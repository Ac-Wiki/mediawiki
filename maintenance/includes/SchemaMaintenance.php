<?php

/**
 * Base script for schema maintenance
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 * @ingroup Maintenance
 */

namespace MediaWiki\Maintenance;

use Doctrine\SqlFormatter\NullHighlighter;
use Doctrine\SqlFormatter\SqlFormatter;
use MediaWiki\DB\AbstractSchemaValidationError;
use MediaWiki\DB\AbstractSchemaValidator;

// @codeCoverageIgnoreStart
require_once __DIR__ . '/../Maintenance.php';
// @codeCoverageIgnoreEnd

abstract class SchemaMaintenance extends Maintenance {
	public const SUPPORTED_PLATFORMS = [
		'mysql',
		'sqlite',
		'postgres'
	];

	/**
	 * Name of the script.
	 * @var string
	 */
	protected $scriptName;

	public function __construct() {
		parent::__construct();

		$types = implode( ', ', array_map( static function ( string $type ): string {
			return "'$type'";
		}, self::SUPPORTED_PLATFORMS ) );

		$this->addOption(
			'json',
			'Path to the json file. Default: tables.json',
			false,
			true
		);
		$this->addOption(
			'sql',
			'Path to output. If --type=all is given, ' .
			'the output will be placed in a directory named after the dbms. ' .
			'For mysql, a directory will only be used if it already exists. Default: tables-generated.sql',
			false,
			true
		);
		$this->addOption(
			'type',
			"Can be either $types, or 'all'. Default: mysql",
			false,
			true
		);
		$this->addOption(
			'validate',
			'Validate the schema instead of generating sql files.'
		);
	}

	public function canExecuteWithoutLocalSettings(): bool {
		return true;
	}

	public function execute() {
		global $IP;

		$platform = $this->getOption( 'type', 'mysql' );
		$jsonPath = $this->getOption( 'json', dirname( __DIR__ ) );

		$installPath = $IP;

		// For windows
		if ( DIRECTORY_SEPARATOR === '\\' ) {
			$installPath = strtr( $installPath, '\\', '/' );
			$jsonPath = strtr( $jsonPath, '\\', '/' );
		}

		if ( $this->hasOption( 'validate' ) ) {
			$this->getSchema( $jsonPath );

			$this->output( "Schema is valid.\n" );
			return;
		}

		// Allow to specify a folder and use a default name
		if ( is_dir( $jsonPath ) ) {
			$jsonPath .= '/tables.json';
		}

		$relativeJsonPath = str_replace(
			[ "$installPath/extensions/", "$installPath/" ],
			'',
			$jsonPath
		);

		if ( in_array( $platform, self::SUPPORTED_PLATFORMS, true ) ) {
			$platforms = [ $platform ];
		} elseif ( $platform === 'all' ) {
			$platforms = self::SUPPORTED_PLATFORMS;
		} else {
			$this->fatalError( "'$platform' is not a supported platform!" );
		}

		foreach ( $platforms as $platform ) {
			$sqlPath = $this->getOption( 'sql', dirname( $jsonPath ) );

			// MediaWiki, and some extensions place mysql .sql files in the directory root, instead of a dedicated
			// sub directory. If mysql/ doesn't exist, assume that the .sql files should be in the directory root.
			if (
				$platform === 'mysql' &&
				!is_dir( $sqlPath . '/mysql' ) &&
				!( count( $platforms ) > 1 && is_dir( dirname( $sqlPath ) . '/' . $platform ) )
			) {
				// Allow to specify a folder and build the name from the json filename
				if ( is_dir( $sqlPath ) ) {
					$sqlPath = $this->getSqlPathWithFileName( $relativeJsonPath, $sqlPath );
				}
			} else {
				// Allow to specify a folder and build the name from the json filename
				if ( is_dir( $sqlPath ) ) {
					$sqlPath .= '/' . $platform;
					$directory = $sqlPath;
					$sqlPath = $this->getSqlPathWithFileName( $relativeJsonPath, $sqlPath );
				} elseif ( count( $platforms ) > 1 ) {
					$directory = dirname( $sqlPath ) . '/' . $platform;
					$sqlPath = $directory . '/' . pathinfo( $sqlPath, PATHINFO_FILENAME ) . '.sql';
				} else {
					$directory = false;
				}

				// The directory for the platform might not exist.
				if ( $directory !== false && !is_dir( $directory )
					&& !mkdir( $directory ) && !is_dir( $directory )
				) {
					$this->error( "Cannot create $directory for $platform" );

					continue;
				}
			}

			$this->writeSchema( $platform, $jsonPath, $relativeJsonPath, $sqlPath );
		}
	}

	/**
	 * Determine the name of the generated SQL file when only a directory has been provided to --sql.
	 * When --json is given tables.json, tables-generates.sql will be the name, otherwise it will be the name of the
	 * .json file, minus the extension.
	 *
	 * @param string $relativeJsonPath
	 * @param string $sqlPath
	 * @return string
	 */
	private function getSqlPathWithFileName( string $relativeJsonPath, string $sqlPath ): string {
		$jsonFilename = pathinfo( $relativeJsonPath, PATHINFO_FILENAME );
		if ( str_starts_with( $jsonFilename, 'tables' ) ) {
			$sqlFileName = $jsonFilename . '-generated.sql';
		} else {
			$sqlFileName = $jsonFilename . '.sql';
		}

		return $sqlPath . '/' . $sqlFileName;
	}

	private function writeSchema(
		string $platform,
		string $jsonPath,
		string $relativeJsonPath,
		string $sqlPath
	): void {
		$abstractSchemaChange = $this->getSchema( $jsonPath );

		$sql =
			"-- This file is automatically generated using maintenance/$this->scriptName.\n" .
			"-- Source: $relativeJsonPath\n" .
			"-- Do not modify this file directly.\n" .
			"-- See https://www.mediawiki.org/wiki/Manual:Schema_changes\n";

		$sql .= $this->generateSchema( $platform, $abstractSchemaChange );

		// Give a hint, if nothing changed
		if ( is_readable( $sqlPath ) ) {
			$oldSql = file_get_contents( $sqlPath );
			if ( $oldSql === $sql ) {
				$this->output( "Schema change is unchanged.\n" );
			}
		}

		file_put_contents( $sqlPath, $sql );
		$this->output( 'Schema change generated and written to ' . $sqlPath . "\n" );
	}

	abstract protected function generateSchema( string $platform, array $schema ): string;

	/**
	 * Takes the output of DoctrineSchemaBuilder::getSql() or
	 * DoctrineSchemaChangeBuilder::getSchemaChangeSql() and applies presentational changes.
	 *
	 * @param string $platform DB engine identifier
	 * @param array $sqlArray Array of SQL statements
	 * @return string
	 */
	protected function cleanupSqlArray( string $platform, array $sqlArray ): string {
		if ( !$sqlArray ) {
			return '';
		}

		// Temporary
		$sql = implode( ";\n\n", $sqlArray ) . ';';
		$sql = ( new SqlFormatter( new NullHighlighter() ) )->format( $sql );

		// Postgres hacks
		if ( $platform === 'postgres' ) {
			// FIXME: Fix a lot of weird formatting issues caused by
			//   presence of partial index's WHERE clause, this should probably
			//   be done in some better way, but for now this can work temporarily
			$sql = str_replace(
				[ "WHERE\n ", "\n  /*_*/\n  ", "    ", "  );", "KEY(\n  " ],
				[ "WHERE", ' ', "  ", ');', "KEY(\n    " ],
				$sql
			);
		}

		// Temporary fixes until the linting issues are resolved upstream.
		// https://github.com/doctrine/sql-formatter/issues/53

		$sql = preg_replace( "!\s+/\*_\*/\s+!", " /*_*/", $sql );
		$sql = preg_replace(
			'!\s+/\*\$wgDBTableOptions\*/\s+;!',
			' /*$wgDBTableOptions*/;',
			$sql
		);

		$sql = str_replace( "; CREATE ", ";\n\nCREATE ", $sql );
		$sql = str_replace( ";\n\nCREATE TABLE ", ";\n\n\nCREATE TABLE ", $sql );
		$sql = preg_replace( '/^(CREATE|DROP|ALTER)\s+(TABLE|VIEW|INDEX)\s+/m', '$1 $2 ', $sql );
		$sql = preg_replace( '/(?<!\s|;)\s+(ADD|DROP|ALTER|MODIFY|CHANGE|RENAME)\s+/', "\n  \$1 ", $sql );

		$sql = str_replace( "; ", ";\n", $sql );

		if ( !str_ends_with( $sql, "\n" ) ) {
			$sql .= "\n";
		}

		// Sqlite hacks
		if ( $platform === 'sqlite' ) {
			// Doctrine prepends __temp__ to the table name and we set the table with the schema prefix causing invalid
			// sqlite.
			$sql = preg_replace( '/__temp__\s*\/\*_\*\//', '/*_*/__temp__', $sql );
		}

		return $sql;
	}

	/**
	 * Fetches the abstract schema.
	 *
	 * @param string $jsonPath
	 * @return array
	 */
	private function getSchema( string $jsonPath ): array {
		$json = file_get_contents( $jsonPath );

		if ( !$json ) {
			$this->fatalError(
				"'$jsonPath' does not exist!\n"
			);
		}

		$abstractSchema = json_decode( $json, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			$this->fatalError(
				"'$jsonPath' seems to be invalid json. Check the syntax and try again!\n" . json_last_error_msg()
			);
		}

		$validator = new AbstractSchemaValidator( function ( string $msg ): void {
			$this->fatalError( $msg );
		} );
		try {
			$validator->validate( $jsonPath );
		} catch ( AbstractSchemaValidationError $e ) {
			$this->fatalError( $e->getMessage() );
		}

		return $abstractSchema;
	}
}

/** @deprecated class alias since 1.43 */
class_alias( SchemaMaintenance::class, 'SchemaMaintenance' );

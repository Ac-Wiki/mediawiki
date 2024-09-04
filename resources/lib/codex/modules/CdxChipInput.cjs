"use strict";var y=(e,n,p)=>new Promise((f,c)=>{var v=u=>{try{o(p.next(u))}catch(a){c(a)}},s=u=>{try{o(p.throw(u))}catch(a){c(a)}},o=u=>u.done?f(u.value):Promise.resolve(u.value).then(v,s);o((p=p.apply(e,n)).next())});const t=require("vue"),j=require("./CdxButton.cjs"),B=require("./Icon.js"),I=require("./useI18n.cjs"),V=require("./_plugin-vue_export-helper.js"),D=require("./constants.js"),H=require("./useSplitAttributes.cjs"),X=require("./useFieldData.cjs"),x=require("./useComputedDirection.cjs"),G=require("./useOptionalModelWrapper.js"),J=t.defineComponent({name:"CdxInputChip",components:{CdxButton:j,CdxIcon:B.CdxIcon},props:{icon:{type:[String,Object],default:null},disabled:{type:Boolean,default:!1}},expose:["focus"],emits:["remove-chip","click-chip","arrow-left","arrow-right"],setup(e,{emit:n}){const p=t.ref(),f=t.computed(()=>({"cdx-input-chip--disabled":e.disabled})),c=I("cdx-input-chip-aria-description","Press Enter to edit or Delete to remove");function v(s){var o;switch(s.key){case"Enter":n("click-chip"),s.preventDefault(),s.stopPropagation();break;case"Escape":(o=p.value)==null||o.blur(),s.preventDefault(),s.stopPropagation();break;case"Backspace":case"Delete":n("remove-chip",s.key),s.preventDefault(),s.stopPropagation();break;case"ArrowLeft":n("arrow-left"),s.preventDefault(),s.stopPropagation();break;case"ArrowRight":n("arrow-right"),s.preventDefault(),s.stopPropagation();break}}return{rootElement:p,rootClasses:f,ariaDescription:c,onKeydown:v,cdxIconClose:B.X3}},methods:{focus(){this.$refs.rootElement.focus()}}}),Q=["aria-description"],Y={class:"cdx-input-chip__text"};function Z(e,n,p,f,c,v){const s=t.resolveComponent("cdx-icon"),o=t.resolveComponent("cdx-button");return t.openBlock(),t.createElementBlock("div",{ref:"rootElement",class:t.normalizeClass(["cdx-input-chip",e.rootClasses]),tabindex:"0",role:"option","aria-description":e.ariaDescription,onKeydown:n[1]||(n[1]=(...u)=>e.onKeydown&&e.onKeydown(...u)),onClick:n[2]||(n[2]=u=>e.$emit("click-chip"))},[e.icon?(t.openBlock(),t.createBlock(s,{key:0,icon:e.icon,size:"small"},null,8,["icon"])):t.createCommentVNode("v-if",!0),t.createElementVNode("span",Y,[t.renderSlot(e.$slots,"default")]),t.createVNode(o,{class:"cdx-input-chip__button",weight:"quiet",tabindex:"-1","aria-hidden":"true",disabled:e.disabled,onClick:n[0]||(n[0]=t.withModifiers(u=>e.$emit("remove-chip","button"),["stop"]))},{default:t.withCtx(()=>[t.createVNode(s,{icon:e.cdxIconClose,size:"x-small"},null,8,["icon"])]),_:1},8,["disabled"])],42,Q)}const _=V._export_sfc(J,[["render",Z]]),ee=D.makeStringTypeValidator(D.ValidationStatusTypes),te=t.defineComponent({name:"CdxChipInput",components:{CdxInputChip:_},inheritAttrs:!1,props:{inputChips:{type:Array,required:!0},inputValue:{type:String,default:null},separateInput:{type:Boolean,default:!1},status:{type:String,default:"default",validator:ee},chipValidator:{type:Function,default:e=>!0},disabled:{type:Boolean,default:!1}},emits:["update:input-chips","update:input-value"],setup(e,{emit:n,attrs:p}){const f=t.ref(),c=t.ref(""),v=x(f),s=t.ref(),o=t.ref(""),u=G.useOptionalModelWrapper(o,t.toRef(e,"inputValue"),n,"update:input-value"),a=t.ref("default"),$=t.computed(()=>a.value==="error"||e.status==="error"?"error":"default"),{computedDisabled:w,computedStatus:E}=X(t.toRef(e,"disabled"),$),C=t.ref(!1),F=t.computed(()=>({"cdx-chip-input--has-separate-input":e.separateInput,["cdx-chip-input--status-".concat(E.value)]:!0,"cdx-chip-input--focused":C.value,"cdx-chip-input--disabled":w.value})),{rootClasses:A,rootStyle:R,otherAttrs:S}=H(p,F),m=[],g=t.ref(null),q=t.computed(()=>g.value?g.value.value:""),K=I("cdx-chip-input-chip-added",i=>"Chip ".concat(i," was added."),[u]),P=I("cdx-chip-input-chip-removed",i=>"Chip ".concat(i," was removed."),[q]);function N(i,r){i!==null&&(m[r]=i)}const h=()=>{s.value.focus()};function k(){e.inputChips.find(i=>i.value===u.value)||!e.chipValidator(u.value)?a.value="error":u.value.length>0&&(c.value=K.value,n("update:input-chips",e.inputChips.concat({value:u.value})),u.value="")}function b(i){n("update:input-chips",e.inputChips.filter(r=>r.value!==i.value))}function M(i,r){const d=v.value==="ltr"&&i==="left"||v.value==="rtl"&&i==="right"?-1:1,l=r+d;if(!(l<0)){if(l>=e.inputChips.length){h();return}m[l].focus()}}function T(i){return y(this,null,function*(){k(),yield t.nextTick(),b(i),u.value=i.value,h()})}function z(i,r,d){if(g.value=i,c.value=P.value,d==="button")h();else if(d==="Backspace"){const l=r===0?1:r-1;l<e.inputChips.length?m[l].focus():h()}else if(d==="Delete"){const l=r+1;l<e.inputChips.length?m[l].focus():h()}b(i)}function O(i){var d,l;const r=v.value==="rtl"?"ArrowRight":"ArrowLeft";switch(i.key){case"Enter":if(u.value.length>0){k(),i.preventDefault(),i.stopPropagation();return}break;case"Escape":(d=s.value)==null||d.blur(),i.preventDefault(),i.stopPropagation();return;case"Backspace":case r:if(((l=s.value)==null?void 0:l.selectionStart)===0&&s.value.selectionEnd===0&&e.inputChips.length>0){m[e.inputChips.length-1].focus(),i.preventDefault(),i.stopPropagation();return}break}}function L(){C.value=!0}function U(){C.value=!1}function W(i){var r;(r=f.value)!=null&&r.contains(i.relatedTarget)||k()}return t.watch(t.toRef(e,"inputChips"),i=>{const r=i.find(d=>d.value===u.value);a.value=r?"error":"default"}),t.watch(u,()=>{a.value==="error"&&(a.value="default")}),{rootElement:f,input:s,computedInputValue:u,rootClasses:A,rootStyle:R,otherAttrs:S,assignChipTemplateRef:N,handleChipClick:T,handleChipRemove:z,moveChipFocus:M,onInputKeydown:O,focusInput:h,onInputFocus:L,onInputBlur:U,onFocusOut:W,computedDisabled:w,statusMessageContent:c}}}),ne={class:"cdx-chip-input__chips",role:"listbox","aria-orientation":"horizontal"},oe=["disabled"],ie={key:0,class:"cdx-chip-input__separate-input"},ue=["disabled"],se={class:"cdx-chip-input__aria-status",role:"status","aria-live":"polite"};function ae(e,n,p,f,c,v){const s=t.resolveComponent("cdx-input-chip");return t.openBlock(),t.createElementBlock("div",{ref:"rootElement",class:t.normalizeClass(["cdx-chip-input",e.rootClasses]),style:t.normalizeStyle(e.rootStyle),onClick:n[8]||(n[8]=(...o)=>e.focusInput&&e.focusInput(...o)),onFocusout:n[9]||(n[9]=(...o)=>e.onFocusOut&&e.onFocusOut(...o))},[t.createElementVNode("div",ne,[(t.openBlock(!0),t.createElementBlock(t.Fragment,null,t.renderList(e.inputChips,(o,u)=>(t.openBlock(),t.createBlock(s,{key:o.value,ref_for:!0,ref:a=>e.assignChipTemplateRef(a,u),class:"cdx-chip-input__item",icon:o.icon,disabled:e.computedDisabled,onClickChip:a=>e.handleChipClick(o),onRemoveChip:a=>e.handleChipRemove(o,u,a),onArrowLeft:a=>e.moveChipFocus("left",u),onArrowRight:a=>e.moveChipFocus("right",u)},{default:t.withCtx(()=>[t.createTextVNode(t.toDisplayString(o.value),1)]),_:2},1032,["icon","disabled","onClickChip","onRemoveChip","onArrowLeft","onArrowRight"]))),128)),e.separateInput?t.createCommentVNode("v-if",!0):t.withDirectives((t.openBlock(),t.createElementBlock("input",t.mergeProps({key:0,ref:"input","onUpdate:modelValue":n[0]||(n[0]=o=>e.computedInputValue=o),class:"cdx-chip-input__input",disabled:e.computedDisabled},e.otherAttrs,{onBlur:n[1]||(n[1]=(...o)=>e.onInputBlur&&e.onInputBlur(...o)),onFocus:n[2]||(n[2]=(...o)=>e.onInputFocus&&e.onInputFocus(...o)),onKeydown:n[3]||(n[3]=(...o)=>e.onInputKeydown&&e.onInputKeydown(...o))}),null,16,oe)),[[t.vModelDynamic,e.computedInputValue]])]),e.separateInput?(t.openBlock(),t.createElementBlock("div",ie,[t.withDirectives(t.createElementVNode("input",t.mergeProps({ref:"input","onUpdate:modelValue":n[4]||(n[4]=o=>e.computedInputValue=o),class:"cdx-chip-input__input",disabled:e.computedDisabled},e.otherAttrs,{onBlur:n[5]||(n[5]=(...o)=>e.onInputBlur&&e.onInputBlur(...o)),onFocus:n[6]||(n[6]=(...o)=>e.onInputFocus&&e.onInputFocus(...o)),onKeydown:n[7]||(n[7]=(...o)=>e.onInputKeydown&&e.onInputKeydown(...o))}),null,16,ue),[[t.vModelDynamic,e.computedInputValue]])])):t.createCommentVNode("v-if",!0),t.createElementVNode("div",se,t.toDisplayString(e.statusMessageContent),1)],38)}const re=V._export_sfc(te,[["render",ae]]);module.exports=re;

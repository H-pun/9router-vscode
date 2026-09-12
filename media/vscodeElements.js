var tt=globalThis,et=tt.ShadowRoot&&(tt.ShadyCSS===void 0||tt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,dt=Symbol(),St=new WeakMap,F=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==dt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(et&&t===void 0){let o=e!==void 0&&e.length===1;o&&(t=St.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&St.set(e,t))}return t}toString(){return this.cssText}},ot=r=>new F(typeof r=="string"?r:r+"",void 0,dt),v=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((o,s,i)=>o+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[i+1],r[0]);return new F(e,r,dt)},wt=(r,t)=>{if(et)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let o=document.createElement("style"),s=tt.litNonce;s!==void 0&&o.setAttribute("nonce",s),o.textContent=e.cssText,r.appendChild(o)}},ht=et?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let o of t.cssRules)e+=o.cssText;return ot(e)})(r):r;var{is:Xt,defineProperty:te,getOwnPropertyDescriptor:ee,getOwnPropertyNames:oe,getOwnPropertySymbols:se,getPrototypeOf:re}=Object,st=globalThis,Ct=st.trustedTypes,ie=Ct?Ct.emptyScript:"",ne=st.reactiveElementPolyfillSupport,z=(r,t)=>r,q={toAttribute(r,t){switch(t){case Boolean:r=r?ie:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},rt=(r,t)=>!Xt(r,t),Tt={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),st.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Tt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let o=Symbol(),s=this.getPropertyDescriptor(t,o,e);s!==void 0&&te(this.prototype,t,s)}}static getPropertyDescriptor(t,e,o){let{get:s,set:i}=ee(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:s,set(n){let a=s?.call(this);i?.call(this,n),this.requestUpdate(t,a,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Tt}static _$Ei(){if(this.hasOwnProperty(z("elementProperties")))return;let t=re(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(z("properties"))){let e=this.properties,o=[...oe(e),...se(e)];for(let s of o)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[o,s]of e)this.elementProperties.set(o,s)}this._$Eh=new Map;for(let[e,o]of this.elementProperties){let s=this._$Eu(e,o);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let o=new Set(t.flat(1/0).reverse());for(let s of o)e.unshift(ht(s))}else t!==void 0&&e.push(ht(t));return e}static _$Eu(t,e){let o=e.attribute;return o===!1?void 0:typeof o=="string"?o:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return wt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){let o=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,o);if(s!==void 0&&o.reflect===!0){let i=(o.converter?.toAttribute!==void 0?o.converter:q).toAttribute(e,o.type);this._$Em=t,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(t,e){let o=this.constructor,s=o._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let i=o.getPropertyOptions(s),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=s;let a=n.fromAttribute(e,i.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,e,o,s=!1,i){if(t!==void 0){let n=this.constructor;if(s===!1&&(i=this[t]),o??=n.getPropertyOptions(t),!((o.hasChanged??rt)(i,e)||o.useDefault&&o.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,o))))return;this.C(t,e,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:s,wrapped:i},n){o&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),i!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let o=this.constructor.elementProperties;if(o.size>0)for(let[s,i]of o){let{wrapped:n}=i,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,i,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(o=>o.hostUpdate?.()),this.update(e)):this._$EM()}catch(o){throw t=!1,this._$EM(),o}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[z("elementProperties")]=new Map,w[z("finalized")]=new Map,ne?.({ReactiveElement:w}),(st.reactiveElementVersions??=[]).push("2.1.2");var yt=globalThis,Pt=r=>r,it=yt.trustedTypes,kt=it?it.createPolicy("lit-html",{createHTML:r=>r}):void 0,Ut="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Dt="?"+P,ae=`<${Dt}>`,R=document,K=()=>R.createComment(""),G=r=>r===null||typeof r!="object"&&typeof r!="function",_t=Array.isArray,ce=r=>_t(r)||typeof r?.[Symbol.iterator]=="function",pt=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ot=/-->/g,It=/>/g,I=RegExp(`>|${pt}(?:([^\\s"'>=/]+)(${pt}*=${pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ht=/'/g,Rt=/"/g,Mt=/^(?:script|style|textarea|title)$/i,gt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),m=gt(1),Ce=gt(2),Te=gt(3),g=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Bt=new WeakMap,H=R.createTreeWalker(R,129);function Nt(r,t){if(!_t(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return kt!==void 0?kt.createHTML(t):t}var le=(r,t)=>{let e=r.length-1,o=[],s,i=t===2?"<svg>":t===3?"<math>":"",n=W;for(let a=0;a<e;a++){let l=r[a],f,b,d=-1,S=0;for(;S<l.length&&(n.lastIndex=S,b=n.exec(l),b!==null);)S=n.lastIndex,n===W?b[1]==="!--"?n=Ot:b[1]!==void 0?n=It:b[2]!==void 0?(Mt.test(b[2])&&(s=RegExp("</"+b[2],"g")),n=I):b[3]!==void 0&&(n=I):n===I?b[0]===">"?(n=s??W,d=-1):b[1]===void 0?d=-2:(d=n.lastIndex-b[2].length,f=b[1],n=b[3]===void 0?I:b[3]==='"'?Rt:Ht):n===Rt||n===Ht?n=I:n===Ot||n===It?n=W:(n=I,s=void 0);let T=n===I&&r[a+1].startsWith("/>")?" ":"";i+=n===W?l+ae:d>=0?(o.push(f),l.slice(0,d)+Ut+l.slice(d)+P+T):l+P+(d===-2?a:T)}return[Nt(r,i+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),o]},Y=class r{constructor({strings:t,_$litType$:e},o){let s;this.parts=[];let i=0,n=0,a=t.length-1,l=this.parts,[f,b]=le(t,e);if(this.el=r.createElement(f,o),H.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=H.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(Ut)){let S=b[n++],T=s.getAttribute(d).split(P),X=/([.?@])?(.*)/.exec(S);l.push({type:1,index:i,name:X[2],strings:T,ctor:X[1]==="."?ft:X[1]==="?"?mt:X[1]==="@"?bt:D}),s.removeAttribute(d)}else d.startsWith(P)&&(l.push({type:6,index:i}),s.removeAttribute(d));if(Mt.test(s.tagName)){let d=s.textContent.split(P),S=d.length-1;if(S>0){s.textContent=it?it.emptyScript:"";for(let T=0;T<S;T++)s.append(d[T],K()),H.nextNode(),l.push({type:2,index:++i});s.append(d[S],K())}}}else if(s.nodeType===8)if(s.data===Dt)l.push({type:2,index:i});else{let d=-1;for(;(d=s.data.indexOf(P,d+1))!==-1;)l.push({type:7,index:i}),d+=P.length-1}i++}}static createElement(t,e){let o=R.createElement("template");return o.innerHTML=t,o}};function U(r,t,e=r,o){if(t===g)return t;let s=o!==void 0?e._$Co?.[o]:e._$Cl,i=G(t)?void 0:t._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(r),s._$AT(r,e,o)),o!==void 0?(e._$Co??=[])[o]=s:e._$Cl=s),s!==void 0&&(t=U(r,s._$AS(r,t.values),s,o)),t}var ut=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:o}=this._$AD,s=(t?.creationScope??R).importNode(e,!0);H.currentNode=s;let i=H.nextNode(),n=0,a=0,l=o[0];for(;l!==void 0;){if(n===l.index){let f;l.type===2?f=new Z(i,i.nextSibling,this,t):l.type===1?f=new l.ctor(i,l.name,l.strings,this,t):l.type===6&&(f=new vt(i,this,t)),this._$AV.push(f),l=o[++a]}n!==l?.index&&(i=H.nextNode(),n++)}return H.currentNode=R,s}p(t){let e=0;for(let o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}},Z=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=U(this,t,e),G(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==g&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ce(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&G(this._$AH)?this._$AA.nextSibling.data=t:this.T(R.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:o}=t,s=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=Y.createElement(Nt(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===s)this._$AH.p(e);else{let i=new ut(s,this),n=i.u(this.options);i.p(e),this.T(n),this._$AH=i}}_$AC(t){let e=Bt.get(t.strings);return e===void 0&&Bt.set(t.strings,e=new Y(t)),e}k(t){_t(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,o,s=0;for(let i of t)s===e.length?e.push(o=new r(this.O(K()),this.O(K()),this,this.options)):o=e[s],o._$AI(i),s++;s<e.length&&(this._$AR(o&&o._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let o=Pt(t).nextSibling;Pt(t).remove(),t=o}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,s,i){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=i,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=p}_$AI(t,e=this,o,s){let i=this.strings,n=!1;if(i===void 0)t=U(this,t,e,0),n=!G(t)||t!==this._$AH&&t!==g,n&&(this._$AH=t);else{let a=t,l,f;for(t=i[0],l=0;l<i.length-1;l++)f=U(this,a[o+l],e,l),f===g&&(f=this._$AH[l]),n||=!G(f)||f!==this._$AH[l],f===p?t=p:t!==p&&(t+=(f??"")+i[l+1]),this._$AH[l]=f}n&&!s&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ft=class extends D{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},mt=class extends D{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},bt=class extends D{constructor(t,e,o,s,i){super(t,e,o,s,i),this.type=5}_$AI(t,e=this){if((t=U(this,t,e,0)??p)===g)return;let o=this._$AH,s=t===p&&o!==p||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,i=t!==p&&(o===p||s);s&&this.element.removeEventListener(this.name,this,o),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},vt=class{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}};var de=yt.litHtmlPolyfillSupport;de?.(Y,Z),(yt.litHtmlVersions??=[]).push("3.3.3");var Lt=(r,t,e)=>{let o=e?.renderBefore??t,s=o._$litPart$;if(s===void 0){let i=e?.renderBefore??null;o._$litPart$=s=new Z(t.insertBefore(K(),i),i,void 0,e??{})}return s._$AI(r),s};var $t=globalThis,k=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Lt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return g}};k._$litElement$=!0,k.finalized=!0,$t.litElementHydrateSupport?.({LitElement:k});var he=$t.litElementPolyfillSupport;he?.({LitElement:k});($t.litElementVersions??=[]).push("4.2.2");var pe={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:rt},ue=(r=pe,t,e)=>{let{kind:o,metadata:s}=e,i=globalThis.litPropertyMetadata.get(s);if(i===void 0&&globalThis.litPropertyMetadata.set(s,i=new Map),o==="setter"&&((r=Object.create(r)).wrapped=!0),i.set(e.name,r),o==="accessor"){let{name:n}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(n,l,r,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,r,a),a}}}if(o==="setter"){let{name:n}=e;return function(a){let l=this[n];t.call(this,a),this.requestUpdate(n,l,r,!0,a)}}throw Error("Unsupported decorator location: "+o)};function c(r){return(t,e)=>typeof e=="object"?ue(r,t,e):((o,s,i)=>{let n=s.hasOwnProperty(i);return s.constructor.createProperty(i,o),n?Object.getOwnPropertyDescriptor(s,i):void 0})(r,t,e)}function xt(r){return c({...r,state:!0,attribute:!1})}var M=(r,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(r,t,e),e);function At(r){return(t,e)=>{let{slot:o,selector:s}=r??{},i="slot"+(o?`[name=${o}]`:":not([name])");return M(t,e,{get(){let n=this.renderRoot?.querySelector(i),a=n?.assignedElements(r)??[];return s===void 0?a:a.filter(l=>l.matches(s))}})}}var nt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},at=r=>(...t)=>({_$litDirective$:r,values:t}),N=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,o){this._$Ct=t,this._$AM=e,this._$Ci=o}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var C=at(class extends N{constructor(r){if(super(r),r.type!==nt.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(let o in t)t[o]&&!this.nt?.has(o)&&this.st.add(o);return this.render(t)}let e=r.element.classList;for(let o of this.st)o in t||(e.remove(o),this.st.delete(o));for(let o in t){let s=!!t[o];s===this.st.has(o)||this.nt?.has(o)||(s?(e.add(o),this.st.add(o)):(e.remove(o),this.st.delete(o)))}return g}});var jt=0,fe=(r="")=>(jt++,`${r}${jt}`),Vt=fe;var ct="2.5.1",Ft="__vscodeElements_disableRegistryWarning__",zt=(r,t)=>{console.warn(t?`[VSCode Elements] ${r}
%o`:`${r}
%o`,t)},y=class extends k{get version(){return ct}warn(t){zt(t,this)}},$=r=>t=>{if(!customElements.get(r)){customElements.define(r,t);return}if(Ft in window)return;let s=document.createElement(r)?.version,i="";s?s!==ct?(i+="is already registered by a different version of VSCode Elements. ",i+=`This version is "${ct}", while the other one is "${s}".`):i+=`is already registered by the same version of VSCode Elements (${ct}).`:i+="is already registered by an unknown custom element handler class.",zt(`The custom element "${r}" ${i}
To suppress this warning, set window.${Ft} to true`)};var x=v`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;var me=[x,v`
    :host {
      cursor: pointer;
      display: block;
      user-select: none;
    }

    .wrapper {
      align-items: center;
      border-bottom: 1px solid transparent;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: 20px;
      overflow: hidden;
      padding: 7px 8px;
      position: relative;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host([active]) .wrapper {
      border-bottom-color: var(--vscode-panelTitle-activeForeground, #cccccc);
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      border-bottom: 0;
      margin-bottom: 0;
      padding: 0;
    }

    :host(:focus-visible) {
      outline: none;
    }

    .wrapper {
      align-items: center;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: 20px;
      overflow: inherit;
      text-overflow: inherit;
      position: relative;
    }

    .wrapper.panel {
      color: var(--vscode-panelTitle-inactiveForeground, #9d9d9d);
    }

    .wrapper.panel.active,
    .wrapper.panel:hover {
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      display: flex;
      font-size: 11px;
      height: 31px;
      padding: 2px 10px;
      text-transform: uppercase;
    }

    .main {
      overflow: inherit;
      text-overflow: inherit;
    }

    .active-indicator {
      display: none;
    }

    .active-indicator.panel.active {
      border-top: 1px solid var(--vscode-panelTitle-activeBorder, #0078d4);
      bottom: 4px;
      display: block;
      left: 8px;
      pointer-events: none;
      position: absolute;
      right: 8px;
    }

    :host(:focus-visible) .wrapper {
      outline-color: var(--vscode-focusBorder, #0078d4);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host(:focus-visible) .wrapper.panel {
      outline-offset: -2px;
    }

    slot[name='content-before']::slotted(vscode-badge) {
      margin-right: 8px;
    }

    slot[name='content-after']::slotted(vscode-badge) {
      margin-left: 8px;
    }
  `],qt=me;var L=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},_=class extends y{constructor(){super(...arguments),this.active=!1,this.ariaControls="",this.panel=!1,this.role="tab",this.tabId=-1}attributeChangedCallback(t,e,o){if(super.attributeChangedCallback(t,e,o),t==="active"){let s=o!==null;this.ariaSelected=s?"true":"false",this.tabIndex=s?0:-1}}render(){return m`
      <div
        class=${C({wrapper:!0,active:this.active,panel:this.panel})}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${C({"active-indicator":!0,active:this.active,panel:this.panel})}
        ></span>
      </div>
    `}};_.styles=qt;L([c({type:Boolean,reflect:!0})],_.prototype,"active",void 0);L([c({reflect:!0,attribute:"aria-controls"})],_.prototype,"ariaControls",void 0);L([c({type:Boolean,reflect:!0})],_.prototype,"panel",void 0);L([c({reflect:!0})],_.prototype,"role",void 0);L([c({type:Number,reflect:!0,attribute:"tab-id"})],_.prototype,"tabId",void 0);_=L([$("vscode-tab-header")],_);var be=[x,v`
    :host {
      display: block;
      overflow: hidden;
    }

    :host(:focus-visible) {
      outline-color: var(--vscode-focusBorder, #0078d4);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host([panel]) {
      background-color: var(--vscode-panel-background, #181818);
    }
  `],Wt=be;var j=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},E=class extends y{constructor(){super(...arguments),this.hidden=!1,this.ariaLabelledby="",this.panel=!1,this.role="tabpanel",this.tabIndex=0}render(){return m` <slot></slot> `}};E.styles=Wt;j([c({type:Boolean,reflect:!0})],E.prototype,"hidden",void 0);j([c({reflect:!0,attribute:"aria-labelledby"})],E.prototype,"ariaLabelledby",void 0);j([c({type:Boolean,reflect:!0})],E.prototype,"panel",void 0);j([c({reflect:!0})],E.prototype,"role",void 0);j([c({type:Number,reflect:!0})],E.prototype,"tabIndex",void 0);E=j([$("vscode-tab-panel")],E);var ve=[x,v`
    :host {
      display: block;
    }

    .header {
      align-items: center;
      display: flex;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      width: 100%;
    }

    .header {
      border-bottom-color: var(--vscode-settings-headerBorder, #2b2b2b);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .header.panel {
      background-color: var(--vscode-panel-background, #181818);
      border-bottom-width: 0;
      box-sizing: border-box;
      padding-left: 8px;
      padding-right: 8px;
    }

    .tablist {
      display: flex;
      margin-bottom: -1px;
    }

    slot[name='addons'] {
      display: block;
      margin-left: auto;
    }
  `],Kt=ve;var J=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},O=class extends y{constructor(){super(),this.panel=!1,this.selectedIndex=0,this._tabHeaders=[],this._tabPanels=[],this._componentId="",this._tabFocus=0,this._componentId=Vt()}attributeChangedCallback(t,e,o){super.attributeChangedCallback(t,e,o),t==="selected-index"&&this._setActiveTab(),t==="panel"&&(this._tabHeaders.forEach(s=>s.panel=o!==null),this._tabPanels.forEach(s=>s.panel=o!==null))}_dispatchSelectEvent(){this.dispatchEvent(new CustomEvent("vsc-tabs-select",{detail:{selectedIndex:this.selectedIndex},composed:!0}))}_setActiveTab(){this._tabFocus=this.selectedIndex,this._tabPanels.forEach((t,e)=>{t.hidden=e!==this.selectedIndex}),this._tabHeaders.forEach((t,e)=>{t.active=e===this.selectedIndex})}_focusPrevTab(){this._tabFocus===0?this._tabFocus=this._tabHeaders.length-1:this._tabFocus-=1}_focusNextTab(){this._tabFocus===this._tabHeaders.length-1?this._tabFocus=0:this._tabFocus+=1}_onHeaderKeyDown(t){(t.key==="ArrowLeft"||t.key==="ArrowRight")&&(t.preventDefault(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","-1"),t.key==="ArrowLeft"?this._focusPrevTab():t.key==="ArrowRight"&&this._focusNextTab(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","0"),this._tabHeaders[this._tabFocus].focus()),t.key==="Enter"&&(t.preventDefault(),this.selectedIndex=this._tabFocus,this._dispatchSelectEvent())}_moveHeadersToHeaderSlot(){let t=this._mainSlotElements.filter(e=>e instanceof _);t.length>0&&t.forEach(e=>e.setAttribute("slot","header"))}_onMainSlotChange(){this._moveHeadersToHeaderSlot(),this._tabPanels=this._mainSlotElements.filter(t=>t instanceof E),this._tabPanels.forEach((t,e)=>{t.ariaLabelledby=`t${this._componentId}-h${e}`,t.id=`t${this._componentId}-p${e}`,t.panel=this.panel}),this._setActiveTab()}_onHeaderSlotChange(){this._tabHeaders=this._headerSlotElements.filter(t=>t instanceof _),this._tabHeaders.forEach((t,e)=>{t.tabId=e,t.id=`t${this._componentId}-h${e}`,t.ariaControls=`t${this._componentId}-p${e}`,t.panel=this.panel,t.active=e===this.selectedIndex})}_onHeaderClick(t){let o=t.composedPath().find(s=>s instanceof _);o&&(this.selectedIndex=o.tabId,this._setActiveTab(),this._dispatchSelectEvent())}render(){return m`
      <div
        class=${C({header:!0,panel:this.panel})}
        @click=${this._onHeaderClick}
        @keydown=${this._onHeaderKeyDown}
      >
        <div role="tablist" class="tablist">
          <slot
            name="header"
            @slotchange=${this._onHeaderSlotChange}
            role="tablist"
          ></slot>
        </div>
        <slot name="addons"></slot>
      </div>
      <slot @slotchange=${this._onMainSlotChange}></slot>
    `}};O.styles=Kt;J([c({type:Boolean,reflect:!0})],O.prototype,"panel",void 0);J([c({type:Number,reflect:!0,attribute:"selected-index"})],O.prototype,"selectedIndex",void 0);J([At({slot:"header"})],O.prototype,"_headerSlotElements",void 0);J([At()],O.prototype,"_mainSlotElements",void 0);O=J([$("vscode-tabs")],O);var V=r=>r??p;var Et=class extends N{constructor(t){if(super(t),this._prevProperties={},t.type!==nt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[e]){return Object.entries(e).forEach(([o,s])=>{this._prevProperties[o]!==s&&(o.startsWith("--")?t.element.style.setProperty(o,s):t.element.style[o]=s,this._prevProperties[o]=s)}),g}render(t){return g}},Gt=at(Et);var ye=[x,v`
    :host {
      color: var(--vscode-icon-foreground, #cccccc);
      display: inline-block;
    }

    .codicon[class*='codicon-'] {
      display: block;
    }

    .icon,
    .button {
      background-color: transparent;
      display: block;
      padding: 0;
    }

    .button {
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
      color: currentColor;
      cursor: pointer;
      padding: 2px;
    }

    .button:hover {
      background-color: var(
        --vscode-toolbar-hoverBackground,
        rgba(90, 93, 94, 0.31)
      );
    }

    .button:active {
      background-color: var(
        --vscode-toolbar-activeBackground,
        rgba(99, 102, 103, 0.31)
      );
    }

    .button:focus {
      outline: none;
    }

    .button:focus-visible {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    @keyframes icon-spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation-name: icon-spin;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `],Yt=ye;var B=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},Q,A=Q=class extends y{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:e}=this._getStylesheetConfig();Q.stylesheetHref=t,Q.nonce=e}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),e=t?.getAttribute("href")||void 0,o=t?.nonce||void 0;if(!t){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:o,href:e}}render(){let{stylesheetHref:t,nonce:e}=Q,o=m`<span
      class=${C({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${Gt({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?m` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${o}
        </button>`:m` <span class="icon" aria-hidden="true" role="presentation"
          >${o}</span
        >`;return m`
      <link
        rel="stylesheet"
        href=${V(t)}
        nonce=${V(e)}
      />
      ${s}
    `}};A.styles=Yt;A.stylesheetHref="";A.nonce="";B([c()],A.prototype,"label",void 0);B([c({type:String})],A.prototype,"name",void 0);B([c({type:Number})],A.prototype,"size",void 0);B([c({type:Boolean,reflect:!0})],A.prototype,"spin",void 0);B([c({type:Number,attribute:"spin-duration"})],A.prototype,"spinDuration",void 0);B([c({type:Boolean,reflect:!0,attribute:"action-icon"})],A.prototype,"actionIcon",void 0);A=Q=B([$("vscode-icon")],A);function Zt(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var _e=ot(Zt()),ge=[x,v`
    :host {
      cursor: pointer;
      display: inline-block;
      width: auto;
    }

    :host([block]) {
      display: block;
      width: 100%;
    }

    .base {
      align-items: center;
      background-color: var(--vscode-button-background, #0078d4);
      border-bottom-left-radius: var(--vsc-border-left-radius, 4px);
      border-bottom-right-radius: var(--vsc-border-right-radius, 4px);
      border-bottom-width: 1px;
      border-color: var(--vscode-button-border, transparent);
      border-left-width: var(--vsc-border-left-width, 1px);
      border-right-width: var(--vsc-border-right-width, 1px);
      border-style: solid;
      border-top-left-radius: var(--vsc-border-left-radius, 4px);
      border-top-right-radius: var(--vsc-border-right-radius, 4px);
      border-top-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-button-foreground, #ffffff);
      display: flex;
      font-family: var(--vscode-font-family, ${_e});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 100%;
      justify-content: center;
      line-height: 22px;
      overflow: hidden;
      padding: 1px calc(13px + var(--vsc-base-additional-right-padding, 0px))
        1px 13px;
      position: relative;
      user-select: none;
      white-space: nowrap;
      width: 100%;
    }

    :host([block]) .base {
      min-height: 28px;
      text-align: center;
      width: 100%;
    }

    .base:after {
      background-color: var(
        --vscode-button-separator,
        rgba(255, 255, 255, 0.4)
      );
      content: var(--vsc-base-after-content);
      display: var(--vsc-divider-display, none);
      position: absolute;
      right: 0;
      top: 4px;
      bottom: 4px;
      width: 1px;
    }

    :host([secondary]) .base:after {
      background-color: var(--vscode-button-secondaryForeground, #cccccc);
      opacity: 0.4;
    }

    :host([secondary]) .base {
      color: var(--vscode-button-secondaryForeground, #cccccc);
      background-color: var(--vscode-button-secondaryBackground, #313131);
      border-color: var(
        --vscode-button-border,
        var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.07))
      );
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.4;
      pointer-events: none;
    }

    :host(:hover) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
    }

    :host([disabled]:hover) .base {
      background-color: var(--vscode-button-background, #0078d4);
    }

    :host([secondary]:hover) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:hover) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    :host(:focus),
    :host(:active) {
      outline: none;
    }

    :host(:focus) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: 2px;
    }

    :host([disabled]:focus) .base {
      background-color: var(--vscode-button-background, #0078d4);
      outline: 0;
    }

    :host([secondary]:focus) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:focus) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    ::slotted(*) {
      display: inline-block;
      margin-left: 4px;
      margin-right: 4px;
    }

    ::slotted(*:first-child) {
      margin-left: 0;
    }

    ::slotted(*:last-child) {
      margin-right: 0;
    }

    ::slotted(vscode-icon) {
      color: inherit;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      padding: 1px 13px;
    }

    :host(:empty) .base,
    .base.icon-only {
      min-height: 24px;
      min-width: 26px;
      padding: 1px 4px;
    }

    slot {
      align-items: center;
      display: flex;
      height: 100%;
    }

    .has-content-before slot[name='content-before'] {
      margin-right: 4px;
    }

    .has-content-after slot[name='content-after'] {
      margin-left: 4px;
    }

    .icon,
    .icon-after {
      color: inherit;
      display: block;
    }

    :host(:not(:empty)) .icon {
      margin-right: 3px;
    }

    :host(:not(:empty)) .icon-after,
    :host([icon]) .icon-after {
      margin-left: 3px;
    }
  `],Jt=ge;var u=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},h=class extends y{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let e=new MouseEvent("click",{bubbles:!0,cancelable:!0});e.synthetic=!0,this.dispatchEvent(e),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let e=t.target;e.name==="content-before"&&(this._hasContentBefore=e.assignedElements().length>0),e.name==="content-after"&&(this._hasContentAfter=e.assignedElements().length>0)}render(){let t=this.icon!=="",e=this.iconAfter!=="",o={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=t?m`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${V(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:p,i=e?m`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${V(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:p;return m`
      <div
        class=${C(o)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${i}
        <slot name="content-after"></slot>
      </div>
    `}};h.styles=Jt;h.formAssociated=!0;u([c({type:Boolean,reflect:!0})],h.prototype,"autofocus",void 0);u([c({type:Number,reflect:!0})],h.prototype,"tabIndex",void 0);u([c({type:Boolean,reflect:!0})],h.prototype,"secondary",void 0);u([c({type:Boolean,reflect:!0})],h.prototype,"block",void 0);u([c({reflect:!0})],h.prototype,"role",void 0);u([c({type:Boolean,reflect:!0})],h.prototype,"disabled",void 0);u([c()],h.prototype,"icon",void 0);u([c({type:Boolean,reflect:!0,attribute:"icon-spin"})],h.prototype,"iconSpin",void 0);u([c({type:Number,reflect:!0,attribute:"icon-spin-duration"})],h.prototype,"iconSpinDuration",void 0);u([c({attribute:"icon-after"})],h.prototype,"iconAfter",void 0);u([c({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],h.prototype,"iconAfterSpin",void 0);u([c({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],h.prototype,"iconAfterSpinDuration",void 0);u([c({type:Boolean,reflect:!0})],h.prototype,"focused",void 0);u([c({type:String,reflect:!0})],h.prototype,"name",void 0);u([c({type:Boolean,reflect:!0,attribute:"icon-only"})],h.prototype,"iconOnly",void 0);u([c({reflect:!0})],h.prototype,"type",void 0);u([c()],h.prototype,"value",void 0);u([xt()],h.prototype,"_hasContentBefore",void 0);u([xt()],h.prototype,"_hasContentAfter",void 0);h=u([$("vscode-button")],h);var $e=[x,v`
    :host {
      display: inline-block;
    }

    .root {
      align-items: stretch;
      display: flex;
      width: 100%;
    }

    ::slotted(vscode-button:not(:first-child)) {
      --vsc-border-left-width: 0;
      --vsc-border-left-radius: 0;
      --vsc-border-left-width: 0;
    }

    ::slotted(vscode-button:not(:last-child)) {
      --vsc-divider-display: block;
      --vsc-base-additional-right-padding: 1px;
      --vsc-base-after-content: '';
      --vsc-border-right-width: 0;
      --vsc-border-right-radius: 0;
      --vsc-border-right-width: 0;
    }

    ::slotted(vscode-button:focus) {
      z-index: 1;
    }

    ::slotted(vscode-button:not(:empty)) {
      width: 100%;
    }
  `],Qt=$e;var xe=function(r,t,e,o){var s=arguments.length,i=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,o);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(s<3?n(i):s>3?n(t,e,i):n(t,e))||i);return s>3&&i&&Object.defineProperty(t,e,i),i},lt=class extends y{render(){return m`<div class="root"><slot></slot></div>`}};lt.styles=Qt;lt=xe([$("vscode-button-group")],lt);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

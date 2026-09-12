var K=globalThis,J=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tt=Symbol(),ut=new WeakMap,I=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==tt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(J&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ut.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ut.set(e,t))}return t}toString(){return this.cssText}},ft=r=>new I(typeof r=="string"?r:r+"",void 0,tt),b=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,o,i)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[i+1],r[0]);return new I(e,r,tt)},mt=(r,t)=>{if(J)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),o=K.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,r.appendChild(s)}},et=J?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return ft(e)})(r):r;var{is:Dt,defineProperty:Lt,getOwnPropertyDescriptor:Vt,getOwnPropertyNames:Bt,getOwnPropertySymbols:qt,getPrototypeOf:Ft}=Object,Y=globalThis,_t=Y.trustedTypes,zt=_t?_t.emptyScript:"",Wt=Y.reactiveElementPolyfillSupport,j=(r,t)=>r,k={toAttribute(r,t){switch(t){case Boolean:r=r?zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},G=(r,t)=>!Dt(r,t),bt={attribute:!0,type:String,converter:k,reflect:!1,useDefault:!1,hasChanged:G};Symbol.metadata??=Symbol("metadata"),Y.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=bt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(t,s,e);o!==void 0&&Lt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){let{get:o,set:i}=Vt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:o,set(n){let a=o?.call(this);i?.call(this,n),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??bt}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;let t=Ft(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){let e=this.properties,s=[...Bt(e),...qt(e)];for(let o of s)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,o]of e)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let o=this._$Eu(e,s);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let o of s)e.unshift(et(o))}else t!==void 0&&e.push(et(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(o!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:k).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(t,e){let s=this.constructor,o=s._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let i=s.getPropertyOptions(o),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:k;this._$Em=o;let a=n.fromAttribute(e,i.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(t,e,s,o=!1,i){if(t!==void 0){let n=this.constructor;if(o===!1&&(i=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??G)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:o,wrapped:i},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),i!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,i]of s){let{wrapped:n}=i,a=this[o];n!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,i,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[j("elementProperties")]=new Map,v[j("finalized")]=new Map,Wt?.({ReactiveElement:v}),(Y.reactiveElementVersions??=[]).push("2.1.2");var lt=globalThis,vt=r=>r,Z=lt.trustedTypes,$t=Z?Z.createPolicy("lit-html",{createHTML:r=>r}):void 0,St="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,wt="?"+g,Kt=`<${wt}>`,C=document,L=()=>C.createComment(""),V=r=>r===null||typeof r!="object"&&typeof r!="function",ct=Array.isArray,Jt=r=>ct(r)||typeof r?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,yt=/-->/g,gt=/>/g,S=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),At=/'/g,xt=/"/g,Ct=/^(?:script|style|textarea|title)$/i,ht=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),H=ht(1),le=ht(2),ce=ht(3),$=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Et=new WeakMap,w=C.createTreeWalker(C,129);function Pt(r,t){if(!ct(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return $t!==void 0?$t.createHTML(t):t}var Yt=(r,t)=>{let e=r.length-1,s=[],o,i=t===2?"<svg>":t===3?"<math>":"",n=D;for(let a=0;a<e;a++){let l=r[a],h,p,c=-1,_=0;for(;_<l.length&&(n.lastIndex=_,p=n.exec(l),p!==null);)_=n.lastIndex,n===D?p[1]==="!--"?n=yt:p[1]!==void 0?n=gt:p[2]!==void 0?(Ct.test(p[2])&&(o=RegExp("</"+p[2],"g")),n=S):p[3]!==void 0&&(n=S):n===S?p[0]===">"?(n=o??D,c=-1):p[1]===void 0?c=-2:(c=n.lastIndex-p[2].length,h=p[1],n=p[3]===void 0?S:p[3]==='"'?xt:At):n===xt||n===At?n=S:n===yt||n===gt?n=D:(n=S,o=void 0);let y=n===S&&r[a+1].startsWith("/>")?" ":"";i+=n===D?l+Kt:c>=0?(s.push(h),l.slice(0,c)+St+l.slice(c)+g+y):l+g+(c===-2?a:y)}return[Pt(r,i+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},B=class r{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let i=0,n=0,a=t.length-1,l=this.parts,[h,p]=Yt(t,e);if(this.el=r.createElement(h,s),w.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=w.nextNode())!==null&&l.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(St)){let _=p[n++],y=o.getAttribute(c).split(g),W=/([.?@])?(.*)/.exec(_);l.push({type:1,index:i,name:W[2],strings:y,ctor:W[1]==="."?rt:W[1]==="?"?it:W[1]==="@"?nt:T}),o.removeAttribute(c)}else c.startsWith(g)&&(l.push({type:6,index:i}),o.removeAttribute(c));if(Ct.test(o.tagName)){let c=o.textContent.split(g),_=c.length-1;if(_>0){o.textContent=Z?Z.emptyScript:"";for(let y=0;y<_;y++)o.append(c[y],L()),w.nextNode(),l.push({type:2,index:++i});o.append(c[_],L())}}}else if(o.nodeType===8)if(o.data===wt)l.push({type:2,index:i});else{let c=-1;for(;(c=o.data.indexOf(g,c+1))!==-1;)l.push({type:7,index:i}),c+=g.length-1}i++}}static createElement(t,e){let s=C.createElement("template");return s.innerHTML=t,s}};function P(r,t,e=r,s){if(t===$)return t;let o=s!==void 0?e._$Co?.[s]:e._$Cl,i=V(t)?void 0:t._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(r),o._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=o:e._$Cl=o),o!==void 0&&(t=P(r,o._$AS(r,t.values),o,s)),t}var ot=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,o=(t?.creationScope??C).importNode(e,!0);w.currentNode=o;let i=w.nextNode(),n=0,a=0,l=s[0];for(;l!==void 0;){if(n===l.index){let h;l.type===2?h=new q(i,i.nextSibling,this,t):l.type===1?h=new l.ctor(i,l.name,l.strings,this,t):l.type===6&&(h=new at(i,this,t)),this._$AV.push(h),l=s[++a]}n!==l?.index&&(i=w.nextNode(),n++)}return w.currentNode=C,o}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},q=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,o){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=P(this,t,e),V(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Jt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&V(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,o=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=B.createElement(Pt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(e);else{let i=new ot(o,this),n=i.u(this.options);i.p(e),this.T(n),this._$AH=i}}_$AC(t){let e=Et.get(t.strings);return e===void 0&&Et.set(t.strings,e=new B(t)),e}k(t){ct(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,o=0;for(let i of t)o===e.length?e.push(s=new r(this.O(L()),this.O(L()),this,this.options)):s=e[o],s._$AI(i),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=vt(t).nextSibling;vt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,o,i){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,o){let i=this.strings,n=!1;if(i===void 0)t=P(this,t,e,0),n=!V(t)||t!==this._$AH&&t!==$,n&&(this._$AH=t);else{let a=t,l,h;for(t=i[0],l=0;l<i.length-1;l++)h=P(this,a[s+l],e,l),h===$&&(h=this._$AH[l]),n||=!V(h)||h!==this._$AH[l],h===d?t=d:t!==d&&(t+=(h??"")+i[l+1]),this._$AH[l]=h}n&&!o&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},rt=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},it=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},nt=class extends T{constructor(t,e,s,o,i){super(t,e,s,o,i),this.type=5}_$AI(t,e=this){if((t=P(this,t,e,0)??d)===$)return;let s=this._$AH,o=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==d&&(s===d||o);o&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},at=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t)}};var Gt=lt.litHtmlPolyfillSupport;Gt?.(B,q),(lt.litHtmlVersions??=[]).push("3.3.3");var Tt=(r,t,e)=>{let s=e?.renderBefore??t,o=s._$litPart$;if(o===void 0){let i=e?.renderBefore??null;s._$litPart$=o=new q(t.insertBefore(L(),i),i,void 0,e??{})}return o._$AI(r),o};var dt=globalThis,A=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};A._$litElement$=!0,A.finalized=!0,dt.litElementHydrateSupport?.({LitElement:A});var Zt=dt.litElementPolyfillSupport;Zt?.({LitElement:A});(dt.litElementVersions??=[]).push("4.2.2");var Qt={attribute:!0,type:String,converter:k,reflect:!1,hasChanged:G},Xt=(r=Qt,t,e)=>{let{kind:s,metadata:o}=e,i=globalThis.litPropertyMetadata.get(o);if(i===void 0&&globalThis.litPropertyMetadata.set(o,i=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),i.set(e.name,r),s==="accessor"){let{name:n}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(n,l,r,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,r,a),a}}}if(s==="setter"){let{name:n}=e;return function(a){let l=this[n];t.call(this,a),this.requestUpdate(n,l,r,!0,a)}}throw Error("Unsupported decorator location: "+s)};function u(r){return(t,e)=>typeof e=="object"?Xt(r,t,e):((s,o,i)=>{let n=o.hasOwnProperty(i);return o.constructor.createProperty(i,s),n?Object.getOwnPropertyDescriptor(o,i):void 0})(r,t,e)}var O=(r,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(r,t,e),e);function pt(r){return(t,e)=>{let{slot:s,selector:o}=r??{},i="slot"+(s?`[name=${s}]`:":not([name])");return O(t,e,{get(){let n=this.renderRoot?.querySelector(i),a=n?.assignedElements(r)??[];return o===void 0?a:a.filter(l=>l.matches(o))}})}}var Ht={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ot=r=>(...t)=>({_$litDirective$:r,values:t}),Q=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var F=Ot(class extends Q{constructor(r){if(super(r),r.type!==Ht.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=r.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let o=!!t[s];o===this.st.has(s)||this.nt?.has(s)||(o?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return $}});var Rt=0,te=(r="")=>(Rt++,`${r}${Rt}`),Ut=te;var X="2.5.1",Mt="__vscodeElements_disableRegistryWarning__",Nt=(r,t)=>{console.warn(t?`[VSCode Elements] ${r}
%o`:`${r}
%o`,t)},x=class extends A{get version(){return X}warn(t){Nt(t,this)}},R=r=>t=>{if(!customElements.get(r)){customElements.define(r,t);return}if(Mt in window)return;let o=document.createElement(r)?.version,i="";o?o!==X?(i+="is already registered by a different version of VSCode Elements. ",i+=`This version is "${X}", while the other one is "${o}".`):i+=`is already registered by the same version of VSCode Elements (${X}).`:i+="is already registered by an unknown custom element handler class.",Nt(`The custom element "${r}" ${i}
To suppress this warning, set window.${Mt} to true`)};var U=b`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;var ee=[U,b`
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
  `],It=ee;var M=function(r,t,e,s){var o=arguments.length,i=o<3?t:s===null?s=Object.getOwnPropertyDescriptor(t,e):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,s);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(o<3?n(i):o>3?n(t,e,i):n(t,e))||i);return o>3&&i&&Object.defineProperty(t,e,i),i},f=class extends x{constructor(){super(...arguments),this.active=!1,this.ariaControls="",this.panel=!1,this.role="tab",this.tabId=-1}attributeChangedCallback(t,e,s){if(super.attributeChangedCallback(t,e,s),t==="active"){let o=s!==null;this.ariaSelected=o?"true":"false",this.tabIndex=o?0:-1}}render(){return H`
      <div
        class=${F({wrapper:!0,active:this.active,panel:this.panel})}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${F({"active-indicator":!0,active:this.active,panel:this.panel})}
        ></span>
      </div>
    `}};f.styles=It;M([u({type:Boolean,reflect:!0})],f.prototype,"active",void 0);M([u({reflect:!0,attribute:"aria-controls"})],f.prototype,"ariaControls",void 0);M([u({type:Boolean,reflect:!0})],f.prototype,"panel",void 0);M([u({reflect:!0})],f.prototype,"role",void 0);M([u({type:Number,reflect:!0,attribute:"tab-id"})],f.prototype,"tabId",void 0);f=M([R("vscode-tab-header")],f);var se=[U,b`
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
  `],jt=se;var N=function(r,t,e,s){var o=arguments.length,i=o<3?t:s===null?s=Object.getOwnPropertyDescriptor(t,e):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,s);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(o<3?n(i):o>3?n(t,e,i):n(t,e))||i);return o>3&&i&&Object.defineProperty(t,e,i),i},m=class extends x{constructor(){super(...arguments),this.hidden=!1,this.ariaLabelledby="",this.panel=!1,this.role="tabpanel",this.tabIndex=0}render(){return H` <slot></slot> `}};m.styles=jt;N([u({type:Boolean,reflect:!0})],m.prototype,"hidden",void 0);N([u({reflect:!0,attribute:"aria-labelledby"})],m.prototype,"ariaLabelledby",void 0);N([u({type:Boolean,reflect:!0})],m.prototype,"panel",void 0);N([u({reflect:!0})],m.prototype,"role",void 0);N([u({type:Number,reflect:!0})],m.prototype,"tabIndex",void 0);m=N([R("vscode-tab-panel")],m);var oe=[U,b`
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
  `],kt=oe;var z=function(r,t,e,s){var o=arguments.length,i=o<3?t:s===null?s=Object.getOwnPropertyDescriptor(t,e):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(r,t,e,s);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(i=(o<3?n(i):o>3?n(t,e,i):n(t,e))||i);return o>3&&i&&Object.defineProperty(t,e,i),i},E=class extends x{constructor(){super(),this.panel=!1,this.selectedIndex=0,this._tabHeaders=[],this._tabPanels=[],this._componentId="",this._tabFocus=0,this._componentId=Ut()}attributeChangedCallback(t,e,s){super.attributeChangedCallback(t,e,s),t==="selected-index"&&this._setActiveTab(),t==="panel"&&(this._tabHeaders.forEach(o=>o.panel=s!==null),this._tabPanels.forEach(o=>o.panel=s!==null))}_dispatchSelectEvent(){this.dispatchEvent(new CustomEvent("vsc-tabs-select",{detail:{selectedIndex:this.selectedIndex},composed:!0}))}_setActiveTab(){this._tabFocus=this.selectedIndex,this._tabPanels.forEach((t,e)=>{t.hidden=e!==this.selectedIndex}),this._tabHeaders.forEach((t,e)=>{t.active=e===this.selectedIndex})}_focusPrevTab(){this._tabFocus===0?this._tabFocus=this._tabHeaders.length-1:this._tabFocus-=1}_focusNextTab(){this._tabFocus===this._tabHeaders.length-1?this._tabFocus=0:this._tabFocus+=1}_onHeaderKeyDown(t){(t.key==="ArrowLeft"||t.key==="ArrowRight")&&(t.preventDefault(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","-1"),t.key==="ArrowLeft"?this._focusPrevTab():t.key==="ArrowRight"&&this._focusNextTab(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","0"),this._tabHeaders[this._tabFocus].focus()),t.key==="Enter"&&(t.preventDefault(),this.selectedIndex=this._tabFocus,this._dispatchSelectEvent())}_moveHeadersToHeaderSlot(){let t=this._mainSlotElements.filter(e=>e instanceof f);t.length>0&&t.forEach(e=>e.setAttribute("slot","header"))}_onMainSlotChange(){this._moveHeadersToHeaderSlot(),this._tabPanels=this._mainSlotElements.filter(t=>t instanceof m),this._tabPanels.forEach((t,e)=>{t.ariaLabelledby=`t${this._componentId}-h${e}`,t.id=`t${this._componentId}-p${e}`,t.panel=this.panel}),this._setActiveTab()}_onHeaderSlotChange(){this._tabHeaders=this._headerSlotElements.filter(t=>t instanceof f),this._tabHeaders.forEach((t,e)=>{t.tabId=e,t.id=`t${this._componentId}-h${e}`,t.ariaControls=`t${this._componentId}-p${e}`,t.panel=this.panel,t.active=e===this.selectedIndex})}_onHeaderClick(t){let s=t.composedPath().find(o=>o instanceof f);s&&(this.selectedIndex=s.tabId,this._setActiveTab(),this._dispatchSelectEvent())}render(){return H`
      <div
        class=${F({header:!0,panel:this.panel})}
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
    `}};E.styles=kt;z([u({type:Boolean,reflect:!0})],E.prototype,"panel",void 0);z([u({type:Number,reflect:!0,attribute:"selected-index"})],E.prototype,"selectedIndex",void 0);z([pt({slot:"header"})],E.prototype,"_headerSlotElements",void 0);z([pt()],E.prototype,"_mainSlotElements",void 0);E=z([R("vscode-tabs")],E);
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
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

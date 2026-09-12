var ce=globalThis,de=ce.ShadowRoot&&(ce.ShadyCSS===void 0||ce.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,we=Symbol(),De=new WeakMap,G=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==we)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(de&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=De.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&De.set(t,e))}return e}toString(){return this.cssText}},Ve=i=>new G(typeof i=="string"?i:i+"",void 0,we),f=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((s,o,r)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[r+1],i[0]);return new G(t,i,we)},Be=(i,e)=>{if(de)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),o=ce.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=t.cssText,i.appendChild(s)}},xe=de?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return Ve(t)})(i):i;var{is:wt,defineProperty:xt,getOwnPropertyDescriptor:$t,getOwnPropertyNames:St,getOwnPropertySymbols:Ct,getPrototypeOf:Et}=Object,pe=globalThis,Ue=pe.trustedTypes,At=Ue?Ue.emptyScript:"",Pt=pe.reactiveElementPolyfillSupport,J=(i,e)=>i,Q={toAttribute(i,e){switch(e){case Boolean:i=i?At:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},ue=(i,e)=>!wt(i,e),Ie={attribute:!0,type:String,converter:Q,reflect:!1,useDefault:!1,hasChanged:ue};Symbol.metadata??=Symbol("metadata"),pe.litPropertyMetadata??=new WeakMap;var O=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ie){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(e,s,t);o!==void 0&&xt(this.prototype,e,o)}}static getPropertyDescriptor(e,t,s){let{get:o,set:r}=$t(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:o,set(n){let l=o?.call(this);r?.call(this,n),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ie}static _$Ei(){if(this.hasOwnProperty(J("elementProperties")))return;let e=Et(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(J("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(J("properties"))){let t=this.properties,s=[...St(t),...Ct(t)];for(let o of s)this.createProperty(o,t[o])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,o]of t)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let o=this._$Eu(t,s);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let o of s)t.unshift(xe(o))}else e!==void 0&&t.push(xe(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Be(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,s);if(o!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:Q).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,o=s._$Eh.get(e);if(o!==void 0&&this._$Em!==o){let r=s.getPropertyOptions(o),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Q;this._$Em=o;let l=n.fromAttribute(t,r.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(e,t,s,o=!1,r){if(e!==void 0){let n=this.constructor;if(o===!1&&(r=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??ue)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:o,wrapped:r},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,r]of s){let{wrapped:n}=r,l=this[o];n!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,r,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};O.elementStyles=[],O.shadowRootOptions={mode:"open"},O[J("elementProperties")]=new Map,O[J("finalized")]=new Map,Pt?.({ReactiveElement:O}),(pe.reactiveElementVersions??=[]).push("2.1.2");var Re=globalThis,ke=i=>i,me=Re.trustedTypes,We=me?me.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ye="$lit$",V=`lit$${Math.random().toFixed(9).slice(2)}$`,Xe="?"+V,Rt=`<${Xe}>`,W=document,te=()=>W.createComment(""),se=i=>i===null||typeof i!="object"&&typeof i!="function",Te=Array.isArray,Tt=i=>Te(i)||typeof i?.[Symbol.iterator]=="function",$e=`[ 	
\f\r]`,ee=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ne=/-->/g,Le=/>/g,I=RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),je=/'/g,qe=/"/g,Ke=/^(?:script|style|textarea|title)$/i,He=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),u=He(1),Qt=He(2),es=He(3),A=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),Fe=new WeakMap,k=W.createTreeWalker(W,129);function Ze(i,e){if(!Te(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return We!==void 0?We.createHTML(e):e}var Ht=(i,e)=>{let t=i.length-1,s=[],o,r=e===2?"<svg>":e===3?"<math>":"",n=ee;for(let l=0;l<t;l++){let a=i[l],m,$,c=-1,C=0;for(;C<a.length&&(n.lastIndex=C,$=n.exec(a),$!==null);)C=n.lastIndex,n===ee?$[1]==="!--"?n=Ne:$[1]!==void 0?n=Le:$[2]!==void 0?(Ke.test($[2])&&(o=RegExp("</"+$[2],"g")),n=I):$[3]!==void 0&&(n=I):n===I?$[0]===">"?(n=o??ee,c=-1):$[1]===void 0?c=-2:(c=n.lastIndex-$[2].length,m=$[1],n=$[3]===void 0?I:$[3]==='"'?qe:je):n===qe||n===je?n=I:n===Ne||n===Le?n=ee:(n=I,o=void 0);let d=n===I&&i[l+1].startsWith("/>")?" ":"";r+=n===ee?a+Rt:c>=0?(s.push(m),a.slice(0,c)+Ye+a.slice(c)+V+d):a+V+(c===-2?l:d)}return[Ze(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},oe=class i{constructor({strings:e,_$litType$:t},s){let o;this.parts=[];let r=0,n=0,l=e.length-1,a=this.parts,[m,$]=Ht(e,t);if(this.el=i.createElement(m,s),k.currentNode=this.el.content,t===2||t===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=k.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(Ye)){let C=$[n++],d=o.getAttribute(c).split(V),D=/([.?@])?(.*)/.exec(C);a.push({type:1,index:r,name:D[2],strings:d,ctor:D[1]==="."?Ce:D[1]==="?"?Ee:D[1]==="@"?Ae:Y}),o.removeAttribute(c)}else c.startsWith(V)&&(a.push({type:6,index:r}),o.removeAttribute(c));if(Ke.test(o.tagName)){let c=o.textContent.split(V),C=c.length-1;if(C>0){o.textContent=me?me.emptyScript:"";for(let d=0;d<C;d++)o.append(c[d],te()),k.nextNode(),a.push({type:2,index:++r});o.append(c[C],te())}}}else if(o.nodeType===8)if(o.data===Xe)a.push({type:2,index:r});else{let c=-1;for(;(c=o.data.indexOf(V,c+1))!==-1;)a.push({type:7,index:r}),c+=V.length-1}r++}}static createElement(e,t){let s=W.createElement("template");return s.innerHTML=e,s}};function F(i,e,t=i,s){if(e===A)return e;let o=s!==void 0?t._$Co?.[s]:t._$Cl,r=se(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),r===void 0?o=void 0:(o=new r(i),o._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=o:t._$Cl=o),o!==void 0&&(e=F(i,o._$AS(i,e.values),o,s)),e}var Se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,o=(e?.creationScope??W).importNode(t,!0);k.currentNode=o;let r=k.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let m;a.type===2?m=new re(r,r.nextSibling,this,e):a.type===1?m=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(m=new Pe(r,this,e)),this._$AV.push(m),a=s[++l]}n!==a?.index&&(r=k.nextNode(),n++)}return k.currentNode=W,o}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},re=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,o){this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=F(this,e,t),se(e)?e===b||e==null||e===""?(this._$AH!==b&&this._$AR(),this._$AH=b):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Tt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==b&&se(this._$AH)?this._$AA.nextSibling.data=e:this.T(W.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,o=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=oe.createElement(Ze(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(t);else{let r=new Se(o,this),n=r.u(this.options);r.p(t),this.T(n),this._$AH=r}}_$AC(e){let t=Fe.get(e.strings);return t===void 0&&Fe.set(e.strings,t=new oe(e)),t}k(e){Te(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,o=0;for(let r of e)o===t.length?t.push(s=new i(this.O(te()),this.O(te()),this,this.options)):s=t[o],s._$AI(r),o++;o<t.length&&(this._$AR(s&&s._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=ke(e).nextSibling;ke(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Y=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,o,r){this.type=1,this._$AH=b,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b}_$AI(e,t=this,s,o){let r=this.strings,n=!1;if(r===void 0)e=F(this,e,t,0),n=!se(e)||e!==this._$AH&&e!==A,n&&(this._$AH=e);else{let l=e,a,m;for(e=r[0],a=0;a<r.length-1;a++)m=F(this,l[s+a],t,a),m===A&&(m=this._$AH[a]),n||=!se(m)||m!==this._$AH[a],m===b?e=b:e!==b&&(e+=(m??"")+r[a+1]),this._$AH[a]=m}n&&!o&&this.j(e)}j(e){e===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Ce=class extends Y{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===b?void 0:e}},Ee=class extends Y{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==b)}},Ae=class extends Y{constructor(e,t,s,o,r){super(e,t,s,o,r),this.type=5}_$AI(e,t=this){if((e=F(this,e,t,0)??b)===A)return;let s=this._$AH,o=e===b&&s!==b||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==b&&(s===b||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pe=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){F(this,e)}};var Ot=Re.litHtmlPolyfillSupport;Ot?.(oe,re),(Re.litHtmlVersions??=[]).push("3.3.3");var Ge=(i,e,t)=>{let s=t?.renderBefore??e,o=s._$litPart$;if(o===void 0){let r=t?.renderBefore??null;s._$litPart$=o=new re(e.insertBefore(te(),r),r,void 0,t??{})}return o._$AI(i),o};var Oe=globalThis,B=class extends O{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ge(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};B._$litElement$=!0,B.finalized=!0,Oe.litElementHydrateSupport?.({LitElement:B});var zt=Oe.litElementPolyfillSupport;zt?.({LitElement:B});(Oe.litElementVersions??=[]).push("4.2.2");var Mt={attribute:!0,type:String,converter:Q,reflect:!1,hasChanged:ue},Dt=(i=Mt,e,t)=>{let{kind:s,metadata:o}=t,r=globalThis.litPropertyMetadata.get(o);if(r===void 0&&globalThis.litPropertyMetadata.set(o,r=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),r.set(t.name,i),s==="accessor"){let{name:n}=t;return{set(l){let a=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,a,i,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,i,l),l}}}if(s==="setter"){let{name:n}=t;return function(l){let a=this[n];e.call(this,l),this.requestUpdate(n,a,i,!0,l)}}throw Error("Unsupported decorator location: "+s)};function h(i){return(e,t)=>typeof t=="object"?Dt(i,e,t):((s,o,r)=>{let n=o.hasOwnProperty(r);return o.constructor.createProperty(r,s),n?Object.getOwnPropertyDescriptor(o,r):void 0})(i,e,t)}function H(i){return h({...i,state:!0,attribute:!1})}var z=(i,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(i,e,t),t);function N(i,e){return(t,s,o)=>{let r=n=>n.renderRoot?.querySelector(i)??null;if(e){let{get:n,set:l}=typeof s=="object"?t:o??(()=>{let a=Symbol();return{get(){return this[a]},set(m){this[a]=m}}})();return z(t,s,{get(){let a=n.call(this);return a===void 0&&(a=r(this),(a!==null||this.hasUpdated)&&l.call(this,a)),a}})}return z(t,s,{get(){return r(this)}})}}var Vt;function Je(i){return(e,t)=>z(e,t,{get(){return(this.renderRoot??(Vt??=document.createDocumentFragment())).querySelectorAll(i)}})}function M(i){return(e,t)=>{let{slot:s,selector:o}=i??{},r="slot"+(s?`[name=${s}]`:":not([name])");return z(e,t,{get(){let n=this.renderRoot?.querySelector(r),l=n?.assignedElements(i)??[];return o===void 0?l:l.filter(a=>a.matches(o))}})}}var fe={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},be=i=>(...e)=>({_$litDirective$:i,values:e}),X=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var P=be(class extends X{constructor(i){if(super(i),i.type!==fe.ATTRIBUTE||i.name!=="class"||i.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(e=>i[e]).join(" ")+" "}update(i,[e]){if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in e)e[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(e)}let t=i.element.classList;for(let s of this.st)s in e||(t.remove(s),this.st.delete(s));for(let s in e){let o=!!e[s];o===this.st.has(s)||this.nt?.has(s)||(o?(t.add(s),this.st.add(s)):(t.remove(s),this.st.delete(s)))}return A}});var Qe=0,Bt=(i="")=>(Qe++,`${i}${Qe}`),et=Bt;var _e="2.5.1",tt="__vscodeElements_disableRegistryWarning__",st=(i,e)=>{console.warn(e?`[VSCode Elements] ${i}
%o`:`${i}
%o`,e)},_=class extends B{get version(){return _e}warn(e){st(e,this)}},y=i=>e=>{if(!customElements.get(i)){customElements.define(i,e);return}if(tt in window)return;let o=document.createElement(i)?.version,r="";o?o!==_e?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${_e}", while the other one is "${o}".`):r+=`is already registered by the same version of VSCode Elements (${_e}).`:r+="is already registered by an unknown custom element handler class.",st(`The custom element "${i}" ${r}
To suppress this warning, set window.${tt} to true`)};var w=f`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;var Ut=[w,f`
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
  `],ot=Ut;var K=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},E=class extends _{constructor(){super(...arguments),this.active=!1,this.ariaControls="",this.panel=!1,this.role="tab",this.tabId=-1}attributeChangedCallback(e,t,s){if(super.attributeChangedCallback(e,t,s),e==="active"){let o=s!==null;this.ariaSelected=o?"true":"false",this.tabIndex=o?0:-1}}render(){return u`
      <div
        class=${P({wrapper:!0,active:this.active,panel:this.panel})}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${P({"active-indicator":!0,active:this.active,panel:this.panel})}
        ></span>
      </div>
    `}};E.styles=ot;K([h({type:Boolean,reflect:!0})],E.prototype,"active",void 0);K([h({reflect:!0,attribute:"aria-controls"})],E.prototype,"ariaControls",void 0);K([h({type:Boolean,reflect:!0})],E.prototype,"panel",void 0);K([h({reflect:!0})],E.prototype,"role",void 0);K([h({type:Number,reflect:!0,attribute:"tab-id"})],E.prototype,"tabId",void 0);E=K([y("vscode-tab-header")],E);var It=[w,f`
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
  `],rt=It;var Z=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},T=class extends _{constructor(){super(...arguments),this.hidden=!1,this.ariaLabelledby="",this.panel=!1,this.role="tabpanel",this.tabIndex=0}render(){return u` <slot></slot> `}};T.styles=rt;Z([h({type:Boolean,reflect:!0})],T.prototype,"hidden",void 0);Z([h({reflect:!0,attribute:"aria-labelledby"})],T.prototype,"ariaLabelledby",void 0);Z([h({type:Boolean,reflect:!0})],T.prototype,"panel",void 0);Z([h({reflect:!0})],T.prototype,"role",void 0);Z([h({type:Number,reflect:!0})],T.prototype,"tabIndex",void 0);T=Z([y("vscode-tab-panel")],T);var kt=[w,f`
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
  `],it=kt;var ie=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},U=class extends _{constructor(){super(),this.panel=!1,this.selectedIndex=0,this._tabHeaders=[],this._tabPanels=[],this._componentId="",this._tabFocus=0,this._componentId=et()}attributeChangedCallback(e,t,s){super.attributeChangedCallback(e,t,s),e==="selected-index"&&this._setActiveTab(),e==="panel"&&(this._tabHeaders.forEach(o=>o.panel=s!==null),this._tabPanels.forEach(o=>o.panel=s!==null))}_dispatchSelectEvent(){this.dispatchEvent(new CustomEvent("vsc-tabs-select",{detail:{selectedIndex:this.selectedIndex},composed:!0}))}_setActiveTab(){this._tabFocus=this.selectedIndex,this._tabPanels.forEach((e,t)=>{e.hidden=t!==this.selectedIndex}),this._tabHeaders.forEach((e,t)=>{e.active=t===this.selectedIndex})}_focusPrevTab(){this._tabFocus===0?this._tabFocus=this._tabHeaders.length-1:this._tabFocus-=1}_focusNextTab(){this._tabFocus===this._tabHeaders.length-1?this._tabFocus=0:this._tabFocus+=1}_onHeaderKeyDown(e){(e.key==="ArrowLeft"||e.key==="ArrowRight")&&(e.preventDefault(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","-1"),e.key==="ArrowLeft"?this._focusPrevTab():e.key==="ArrowRight"&&this._focusNextTab(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","0"),this._tabHeaders[this._tabFocus].focus()),e.key==="Enter"&&(e.preventDefault(),this.selectedIndex=this._tabFocus,this._dispatchSelectEvent())}_moveHeadersToHeaderSlot(){let e=this._mainSlotElements.filter(t=>t instanceof E);e.length>0&&e.forEach(t=>t.setAttribute("slot","header"))}_onMainSlotChange(){this._moveHeadersToHeaderSlot(),this._tabPanels=this._mainSlotElements.filter(e=>e instanceof T),this._tabPanels.forEach((e,t)=>{e.ariaLabelledby=`t${this._componentId}-h${t}`,e.id=`t${this._componentId}-p${t}`,e.panel=this.panel}),this._setActiveTab()}_onHeaderSlotChange(){this._tabHeaders=this._headerSlotElements.filter(e=>e instanceof E),this._tabHeaders.forEach((e,t)=>{e.tabId=t,e.id=`t${this._componentId}-h${t}`,e.ariaControls=`t${this._componentId}-p${t}`,e.panel=this.panel,e.active=t===this.selectedIndex})}_onHeaderClick(e){let s=e.composedPath().find(o=>o instanceof E);s&&(this.selectedIndex=s.tabId,this._setActiveTab(),this._dispatchSelectEvent())}render(){return u`
      <div
        class=${P({header:!0,panel:this.panel})}
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
    `}};U.styles=it;ie([h({type:Boolean,reflect:!0})],U.prototype,"panel",void 0);ie([h({type:Number,reflect:!0,attribute:"selected-index"})],U.prototype,"selectedIndex",void 0);ie([M({slot:"header"})],U.prototype,"_headerSlotElements",void 0);ie([M()],U.prototype,"_mainSlotElements",void 0);U=ie([y("vscode-tabs")],U);var ze=class extends X{constructor(e){if(super(e),this._prevProperties={},e.type!==fe.PROPERTY||e.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(e,[t]){return Object.entries(t).forEach(([s,o])=>{this._prevProperties[s]!==o&&(s.startsWith("--")?e.element.style.setProperty(s,o):e.element.style[s]=o,this._prevProperties[s]=o)}),A}render(e){return A}},L=be(ze);var Wt=[w,f`
    :host {
      display: block;
      position: relative;
    }

    .scrollable-container {
      height: 100%;
      overflow: auto;
    }

    .scrollable-container::-webkit-scrollbar {
      cursor: default;
      width: 0;
    }

    .scrollable-container {
      scrollbar-width: none;
    }

    .shadow {
      box-shadow: var(--vscode-scrollbar-shadow, #000000) 0 6px 6px -6px inset;
      display: none;
      height: 3px;
      left: 0;
      pointer-events: none;
      position: absolute;
      top: 0;
      z-index: 1;
      width: 100%;
    }

    .shadow.visible {
      display: block;
    }

    .scrollbar-track {
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      width: 10px;
      z-index: 100;
    }

    .scrollbar-track.hidden {
      display: none;
    }

    .scrollbar-thumb {
      background-color: transparent;
      min-height: var(--min-thumb-height, 20px);
      opacity: 0;
      position: absolute;
      right: 0;
      width: 10px;
    }

    .scrollbar-thumb.visible {
      background-color: var(
        --vscode-scrollbarSlider-background,
        rgba(121, 121, 121, 0.4)
      );
      opacity: 1;
      transition: opacity 100ms;
    }

    .scrollbar-thumb.fade {
      background-color: var(
        --vscode-scrollbarSlider-background,
        rgba(121, 121, 121, 0.4)
      );
      opacity: 0;
      transition: opacity 800ms;
    }

    .scrollbar-thumb.visible:hover {
      background-color: var(
        --vscode-scrollbarSlider-hoverBackground,
        rgba(100, 100, 100, 0.7)
      );
    }

    .scrollbar-thumb.visible.active,
    .scrollbar-thumb.visible.active:hover {
      background-color: var(
        --vscode-scrollbarSlider-activeBackground,
        rgba(191, 191, 191, 0.4)
      );
    }

    .prevent-interaction {
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      position: absolute;
      z-index: 99;
    }

    .content {
      overflow: hidden;
    }
  `],nt=Wt;var S=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},g=class extends _{set scrollPos(e){this._scrollPos=this._limitScrollPos(e),this._updateScrollbar(),this._updateThumbPosition(),this.requestUpdate()}get scrollPos(){return this._scrollPos}get scrollMax(){return this._scrollableContainer?this._scrollableContainer.scrollHeight-this._scrollableContainer.clientHeight:0}constructor(){super(),this.alwaysVisible=!1,this.fastScrollSensitivity=5,this.minThumbSize=20,this.mouseWheelScrollSensitivity=1,this.shadow=!0,this.scrolled=!1,this._scrollPos=0,this._isDragging=!1,this._thumbHeight=0,this._thumbY=0,this._thumbVisible=!1,this._thumbFade=!1,this._thumbActive=!1,this._componentHeight=0,this._contentHeight=0,this._scrollThumbStartY=0,this._mouseStartY=0,this._scrollbarVisible=!0,this._scrollbarTrackZ=0,this._resizeObserverCallback=()=>{this._componentHeight=this.offsetHeight,this._contentHeight=this._contentElement.offsetHeight,this._updateScrollbar(),this._updateThumbPosition()},this._handleSlotChange=()=>{this._updateScrollbar(),this._updateThumbPosition(),this._zIndexFix()},this._handleScrollThumbMouseMove=e=>{let t=this._scrollThumbStartY+(e.screenY-this._mouseStartY);this._thumbY=this._limitThumbPos(t),this.scrollPos=this._calculateScrollPosFromThumbPos(this._thumbY),this.dispatchEvent(new CustomEvent("vsc-scrollable-scroll",{detail:this.scrollPos}))},this._handleScrollThumbMouseUp=e=>{this._isDragging=!1,this._thumbActive=!1;let t=this.getBoundingClientRect(),{x:s,y:o,width:r,height:n}=t,{pageX:l,pageY:a}=e;(l>s+r||l<s||a>o+n||a<o)&&(this._thumbFade=!0,this._thumbVisible=!1),document.removeEventListener("mousemove",this._handleScrollThumbMouseMove),document.removeEventListener("mouseup",this._handleScrollThumbMouseUp)},this._handleComponentMouseOver=()=>{this._thumbVisible=!0,this._thumbFade=!1},this._handleComponentMouseOut=()=>{this._thumbActive||(this._thumbVisible=!1,this._thumbFade=!0)},this._handleComponentWheel=e=>{if(this._contentHeight<=this._componentHeight)return;e.preventDefault();let t=e.altKey?this.mouseWheelScrollSensitivity*this.fastScrollSensitivity:this.mouseWheelScrollSensitivity;this.scrollPos=this._limitScrollPos(this.scrollPos+e.deltaY*t),this.dispatchEvent(new CustomEvent("vsc-scrollable-scroll",{detail:this.scrollPos}))},this._handleScrollableContainerScroll=e=>{e.currentTarget&&(this.scrollPos=e.currentTarget.scrollTop)},this.addEventListener("mouseover",this._handleComponentMouseOver),this.addEventListener("mouseout",this._handleComponentMouseOut),this.addEventListener("wheel",this._handleComponentWheel)}connectedCallback(){super.connectedCallback(),this._hostResizeObserver=new ResizeObserver(this._resizeObserverCallback),this._contentResizeObserver=new ResizeObserver(this._resizeObserverCallback),this.requestUpdate(),this.updateComplete.then(()=>{this._hostResizeObserver.observe(this),this._contentResizeObserver.observe(this._contentElement),this._updateThumbPosition()})}disconnectedCallback(){super.disconnectedCallback(),this._hostResizeObserver.unobserve(this),this._hostResizeObserver.disconnect(),this._contentResizeObserver.unobserve(this._contentElement),this._contentResizeObserver.disconnect()}firstUpdated(e){this._updateThumbPosition()}_calcThumbHeight(){let e=this.offsetHeight,t=this._contentElement?.offsetHeight??0,s=e*(e/t);return Math.max(this.minThumbSize,s)}_updateScrollbar(){let e=this._contentElement?.offsetHeight??0;this.offsetHeight>=e?this._scrollbarVisible=!1:(this._scrollbarVisible=!0,this._thumbHeight=this._calcThumbHeight()),this.requestUpdate()}_zIndexFix(){let e=0;this._assignedElements.forEach(t=>{if("style"in t){let s=window.getComputedStyle(t).zIndex;/([0-9-])+/g.test(s)&&(e=Number(s)>e?Number(s):e)}}),this._scrollbarTrackZ=e+1,this.requestUpdate()}_updateThumbPosition(){if(!this._scrollableContainer)return;this.scrolled=this.scrollPos>0;let e=this.offsetHeight,t=this._thumbHeight,o=this._contentElement.offsetHeight-e,r=this.scrollPos/o,n=e-t;this._thumbY=Math.min(r*(e-t),n)}_calculateScrollPosFromThumbPos(e){let t=this.getBoundingClientRect().height,s=this._scrollThumbElement.getBoundingClientRect().height,o=this._contentElement.getBoundingClientRect().height,r=e/(t-s)*(o-t);return this._limitScrollPos(r)}_limitScrollPos(e){return e<0?0:e>this.scrollMax?this.scrollMax:e}_limitThumbPos(e){let t=this.getBoundingClientRect().height,s=this._scrollThumbElement.getBoundingClientRect().height;return e<0?0:e>t-s?t-s:e}_handleScrollThumbMouseDown(e){let t=this.getBoundingClientRect(),s=this._scrollThumbElement.getBoundingClientRect();this._mouseStartY=e.screenY,this._scrollThumbStartY=s.top-t.top,this._isDragging=!0,this._thumbActive=!0,document.addEventListener("mousemove",this._handleScrollThumbMouseMove),document.addEventListener("mouseup",this._handleScrollThumbMouseUp)}_handleScrollbarTrackPress(e){e.target===e.currentTarget&&(this._thumbY=e.offsetY-this._thumbHeight/2,this.scrollPos=this._calculateScrollPosFromThumbPos(this._thumbY))}render(){return u`
      <div
        class="scrollable-container"
        .style=${L({userSelect:this._isDragging?"none":"auto"})}
        .scrollTop=${this.scrollPos}
        @scroll=${this._handleScrollableContainerScroll}
      >
        <div
          class=${P({shadow:!0,visible:this.scrolled})}
          .style=${L({zIndex:String(this._scrollbarTrackZ)})}
        ></div>
        ${this._isDragging?u`<div class="prevent-interaction"></div>`:b}
        <div
          class=${P({"scrollbar-track":!0,hidden:!this._scrollbarVisible})}
          @mousedown=${this._handleScrollbarTrackPress}
        >
          <div
            class=${P({"scrollbar-thumb":!0,visible:this.alwaysVisible?!0:this._thumbVisible,fade:this.alwaysVisible?!1:this._thumbFade,active:this._thumbActive})}
            .style=${L({height:`${this._thumbHeight}px`,top:`${this._thumbY}px`})}
            @mousedown=${this._handleScrollThumbMouseDown}
          ></div>
        </div>
        <div class="content">
          <slot @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `}};g.styles=nt;S([h({type:Boolean,reflect:!0,attribute:"always-visible"})],g.prototype,"alwaysVisible",void 0);S([h({type:Number,attribute:"fast-scroll-sensitivity"})],g.prototype,"fastScrollSensitivity",void 0);S([h({type:Number,attribute:"min-thumb-size"})],g.prototype,"minThumbSize",void 0);S([h({type:Number,attribute:"mouse-wheel-scroll-sensitivity"})],g.prototype,"mouseWheelScrollSensitivity",void 0);S([h({type:Boolean,reflect:!0})],g.prototype,"shadow",void 0);S([h({type:Boolean,reflect:!0})],g.prototype,"scrolled",void 0);S([h({type:Number,attribute:"scroll-pos"})],g.prototype,"scrollPos",null);S([H()],g.prototype,"_isDragging",void 0);S([H()],g.prototype,"_thumbHeight",void 0);S([H()],g.prototype,"_thumbY",void 0);S([H()],g.prototype,"_thumbVisible",void 0);S([H()],g.prototype,"_thumbFade",void 0);S([H()],g.prototype,"_thumbActive",void 0);S([N(".content")],g.prototype,"_contentElement",void 0);S([N(".scrollbar-thumb",!0)],g.prototype,"_scrollThumbElement",void 0);S([N(".scrollable-container")],g.prototype,"_scrollableContainer",void 0);S([M()],g.prototype,"_assignedElements",void 0);g=S([y("vscode-scrollable")],g);var R=i=>i,x=i=>i,lt=(i,e)=>x(i/e*100),at=(i,e)=>R(i/100*e),Nt=[{test:i=>/^-?\d+(\.\d+)?%$/.test(i),parse:i=>Number(i.slice(0,-1))},{test:i=>/^-?\d+(\.\d+)?px$/.test(i),parse:(i,e)=>Number(i.slice(0,-2))/e*100},{test:i=>/^-?\d+(\.\d+)?$/.test(i),parse:(i,e)=>Number(i)/e*100}],ne=(i,e)=>{if(!Number.isFinite(e)||e===0)return null;if(typeof i=="number")return Number.isFinite(i)?x(i/e*100):null;let t=i.trim(),s=Nt.find(o=>o.test(t));return s?x(s.parse(t,e)):null};var ht=5,ct=1,Lt=[w,f`
    :host {
      display: block;
      --vsc-row-even-background: transparent;
      --vsc-row-odd-background: transparent;
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 0;
      --vsc-row-display: table-row;
    }

    :host([bordered]),
    :host([bordered-rows]) {
      --vsc-row-border-bottom-width: 1px;
    }

    :host([compact]) {
      --vsc-row-display: block;
    }

    :host([bordered][compact]),
    :host([bordered-rows][compact]) {
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 1px;
    }

    :host([zebra]) {
      --vsc-row-even-background: var(
        --vscode-keybindingTable-rowsBackground,
        rgba(204, 204, 204, 0.04)
      );
    }

    :host([zebra-odd]) {
      --vsc-row-odd-background: var(
        --vscode-keybindingTable-rowsBackground,
        rgba(204, 204, 204, 0.04)
      );
    }

    ::slotted(vscode-table-row) {
      width: 100%;
    }

    .wrapper {
      height: 100%;
      max-width: 100%;
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .wrapper.select-disabled {
      user-select: none;
    }

    .wrapper.resize-cursor {
      cursor: ew-resize;
    }

    .wrapper.compact-view .header-slot-wrapper {
      height: 0;
      overflow: hidden;
    }

    .scrollable {
      height: 100%;
    }

    .scrollable:before {
      background-color: transparent;
      content: '';
      display: block;
      height: 1px;
      position: absolute;
      width: 100%;
    }

    .wrapper:not(.compact-view) .scrollable:not([scrolled]):before {
      background-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
    }

    .sash {
      visibility: hidden;
    }

    :host([bordered-columns]) .sash,
    :host([bordered]) .sash {
      visibility: visible;
    }

    :host([resizable]) .wrapper:hover .sash {
      visibility: visible;
    }

    .sash {
      height: 100%;
      position: absolute;
      top: 0;
      width: 1px;
    }

    .wrapper.compact-view .sash {
      display: none;
    }

    .sash.resizable {
      cursor: ew-resize;
    }

    .sash-visible {
      background-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
      height: calc(100% - 30px);
      position: absolute;
      top: 30px;
      width: ${ct}px;
    }

    .sash.hover .sash-visible {
      background-color: var(--vscode-sash-hoverBorder, #0078d4);
      transition: background-color 50ms linear 300ms;
    }

    .sash .sash-clickable {
      height: 100%;
      left: ${0-(ht-ct)/2}px;
      position: absolute;
      width: ${ht}px;
    }
  `],dt=Lt;function pt(i,e,t,s){let o=[...i];if(t===0||e<0||e>=i.length-1)return o;let r=Math.abs(t),n=x(r),l=[],a=[];for(let d=e;d>=0;d--)l.push(d);for(let d=e+1;d<i.length;d++)a.push(d);let m=t>0?a:l,$=t>0?l:a,c=x(0);for(let d of m){let D=Math.max(0,o[d]-(s.get(d)??0));c=x(c+D)}if(c<n)return o;for(let d of m){if(n===0)break;let D=Math.max(0,o[d]-(s.get(d)??0)),Me=Math.min(D,n);o[d]=x(o[d]-Me),n=x(n-Me)}let C=x(r);for(let d of $){if(C===0)break;o[d]=x(o[d]+C),C=x(0)}return o}var ve=class{constructor(e){this._hostWidth=R(0),this._hostX=R(0),this._activeSplitter=null,this._columnMinWidths=new Map,this._columnWidths=[],this._dragState=null,this._cachedSplitterPositions=null,(this._host=e).addController(this)}hostConnected(){this.saveHostDimensions()}get isDragging(){return this._dragState!==null}get splitterPositions(){if(this._cachedSplitterPositions)return this._cachedSplitterPositions;let e=[],t=x(0);for(let s=0;s<this._columnWidths.length-1;s++)t=x(t+this._columnWidths[s]),e.push(t);return this._cachedSplitterPositions=e,e}getActiveSplitterCalculatedPosition(){let e=this.splitterPositions;if(!this._dragState)return R(0);let t=e[this._dragState.splitterIndex];return this._toPx(t)}get columnWidths(){return this._columnWidths}get columnMinWidths(){return new Map(this._columnMinWidths)}saveHostDimensions(){let e=this._host.getBoundingClientRect(),{width:t,x:s}=e;return this._hostWidth=R(t),this._hostX=R(s),this}setActiveSplitter(e){return this._activeSplitter=e,this}getActiveSplitter(){return this._activeSplitter}setColumnMinWidthAt(e,t){return this._columnMinWidths.set(e,t),this._host.requestUpdate(),this}setColumWidths(e){return this._columnWidths=e,this._cachedSplitterPositions=null,this._host.requestUpdate(),this}shouldDrag(e){return+e.currentTarget.dataset.index===this._dragState?.splitterIndex}startDrag(e){if(e.stopPropagation(),this._dragState)return;this._activeSplitter?.setPointerCapture(e.pointerId);let t=e.pageX,s=e.currentTarget,o=s.getBoundingClientRect().x,r=R(t-o);this._dragState={dragOffset:R(r),pointerId:e.pointerId,splitterIndex:+s.dataset.index,prevX:R(t-r)},this._host.requestUpdate()}drag(e){if(e.stopPropagation(),!e?.currentTarget?.hasPointerCapture?.(e.pointerId)||!this._dragState||e.pointerId!==this._dragState.pointerId||!this.shouldDrag(e))return;let t=e.pageX,s=R(t-this._dragState.dragOffset),o=R(s-this._dragState.prevX),r=this._toPercent(o);this._dragState.prevX=s;let n=this.getActiveSplitterCalculatedPosition();o<=0&&t>n+this._hostX||o>0&&t<n+this._hostX||(this._columnWidths=pt(this._columnWidths,this._dragState.splitterIndex,r,this._columnMinWidths),this._cachedSplitterPositions=null,this._host.requestUpdate())}stopDrag(e){if(e.stopPropagation(),!this._dragState)return;let t=e.currentTarget;try{t.releasePointerCapture(this._dragState.pointerId)}catch{}this._dragState=null,this._activeSplitter=null,this._host.requestUpdate()}_toPercent(e){return lt(e,this._hostWidth)}_toPx(e){return at(e,this._hostWidth)}};var v=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},p=class extends _{set columns(e){if(!Array.isArray(e)){this.warn('Invalid value for "columns": expected an array.'),this._columns=[];return}this._columns=e,this.isConnected&&this._initDefaultColumnSizes()}get columns(){return this._columns}constructor(){super(),this.role="table",this.resizable=!1,this.responsive=!1,this.bordered=!1,this.borderedColumns=!1,this.borderedRows=!1,this.breakpoint=300,this.minColumnWidth="50px",this.delayedResizing=!1,this.compact=!1,this.zebra=!1,this.zebraOdd=!1,this._sashPositions=[],this._isDragging=!1,this._sashHovers=[],this._columns=[],this._activeSashElementIndex=-1,this._componentH=0,this._componentW=0,this._headerCells=[],this._cellsOfFirstRow=[],this._prevHeaderHeight=0,this._prevComponentHeight=0,this._columnResizeController=new ve(this),this._componentResizeObserverCallback=()=>{this._memoizeComponentDimensions(),this._updateResizeHandlersSize(),this.responsive&&this._toggleCompactView(),this._resizeTableBody()},this._headerResizeObserverCallback=()=>{this._updateResizeHandlersSize()},this._bodyResizeObserverCallback=()=>{this._resizeTableBody()},this._handleSplitterPointerMove=e=>{this._columnResizeController.shouldDrag(e)&&(this._columnResizeController.drag(e),this.delayedResizing?this._resizeColumns(!1):this._resizeColumns(!0))},this._handleSplitterPointerUp=e=>{this._stopDrag(e)},this._handleSplitterPointerCancel=e=>{this._stopDrag(e)},this._handleMinColumnWidthChange=e=>{let{columnIndex:t,propertyValue:s}=e.detail,o=ne(s,this._componentW);o&&this._columnResizeController.setColumnMinWidthAt(t,o)},this.addEventListener("vsc-table-change-min-column-width",this._handleMinColumnWidthChange)}connectedCallback(){super.connectedCallback(),this._memoizeComponentDimensions(),this._initDefaultColumnSizes()}disconnectedCallback(){super.disconnectedCallback(),this._componentResizeObserver?.unobserve(this),this._componentResizeObserver?.disconnect(),this._bodyResizeObserver?.disconnect()}willUpdate(e){if(e.has("minColumnWidth")){let t=x(ne(this.minColumnWidth,this._componentW)??0),s=this._columnResizeController.columnMinWidths,o=this._columnResizeController.columnWidths;for(let r=0;r<o.length;r++)s.has(r)||this._columnResizeController.setColumnMinWidthAt(r,t)}}_memoizeComponentDimensions(){let e=this.getBoundingClientRect();this._componentH=e.height,this._componentW=e.width}_queryHeaderCells(){let e=this._assignedHeaderElements;return e&&e[0]?Array.from(e[0].querySelectorAll("vscode-table-header-cell")):[]}_getHeaderCells(){return this._headerCells.length||(this._headerCells=this._queryHeaderCells()),this._headerCells}_queryCellsOfFirstRow(){let e=this._assignedBodyElements;return e&&e[0]?Array.from(e[0].querySelectorAll("vscode-table-row:first-child vscode-table-cell")):[]}_getCellsOfFirstRow(){return this._cellsOfFirstRow.length||(this._cellsOfFirstRow=this._queryCellsOfFirstRow()),this._cellsOfFirstRow}_resizeTableBody(){let e=0,t=0,s=this.getBoundingClientRect().height;this._assignedHeaderElements&&this._assignedHeaderElements.length&&(e=this._assignedHeaderElements[0].getBoundingClientRect().height),this._assignedBodyElements&&this._assignedBodyElements.length&&(t=this._assignedBodyElements[0].getBoundingClientRect().height);let o=t-e-s;this._scrollableElement.style.height=o>0?`${s-e}px`:"auto"}_initResizeObserver(){this._componentResizeObserver=new ResizeObserver(this._componentResizeObserverCallback),this._componentResizeObserver.observe(this),this._headerResizeObserver=new ResizeObserver(this._headerResizeObserverCallback),this._headerResizeObserver.observe(this._headerElement)}_calculateInitialColumnWidths(){let e=this._getHeaderCells().length,t=this.columns.slice(0,e),s=t.filter(r=>r==="auto").length+e-t.length,o=100;if(t=t.map(r=>{let n=ne(r,this._componentW);return n===null?"auto":(o-=n,n)}),t.length<e)for(let r=t.length;r<e;r++)t.push("auto");return t=t.map(r=>r==="auto"?o/s:r),t}_initHeaderCellSizes(e){this._getHeaderCells().forEach((t,s)=>{t.style.width=`${e[s]}%`})}_initBodyColumnSizes(e){this._getCellsOfFirstRow().forEach((t,s)=>{t.style.width=`${e[s]}%`})}_initSashes(e){let t=e.length,s=0;this._sashPositions=[],e.forEach((o,r)=>{if(r<t-1){let n=s+o;this._sashPositions.push(n),s=n}})}_initDefaultColumnSizes(){let e=this._calculateInitialColumnWidths();this._columnResizeController.setColumWidths(e.map(t=>x(t))),this._initHeaderCellSizes(e),this._initBodyColumnSizes(e),this._initSashes(e)}_updateResizeHandlersSize(){let e=this._headerElement.getBoundingClientRect();if(e.height===this._prevHeaderHeight&&this._componentH===this._prevComponentHeight)return;this._prevHeaderHeight=e.height,this._prevComponentHeight=this._componentH;let t=this._componentH-e.height;this._sashVisibleElements.forEach(s=>{s.style.height=`${t}px`,s.style.top=`${e.height}px`})}_applyCompactViewColumnLabels(){let t=this._getHeaderCells().map(o=>o.innerText);this.querySelectorAll("vscode-table-row").forEach(o=>{o.querySelectorAll("vscode-table-cell").forEach((n,l)=>{n.columnLabel=t[l],n.compact=!0})})}_clearCompactViewColumnLabels(){this.querySelectorAll("vscode-table-cell").forEach(e=>{e.columnLabel="",e.compact=!1})}_toggleCompactView(){let t=this.getBoundingClientRect().width<this.breakpoint;this.compact!==t&&(this.compact=t,t?this._applyCompactViewColumnLabels():this._clearCompactViewColumnLabels())}_stopDrag(e){let t=this._columnResizeController.getActiveSplitter();t&&(t.removeEventListener("pointermove",this._handleSplitterPointerMove),t.removeEventListener("pointerup",this._handleSplitterPointerUp),t.removeEventListener("pointercancel",this._handleSplitterPointerCancel)),this._columnResizeController.stopDrag(e),this._resizeColumns(!0),this._sashHovers[this._activeSashElementIndex]=!1,this._isDragging=!1,this._activeSashElementIndex=-1}_onDefaultSlotChange(){this._assignedElements.forEach(e=>{if(e.tagName.toLowerCase()==="vscode-table-header"){e.slot="header";return}if(e.tagName.toLowerCase()==="vscode-table-body"){e.slot="body";return}})}_onHeaderSlotChange(){this._headerCells=this._queryHeaderCells(),[].fill(x(0),0,this._headerCells.length-1),this._headerCells.forEach((t,s)=>{if(t.index=s,t.minWidth){let o=ne(t.minWidth,this._componentW)??x(0);this._columnResizeController.setColumnMinWidthAt(s,o)}})}_onBodySlotChange(){if(this._initDefaultColumnSizes(),this._initResizeObserver(),this._updateResizeHandlersSize(),!this._bodyResizeObserver){let e=this._assignedBodyElements[0]??null;e&&(this._bodyResizeObserver=new ResizeObserver(this._bodyResizeObserverCallback),this._bodyResizeObserver.observe(e))}}_onSashMouseOver(e){if(this._isDragging)return;let t=e.currentTarget,s=Number(t.dataset.index);this._sashHovers[s]=!0,this.requestUpdate()}_onSashMouseOut(e){if(e.stopPropagation(),this._isDragging)return;let t=e.currentTarget,s=Number(t.dataset.index);this._sashHovers[s]=!1,this.requestUpdate()}_resizeColumns(e=!0){let t=this._columnResizeController.columnWidths;this._getHeaderCells().forEach((o,r)=>o.style.width=`${t[r]}%`),e&&this._getCellsOfFirstRow().forEach((r,n)=>r.style.width=`${t[n]}%`)}_handleSplitterPointerDown(e){e.stopPropagation();let t=e.currentTarget;this._columnResizeController.saveHostDimensions().setActiveSplitter(t).startDrag(e),t.addEventListener("pointermove",this._handleSplitterPointerMove),t.addEventListener("pointerup",this._handleSplitterPointerUp),t.addEventListener("pointercancel",this._handleSplitterPointerCancel)}render(){let t=this._columnResizeController.splitterPositions.map((o,r)=>{let n=P({sash:!0,hover:this._sashHovers[r],resizable:this.resizable}),l=`${o}%`;return this.resizable?u`
            <div
              class=${n}
              data-index=${r}
              .style=${L({left:l})}
              @pointerdown=${this._handleSplitterPointerDown}
              @mouseover=${this._onSashMouseOver}
              @mouseout=${this._onSashMouseOut}
            >
              <div class="sash-visible"></div>
              <div class="sash-clickable"></div>
            </div>
          `:u`<div
            class=${n}
            data-index=${r}
            .style=${L({left:l})}
          >
            <div class="sash-visible"></div>
          </div>`}),s=P({wrapper:!0,"select-disabled":this._columnResizeController.isDragging,"resize-cursor":this._columnResizeController.isDragging,"compact-view":this.compact});return u`
      <div class=${s}>
        <div class="header">
          <slot name="caption"></slot>
          <div class="header-slot-wrapper">
            <slot name="header" @slotchange=${this._onHeaderSlotChange}></slot>
          </div>
        </div>
        <vscode-scrollable class="scrollable">
          <div>
            <slot name="body" @slotchange=${this._onBodySlotChange}></slot>
          </div>
        </vscode-scrollable>
        ${t}
        <slot @slotchange=${this._onDefaultSlotChange}></slot>
      </div>
    `}};p.styles=dt;v([h({reflect:!0})],p.prototype,"role",void 0);v([h({type:Boolean,reflect:!0})],p.prototype,"resizable",void 0);v([h({type:Boolean,reflect:!0})],p.prototype,"responsive",void 0);v([h({type:Boolean,reflect:!0})],p.prototype,"bordered",void 0);v([h({type:Boolean,reflect:!0,attribute:"bordered-columns"})],p.prototype,"borderedColumns",void 0);v([h({type:Boolean,reflect:!0,attribute:"bordered-rows"})],p.prototype,"borderedRows",void 0);v([h({type:Number})],p.prototype,"breakpoint",void 0);v([h({type:Array})],p.prototype,"columns",null);v([h({attribute:"min-column-width"})],p.prototype,"minColumnWidth",void 0);v([h({type:Boolean,reflect:!0,attribute:"delayed-resizing"})],p.prototype,"delayedResizing",void 0);v([h({type:Boolean,reflect:!0})],p.prototype,"compact",void 0);v([h({type:Boolean,reflect:!0})],p.prototype,"zebra",void 0);v([h({type:Boolean,reflect:!0,attribute:"zebra-odd"})],p.prototype,"zebraOdd",void 0);v([N(".header")],p.prototype,"_headerElement",void 0);v([N(".scrollable")],p.prototype,"_scrollableElement",void 0);v([Je(".sash-visible")],p.prototype,"_sashVisibleElements",void 0);v([M({flatten:!0,selector:"vscode-table-header, vscode-table-body"})],p.prototype,"_assignedElements",void 0);v([M({slot:"header",flatten:!0,selector:"vscode-table-header"})],p.prototype,"_assignedHeaderElements",void 0);v([M({slot:"body",flatten:!0,selector:"vscode-table-body"})],p.prototype,"_assignedBodyElements",void 0);v([H()],p.prototype,"_sashPositions",void 0);v([H()],p.prototype,"_isDragging",void 0);p=v([y("vscode-table")],p);var jt=[w,f`
    :host {
      background-color: var(
        --vscode-keybindingTable-headerBackground,
        rgba(204, 204, 204, 0.04)
      );
      display: table;
      table-layout: fixed;
      width: 100%;
    }
  `],ut=jt;var mt=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},le=class extends _{constructor(){super(...arguments),this.role="rowgroup"}render(){return u` <slot></slot> `}};le.styles=ut;mt([h({reflect:!0})],le.prototype,"role",void 0);le=mt([y("vscode-table-header")],le);var qt=[w,f`
    :host {
      box-sizing: border-box;
      color: var(--vscode-foreground, #cccccc);
      display: table-cell;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: bold;
      line-height: 20px;
      overflow: hidden;
      padding-bottom: 5px;
      padding-left: 10px;
      padding-right: 0;
      padding-top: 5px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wrapper {
      box-sizing: inherit;
      overflow: inherit;
      text-overflow: inherit;
      white-space: inherit;
      width: 100%;
    }
  `],ft=qt;var ge=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},j=class extends _{constructor(){super(...arguments),this.minWidth="0",this.index=-1,this.role="columnheader"}willUpdate(e){e.has("minWidth")&&this.index>-1&&this.dispatchEvent(new CustomEvent("vsc-table-change-min-column-width",{detail:{columnIndex:this.index,propertyValue:this.minWidth},bubbles:!0}))}render(){return u`
      <div class="wrapper">
        <slot></slot>
      </div>
    `}};j.styles=ft;ge([h({attribute:"min-width"})],j.prototype,"minWidth",void 0);ge([h({type:Number})],j.prototype,"index",void 0);ge([h({reflect:!0})],j.prototype,"role",void 0);j=ge([y("vscode-table-header-cell")],j);var Ft=[w,f`
    :host {
      display: table;
      table-layout: fixed;
      width: 100%;
    }

    ::slotted(vscode-table-row:nth-child(even)) {
      background-color: var(--vsc-row-even-background);
    }

    ::slotted(vscode-table-row:nth-child(odd)) {
      background-color: var(--vsc-row-odd-background);
    }
  `],bt=Ft;var _t=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},ae=class extends _{constructor(){super(...arguments),this.role="rowgroup"}render(){return u` <slot></slot> `}};ae.styles=bt;_t([h({reflect:!0})],ae.prototype,"role",void 0);ae=_t([y("vscode-table-body")],ae);var Yt=[w,f`
    :host {
      border-top-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
      border-top-style: solid;
      border-top-width: var(--vsc-row-border-top-width);
      display: var(--vsc-row-display);
      width: 100%;
    }
  `],vt=Yt;var gt=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},he=class extends _{constructor(){super(...arguments),this.role="row"}render(){return u` <slot></slot> `}};he.styles=vt;gt([h({reflect:!0})],he.prototype,"role",void 0);he=gt([y("vscode-table-row")],he);var Xt=[w,f`
    :host {
      border-bottom-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
      border-bottom-style: solid;
      border-bottom-width: var(--vsc-row-border-bottom-width);
      box-sizing: border-box;
      color: var(--vscode-foreground, #cccccc);
      display: table-cell;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      height: 24px;
      overflow: hidden;
      padding-left: 10px;
      text-overflow: ellipsis;
      vertical-align: middle;
      white-space: nowrap;
    }

    :host([compact]) {
      display: block;
      height: auto;
      padding-bottom: 5px;
      width: 100% !important;
    }

    :host([compact]:first-child) {
      padding-top: 10px;
    }

    :host([compact]:last-child) {
      padding-bottom: 10px;
    }

    .wrapper {
      overflow: inherit;
      text-overflow: inherit;
      white-space: inherit;
      width: 100%;
    }

    .column-label {
      font-weight: bold;
    }
  `],yt=Xt;var ye=function(i,e,t,s){var o=arguments.length,r=o<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,e,t,s);else for(var l=i.length-1;l>=0;l--)(n=i[l])&&(r=(o<3?n(r):o>3?n(e,t,r):n(e,t))||r);return o>3&&r&&Object.defineProperty(e,t,r),r},q=class extends _{constructor(){super(...arguments),this.role="cell",this.columnLabel="",this.compact=!1}render(){let e=this.columnLabel?u`<div class="column-label" role="presentation">
          ${this.columnLabel}
        </div>`:b;return u`
      <div class="wrapper">
        ${e}
        <slot></slot>
      </div>
    `}};q.styles=yt;ye([h({reflect:!0})],q.prototype,"role",void 0);ye([h({attribute:"column-label"})],q.prototype,"columnLabel",void 0);ye([h({type:Boolean,reflect:!0})],q.prototype,"compact",void 0);q=ye([y("vscode-table-cell")],q);
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

const r={context:void 0,registry:void 0};function V(e){r.context=e}const W=(e,t)=>e===t,L={equals:W};let O=Y;const y=1,A=2,k={owned:null,cleanups:null,context:null,owner:null};var h=null;let U=null,u=null,d=null,g=null,m=0;function G(e,t){const s=u,n=h,i=e.length===0,o=i?k:{owned:null,cleanups:null,context:null,owner:t===void 0?n:t},f=i?e:()=>e(()=>$(()=>T(o)));h=o,u=null;try{return x(f,!0)}finally{u=s,h=n}}function le(e,t){t=t?Object.assign({},L,t):L;const s={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},n=i=>(typeof i=="function"&&(i=i(s.value)),F(s,i));return[K.bind(s),n]}function H(e,t,s){const n=R(e,t,!1,y);N(n)}function oe(e,t,s){O=X;const n=R(e,t,!1,y);(!s||!s.render)&&(n.user=!0),g?g.push(n):N(n)}function $(e){if(u===null)return e();const t=u;u=null;try{return e()}finally{u=t}}function fe(e){return h===null||(h.cleanups===null?h.cleanups=[e]:h.cleanups.push(e)),e}function K(){if(this.sources&&this.state)if(this.state===y)N(this);else{const e=d;d=null,x(()=>C(this),!1),d=e}if(u){const e=this.observers?this.observers.length:0;u.sources?(u.sources.push(this),u.sourceSlots.push(e)):(u.sources=[this],u.sourceSlots=[e]),this.observers?(this.observers.push(u),this.observerSlots.push(u.sources.length-1)):(this.observers=[u],this.observerSlots=[u.sources.length-1])}return this.value}function F(e,t,s){let n=e.value;return(!e.comparator||!e.comparator(n,t))&&(e.value=t,e.observers&&e.observers.length&&x(()=>{for(let i=0;i<e.observers.length;i+=1){const o=e.observers[i],f=U&&U.running;f&&U.disposed.has(o),(f?!o.tState:!o.state)&&(o.pure?d.push(o):g.push(o),o.observers&&_(o)),f||(o.state=y)}if(d.length>1e6)throw d=[],new Error},!1)),t}function N(e){if(!e.fn)return;T(e);const t=h,s=u,n=m;u=h=e,Q(e,e.value,n),u=s,h=t}function Q(e,t,s){let n;try{n=e.fn(t)}catch(i){return e.pure&&(e.state=y,e.owned&&e.owned.forEach(T),e.owned=null),e.updatedAt=s+1,j(i)}(!e.updatedAt||e.updatedAt<=s)&&(e.updatedAt!=null&&"observers"in e?F(e,n):e.value=n,e.updatedAt=s)}function R(e,t,s,n=y,i){const o={fn:e,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:h,context:null,pure:s};return h===null||h!==k&&(h.owned?h.owned.push(o):h.owned=[o]),o}function S(e){if(e.state===0)return;if(e.state===A)return C(e);if(e.suspense&&$(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<m);)e.state&&t.push(e);for(let s=t.length-1;s>=0;s--)if(e=t[s],e.state===y)N(e);else if(e.state===A){const n=d;d=null,x(()=>C(e,t[0]),!1),d=n}}function x(e,t){if(d)return e();let s=!1;t||(d=[]),g?s=!0:g=[],m++;try{const n=e();return J(s),n}catch(n){s||(g=null),d=null,j(n)}}function J(e){if(d&&(Y(d),d=null),e)return;const t=g;g=null,t.length&&x(()=>O(t),!1)}function Y(e){for(let t=0;t<e.length;t++)S(e[t])}function X(e){let t,s=0;for(t=0;t<e.length;t++){const n=e[t];n.user?e[s++]=n:S(n)}if(r.context){if(r.count){r.effects||(r.effects=[]),r.effects.push(...e.slice(0,s));return}else r.effects&&(e=[...r.effects,...e],s+=r.effects.length,delete r.effects);V()}for(t=0;t<s;t++)S(e[t])}function C(e,t){e.state=0;for(let s=0;s<e.sources.length;s+=1){const n=e.sources[s];if(n.sources){const i=n.state;i===y?n!==t&&(!n.updatedAt||n.updatedAt<m)&&S(n):i===A&&C(n,t)}}}function _(e){for(let t=0;t<e.observers.length;t+=1){const s=e.observers[t];s.state||(s.state=A,s.pure?d.push(s):g.push(s),s.observers&&_(s))}}function T(e){let t;if(e.sources)for(;e.sources.length;){const s=e.sources.pop(),n=e.sourceSlots.pop(),i=s.observers;if(i&&i.length){const o=i.pop(),f=s.observerSlots.pop();n<i.length&&(o.sourceSlots[f]=n,i[n]=o,s.observerSlots[n]=f)}}if(e.owned){for(t=e.owned.length-1;t>=0;t--)T(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0,e.context=null}function Z(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function j(e,t=h){throw Z(e)}let q=!1;function z(){q=!0}function ee(e,t,s){let n=s.length,i=t.length,o=n,f=0,l=0,c=t[i-1].nextSibling,a=null;for(;f<i||l<o;){if(t[f]===s[l]){f++,l++;continue}for(;t[i-1]===s[o-1];)i--,o--;if(i===f){const p=o<n?l?s[l-1].nextSibling:s[o-l]:c;for(;l<o;)e.insertBefore(s[l++],p)}else if(o===l)for(;f<i;)(!a||!a.has(t[f]))&&t[f].remove(),f++;else if(t[f]===s[o-1]&&s[l]===t[i-1]){const p=t[--i].nextSibling;e.insertBefore(s[l++],t[f++].nextSibling),e.insertBefore(s[--o],p),t[i]=s[o]}else{if(!a){a=new Map;let w=l;for(;w<o;)a.set(s[w],w++)}const p=a.get(t[f]);if(p!=null)if(l<p&&p<o){let w=f,v=1,M;for(;++w<i&&w<o&&!((M=a.get(t[w]))==null||M!==p+v);)v++;if(v>p-l){const P=t[f];for(;l<p;)e.insertBefore(s[l++],P)}else e.replaceChild(s[l++],t[f++])}else f++;else t[f++].remove()}}}function te(e,t,s,n={}){let i;return G(o=>{i=o,t===document?e():se(t,e(),t.firstChild?null:void 0,s)},n.owner),()=>{i(),t.textContent=""}}function re(e,t,s){let n;const i=()=>{const f=document.createElement("template");return f.innerHTML=e,s?f.content.firstChild.firstChild:f.content.firstChild},o=t?()=>$(()=>document.importNode(n||(n=i()),!0)):()=>(n||(n=i())).cloneNode(!0);return o.cloneNode=o,o}function ue(e,t,s){s==null?e.removeAttribute(t):e.setAttribute(t,s)}function se(e,t,s,n){if(s!==void 0&&!n&&(n=[]),typeof t!="function")return E(e,t,n,s);H(i=>E(e,t(),i,s),n)}function ne(e,t,s={}){r.completed=globalThis._$HY.completed,r.events=globalThis._$HY.events,r.load=globalThis._$HY.load,r.gather=i=>I(t,i),r.registry=new Map,r.context={id:s.renderId||"",count:0},I(t,s.renderId);const n=te(e,t,[...t.childNodes],s);return r.context=null,n}function ce(e){let t,s;if(!r.context||!(t=r.registry.get(s=ie()))){if(r.context&&console.warn("Unable to find DOM nodes for hydration key:",s),!e)throw new Error("Unrecoverable Hydration Mismatch. No template for key: "+s);return e()}return r.completed&&r.completed.add(t),r.registry.delete(s),t}function ae(e){let t=e,s=0,n=[];if(r.context)for(;t;){if(t.nodeType===8){const i=t.nodeValue;if(i==="#")s++;else if(i==="/"){if(s===0)return[t,n];s--}}n.push(t),t=t.nextSibling}return[t,n]}function E(e,t,s,n,i){if(r.context){!s&&(s=[...e.childNodes]);let l=[];for(let c=0;c<s.length;c++){const a=s[c];a.nodeType===8&&a.data.slice(0,2)==="!$"?a.remove():l.push(a)}s=l}for(;typeof s=="function";)s=s();if(t===s)return s;const o=typeof t,f=n!==void 0;if(e=f&&s[0]&&s[0].parentNode||e,o==="string"||o==="number"){if(r.context)return s;if(o==="number"&&(t=t.toString()),f){let l=s[0];l&&l.nodeType===3?l.data=t:l=document.createTextNode(t),s=b(e,s,n,l)}else s!==""&&typeof s=="string"?s=e.firstChild.data=t:s=e.textContent=t}else if(t==null||o==="boolean"){if(r.context)return s;s=b(e,s,n)}else{if(o==="function")return H(()=>{let l=t();for(;typeof l=="function";)l=l();s=E(e,l,s,n)}),()=>s;if(Array.isArray(t)){const l=[],c=s&&Array.isArray(s);if(B(l,t,s,i))return H(()=>s=E(e,l,s,n,!0)),()=>s;if(r.context){if(!l.length)return s;for(let a=0;a<l.length;a++)if(l[a].parentNode)return s=l}if(l.length===0){if(s=b(e,s,n),f)return s}else c?s.length===0?D(e,l,n):ee(e,s,l):(s&&b(e),D(e,l));s=l}else if(t.nodeType){if(r.context&&t.parentNode)return s=f?[t]:t;if(Array.isArray(s)){if(f)return s=b(e,s,n,t);b(e,s,null,t)}else s==null||s===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);s=t}else console.warn("Unrecognized value. Skipped inserting",t)}return s}function B(e,t,s,n){let i=!1;for(let o=0,f=t.length;o<f;o++){let l=t[o],c=s&&s[o],a;if(!(l==null||l===!0||l===!1))if((a=typeof l)=="object"&&l.nodeType)e.push(l);else if(Array.isArray(l))i=B(e,l,c)||i;else if(a==="function")if(n){for(;typeof l=="function";)l=l();i=B(e,Array.isArray(l)?l:[l],Array.isArray(c)?c:[c])||i}else e.push(l),i=!0;else{const p=String(l);c&&c.nodeType===3&&c.data===p?e.push(c):e.push(document.createTextNode(p))}}return i}function D(e,t,s=null){for(let n=0,i=t.length;n<i;n++)e.insertBefore(t[n],s)}function b(e,t,s,n){if(s===void 0)return e.textContent="";const i=n||document.createTextNode("");if(t.length){let o=!1;for(let f=t.length-1;f>=0;f--){const l=t[f];if(i!==l){const c=l.parentNode===e;!o&&!f?c?e.replaceChild(i,l):e.insertBefore(i,s):c&&l.remove()}else o=!0}}else e.insertBefore(i,s);return[i]}function I(e,t){const s=e.querySelectorAll("*[data-hk]");for(let n=0;n<s.length;n++){const i=s[n],o=i.getAttribute("data-hk");(!t||o.startsWith(t))&&!r.registry.has(o)&&r.registry.set(o,i)}}function ie(){const e=r.context;return`${e.id}${e.count++}`}const he=(...e)=>(z(),ne(...e));export{oe as a,ae as b,le as c,ce as g,he as h,se as i,fe as o,te as r,ue as s,re as t};

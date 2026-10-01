var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),a=Symbol.for(`react.strict_mode`),o=Symbol.for(`react.profiler`),s=Symbol.for(`react.consumer`),c=Symbol.for(`react.context`),l=Symbol.for(`react.forward_ref`),u=Symbol.for(`react.suspense`),d=Symbol.for(`react.memo`),f=Symbol.for(`react.lazy`),p=Symbol.for(`react.activity`),m=Symbol.iterator;function h(e){return typeof e!=`object`||!e?null:(e=m&&e[m]||e[`@@iterator`],typeof e==`function`?e:null)}var g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},_=Object.assign,v={};function y(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}y.prototype.isReactComponent={},y.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},y.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function b(){}b.prototype=y.prototype;function x(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||g}var S=x.prototype=new b;S.constructor=x,_(S,y.prototype),S.isPureReactComponent=!0;var C=Array.isArray;function w(){}var T={H:null,A:null,T:null,S:null},E=Object.prototype.hasOwnProperty;function D(e,n,r){var a=r.ref;return{$$typeof:t,type:e,key:n,ref:a===void 0?null:a,props:r}}function O(e,t){return D(e.type,t,e.props)}function k(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function A(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var j=/\/+/g;function M(e,t){return typeof e==`object`&&e&&e.key!=null?A(``+e.key):t.toString(36)}function ee(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(w,w):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function N(e,r,a,o,s){var c=typeof e;(c===`undefined`||c===`boolean`)&&(e=null);var l=!1;if(e===null)l=!0;else switch(c){case`bigint`:case`string`:case`number`:l=!0;break;case`object`:switch(e.$$typeof){case t:case n:l=!0;break;case f:return l=e._init,N(l(e._payload),r,a,o,s)}}if(l)return s=s(e),l=o===``?`.`+M(e,0):o,C(s)?(a=``,l!=null&&(a=l.replace(j,`$&/`)+`/`),N(s,r,a,``,function(e){return e})):s!=null&&(k(s)&&(s=O(s,a+(s.key==null||e&&e.key===s.key?``:(``+s.key).replace(j,`$&/`)+`/`)+l)),r.push(s)),1;l=0;var u=o===``?`.`:o+`:`;if(C(e))for(var d=0;d<e.length;d++)o=e[d],c=u+M(o,d),l+=N(o,r,a,c,s);else if(d=h(e),typeof d==`function`)for(e=d.call(e),d=0;!(o=e.next()).done;)o=o.value,c=u+M(o,d++),l+=N(o,r,a,c,s);else if(c===`object`){if(typeof e.then==`function`)return N(ee(e),r,a,o,s);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return l}function te(e,t,n){if(e==null)return e;var r=[],a=0;return N(e,r,``,``,function(e){return t.call(n,e,a++)}),r}function ne(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var P=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},F={map:te,forEach:function(e,t,n){te(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return te(e,function(){t++}),t},toArray:function(e){return te(e,function(e){return e})||[]},only:function(e){if(!k(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=p,e.Children=F,e.Component=y,e.Fragment=r,e.Profiler=o,e.PureComponent=x,e.StrictMode=a,e.Suspense=u,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=T,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return T.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=_({},e.props),a=e.key;if(t!=null)for(o in t.key!==void 0&&(a=``+t.key),t)!E.call(t,o)||o===`key`||o===`__self`||o===`__source`||o===`ref`&&t.ref===void 0||(r[o]=t[o]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];r.children=s}return D(e.type,a,r)},e.createContext=function(e){return e={$$typeof:c,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:s,_context:e},e},e.createElement=function(e,t,n){var r,a={},o=null;if(t!=null)for(r in t.key!==void 0&&(o=``+t.key),t)E.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(a[r]=t[r]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var c=Array(s),l=0;l<s;l++)c[l]=arguments[l+2];a.children=c}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)a[r]===void 0&&(a[r]=s[r]);return D(e,o,a)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:l,render:e}},e.isValidElement=k,e.lazy=function(e){return{$$typeof:f,_payload:{_status:-1,_result:e},_init:ne}},e.memo=function(e,t){return{$$typeof:d,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=T.T,n={};T.T=n;try{var r=e(),a=T.S;a!==null&&a(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(w,P)}catch(e){P(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),T.T=t}},e.unstable_useCacheRefresh=function(){return T.H.useCacheRefresh()},e.use=function(e){return T.H.use(e)},e.useActionState=function(e,t,n){return T.H.useActionState(e,t,n)},e.useCallback=function(e,t){return T.H.useCallback(e,t)},e.useContext=function(e){return T.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return T.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return T.H.useEffect(e,t)},e.useEffectEvent=function(e){return T.H.useEffectEvent(e)},e.useId=function(){return T.H.useId()},e.useImperativeHandle=function(e,t,n){return T.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return T.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return T.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return T.H.useMemo(e,t)},e.useOptimistic=function(e,t){return T.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return T.H.useReducer(e,t,n)},e.useRef=function(e){return T.H.useRef(e)},e.useState=function(e){return T.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return T.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return T.H.useTransition()},e.version=`19.2.7`})),n=e(((e,n)=>{n.exports=t()})),r=e((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,o=e[r];if(0<a(o,t))e[r]=t,e[n]=o,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,o=e.length,s=o>>>1;r<s;){var c=2*(r+1)-1,l=e[c],u=c+1,d=e[u];if(0>a(l,n))u<o&&0>a(d,l)?(e[r]=d,e[u]=n,r=u):(e[r]=l,e[c]=n,r=c);else if(u<o&&0>a(d,n))e[r]=d,e[u]=n,r=u;else break a}}return t}function a(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var o=performance;e.unstable_now=function(){return o.now()}}else{var s=Date,c=s.now();e.unstable_now=function(){return s.now()-c}}var l=[],u=[],d=1,f=null,p=3,m=!1,h=!1,g=!1,_=!1,v=typeof setTimeout==`function`?setTimeout:null,y=typeof clearTimeout==`function`?clearTimeout:null,b=typeof setImmediate<`u`?setImmediate:null;function x(e){for(var a=n(u);a!==null;){if(a.callback===null)r(u);else if(a.startTime<=e)r(u),a.sortIndex=a.expirationTime,t(l,a);else break;a=n(u)}}function S(e){if(g=!1,x(e),!h)if(n(l)!==null)h=!0,C||(C=!0,k());else{var t=n(u);t!==null&&M(S,t.startTime-e)}}var C=!1,w=-1,T=5,E=-1;function D(){return _?!0:!(e.unstable_now()-E<T)}function O(){if(_=!1,C){var t=e.unstable_now();E=t;var a=!0;try{a:{h=!1,g&&(g=!1,y(w),w=-1),m=!0;var o=p;try{b:{for(x(t),f=n(l);f!==null&&!(f.expirationTime>t&&D());){var s=f.callback;if(typeof s==`function`){f.callback=null,p=f.priorityLevel;var c=s(f.expirationTime<=t);if(t=e.unstable_now(),typeof c==`function`){f.callback=c,x(t),a=!0;break b}f===n(l)&&r(l),x(t)}else r(l);f=n(l)}if(f!==null)a=!0;else{var d=n(u);d!==null&&M(S,d.startTime-t),a=!1}}break a}finally{f=null,p=o,m=!1}a=void 0}}finally{a?k():C=!1}}}var k;if(typeof b==`function`)k=function(){b(O)};else if(typeof MessageChannel<`u`){var A=new MessageChannel,j=A.port2;A.port1.onmessage=O,k=function(){j.postMessage(null)}}else k=function(){v(O,0)};function M(t,n){w=v(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):T=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return p},e.unstable_next=function(e){switch(p){case 1:case 2:case 3:var t=3;break;default:t=p}var n=p;p=t;try{return e()}finally{p=n}},e.unstable_requestPaint=function(){_=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=p;p=e;try{return t()}finally{p=n}},e.unstable_scheduleCallback=function(r,a,o){var s=e.unstable_now();switch(typeof o==`object`&&o?(o=o.delay,o=typeof o==`number`&&0<o?s+o:s):o=s,r){case 1:var c=-1;break;case 2:c=250;break;case 5:c=1073741823;break;case 4:c=1e4;break;default:c=5e3}return c=o+c,r={id:d++,callback:a,priorityLevel:r,startTime:o,expirationTime:c,sortIndex:-1},o>s?(r.sortIndex=o,t(u,r),n(l)===null&&r===n(u)&&(g?(y(w),w=-1):g=!0,M(S,o-s))):(r.sortIndex=c,t(l,r),h||m||(h=!0,C||(C=!0,k()))),r},e.unstable_shouldYield=D,e.unstable_wrapCallback=function(e){var t=p;return function(){var n=p;p=t;try{return e.apply(this,arguments)}finally{p=n}}}})),a=e(((e,t)=>{t.exports=r()})),o=e((e=>{var t=n();function r(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(){}var o={d:{f:a,r:function(){throw Error(r(522))},D:a,C:a,L:a,m:a,X:a,S:a,M:a},p:0,findDOMNode:null},s=Symbol.for(`react.portal`);function c(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:s,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var l=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function u(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=o,e.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(r(299));return c(e,t,null,n)},e.flushSync=function(e){var t=l.T,n=o.p;try{if(l.T=null,o.p=2,e)return e()}finally{l.T=t,o.p=n,o.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,o.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&o.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=u(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,s=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?o.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:s}):n===`script`&&o.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:s,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`)if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=u(t.as,t.crossOrigin);o.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??o.d.M(e)},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=u(n,t.crossOrigin);o.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`)if(t){var n=u(t.as,t.crossOrigin);o.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else o.d.m(e)},e.requestFormReset=function(e){o.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return l.H.useFormState(e,t,n)},e.useFormStatus=function(){return l.H.useHostTransitionStatus()},e.version=`19.2.7`})),s=e(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=o()})),c=e((e=>{var t=a(),r=n(),o=s();function c(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function l(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function u(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function d(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function f(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function p(e){if(u(e)!==e)throw Error(c(188))}function m(e){var t=e.alternate;if(!t){if(t=u(e),t===null)throw Error(c(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var o=a.alternate;if(o===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===o.child){for(o=a.child;o;){if(o===n)return p(a),e;if(o===r)return p(a),t;o=o.sibling}throw Error(c(188))}if(n.return!==r.return)n=a,r=o;else{for(var s=!1,l=a.child;l;){if(l===n){s=!0,n=a,r=o;break}if(l===r){s=!0,r=a,n=o;break}l=l.sibling}if(!s){for(l=o.child;l;){if(l===n){s=!0,n=o,r=a;break}if(l===r){s=!0,r=o,n=a;break}l=l.sibling}if(!s)throw Error(c(189))}}if(n.alternate!==r)throw Error(c(190))}if(n.tag!==3)throw Error(c(188));return n.stateNode.current===n?e:t}function h(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=h(e),t!==null)return t;e=e.sibling}return null}var g=Object.assign,_=Symbol.for(`react.element`),v=Symbol.for(`react.transitional.element`),y=Symbol.for(`react.portal`),b=Symbol.for(`react.fragment`),x=Symbol.for(`react.strict_mode`),S=Symbol.for(`react.profiler`),C=Symbol.for(`react.consumer`),w=Symbol.for(`react.context`),T=Symbol.for(`react.forward_ref`),E=Symbol.for(`react.suspense`),D=Symbol.for(`react.suspense_list`),O=Symbol.for(`react.memo`),k=Symbol.for(`react.lazy`),A=Symbol.for(`react.activity`),j=Symbol.for(`react.memo_cache_sentinel`),M=Symbol.iterator;function ee(e){return typeof e!=`object`||!e?null:(e=M&&e[M]||e[`@@iterator`],typeof e==`function`?e:null)}var N=Symbol.for(`react.client.reference`);function te(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===N?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case b:return`Fragment`;case S:return`Profiler`;case x:return`StrictMode`;case E:return`Suspense`;case D:return`SuspenseList`;case A:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case y:return`Portal`;case w:return e.displayName||`Context`;case C:return(e._context.displayName||`Context`)+`.Consumer`;case T:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case O:return t=e.displayName||null,t===null?te(e.type)||`Memo`:t;case k:t=e._payload,e=e._init;try{return te(e(t))}catch{}}return null}var ne=Array.isArray,P=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,F=o.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,re={pending:!1,data:null,method:null,action:null},ie=[],ae=-1;function oe(e){return{current:e}}function se(e){0>ae||(e.current=ie[ae],ie[ae]=null,ae--)}function I(e,t){ae++,ie[ae]=e.current,e.current=t}var ce=oe(null),le=oe(null),ue=oe(null),de=oe(null);function fe(e,t){switch(I(ue,t),I(le,e),I(ce,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Hd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Hd(t),e=Ud(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}se(ce),I(ce,e)}function pe(){se(ce),se(le),se(ue)}function me(e){e.memoizedState!==null&&I(de,e);var t=ce.current,n=Ud(t,e.type);t!==n&&(I(le,e),I(ce,n))}function he(e){le.current===e&&(se(ce),se(le)),de.current===e&&(se(de),$f._currentValue=re)}var ge,_e;function ve(e){if(ge===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);ge=t&&t[1]||``,_e=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+ge+e+_e}var ye=!1;function be(e,t){if(!e||ye)return``;ye=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var a=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);a&&a.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var o=r.DetermineComponentFrameRoot(),s=o[0],c=o[1];if(s&&c){var l=s.split(`
`),u=c.split(`
`);for(a=r=0;r<l.length&&!l[r].includes(`DetermineComponentFrameRoot`);)r++;for(;a<u.length&&!u[a].includes(`DetermineComponentFrameRoot`);)a++;if(r===l.length||a===u.length)for(r=l.length-1,a=u.length-1;1<=r&&0<=a&&l[r]!==u[a];)a--;for(;1<=r&&0<=a;r--,a--)if(l[r]!==u[a]){if(r!==1||a!==1)do if(r--,a--,0>a||l[r]!==u[a]){var d=`
`+l[r].replace(` at new `,` at `);return e.displayName&&d.includes(`<anonymous>`)&&(d=d.replace(`<anonymous>`,e.displayName)),d}while(1<=r&&0<=a);break}}}finally{ye=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?ve(n):``}function xe(e,t){switch(e.tag){case 26:case 27:case 5:return ve(e.type);case 16:return ve(`Lazy`);case 13:return e.child!==t&&t!==null?ve(`Suspense Fallback`):ve(`Suspense`);case 19:return ve(`SuspenseList`);case 0:case 15:return be(e.type,!1);case 11:return be(e.type.render,!1);case 1:return be(e.type,!0);case 31:return ve(`Activity`);default:return``}}function Se(e){try{var t=``,n=null;do t+=xe(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var Ce=Object.prototype.hasOwnProperty,we=t.unstable_scheduleCallback,Te=t.unstable_cancelCallback,Ee=t.unstable_shouldYield,De=t.unstable_requestPaint,Oe=t.unstable_now,ke=t.unstable_getCurrentPriorityLevel,L=t.unstable_ImmediatePriority,Ae=t.unstable_UserBlockingPriority,je=t.unstable_NormalPriority,Me=t.unstable_LowPriority,R=t.unstable_IdlePriority,Ne=t.log,z=t.unstable_setDisableYieldValue,B=null,Pe=null;function Fe(e){if(typeof Ne==`function`&&z(e),Pe&&typeof Pe.setStrictMode==`function`)try{Pe.setStrictMode(B,e)}catch{}}var Ie=Math.clz32?Math.clz32:ze,Le=Math.log,Re=Math.LN2;function ze(e){return e>>>=0,e===0?32:31-(Le(e)/Re|0)|0}var Be=256,Ve=262144,He=4194304;function Ue(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function We(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var a=0,o=e.suspendedLanes,s=e.pingedLanes;e=e.warmLanes;var c=r&134217727;return c===0?(c=r&~o,c===0?s===0?n||(n=r&~e,n!==0&&(a=Ue(n))):a=Ue(s):a=Ue(c)):(r=c&~o,r===0?(s&=c,s===0?n||(n=c&~e,n!==0&&(a=Ue(n))):a=Ue(s)):a=Ue(r)),a===0?0:t!==0&&t!==a&&(t&o)===0&&(o=a&-a,n=t&-t,o>=n||o===32&&n&4194048)?t:a}function Ge(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Ke(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function qe(){var e=He;return He<<=1,!(He&62914560)&&(He=4194304),e}function Je(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Ye(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Xe(e,t,n,r,a,o){var s=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var c=e.entanglements,l=e.expirationTimes,u=e.hiddenUpdates;for(n=s&~n;0<n;){var d=31-Ie(n),f=1<<d;c[d]=0,l[d]=-1;var p=u[d];if(p!==null)for(u[d]=null,d=0;d<p.length;d++){var m=p[d];m!==null&&(m.lane&=-536870913)}n&=~f}r!==0&&Ze(e,r,0),o!==0&&a===0&&e.tag!==0&&(e.suspendedLanes|=o&~(s&~t))}function Ze(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-Ie(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function Qe(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Ie(n),a=1<<r;a&t|e[r]&t&&(e[r]|=t),n&=~a}}function $e(e,t){var n=t&-t;return n=n&42?1:et(n),(n&(e.suspendedLanes|t))===0?n:0}function et(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function tt(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function nt(){var e=F.p;return e===0?(e=window.event,e===void 0?32:hp(e.type)):e}function rt(e,t){var n=F.p;try{return F.p=e,t()}finally{F.p=n}}var it=Math.random().toString(36).slice(2),at=`__reactFiber$`+it,ot=`__reactProps$`+it,st=`__reactContainer$`+it,ct=`__reactEvents$`+it,lt=`__reactListeners$`+it,ut=`__reactHandles$`+it,dt=`__reactResources$`+it,ft=`__reactMarker$`+it;function pt(e){delete e[at],delete e[ot],delete e[ct],delete e[lt],delete e[ut]}function mt(e){var t=e[at];if(t)return t;for(var n=e.parentNode;n;){if(t=n[st]||n[at]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=ff(e);e!==null;){if(n=e[at])return n;e=ff(e)}return t}e=n,n=e.parentNode}return null}function ht(e){if(e=e[at]||e[st]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function gt(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(c(33))}function _t(e){var t=e[dt];return t||=e[dt]={hoistableStyles:new Map,hoistableScripts:new Map},t}function vt(e){e[ft]=!0}var yt=new Set,bt={};function xt(e,t){St(e,t),St(e+`Capture`,t)}function St(e,t){for(bt[e]=t,e=0;e<t.length;e++)yt.add(t[e])}var Ct=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),wt={},Tt={};function Et(e){return Ce.call(Tt,e)?!0:Ce.call(wt,e)?!1:Ct.test(e)?Tt[e]=!0:(wt[e]=!0,!1)}function V(e,t,n){if(Et(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}function H(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function Dt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Ot(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function kt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function At(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var a=r.get,o=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return a.call(this)},set:function(e){n=``+e,o.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function jt(e){if(!e._valueTracker){var t=kt(e)?`checked`:`value`;e._valueTracker=At(e,t,``+e[t])}}function Mt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=kt(e)?e.checked?`true`:`false`:e.value),e=r,e===n?!1:(t.setValue(e),!0)}function Nt(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Pt=/[\n"\\]/g;function U(e){return e.replace(Pt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Ft(e,t,n,r,a,o,s,c){e.name=``,s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.type=s:e.removeAttribute(`type`),t==null?s!==`submit`&&s!==`reset`||e.removeAttribute(`value`):s===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Ot(t)):e.value!==``+Ot(t)&&(e.value=``+Ot(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Lt(e,s,Ot(n)):Lt(e,s,Ot(t)),a==null&&o!=null&&(e.defaultChecked=!!o),a!=null&&(e.checked=a&&typeof a!=`function`&&typeof a!=`symbol`),c!=null&&typeof c!=`function`&&typeof c!=`symbol`&&typeof c!=`boolean`?e.name=``+Ot(c):e.removeAttribute(`name`)}function It(e,t,n,r,a,o,s,c){if(o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.type=o),t!=null||n!=null){if(!(o!==`submit`&&o!==`reset`||t!=null)){jt(e);return}n=n==null?``:``+Ot(n),t=t==null?n:``+Ot(t),c||t===e.value||(e.value=t),e.defaultValue=t}r??=a,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=c?e.checked:!!r,e.defaultChecked=!!r,s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`&&(e.name=s),jt(e)}function Lt(e,t,n){t===`number`&&Nt(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Rt(e,t,n,r){if(e=e.options,t){t={};for(var a=0;a<n.length;a++)t[`$`+n[a]]=!0;for(n=0;n<e.length;n++)a=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==a&&(e[n].selected=a),a&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Ot(n),t=null,a=0;a<e.length;a++){if(e[a].value===n){e[a].selected=!0,r&&(e[a].defaultSelected=!0);return}t!==null||e[a].disabled||(t=e[a])}t!==null&&(t.selected=!0)}}function zt(e,t,n){if(t!=null&&(t=``+Ot(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Ot(n)}function Bt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(c(92));if(ne(r)){if(1<r.length)throw Error(c(93));r=r[0]}n=r}n??=``,t=n}n=Ot(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),jt(e)}function W(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Vt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function Ht(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Vt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function G(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(c(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&Ht(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&Ht(e,o,t[o])}function Ut(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var Wt=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),Gt=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Kt(e){return Gt.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function K(){}var qt=null;function Jt(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Yt=null,Xt=null;function Zt(e){var t=ht(e);if(t&&(e=t.stateNode)){var n=e[ot]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Ft(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+U(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[ot]||null;if(!a)throw Error(c(90));Ft(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Mt(r)}break a;case`textarea`:zt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Rt(e,!!n.multiple,t,!1)}}}var Qt=!1;function $t(e,t,n){if(Qt)return e(t,n);Qt=!0;try{return e(t)}finally{if(Qt=!1,(Yt!==null||Xt!==null)&&(yu(),Yt&&(t=Yt,e=Xt,Xt=Yt=null,Zt(t),e)))for(t=0;t<e.length;t++)Zt(e[t])}}function en(e,t){var n=e.stateNode;if(n===null)return null;var r=n[ot]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=!(e===`button`||e===`input`||e===`select`||e===`textarea`)),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(c(231,t,typeof n));return n}var tn=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),nn=!1;if(tn)try{var rn={};Object.defineProperty(rn,"passive",{get:function(){nn=!0}}),window.addEventListener(`test`,rn,rn),window.removeEventListener(`test`,rn,rn)}catch{nn=!1}var an=null,on=null,sn=null;function cn(){if(sn)return sn;var e,t=on,n=t.length,r,a=`value`in an?an.value:an.textContent,o=a.length;for(e=0;e<n&&t[e]===a[e];e++);var s=n-e;for(r=1;r<=s&&t[n-r]===a[o-r];r++);return sn=a.slice(e,1<r?1-r:void 0)}function ln(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function un(){return!0}function dn(){return!1}function fn(e){function t(t,n,r,a,o){for(var s in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=a,this.target=o,this.currentTarget=null,e)e.hasOwnProperty(s)&&(t=e[s],this[s]=t?t(a):a[s]);return this.isDefaultPrevented=(a.defaultPrevented==null?!1===a.returnValue:a.defaultPrevented)?un:dn,this.isPropagationStopped=dn,this}return g(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=un)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=un)},persist:function(){},isPersistent:un}),t}var pn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},mn=fn(pn),hn=g({},pn,{view:0,detail:0}),gn=fn(hn),_n,vn,yn,bn=g({},hn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:jn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==yn&&(yn&&e.type===`mousemove`?(_n=e.screenX-yn.screenX,vn=e.screenY-yn.screenY):vn=_n=0,yn=e),_n)},movementY:function(e){return`movementY`in e?e.movementY:vn}}),xn=fn(bn),Sn=fn(g({},bn,{dataTransfer:0})),Cn=fn(g({},hn,{relatedTarget:0})),wn=fn(g({},pn,{animationName:0,elapsedTime:0,pseudoElement:0})),Tn=fn(g({},pn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),En=fn(g({},pn,{data:0})),Dn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},On={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},kn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function An(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=kn[e])?!!t[e]:!1}function jn(){return An}var Mn=fn(g({},hn,{key:function(e){if(e.key){var t=Dn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=ln(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?On[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:jn,charCode:function(e){return e.type===`keypress`?ln(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?ln(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Nn=fn(g({},bn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Pn=fn(g({},hn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:jn})),Fn=fn(g({},pn,{propertyName:0,elapsedTime:0,pseudoElement:0})),In=fn(g({},bn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Ln=fn(g({},pn,{newState:0,oldState:0})),Rn=[9,13,27,32],zn=tn&&`CompositionEvent`in window,Bn=null;tn&&`documentMode`in document&&(Bn=document.documentMode);var Vn=tn&&`TextEvent`in window&&!Bn,Hn=tn&&(!zn||Bn&&8<Bn&&11>=Bn),Un=` `,q=!1;function Wn(e,t){switch(e){case`keyup`:return Rn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function Gn(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var Kn=!1;function qn(e,t){switch(e){case`compositionend`:return Gn(t);case`keypress`:return t.which===32?(q=!0,Un):null;case`textInput`:return e=t.data,e===Un&&q?null:e;default:return null}}function Jn(e,t){if(Kn)return e===`compositionend`||!zn&&Wn(e,t)?(e=cn(),sn=on=an=null,Kn=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return Hn&&t.locale!==`ko`?null:t.data;default:return null}}var Yn={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Xn(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!Yn[e.type]:t===`textarea`}function Zn(e,t,n,r){Yt?Xt?Xt.push(r):Xt=[r]:Yt=r,t=Ed(t,`onChange`),0<t.length&&(n=new mn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var Qn=null,$n=null;function er(e){yd(e,0)}function tr(e){if(Mt(gt(e)))return e}function nr(e,t){if(e===`change`)return t}var rr=!1;if(tn){var ir;if(tn){var ar=`oninput`in document;if(!ar){var or=document.createElement(`div`);or.setAttribute(`oninput`,`return;`),ar=typeof or.oninput==`function`}ir=ar}else ir=!1;rr=ir&&(!document.documentMode||9<document.documentMode)}function sr(){Qn&&(Qn.detachEvent(`onpropertychange`,cr),$n=Qn=null)}function cr(e){if(e.propertyName===`value`&&tr($n)){var t=[];Zn(t,$n,e,Jt(e)),$t(er,t)}}function lr(e,t,n){e===`focusin`?(sr(),Qn=t,$n=n,Qn.attachEvent(`onpropertychange`,cr)):e===`focusout`&&sr()}function ur(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return tr($n)}function dr(e,t){if(e===`click`)return tr(t)}function fr(e,t){if(e===`input`||e===`change`)return tr(t)}function pr(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var mr=typeof Object.is==`function`?Object.is:pr;function hr(e,t){if(mr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var a=n[r];if(!Ce.call(t,a)||!mr(e[a],t[a]))return!1}return!0}function gr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function _r(e,t){var n=gr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=gr(n)}}function vr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?vr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function yr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Nt(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Nt(e.document)}return t}function br(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var xr=tn&&`documentMode`in document&&11>=document.documentMode,Sr=null,Cr=null,wr=null,Tr=!1;function Er(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Tr||Sr==null||Sr!==Nt(r)||(r=Sr,`selectionStart`in r&&br(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),wr&&hr(wr,r)||(wr=r,r=Ed(Cr,`onSelect`),0<r.length&&(t=new mn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Sr)))}function Dr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Or={animationend:Dr(`Animation`,`AnimationEnd`),animationiteration:Dr(`Animation`,`AnimationIteration`),animationstart:Dr(`Animation`,`AnimationStart`),transitionrun:Dr(`Transition`,`TransitionRun`),transitionstart:Dr(`Transition`,`TransitionStart`),transitioncancel:Dr(`Transition`,`TransitionCancel`),transitionend:Dr(`Transition`,`TransitionEnd`)},kr={},Ar={};tn&&(Ar=document.createElement(`div`).style,`AnimationEvent`in window||(delete Or.animationend.animation,delete Or.animationiteration.animation,delete Or.animationstart.animation),`TransitionEvent`in window||delete Or.transitionend.transition);function jr(e){if(kr[e])return kr[e];if(!Or[e])return e;var t=Or[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Ar)return kr[e]=t[n];return e}var Mr=jr(`animationend`),Nr=jr(`animationiteration`),Pr=jr(`animationstart`),Fr=jr(`transitionrun`),Ir=jr(`transitionstart`),Lr=jr(`transitioncancel`),Rr=jr(`transitionend`),zr=new Map,Br=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Br.push(`scrollEnd`);function Vr(e,t){zr.set(e,t),xt(t,[e])}var Hr=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},Ur=[],Wr=0,Gr=0;function Kr(){for(var e=Wr,t=Gr=Wr=0;t<e;){var n=Ur[t];Ur[t++]=null;var r=Ur[t];Ur[t++]=null;var a=Ur[t];Ur[t++]=null;var o=Ur[t];if(Ur[t++]=null,r!==null&&a!==null){var s=r.pending;s===null?a.next=a:(a.next=s.next,s.next=a),r.pending=a}o!==0&&Xr(n,a,o)}}function qr(e,t,n,r){Ur[Wr++]=e,Ur[Wr++]=t,Ur[Wr++]=n,Ur[Wr++]=r,Gr|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function Jr(e,t,n,r){return qr(e,t,n,r),Zr(e)}function Yr(e,t){return qr(e,null,null,t),Zr(e)}function Xr(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var a=!1,o=e.return;o!==null;)o.childLanes|=n,r=o.alternate,r!==null&&(r.childLanes|=n),o.tag===22&&(e=o.stateNode,e===null||e._visibility&1||(a=!0)),e=o,o=o.return;return e.tag===3?(o=e.stateNode,a&&t!==null&&(a=31-Ie(n),e=o.hiddenUpdates,r=e[a],r===null?e[a]=[t]:r.push(t),t.lane=n|536870912),o):null}function Zr(e){if(50<uu)throw uu=0,du=null,Error(c(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Qr={};function $r(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ei(e,t,n,r){return new $r(e,t,n,r)}function ti(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ni(e,t){var n=e.alternate;return n===null?(n=ei(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function ri(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function ii(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)ti(e)&&(s=1);else if(typeof e==`string`)s=Wf(e,n,ce.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case A:return e=ei(31,n,t,a),e.elementType=A,e.lanes=o,e;case b:return ai(n.children,a,o,t);case x:s=8,a|=24;break;case S:return e=ei(12,n,t,a|2),e.elementType=S,e.lanes=o,e;case E:return e=ei(13,n,t,a),e.elementType=E,e.lanes=o,e;case D:return e=ei(19,n,t,a),e.elementType=D,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case w:s=10;break a;case C:s=9;break a;case T:s=11;break a;case O:s=14;break a;case k:s=16,r=null;break a}s=29,n=Error(c(130,e===null?`null`:typeof e,``)),r=null}return t=ei(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function ai(e,t,n,r){return e=ei(7,e,r,t),e.lanes=n,e}function oi(e,t,n){return e=ei(6,e,null,t),e.lanes=n,e}function si(e){var t=ei(18,null,null,0);return t.stateNode=e,t}function ci(e,t,n){return t=ei(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var li=new WeakMap;function ui(e,t){if(typeof e==`object`&&e){var n=li.get(e);return n===void 0?(t={value:e,source:t,stack:Se(t)},li.set(e,t),t):n}return{value:e,source:t,stack:Se(t)}}var di=[],fi=0,pi=null,mi=0,hi=[],gi=0,_i=null,vi=1,yi=``;function bi(e,t){di[fi++]=mi,di[fi++]=pi,pi=e,mi=t}function xi(e,t,n){hi[gi++]=vi,hi[gi++]=yi,hi[gi++]=_i,_i=e;var r=vi;e=yi;var a=32-Ie(r)-1;r&=~(1<<a),n+=1;var o=32-Ie(t)+a;if(30<o){var s=a-a%5;o=(r&(1<<s)-1).toString(32),r>>=s,a-=s,vi=1<<32-Ie(t)+a|n<<a|r,yi=o+e}else vi=1<<o|n<<a|r,yi=e}function Si(e){e.return!==null&&(bi(e,1),xi(e,1,0))}function Ci(e){for(;e===pi;)pi=di[--fi],di[fi]=null,mi=di[--fi],di[fi]=null;for(;e===_i;)_i=hi[--gi],hi[gi]=null,yi=hi[--gi],hi[gi]=null,vi=hi[--gi],hi[gi]=null}function wi(e,t){hi[gi++]=vi,hi[gi++]=yi,hi[gi++]=_i,vi=t.id,yi=t.overflow,_i=e}var Ti=null,Ei=null,J=!1,Di=null,Oi=!1,ki=Error(c(519));function Ai(e){throw Ii(ui(Error(c(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),ki}function ji(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[at]=e,t[ot]=r,n){case`dialog`:$(`cancel`,t),$(`close`,t);break;case`iframe`:case`object`:case`embed`:$(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)$(_d[n],t);break;case`source`:$(`error`,t);break;case`img`:case`image`:case`link`:$(`error`,t),$(`load`,t);break;case`details`:$(`toggle`,t);break;case`input`:$(`invalid`,t),It(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:$(`invalid`,t);break;case`textarea`:$(`invalid`,t),Bt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&($(`beforetoggle`,t),$(`toggle`,t)),r.onScroll!=null&&$(`scroll`,t),r.onScrollEnd!=null&&$(`scrollend`,t),r.onClick!=null&&(t.onclick=K),t=!0):t=!1,t||Ai(e,!0)}function Mi(e){for(Ti=e.return;Ti;)switch(Ti.tag){case 5:case 31:case 13:Oi=!1;return;case 27:case 3:Oi=!0;return;default:Ti=Ti.return}}function Ni(e){if(e!==Ti)return!1;if(!J)return Mi(e),J=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!==`form`&&n!==`button`)||Wd(e.type,e.memoizedProps)),n=!n),n&&Ei&&Ai(e),Mi(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(c(317));Ei=df(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(c(317));Ei=df(e)}else t===27?(t=Ei,Qd(e.type)?(e=uf,uf=null,Ei=e):Ei=t):Ei=Ti?lf(e.stateNode.nextSibling):null;return!0}function Pi(){Ei=Ti=null,J=!1}function Fi(){var e=Di;return e!==null&&(Xl===null?Xl=e:Xl.push.apply(Xl,e),Di=null),e}function Ii(e){Di===null?Di=[e]:Di.push(e)}var Li=oe(null),Ri=null,zi=null;function Bi(e,t,n){I(Li,t._currentValue),t._currentValue=n}function Vi(e){e._currentValue=Li.current,se(Li)}function Hi(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Ui(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var l=o;o=a;for(var u=0;u<t.length;u++)if(l.context===t[u]){o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),Hi(o.return,n,e),r||(s=null);break a}o=l.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(c(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Hi(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function Wi(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(c(387));if(s=s.memoizedProps,s!==null){var l=a.type;mr(a.pendingProps.value,s.value)||(e===null?e=[l]:e.push(l))}}else if(a===de.current){if(s=a.alternate,s===null)throw Error(c(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[$f]:e.push($f))}a=a.return}e!==null&&Ui(t,e,n,r),t.flags|=262144}function Gi(e){for(e=e.firstContext;e!==null;){if(!mr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ki(e){Ri=e,zi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function qi(e){return Yi(Ri,e)}function Ji(e,t){return Ri===null&&Ki(e),Yi(e,t)}function Yi(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},zi===null){if(e===null)throw Error(c(308));zi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else zi=zi.next=t;return n}var Xi=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},Zi=t.unstable_scheduleCallback,Qi=t.unstable_NormalPriority,$i={$$typeof:w,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ea(){return{controller:new Xi,data:new Map,refCount:0}}function ta(e){e.refCount--,e.refCount===0&&Zi(Qi,function(){e.controller.abort()})}var na=null,ra=0,ia=0,aa=null;function oa(e,t){if(na===null){var n=na=[];ra=0,ia=dd(),aa={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return ra++,t.then(sa,sa),t}function sa(){if(--ra===0&&na!==null){aa!==null&&(aa.status=`fulfilled`);var e=na;na=null,ia=0,aa=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function ca(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var la=P.S;P.S=function(e,t){$l=Oe(),typeof t==`object`&&t&&typeof t.then==`function`&&oa(e,t),la!==null&&la(e,t)};var ua=oe(null);function da(){var e=ua.current;return e===null?Fl.pooledCache:e}function fa(e,t){t===null?I(ua,ua.current):I(ua,t.pool)}function pa(){var e=da();return e===null?null:{parent:$i._currentValue,pool:e}}var ma=Error(c(460)),ha=Error(c(474)),ga=Error(c(542)),_a={then:function(){}};function va(e){return e=e.status,e===`fulfilled`||e===`rejected`}function ya(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(K,K),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ca(e),e;default:if(typeof t.status==`string`)t.then(K,K);else{if(e=Fl,e!==null&&100<e.shellSuspendCounter)throw Error(c(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ca(e),e}throw xa=t,ma}}function ba(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(xa=e,ma):e}}var xa=null;function Sa(){if(xa===null)throw Error(c(459));var e=xa;return xa=null,e}function Ca(e){if(e===ma||e===ga)throw Error(c(483))}var wa=null,Ta=0;function Ea(e){var t=Ta;return Ta+=1,wa===null&&(wa=[]),ya(wa,e,t)}function Da(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Oa(e,t){throw t.$$typeof===_?Error(c(525)):(e=Object.prototype.toString.call(t),Error(c(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function ka(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=ni(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function l(e,t,n,r){return t===null||t.tag!==6?(t=oi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function u(e,t,n,r){var o=n.type;return o===b?f(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===o||typeof o==`object`&&o&&o.$$typeof===k&&ba(o)===t.type)?(t=a(t,n.props),Da(t,n),t.return=e,t):(t=ii(n.type,n.key,n.props,null,e.mode,r),Da(t,n),t.return=e,t)}function d(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=ci(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function f(e,t,n,r,o){return t===null||t.tag!==7?(t=ai(n,e.mode,r,o),t.return=e,t):(t=a(t,n),t.return=e,t)}function p(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=oi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case v:return n=ii(t.type,t.key,t.props,null,e.mode,n),Da(n,t),n.return=e,n;case y:return t=ci(t,e.mode,n),t.return=e,t;case k:return t=ba(t),p(e,t,n)}if(ne(t)||ee(t))return t=ai(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return p(e,Ea(t),n);if(t.$$typeof===w)return p(e,Ji(e,t),n);Oa(e,t)}return null}function m(e,t,n,r){var a=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return a===null?l(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case v:return n.key===a?u(e,t,n,r):null;case y:return n.key===a?d(e,t,n,r):null;case k:return n=ba(n),m(e,t,n,r)}if(ne(n)||ee(n))return a===null?f(e,t,n,r,null):null;if(typeof n.then==`function`)return m(e,t,Ea(n),r);if(n.$$typeof===w)return m(e,t,Ji(e,n),r);Oa(e,n)}return null}function h(e,t,n,r,a){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,l(t,e,``+r,a);if(typeof r==`object`&&r){switch(r.$$typeof){case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,a);case y:return e=e.get(r.key===null?n:r.key)||null,d(t,e,r,a);case k:return r=ba(r),h(e,t,n,r,a)}if(ne(r)||ee(r))return e=e.get(n)||null,f(t,e,r,a,null);if(typeof r.then==`function`)return h(e,t,n,Ea(r),a);if(r.$$typeof===w)return h(e,t,n,Ji(t,r),a);Oa(t,r)}return null}function g(a,s,c,l){for(var u=null,d=null,f=s,g=s=0,_=null;f!==null&&g<c.length;g++){f.index>g?(_=f,f=null):_=f.sibling;var v=m(a,f,c[g],l);if(v===null){f===null&&(f=_);break}e&&f&&v.alternate===null&&t(a,f),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v,f=_}if(g===c.length)return n(a,f),J&&bi(a,g),u;if(f===null){for(;g<c.length;g++)f=p(a,c[g],l),f!==null&&(s=o(f,s,g),d===null?u=f:d.sibling=f,d=f);return J&&bi(a,g),u}for(f=r(f);g<c.length;g++)_=h(f,a,g,c[g],l),_!==null&&(e&&_.alternate!==null&&f.delete(_.key===null?g:_.key),s=o(_,s,g),d===null?u=_:d.sibling=_,d=_);return e&&f.forEach(function(e){return t(a,e)}),J&&bi(a,g),u}function _(a,s,l,u){if(l==null)throw Error(c(151));for(var d=null,f=null,g=s,_=s=0,v=null,y=l.next();g!==null&&!y.done;_++,y=l.next()){g.index>_?(v=g,g=null):v=g.sibling;var b=m(a,g,y.value,u);if(b===null){g===null&&(g=v);break}e&&g&&b.alternate===null&&t(a,g),s=o(b,s,_),f===null?d=b:f.sibling=b,f=b,g=v}if(y.done)return n(a,g),J&&bi(a,_),d;if(g===null){for(;!y.done;_++,y=l.next())y=p(a,y.value,u),y!==null&&(s=o(y,s,_),f===null?d=y:f.sibling=y,f=y);return J&&bi(a,_),d}for(g=r(g);!y.done;_++,y=l.next())y=h(g,a,_,y.value,u),y!==null&&(e&&y.alternate!==null&&g.delete(y.key===null?_:y.key),s=o(y,s,_),f===null?d=y:f.sibling=y,f=y);return e&&g.forEach(function(e){return t(a,e)}),J&&bi(a,_),d}function x(e,r,o,l){if(typeof o==`object`&&o&&o.type===b&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case v:a:{for(var u=o.key;r!==null;){if(r.key===u){if(u=o.type,u===b){if(r.tag===7){n(e,r.sibling),l=a(r,o.props.children),l.return=e,e=l;break a}}else if(r.elementType===u||typeof u==`object`&&u&&u.$$typeof===k&&ba(u)===r.type){n(e,r.sibling),l=a(r,o.props),Da(l,o),l.return=e,e=l;break a}n(e,r);break}else t(e,r);r=r.sibling}o.type===b?(l=ai(o.props.children,e.mode,l,o.key),l.return=e,e=l):(l=ii(o.type,o.key,o.props,null,e.mode,l),Da(l,o),l.return=e,e=l)}return s(e);case y:a:{for(u=o.key;r!==null;){if(r.key===u)if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),l=a(r,o.children||[]),l.return=e,e=l;break a}else{n(e,r);break}else t(e,r);r=r.sibling}l=ci(o,e.mode,l),l.return=e,e=l}return s(e);case k:return o=ba(o),x(e,r,o,l)}if(ne(o))return g(e,r,o,l);if(ee(o)){if(u=ee(o),typeof u!=`function`)throw Error(c(150));return o=u.call(o),_(e,r,o,l)}if(typeof o.then==`function`)return x(e,r,Ea(o),l);if(o.$$typeof===w)return x(e,r,Ji(e,o),l);Oa(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),l=a(r,o),l.return=e,e=l):(n(e,r),l=oi(o,e.mode,l),l.return=e,e=l),s(e)):n(e,r)}return function(e,t,n,r){try{Ta=0;var a=x(e,t,n,r);return wa=null,a}catch(t){if(t===ma||t===ga)throw t;var o=ei(29,t,null,e.mode);return o.lanes=r,o.return=e,o}}}var Aa=ka(!0),ja=ka(!1),Ma=!1;function Na(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Pa(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Fa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ia(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,Pl&2){var a=r.pending;return a===null?t.next=t:(t.next=a.next,a.next=t),r.pending=t,t=Zr(e),Xr(e,null,n),t}return qr(e,r,t,n),Zr(e)}function La(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Qe(e,n)}}function Ra(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var a=null,o=null;if(n=n.firstBaseUpdate,n!==null){do{var s={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};o===null?a=o=s:o=o.next=s,n=n.next}while(n!==null);o===null?a=o=t:o=o.next=t}else a=o=t;n={baseState:r.baseState,firstBaseUpdate:a,lastBaseUpdate:o,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var za=!1;function Ba(){if(za){var e=aa;if(e!==null)throw e}}function Va(e,t,n,r){za=!1;var a=e.updateQueue;Ma=!1;var o=a.firstBaseUpdate,s=a.lastBaseUpdate,c=a.shared.pending;if(c!==null){a.shared.pending=null;var l=c,u=l.next;l.next=null,s===null?o=u:s.next=u,s=l;var d=e.alternate;d!==null&&(d=d.updateQueue,c=d.lastBaseUpdate,c!==s&&(c===null?d.firstBaseUpdate=u:c.next=u,d.lastBaseUpdate=l))}if(o!==null){var f=a.baseState;s=0,d=u=l=null,c=o;do{var p=c.lane&-536870913,m=p!==c.lane;if(m?(Il&p)===p:(r&p)===p){p!==0&&p===ia&&(za=!0),d!==null&&(d=d.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});a:{var h=e,_=c;p=t;var v=n;switch(_.tag){case 1:if(h=_.payload,typeof h==`function`){f=h.call(v,f,p);break a}f=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=_.payload,p=typeof h==`function`?h.call(v,f,p):h,p==null)break a;f=g({},f,p);break a;case 2:Ma=!0}}p=c.callback,p!==null&&(e.flags|=64,m&&(e.flags|=8192),m=a.callbacks,m===null?a.callbacks=[p]:m.push(p))}else m={lane:p,tag:c.tag,payload:c.payload,callback:c.callback,next:null},d===null?(u=d=m,l=f):d=d.next=m,s|=p;if(c=c.next,c===null){if(c=a.shared.pending,c===null)break;m=c,c=m.next,m.next=null,a.lastBaseUpdate=m,a.shared.pending=null}}while(1);d===null&&(l=f),a.baseState=l,a.firstBaseUpdate=u,a.lastBaseUpdate=d,o===null&&(a.shared.lanes=0),Wl|=s,e.lanes=s,e.memoizedState=f}}function Ha(e,t){if(typeof e!=`function`)throw Error(c(191,e));e.call(t)}function Ua(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ha(n[e],t)}var Wa=oe(null),Ga=oe(0);function Y(e,t){e=Hl,I(Ga,e),I(Wa,t),Hl=e|t.baseLanes}function X(){I(Ga,Hl),I(Wa,Wa.current)}function Ka(){Hl=Ga.current,se(Wa),se(Ga)}var qa=oe(null),Ja=null;function Ya(e){var t=e.alternate;I(eo,eo.current&1),I(qa,e),Ja===null&&(t===null||Wa.current!==null||t.memoizedState!==null)&&(Ja=e)}function Xa(e){I(eo,eo.current),I(qa,e),Ja===null&&(Ja=e)}function Za(e){e.tag===22?(I(eo,eo.current),I(qa,e),Ja===null&&(Ja=e)):Qa(e)}function Qa(){I(eo,eo.current),I(qa,qa.current)}function $a(e){se(qa),Ja===e&&(Ja=null),se(eo)}var eo=oe(0);function to(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||of(n)||sf(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var no=0,Z=null,ro=null,io=null,ao=!1,oo=!1,so=!1,co=0,lo=0,uo=null,fo=0;function po(){throw Error(c(321))}function mo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!mr(e[n],t[n]))return!1;return!0}function ho(e,t,n,r,a,o){return no=o,Z=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,P.H=e===null||e.memoizedState===null?Ms:Ns,so=!1,o=n(r,a),so=!1,oo&&(o=_o(t,n,r,a)),go(e),o}function go(e){P.H=js;var t=ro!==null&&ro.next!==null;if(no=0,io=ro=Z=null,ao=!1,lo=0,uo=null,t)throw Error(c(300));e===null||Xs||(e=e.dependencies,e!==null&&Gi(e)&&(Xs=!0))}function _o(e,t,n,r){Z=e;var a=0;do{if(oo&&(uo=null),lo=0,oo=!1,25<=a)throw Error(c(301));if(a+=1,io=ro=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}P.H=Ps,o=t(n,r)}while(oo);return o}function vo(){var e=P.H,t=e.useState()[0];return t=typeof t.then==`function`?To(t):t,e=e.useState()[0],(ro===null?null:ro.memoizedState)!==e&&(Z.flags|=1024),t}function yo(){var e=co!==0;return co=0,e}function bo(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function xo(e){if(ao){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}ao=!1}no=0,io=ro=Z=null,oo=!1,lo=co=0,uo=null}function So(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return io===null?Z.memoizedState=io=e:io=io.next=e,io}function Co(){if(ro===null){var e=Z.alternate;e=e===null?null:e.memoizedState}else e=ro.next;var t=io===null?Z.memoizedState:io.next;if(t!==null)io=t,ro=e;else{if(e===null)throw Z.alternate===null?Error(c(467)):Error(c(310));ro=e,e={memoizedState:ro.memoizedState,baseState:ro.baseState,baseQueue:ro.baseQueue,queue:ro.queue,next:null},io===null?Z.memoizedState=io=e:io=io.next=e}return io}function wo(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function To(e){var t=lo;return lo+=1,uo===null&&(uo=[]),e=ya(uo,e,t),t=Z,(io===null?t.memoizedState:io.next)===null&&(t=t.alternate,P.H=t===null||t.memoizedState===null?Ms:Ns),e}function Eo(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return To(e);if(e.$$typeof===w)return qi(e)}throw Error(c(438,String(e)))}function Do(e){var t=null,n=Z.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=Z.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=wo(),Z.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=j;return t.index++,n}function Oo(e,t){return typeof t==`function`?t(e):t}function ko(e){return Ao(Co(),ro,e)}function Ao(e,t,n){var r=e.queue;if(r===null)throw Error(c(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var l=s=null,u=null,d=t,f=!1;do{var p=d.lane&-536870913;if(p===d.lane?(no&p)===p:(Il&p)===p){var m=d.revertLane;if(m===0)u!==null&&(u=u.next={lane:0,revertLane:0,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),p===ia&&(f=!0);else if((no&m)===m){d=d.next,m===ia&&(f=!0);continue}else p={lane:0,revertLane:d.revertLane,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},u===null?(l=u=p,s=o):u=u.next=p,Z.lanes|=m,Wl|=m;p=d.action,so&&n(o,p),o=d.hasEagerState?d.eagerState:n(o,p)}else m={lane:p,revertLane:d.revertLane,gesture:d.gesture,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},u===null?(l=u=m,s=o):u=u.next=m,Z.lanes|=p,Wl|=p;d=d.next}while(d!==null&&d!==t);if(u===null?s=o:u.next=l,!mr(o,e.memoizedState)&&(Xs=!0,f&&(n=aa,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=u,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function jo(e){var t=Co(),n=t.queue;if(n===null)throw Error(c(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);mr(o,t.memoizedState)||(Xs=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Mo(e,t,n){var r=Z,a=Co(),o=J;if(o){if(n===void 0)throw Error(c(407));n=n()}else n=t();var s=!mr((ro||a).memoizedState,n);if(s&&(a.memoizedState=n,Xs=!0),a=a.queue,rs(Fo.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||io!==null&&io.memoizedState.tag&1){if(r.flags|=2048,Qo(9,{destroy:void 0},Po.bind(null,r,a,n,t),null),Fl===null)throw Error(c(349));o||no&127||No(r,t,n)}return n}function No(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Z.updateQueue,t===null?(t=wo(),Z.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Po(e,t,n,r){t.value=n,t.getSnapshot=r,Io(t)&&Lo(e)}function Fo(e,t,n){return n(function(){Io(t)&&Lo(e)})}function Io(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!mr(e,n)}catch{return!0}}function Lo(e){var t=Yr(e,2);t!==null&&mu(t,e,2)}function Ro(e){var t=So();if(typeof e==`function`){var n=e;if(e=n(),so){Fe(!0);try{n()}finally{Fe(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Oo,lastRenderedState:e},t}function zo(e,t,n,r){return e.baseState=n,Ao(e,ro,typeof r==`function`?r:Oo)}function Bo(e,t,n,r,a){if(Os(e))throw Error(c(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};P.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Vo(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Vo(e,t){var n=t.action,r=t.payload,a=e.state;if(t.isTransition){var o=P.T,s={};P.T=s;try{var c=n(a,r),l=P.S;l!==null&&l(s,c),Ho(e,t,c)}catch(n){Wo(e,t,n)}finally{o!==null&&s.types!==null&&(o.types=s.types),P.T=o}}else try{o=n(a,r),Ho(e,t,o)}catch(n){Wo(e,t,n)}}function Ho(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Uo(e,t,n)},function(n){return Wo(e,t,n)}):Uo(e,t,n)}function Uo(e,t,n){t.status=`fulfilled`,t.value=n,Go(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Vo(e,n)))}function Wo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Go(t),t=t.next;while(t!==r)}e.action=null}function Go(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Ko(e,t){return t}function qo(e,t){if(J){var n=Fl.formState;if(n!==null){a:{var r=Z;if(J){if(Ei){b:{for(var a=Ei,o=Oi;a.nodeType!==8;){if(!o){a=null;break b}if(a=lf(a.nextSibling),a===null){a=null;break b}}o=a.data,a=o===`F!`||o===`F`?a:null}if(a){Ei=lf(a.nextSibling),r=a.data===`F!`;break a}}Ai(r)}r=!1}r&&(t=n[0])}}return n=So(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Ko,lastRenderedState:t},n.queue=r,n=Ts.bind(null,Z,r),r.dispatch=n,r=Ro(!1),o=Ds.bind(null,Z,!1,r.queue),r=So(),a={state:t,dispatch:null,action:e,pending:null},r.queue=a,n=Bo.bind(null,Z,a,o,n),a.dispatch=n,r.memoizedState=e,[t,n,!1]}function Jo(e){return Yo(Co(),ro,e)}function Yo(e,t,n){if(t=Ao(e,t,Ko)[0],e=ko(Oo)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=To(t)}catch(e){throw e===ma?ga:e}else r=t;t=Co();var a=t.queue,o=a.dispatch;return n!==t.memoizedState&&(Z.flags|=2048,Qo(9,{destroy:void 0},Xo.bind(null,a,n),null)),[r,o,e]}function Xo(e,t){e.action=t}function Zo(e){var t=Co(),n=ro;if(n!==null)return Yo(t,n,e);Co(),t=t.memoizedState,n=Co();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function Qo(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=Z.updateQueue,t===null&&(t=wo(),Z.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function $o(){return Co().memoizedState}function es(e,t,n,r){var a=So();Z.flags|=e,a.memoizedState=Qo(1|t,{destroy:void 0},n,r===void 0?null:r)}function ts(e,t,n,r){var a=Co();r=r===void 0?null:r;var o=a.memoizedState.inst;ro!==null&&r!==null&&mo(r,ro.memoizedState.deps)?a.memoizedState=Qo(t,o,n,r):(Z.flags|=e,a.memoizedState=Qo(1|t,o,n,r))}function ns(e,t){es(8390656,8,e,t)}function rs(e,t){ts(2048,8,e,t)}function is(e){Z.flags|=4;var t=Z.updateQueue;if(t===null)t=wo(),Z.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function as(e){var t=Co().memoizedState;return is({ref:t,nextImpl:e}),function(){if(Pl&2)throw Error(c(440));return t.impl.apply(void 0,arguments)}}function os(e,t){return ts(4,2,e,t)}function ss(e,t){return ts(4,4,e,t)}function cs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ls(e,t,n){n=n==null?null:n.concat([e]),ts(4,4,cs.bind(null,t,e),n)}function us(){}function ds(e,t){var n=Co();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&mo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function fs(e,t){var n=Co();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&mo(t,r[1]))return r[0];if(r=e(),so){Fe(!0);try{e()}finally{Fe(!1)}}return n.memoizedState=[r,t],r}function ps(e,t,n){return n===void 0||no&1073741824&&!(Il&261930)?e.memoizedState=t:(e.memoizedState=n,e=pu(),Z.lanes|=e,Wl|=e,n)}function ms(e,t,n,r){return mr(n,t)?n:Wa.current===null?!(no&42)||no&1073741824&&!(Il&261930)?(Xs=!0,e.memoizedState=n):(e=pu(),Z.lanes|=e,Wl|=e,t):(e=ps(e,n,r),mr(e,t)||(Xs=!0),e)}function hs(e,t,n,r,a){var o=F.p;F.p=o!==0&&8>o?o:8;var s=P.T,c={};P.T=c,Ds(e,!1,t,n);try{var l=a(),u=P.S;u!==null&&u(c,l),typeof l==`object`&&l&&typeof l.then==`function`?Es(e,t,ca(l,r),fu(e)):Es(e,t,r,fu(e))}catch(n){Es(e,t,{then:function(){},status:`rejected`,reason:n},fu())}finally{F.p=o,s!==null&&c.types!==null&&(s.types=c.types),P.T=s}}function gs(){}function _s(e,t,n,r){if(e.tag!==5)throw Error(c(476));var a=vs(e).queue;hs(e,a,t,re,n===null?gs:function(){return ys(e),n(r)})}function vs(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:re,baseState:re,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Oo,lastRenderedState:re},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Oo,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ys(e){var t=vs(e);t.next===null&&(t=e.alternate.memoizedState),Es(e,t.next.queue,{},fu())}function bs(){return qi($f)}function xs(){return Co().memoizedState}function Ss(){return Co().memoizedState}function Cs(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=fu();e=Fa(n);var r=Ia(t,e,n);r!==null&&(mu(r,t,n),La(r,t,n)),t={cache:ea()},e.payload=t;return}t=t.return}}function ws(e,t,n){var r=fu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Os(e)?ks(t,n):(n=Jr(e,t,n,r),n!==null&&(mu(n,e,r),As(n,t,r)))}function Ts(e,t,n){Es(e,t,n,fu())}function Es(e,t,n,r){var a={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Os(e))ks(t,a);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var s=t.lastRenderedState,c=o(s,n);if(a.hasEagerState=!0,a.eagerState=c,mr(c,s))return qr(e,t,a,0),Fl===null&&Kr(),!1}catch{}if(n=Jr(e,t,a,r),n!==null)return mu(n,e,r),As(n,t,r),!0}return!1}function Ds(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Os(e)){if(t)throw Error(c(479))}else t=Jr(e,n,r,2),t!==null&&mu(t,e,2)}function Os(e){var t=e.alternate;return e===Z||t!==null&&t===Z}function ks(e,t){oo=ao=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function As(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Qe(e,n)}}var js={readContext:qi,use:Eo,useCallback:po,useContext:po,useEffect:po,useImperativeHandle:po,useLayoutEffect:po,useInsertionEffect:po,useMemo:po,useReducer:po,useRef:po,useState:po,useDebugValue:po,useDeferredValue:po,useTransition:po,useSyncExternalStore:po,useId:po,useHostTransitionStatus:po,useFormState:po,useActionState:po,useOptimistic:po,useMemoCache:po,useCacheRefresh:po};js.useEffectEvent=po;var Ms={readContext:qi,use:Eo,useCallback:function(e,t){return So().memoizedState=[e,t===void 0?null:t],e},useContext:qi,useEffect:ns,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),es(4194308,4,cs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return es(4194308,4,e,t)},useInsertionEffect:function(e,t){es(4,2,e,t)},useMemo:function(e,t){var n=So();t=t===void 0?null:t;var r=e();if(so){Fe(!0);try{e()}finally{Fe(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=So();if(n!==void 0){var a=n(t);if(so){Fe(!0);try{n(t)}finally{Fe(!1)}}}else a=t;return r.memoizedState=r.baseState=a,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:a},r.queue=e,e=e.dispatch=ws.bind(null,Z,e),[r.memoizedState,e]},useRef:function(e){var t=So();return e={current:e},t.memoizedState=e},useState:function(e){e=Ro(e);var t=e.queue,n=Ts.bind(null,Z,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:us,useDeferredValue:function(e,t){return ps(So(),e,t)},useTransition:function(){var e=Ro(!1);return e=hs.bind(null,Z,e.queue,!0,!1),So().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=Z,a=So();if(J){if(n===void 0)throw Error(c(407));n=n()}else{if(n=t(),Fl===null)throw Error(c(349));Il&127||No(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,ns(Fo.bind(null,r,o,e),[e]),r.flags|=2048,Qo(9,{destroy:void 0},Po.bind(null,r,o,n,t),null),n},useId:function(){var e=So(),t=Fl.identifierPrefix;if(J){var n=yi,r=vi;n=(r&~(1<<32-Ie(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=co++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=fo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:bs,useFormState:qo,useActionState:qo,useOptimistic:function(e){var t=So();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ds.bind(null,Z,!0,n),n.dispatch=t,[e,t]},useMemoCache:Do,useCacheRefresh:function(){return So().memoizedState=Cs.bind(null,Z)},useEffectEvent:function(e){var t=So(),n={impl:e};return t.memoizedState=n,function(){if(Pl&2)throw Error(c(440));return n.impl.apply(void 0,arguments)}}},Ns={readContext:qi,use:Eo,useCallback:ds,useContext:qi,useEffect:rs,useImperativeHandle:ls,useInsertionEffect:os,useLayoutEffect:ss,useMemo:fs,useReducer:ko,useRef:$o,useState:function(){return ko(Oo)},useDebugValue:us,useDeferredValue:function(e,t){return ms(Co(),ro.memoizedState,e,t)},useTransition:function(){var e=ko(Oo)[0],t=Co().memoizedState;return[typeof e==`boolean`?e:To(e),t]},useSyncExternalStore:Mo,useId:xs,useHostTransitionStatus:bs,useFormState:Jo,useActionState:Jo,useOptimistic:function(e,t){return zo(Co(),ro,e,t)},useMemoCache:Do,useCacheRefresh:Ss};Ns.useEffectEvent=as;var Ps={readContext:qi,use:Eo,useCallback:ds,useContext:qi,useEffect:rs,useImperativeHandle:ls,useInsertionEffect:os,useLayoutEffect:ss,useMemo:fs,useReducer:jo,useRef:$o,useState:function(){return jo(Oo)},useDebugValue:us,useDeferredValue:function(e,t){var n=Co();return ro===null?ps(n,e,t):ms(n,ro.memoizedState,e,t)},useTransition:function(){var e=jo(Oo)[0],t=Co().memoizedState;return[typeof e==`boolean`?e:To(e),t]},useSyncExternalStore:Mo,useId:xs,useHostTransitionStatus:bs,useFormState:Zo,useActionState:Zo,useOptimistic:function(e,t){var n=Co();return ro===null?(n.baseState=e,[e,n.queue.dispatch]):zo(n,ro,e,t)},useMemoCache:Do,useCacheRefresh:Ss};Ps.useEffectEvent=as;function Fs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:g({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Is={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=fu(),a=Fa(r);a.payload=t,n!=null&&(a.callback=n),t=Ia(e,a,r),t!==null&&(mu(t,e,r),La(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=fu(),a=Fa(r);a.tag=1,a.payload=t,n!=null&&(a.callback=n),t=Ia(e,a,r),t!==null&&(mu(t,e,r),La(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=fu(),r=Fa(n);r.tag=2,t!=null&&(r.callback=t),t=Ia(e,r,n),t!==null&&(mu(t,e,n),La(t,e,n))}};function Ls(e,t,n,r,a,o,s){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,o,s):t.prototype&&t.prototype.isPureReactComponent?!hr(n,r)||!hr(a,o):!0}function Rs(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Is.enqueueReplaceState(t,t.state,null)}function zs(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var a in n===t&&(n=g({},n)),e)n[a]===void 0&&(n[a]=e[a]);return n}function Bs(e){Hr(e)}function Vs(e){console.error(e)}function Hs(e){Hr(e)}function Us(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Ws(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Gs(e,t,n){return n=Fa(n),n.tag=3,n.payload={element:null},n.callback=function(){Us(e,t)},n}function Ks(e){return e=Fa(e),e.tag=3,e}function qs(e,t,n,r){var a=n.type.getDerivedStateFromError;if(typeof a==`function`){var o=r.value;e.payload=function(){return a(o)},e.callback=function(){Ws(t,n,r)}}var s=n.stateNode;s!==null&&typeof s.componentDidCatch==`function`&&(e.callback=function(){Ws(t,n,r),typeof a!=`function`&&(nu===null?nu=new Set([this]):nu.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function Js(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Wi(t,n,a,!0),n=qa.current,n!==null){switch(n.tag){case 31:case 13:return Ja===null?Eu():n.alternate===null&&Ul===0&&(Ul=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===_a?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,a)),!1;case 22:return n.flags|=65536,r===_a?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,a)),!1}throw Error(c(435,n.tag))}return Gu(e,r,a),Eu(),!1}if(J)return t=qa.current,t===null?(r!==ki&&(t=Error(c(423),{cause:r}),Ii(ui(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=ui(r,n),a=Gs(e.stateNode,r,a),Ra(e,a),Ul!==4&&(Ul=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==ki&&(e=Error(c(422),{cause:r}),Ii(ui(e,n)))),!1;var o=Error(c(520),{cause:r});if(o=ui(o,n),Yl===null?Yl=[o]:Yl.push(o),Ul!==4&&(Ul=2),t===null)return!0;r=ui(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Gs(n.stateNode,r,e),Ra(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(nu===null||!nu.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=Ks(a),qs(a,e,n,r),Ra(n,a),!1}n=n.return}while(n!==null);return!1}var Ys=Error(c(461)),Xs=!1;function Zs(e,t,n,r){t.child=e===null?ja(t,null,n,r):Aa(t,e.child,n,r)}function Qs(e,t,n,r,a){n=n.render;var o=t.ref;if(`ref`in r){var s={};for(var c in r)c!==`ref`&&(s[c]=r[c])}else s=r;return Ki(t),r=ho(e,t,n,s,o,a),c=yo(),e!==null&&!Xs?(bo(e,t,a),Sc(e,t,a)):(J&&c&&Si(t),t.flags|=1,Zs(e,t,r,a),t.child)}function $s(e,t,n,r,a){if(e===null){var o=n.type;return typeof o==`function`&&!ti(o)&&o.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=o,ec(e,t,o,r,a)):(e=ii(n.type,null,r,t,t.mode,a),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,!Cc(e,a)){var s=o.memoizedProps;if(n=n.compare,n=n===null?hr:n,n(s,r)&&e.ref===t.ref)return Sc(e,t,a)}return t.flags|=1,e=ni(o,r),e.ref=t.ref,e.return=t,t.child=e}function ec(e,t,n,r,a){if(e!==null){var o=e.memoizedProps;if(hr(o,r)&&e.ref===t.ref)if(Xs=!1,t.pendingProps=r=o,Cc(e,a))e.flags&131072&&(Xs=!0);else return t.lanes=e.lanes,Sc(e,t,a)}return cc(e,t,n,r,a)}function tc(e,t,n,r){var a=r.children,o=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(o=o===null?n:o.baseLanes|n,e!==null){for(r=t.child=e.child,a=0;r!==null;)a=a|r.lanes|r.childLanes,r=r.sibling;r=a&~o}else r=0,t.child=null;return rc(e,t,o,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&fa(t,o===null?null:o.cachePool),o===null?X():Y(t,o),Za(t);else return r=t.lanes=536870912,rc(e,t,o===null?n:o.baseLanes|n,n,r)}else o===null?(e!==null&&fa(t,null),X(),Qa(t)):(fa(t,o.cachePool),Y(t,o),Qa(t),t.memoizedState=null);return Zs(e,t,a,n),t.child}function nc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function rc(e,t,n,r,a){var o=da();return o=o===null?null:{parent:$i._currentValue,pool:o},t.memoizedState={baseLanes:n,cachePool:o},e!==null&&fa(t,null),X(),Za(t),e!==null&&Wi(e,t,r,!0),t.childLanes=a,null}function ic(e,t){return t=_c({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function ac(e,t,n){return Aa(t,e.child,null,n),e=ic(t,t.pendingProps),e.flags|=2,$a(t),t.memoizedState=null,e}function oc(e,t,n){var r=t.pendingProps,a=(t.flags&128)!=0;if(t.flags&=-129,e===null){if(J){if(r.mode===`hidden`)return e=ic(t,r),t.lanes=536870912,nc(null,e);if(Xa(t),(e=Ei)?(e=af(e,Oi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:_i===null?null:{id:vi,overflow:yi},retryLane:536870912,hydrationErrors:null},n=si(e),n.return=t,t.child=n,Ti=t,Ei=null)):e=null,e===null)throw Ai(t);return t.lanes=536870912,null}return ic(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(Xa(t),a)if(t.flags&256)t.flags&=-257,t=ac(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(c(558));else if(Xs||Wi(e,t,n,!1),a=(n&e.childLanes)!==0,Xs||a){if(r=Fl,r!==null&&(s=$e(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,Yr(e,s),mu(r,e,s),Ys;Eu(),t=ac(e,t,n)}else e=o.treeContext,Ei=lf(s.nextSibling),Ti=t,J=!0,Di=null,Oi=!1,e!==null&&wi(t,e),t=ic(t,r),t.flags|=4096;return t}return e=ni(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function sc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(c(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function cc(e,t,n,r,a){return Ki(t),n=ho(e,t,n,r,void 0,a),r=yo(),e!==null&&!Xs?(bo(e,t,a),Sc(e,t,a)):(J&&r&&Si(t),t.flags|=1,Zs(e,t,n,a),t.child)}function lc(e,t,n,r,a,o){return Ki(t),t.updateQueue=null,n=_o(t,r,n,a),go(e),r=yo(),e!==null&&!Xs?(bo(e,t,o),Sc(e,t,o)):(J&&r&&Si(t),t.flags|=1,Zs(e,t,n,o),t.child)}function uc(e,t,n,r,a){if(Ki(t),t.stateNode===null){var o=Qr,s=n.contextType;typeof s==`object`&&s&&(o=qi(s)),o=new n(r,o),t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,o.updater=Is,t.stateNode=o,o._reactInternals=t,o=t.stateNode,o.props=r,o.state=t.memoizedState,o.refs={},Na(t),s=n.contextType,o.context=typeof s==`object`&&s?qi(s):Qr,o.state=t.memoizedState,s=n.getDerivedStateFromProps,typeof s==`function`&&(Fs(t,n,s,r),o.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof o.getSnapshotBeforeUpdate==`function`||typeof o.UNSAFE_componentWillMount!=`function`&&typeof o.componentWillMount!=`function`||(s=o.state,typeof o.componentWillMount==`function`&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount==`function`&&o.UNSAFE_componentWillMount(),s!==o.state&&Is.enqueueReplaceState(o,o.state,null),Va(t,r,o,a),Ba(),o.state=t.memoizedState),typeof o.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){o=t.stateNode;var c=t.memoizedProps,l=zs(n,c);o.props=l;var u=o.context,d=n.contextType;s=Qr,typeof d==`object`&&d&&(s=qi(d));var f=n.getDerivedStateFromProps;d=typeof f==`function`||typeof o.getSnapshotBeforeUpdate==`function`,c=t.pendingProps!==c,d||typeof o.UNSAFE_componentWillReceiveProps!=`function`&&typeof o.componentWillReceiveProps!=`function`||(c||u!==s)&&Rs(t,o,r,s),Ma=!1;var p=t.memoizedState;o.state=p,Va(t,r,o,a),Ba(),u=t.memoizedState,c||p!==u||Ma?(typeof f==`function`&&(Fs(t,n,f,r),u=t.memoizedState),(l=Ma||Ls(t,n,l,r,p,u,s))?(d||typeof o.UNSAFE_componentWillMount!=`function`&&typeof o.componentWillMount!=`function`||(typeof o.componentWillMount==`function`&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount==`function`&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount==`function`&&(t.flags|=4194308)):(typeof o.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),o.props=r,o.state=u,o.context=s,r=l):(typeof o.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{o=t.stateNode,Pa(e,t),s=t.memoizedProps,d=zs(n,s),o.props=d,f=t.pendingProps,p=o.context,u=n.contextType,l=Qr,typeof u==`object`&&u&&(l=qi(u)),c=n.getDerivedStateFromProps,(u=typeof c==`function`||typeof o.getSnapshotBeforeUpdate==`function`)||typeof o.UNSAFE_componentWillReceiveProps!=`function`&&typeof o.componentWillReceiveProps!=`function`||(s!==f||p!==l)&&Rs(t,o,r,l),Ma=!1,p=t.memoizedState,o.state=p,Va(t,r,o,a),Ba();var m=t.memoizedState;s!==f||p!==m||Ma||e!==null&&e.dependencies!==null&&Gi(e.dependencies)?(typeof c==`function`&&(Fs(t,n,c,r),m=t.memoizedState),(d=Ma||Ls(t,n,d,r,p,m,l)||e!==null&&e.dependencies!==null&&Gi(e.dependencies))?(u||typeof o.UNSAFE_componentWillUpdate!=`function`&&typeof o.componentWillUpdate!=`function`||(typeof o.componentWillUpdate==`function`&&o.componentWillUpdate(r,m,l),typeof o.UNSAFE_componentWillUpdate==`function`&&o.UNSAFE_componentWillUpdate(r,m,l)),typeof o.componentDidUpdate==`function`&&(t.flags|=4),typeof o.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof o.componentDidUpdate!=`function`||s===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!=`function`||s===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=m),o.props=r,o.state=m,o.context=l,r=d):(typeof o.componentDidUpdate!=`function`||s===e.memoizedProps&&p===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!=`function`||s===e.memoizedProps&&p===e.memoizedState||(t.flags|=1024),r=!1)}return o=r,sc(e,t),r=(t.flags&128)!=0,o||r?(o=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:o.render(),t.flags|=1,e!==null&&r?(t.child=Aa(t,e.child,null,a),t.child=Aa(t,null,n,a)):Zs(e,t,n,a),t.memoizedState=o.state,e=t.child):e=Sc(e,t,a),e}function dc(e,t,n,r){return Pi(),t.flags|=256,Zs(e,t,n,r),t.child}var fc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function pc(e){return{baseLanes:e,cachePool:pa()}}function mc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=ql),e}function hc(e,t,n){var r=t.pendingProps,a=!1,o=(t.flags&128)!=0,s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:(eo.current&2)!=0),s&&(a=!0,t.flags&=-129),s=(t.flags&32)!=0,t.flags&=-33,e===null){if(J){if(a?Ya(t):Qa(t),(e=Ei)?(e=af(e,Oi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:_i===null?null:{id:vi,overflow:yi},retryLane:536870912,hydrationErrors:null},n=si(e),n.return=t,t.child=n,Ti=t,Ei=null)):e=null,e===null)throw Ai(t);return sf(e)?t.lanes=32:t.lanes=536870912,null}var l=r.children;return r=r.fallback,a?(Qa(t),a=t.mode,l=_c({mode:`hidden`,children:l},a),r=ai(r,a,n,null),l.return=t,r.return=t,l.sibling=r,t.child=l,r=t.child,r.memoizedState=pc(n),r.childLanes=mc(e,s,n),t.memoizedState=fc,nc(null,r)):(Ya(t),gc(t,l))}var u=e.memoizedState;if(u!==null&&(l=u.dehydrated,l!==null)){if(o)t.flags&256?(Ya(t),t.flags&=-257,t=vc(e,t,n)):t.memoizedState===null?(Qa(t),l=r.fallback,a=t.mode,r=_c({mode:`visible`,children:r.children},a),l=ai(l,a,n,null),l.flags|=2,r.return=t,l.return=t,r.sibling=l,t.child=r,Aa(t,e.child,null,n),r=t.child,r.memoizedState=pc(n),r.childLanes=mc(e,s,n),t.memoizedState=fc,t=nc(null,r)):(Qa(t),t.child=e.child,t.flags|=128,t=null);else if(Ya(t),sf(l)){if(s=l.nextSibling&&l.nextSibling.dataset,s)var d=s.dgst;s=d,r=Error(c(419)),r.stack=``,r.digest=s,Ii({value:r,source:null,stack:null}),t=vc(e,t,n)}else if(Xs||Wi(e,t,n,!1),s=(n&e.childLanes)!==0,Xs||s){if(s=Fl,s!==null&&(r=$e(s,n),r!==0&&r!==u.retryLane))throw u.retryLane=r,Yr(e,r),mu(s,e,r),Ys;of(l)||Eu(),t=vc(e,t,n)}else of(l)?(t.flags|=192,t.child=e.child,t=null):(e=u.treeContext,Ei=lf(l.nextSibling),Ti=t,J=!0,Di=null,Oi=!1,e!==null&&wi(t,e),t=gc(t,r.children),t.flags|=4096);return t}return a?(Qa(t),l=r.fallback,a=t.mode,u=e.child,d=u.sibling,r=ni(u,{mode:`hidden`,children:r.children}),r.subtreeFlags=u.subtreeFlags&65011712,d===null?(l=ai(l,a,n,null),l.flags|=2):l=ni(d,l),l.return=t,r.return=t,r.sibling=l,t.child=r,nc(null,r),r=t.child,l=e.child.memoizedState,l===null?l=pc(n):(a=l.cachePool,a===null?a=pa():(u=$i._currentValue,a=a.parent===u?a:{parent:u,pool:u}),l={baseLanes:l.baseLanes|n,cachePool:a}),r.memoizedState=l,r.childLanes=mc(e,s,n),t.memoizedState=fc,nc(e.child,r)):(Ya(t),n=e.child,e=n.sibling,n=ni(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function gc(e,t){return t=_c({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function _c(e,t){return e=ei(22,e,null,t),e.lanes=0,e}function vc(e,t,n){return Aa(t,e.child,null,n),e=gc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function yc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Hi(e.return,t,n)}function bc(e,t,n,r,a,o){var s=e.memoizedState;s===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:a,treeForkCount:o}:(s.isBackwards=t,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=a,s.treeForkCount=o)}function xc(e,t,n){var r=t.pendingProps,a=r.revealOrder,o=r.tail;r=r.children;var s=eo.current,c=(s&2)!=0;if(c?(s=s&1|2,t.flags|=128):s&=1,I(eo,s),Zs(e,t,r,n),r=J?mi:0,!c&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&yc(e,n,t);else if(e.tag===19)yc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(a){case`forwards`:for(n=t.child,a=null;n!==null;)e=n.alternate,e!==null&&to(e)===null&&(a=n),n=n.sibling;n=a,n===null?(a=t.child,t.child=null):(a=n.sibling,n.sibling=null),bc(t,!1,a,n,o,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,a=t.child,t.child=null;a!==null;){if(e=a.alternate,e!==null&&to(e)===null){t.child=a;break}e=a.sibling,a.sibling=n,n=a,a=e}bc(t,!0,n,null,o,r);break;case`together`:bc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Sc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Wl|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Wi(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(c(153));if(t.child!==null){for(e=t.child,n=ni(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ni(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Cc(e,t){return(e.lanes&t)===0?(e=e.dependencies,!!(e!==null&&Gi(e))):!0}function wc(e,t,n){switch(t.tag){case 3:fe(t,t.stateNode.containerInfo),Bi(t,$i,e.memoizedState.cache),Pi();break;case 27:case 5:me(t);break;case 4:fe(t,t.stateNode.containerInfo);break;case 10:Bi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Xa(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(Ya(t),e=Sc(e,t,n),e===null?null:e.sibling):hc(e,t,n):(Ya(t),t.flags|=128,null);Ya(t);break;case 19:var a=(e.flags&128)!=0;if(r=(n&t.childLanes)!==0,r||=(Wi(e,t,n,!1),(n&t.childLanes)!==0),a){if(r)return xc(e,t,n);t.flags|=128}if(a=t.memoizedState,a!==null&&(a.rendering=null,a.tail=null,a.lastEffect=null),I(eo,eo.current),r)break;return null;case 22:return t.lanes=0,tc(e,t,n,t.pendingProps);case 24:Bi(t,$i,e.memoizedState.cache)}return Sc(e,t,n)}function Tc(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)Xs=!0;else{if(!Cc(e,n)&&!(t.flags&128))return Xs=!1,wc(e,t,n);Xs=!!(e.flags&131072)}else Xs=!1,J&&t.flags&1048576&&xi(t,mi,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=ba(t.elementType),t.type=e,typeof e==`function`)ti(e)?(r=zs(e,r),t.tag=1,t=uc(null,t,e,r,n)):(t.tag=0,t=cc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===T){t.tag=11,t=Qs(null,t,e,r,n);break a}else if(a===O){t.tag=14,t=$s(null,t,e,r,n);break a}}throw t=te(e)||e,Error(c(306,t,``))}}return t;case 0:return cc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=zs(r,t.pendingProps),uc(e,t,r,a,n);case 3:a:{if(fe(t,t.stateNode.containerInfo),e===null)throw Error(c(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Pa(e,t),Va(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Bi(t,$i,r),r!==o.cache&&Ui(t,[$i],n,!0),Ba(),r=s.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=dc(e,t,r,n);break a}else if(r!==a){a=ui(Error(c(424)),t),Ii(a),t=dc(e,t,r,n);break a}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(Ei=lf(e.firstChild),Ti=t,J=!0,Di=null,Oi=!0,n=ja(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Pi(),r===a){t=Sc(e,t,n);break a}Zs(e,t,r,n)}t=t.child}return t;case 26:return sc(e,t),e===null?(n=Af(t.type,null,t.pendingProps,null))?t.memoizedState=n:J||(n=t.type,e=t.pendingProps,r=Vd(ue.current).createElement(n),r[at]=t,r[ot]=e,Fd(r,n,e),vt(r),t.stateNode=r):t.memoizedState=Af(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return me(t),e===null&&J&&(r=t.stateNode=pf(t.type,t.pendingProps,ue.current),Ti=t,Oi=!0,a=Ei,Qd(t.type)?(uf=a,Ei=lf(r.firstChild)):Ei=a),Zs(e,t,t.pendingProps.children,n),sc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&J&&((a=r=Ei)&&(r=nf(r,t.type,t.pendingProps,Oi),r===null?a=!1:(t.stateNode=r,Ti=t,Ei=lf(r.firstChild),Oi=!1,a=!0)),a||Ai(t)),me(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Wd(a,o)?r=null:s!==null&&Wd(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=ho(e,t,vo,null,null,n),$f._currentValue=a),sc(e,t),Zs(e,t,r,n),t.child;case 6:return e===null&&J&&((e=n=Ei)&&(n=rf(n,t.pendingProps,Oi),n===null?e=!1:(t.stateNode=n,Ti=t,Ei=null,e=!0)),e||Ai(t)),null;case 13:return hc(e,t,n);case 4:return fe(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Aa(t,null,r,n):Zs(e,t,r,n),t.child;case 11:return Qs(e,t,t.type,t.pendingProps,n);case 7:return Zs(e,t,t.pendingProps,n),t.child;case 8:return Zs(e,t,t.pendingProps.children,n),t.child;case 12:return Zs(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Bi(t,t.type,r.value),Zs(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,Ki(t),a=qi(a),r=r(a),t.flags|=1,Zs(e,t,r,n),t.child;case 14:return $s(e,t,t.type,t.pendingProps,n);case 15:return ec(e,t,t.type,t.pendingProps,n);case 19:return xc(e,t,n);case 31:return oc(e,t,n);case 22:return tc(e,t,n,t.pendingProps);case 24:return Ki(t),r=qi($i),e===null?(a=da(),a===null&&(a=Fl,o=ea(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},Na(t),Bi(t,$i,a)):((e.lanes&n)!==0&&(Pa(e,t),Va(t,null,null,n),Ba()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,Bi(t,$i,r),r!==a.cache&&Ui(t,[$i],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),Bi(t,$i,r))),Zs(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(c(156,t.tag))}function Ec(e){e.flags|=4}function Dc(e,t,n,r,a){if((t=(e.mode&32)!=0)&&(t=!1),t){if(e.flags|=16777216,(a&335544128)===a)if(e.stateNode.complete)e.flags|=8192;else if(Cu())e.flags|=8192;else throw xa=_a,ha}else e.flags&=-16777217}function Oc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Gf(t))if(Cu())e.flags|=8192;else throw xa=_a,ha}function kc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:qe(),e.lanes|=t,Jl|=t)}function Ac(e,t){if(!J)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function jc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var a=e.child;a!==null;)n|=a.lanes|a.childLanes,r|=a.subtreeFlags&65011712,r|=a.flags&65011712,a.return=e,a=a.sibling;else for(a=e.child;a!==null;)n|=a.lanes|a.childLanes,r|=a.subtreeFlags,r|=a.flags,a.return=e,a=a.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Mc(e,t,n){var r=t.pendingProps;switch(Ci(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return jc(t),null;case 1:return jc(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Vi($i),pe(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Ni(t)?Ec(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Fi())),jc(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(Ec(t),o===null?(jc(t),Dc(t,a,null,r,n)):(jc(t),Oc(t,o))):o?o===e.memoizedState?(jc(t),t.flags&=-16777217):(Ec(t),jc(t),Oc(t,o)):(e=e.memoizedProps,e!==r&&Ec(t),jc(t),Dc(t,a,e,r,n)),null;case 27:if(he(t),n=ue.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Ec(t);else{if(!r){if(t.stateNode===null)throw Error(c(166));return jc(t),null}e=ce.current,Ni(t)?ji(t,e):(e=pf(a,r,n),t.stateNode=e,Ec(t))}return jc(t),null;case 5:if(he(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Ec(t);else{if(!r){if(t.stateNode===null)throw Error(c(166));return jc(t),null}if(o=ce.current,Ni(t))ji(t,o);else{var s=Vd(ue.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[at]=t,o[ot]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Fd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Ec(t)}}return jc(t),Dc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Ec(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(c(166));if(e=ue.current,Ni(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Ti,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[at]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||Ai(t,!0)}else e=Vd(e).createTextNode(r),e[at]=t,t.stateNode=e}return jc(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Ni(t),n!==null){if(e===null){if(!r)throw Error(c(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(c(557));e[at]=t}else Pi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;jc(t),e=!1}else n=Fi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?($a(t),t):($a(t),null);if(t.flags&128)throw Error(c(558))}return jc(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Ni(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(c(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(c(317));a[at]=t}else Pi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;jc(t),a=!1}else a=Fi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?($a(t),t):($a(t),null)}return $a(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),kc(t,t.updateQueue),jc(t),null);case 4:return pe(),e===null&&Sd(t.stateNode.containerInfo),jc(t),null;case 10:return Vi(t.type),jc(t),null;case 19:if(se(eo),r=t.memoizedState,r===null)return jc(t),null;if(a=(t.flags&128)!=0,o=r.rendering,o===null)if(a)Ac(r,!1);else{if(Ul!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=to(e),o!==null){for(t.flags|=128,Ac(r,!1),e=o.updateQueue,t.updateQueue=e,kc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)ri(n,e),n=n.sibling;return I(eo,eo.current&1|2),J&&bi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Oe()>eu&&(t.flags|=128,a=!0,Ac(r,!1),t.lanes=4194304)}else{if(!a)if(e=to(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,kc(t,e),Ac(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!J)return jc(t),null}else 2*Oe()-r.renderingStartTime>eu&&n!==536870912&&(t.flags|=128,a=!0,Ac(r,!1),t.lanes=4194304);r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(jc(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Oe(),e.sibling=null,n=eo.current,I(eo,a?n&1|2:n&1),J&&bi(t,r.treeForkCount),e);case 22:case 23:return $a(t),Ka(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(jc(t),t.subtreeFlags&6&&(t.flags|=8192)):jc(t),n=t.updateQueue,n!==null&&kc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&se(ua),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Vi($i),jc(t),null;case 25:return null;case 30:return null}throw Error(c(156,t.tag))}function Nc(e,t){switch(Ci(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Vi($i),pe(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return he(t),null;case 31:if(t.memoizedState!==null){if($a(t),t.alternate===null)throw Error(c(340));Pi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if($a(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(c(340));Pi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return se(eo),null;case 4:return pe(),null;case 10:return Vi(t.type),null;case 22:case 23:return $a(t),Ka(),e!==null&&se(ua),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Vi($i),null;case 25:return null;default:return null}}function Pc(e,t){switch(Ci(t),t.tag){case 3:Vi($i),pe();break;case 26:case 27:case 5:he(t);break;case 4:pe();break;case 31:t.memoizedState!==null&&$a(t);break;case 13:$a(t);break;case 19:se(eo);break;case 10:Vi(t.type);break;case 22:case 23:$a(t),Ka(),e!==null&&se(ua);break;case 24:Vi($i)}}function Fc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var a=r.next;n=a;do{if((n.tag&e)===e){r=void 0;var o=n.create,s=n.inst;r=o(),s.destroy=r}n=n.next}while(n!==a)}}catch(e){Wu(t,t.return,e)}}function Ic(e,t,n){try{var r=t.updateQueue,a=r===null?null:r.lastEffect;if(a!==null){var o=a.next;r=o;do{if((r.tag&e)===e){var s=r.inst,c=s.destroy;if(c!==void 0){s.destroy=void 0,a=t;var l=n,u=c;try{u()}catch(e){Wu(a,l,e)}}}r=r.next}while(r!==o)}}catch(e){Wu(t,t.return,e)}}function Lc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Ua(t,n)}catch(t){Wu(e,e.return,t)}}}function Rc(e,t,n){n.props=zs(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Wu(e,t,n)}}function zc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Wu(e,t,n)}}function Bc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null)if(typeof r==`function`)try{r()}catch(n){Wu(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Wu(e,t,n)}else n.current=null}function Vc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Wu(e,e.return,t)}}function Hc(e,t,n){try{var r=e.stateNode;Id(r,e.type,n,t),r[ot]=t}catch(t){Wu(e,e.return,t)}}function Uc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Qd(e.type)||e.tag===4}function Wc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Uc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Qd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Gc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=K));else if(r!==4&&(r===27&&Qd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Gc(e,t,n),e=e.sibling;e!==null;)Gc(e,t,n),e=e.sibling}function Kc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Qd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Kc(e,t,n),e=e.sibling;e!==null;)Kc(e,t,n),e=e.sibling}function qc(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,a=t.attributes;a.length;)t.removeAttributeNode(a[0]);Fd(t,r,n),t[at]=e,t[ot]=n}catch(t){Wu(e,e.return,t)}}var Jc=!1,Yc=!1,Xc=!1,Zc=typeof WeakSet==`function`?WeakSet:Set,Qc=null;function $c(e,t){if(e=e.containerInfo,zd=cp,e=yr(e),br(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,l=-1,u=-1,d=0,f=0,p=e,m=null;b:for(;;){for(var h;p!==n||a!==0&&p.nodeType!==3||(l=s+a),p!==o||r!==0&&p.nodeType!==3||(u=s+r),p.nodeType===3&&(s+=p.nodeValue.length),(h=p.firstChild)!==null;)m=p,p=h;for(;;){if(p===e)break b;if(m===n&&++d===a&&(l=s),m===o&&++f===r&&(u=s),(h=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=h}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n||={start:0,end:0}}else n=null;for(Bd={focusedElem:e,selectionRange:n},cp=!1,Qc=t;Qc!==null;)if(t=Qc,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,Qc=e;else for(;Qc!==null;){switch(t=Qc,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var g=zs(n.type,a);e=r.getSnapshotBeforeUpdate(g,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Wu(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)tf(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:tf(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(c(163))}if(e=t.sibling,e!==null){e.return=t.return,Qc=e;break}Qc=t.return}}function el(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:hl(e,n),r&4&&Fc(5,n);break;case 1:if(hl(e,n),r&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Wu(n,n.return,e)}else{var a=zs(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(a,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Wu(n,n.return,e)}}r&64&&Lc(n),r&512&&zc(n,n.return);break;case 3:if(hl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Ua(e,t)}catch(e){Wu(n,n.return,e)}}break;case 27:t===null&&r&4&&qc(n);case 26:case 5:hl(e,n),t===null&&r&4&&Vc(n),r&512&&zc(n,n.return);break;case 12:hl(e,n);break;case 31:hl(e,n),r&4&&ol(e,n);break;case 13:hl(e,n),r&4&&sl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),cf(e,n))));break;case 22:if(r=n.memoizedState!==null||Jc,!r){t=t!==null&&t.memoizedState!==null||Yc,a=Jc;var o=Yc;Jc=r,(Yc=t)&&!o?_l(e,n,(n.subtreeFlags&8772)!=0):hl(e,n),Jc=a,Yc=o}break;case 30:break;default:hl(e,n)}}function tl(e){var t=e.alternate;t!==null&&(e.alternate=null,tl(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&pt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var nl=null,rl=!1;function il(e,t,n){for(n=n.child;n!==null;)al(e,t,n),n=n.sibling}function al(e,t,n){if(Pe&&typeof Pe.onCommitFiberUnmount==`function`)try{Pe.onCommitFiberUnmount(B,n)}catch{}switch(n.tag){case 26:Yc||Bc(n,t),il(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Yc||Bc(n,t);var r=nl,a=rl;Qd(n.type)&&(nl=n.stateNode,rl=!1),il(e,t,n),mf(n.stateNode),nl=r,rl=a;break;case 5:Yc||Bc(n,t);case 6:if(r=nl,a=rl,nl=null,il(e,t,n),nl=r,rl=a,nl!==null)if(rl)try{(nl.nodeType===9?nl.body:nl.nodeName===`HTML`?nl.ownerDocument.body:nl).removeChild(n.stateNode)}catch(e){Wu(n,t,e)}else try{nl.removeChild(n.stateNode)}catch(e){Wu(n,t,e)}break;case 18:nl!==null&&(rl?(e=nl,$d(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Pp(e)):$d(nl,n.stateNode));break;case 4:r=nl,a=rl,nl=n.stateNode.containerInfo,rl=!0,il(e,t,n),nl=r,rl=a;break;case 0:case 11:case 14:case 15:Ic(2,n,t),Yc||Ic(4,n,t),il(e,t,n);break;case 1:Yc||(Bc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Rc(n,t,r)),il(e,t,n);break;case 21:il(e,t,n);break;case 22:Yc=(r=Yc)||n.memoizedState!==null,il(e,t,n),Yc=r;break;default:il(e,t,n)}}function ol(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Pp(e)}catch(e){Wu(t,t.return,e)}}}function sl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Pp(e)}catch(e){Wu(t,t.return,e)}}function cl(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Zc),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Zc),t;default:throw Error(c(435,e.tag))}}function ll(e,t){var n=cl(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function ul(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,l=s;a:for(;l!==null;){switch(l.tag){case 27:if(Qd(l.type)){nl=l.stateNode,rl=!1;break a}break;case 5:nl=l.stateNode,rl=!1;break a;case 3:case 4:nl=l.stateNode.containerInfo,rl=!0;break a}l=l.return}if(nl===null)throw Error(c(160));al(o,s,a),nl=null,rl=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)fl(t,e),t=t.sibling}var dl=null;function fl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:ul(t,e),pl(e),r&4&&(Ic(3,e,e.return),Fc(3,e),Ic(5,e,e.return));break;case 1:ul(t,e),pl(e),r&512&&(Yc||n===null||Bc(n,n.return)),r&64&&Jc&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=dl;if(ul(t,e),pl(e),r&512&&(Yc||n===null||Bc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null)if(r===null)if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[ft]||o[at]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Fd(o,r,n),o[at]=e,vt(o),r=o;break a;case`link`:var s=Hf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var l=0;l<s.length;l++)if(o=s[l],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(l,1);break b}}o=a.createElement(r),Fd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Hf(`meta`,`content`,a).get(r+(n.content||``))){for(l=0;l<s.length;l++)if(o=s[l],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(l,1);break b}}o=a.createElement(r),Fd(o,r,n),a.head.appendChild(o);break;default:throw Error(c(468,r))}o[at]=e,vt(o),r=o}e.stateNode=r}else Uf(a,e.type,e.stateNode);else e.stateNode=Lf(a,r,e.memoizedProps);else o===r?r===null&&e.stateNode!==null&&Hc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Uf(a,e.type,e.stateNode):Lf(a,r,e.memoizedProps))}break;case 27:ul(t,e),pl(e),r&512&&(Yc||n===null||Bc(n,n.return)),n!==null&&r&4&&Hc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(ul(t,e),pl(e),r&512&&(Yc||n===null||Bc(n,n.return)),e.flags&32){a=e.stateNode;try{W(a,``)}catch(t){Wu(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Hc(e,a,n===null?a:n.memoizedProps)),r&1024&&(Xc=!0);break;case 6:if(ul(t,e),pl(e),r&4){if(e.stateNode===null)throw Error(c(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Wu(e,e.return,t)}}break;case 3:if(Vf=null,a=dl,dl=_f(t.containerInfo),ul(t,e),dl=a,pl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Pp(t.containerInfo)}catch(t){Wu(e,e.return,t)}Xc&&(Xc=!1,ml(e));break;case 4:r=dl,dl=_f(e.stateNode.containerInfo),ul(t,e),pl(e),dl=r;break;case 12:ul(t,e),pl(e);break;case 31:ul(t,e),pl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ll(e,r)));break;case 13:ul(t,e),pl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Ql=Oe()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ll(e,r)));break;case 22:a=e.memoizedState!==null;var u=n!==null&&n.memoizedState!==null,d=Jc,f=Yc;if(Jc=d||a,Yc=f||u,ul(t,e),Yc=f,Jc=d,pl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||u||Jc||Yc||gl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){u=n=t;try{if(o=u.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{l=u.stateNode;var p=u.memoizedProps.style,m=p!=null&&p.hasOwnProperty(`display`)?p.display:null;l.style.display=m==null||typeof m==`boolean`?``:(``+m).trim()}}catch(e){Wu(u,u.return,e)}}}else if(t.tag===6){if(n===null){u=t;try{u.stateNode.nodeValue=a?``:u.memoizedProps}catch(e){Wu(u,u.return,e)}}}else if(t.tag===18){if(n===null){u=t;try{var h=u.stateNode;a?ef(h,!0):ef(u.stateNode,!1)}catch(e){Wu(u,u.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,ll(e,n))));break;case 19:ul(t,e),pl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ll(e,r)));break;case 30:break;case 21:break;default:ul(t,e),pl(e)}}function pl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Uc(r)){n=r;break}r=r.return}if(n==null)throw Error(c(160));switch(n.tag){case 27:var a=n.stateNode;Kc(e,Wc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(W(o,``),n.flags&=-33),Kc(e,Wc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Gc(e,Wc(e),s);break;default:throw Error(c(161))}}catch(t){Wu(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function ml(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;ml(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function hl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)el(e,t.alternate,t),t=t.sibling}function gl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Ic(4,t,t.return),gl(t);break;case 1:Bc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Rc(t,t.return,n),gl(t);break;case 27:mf(t.stateNode);case 26:case 5:Bc(t,t.return),gl(t);break;case 22:t.memoizedState===null&&gl(t);break;case 30:gl(t);break;default:gl(t)}e=e.sibling}}function _l(e,t,n){for(n&&=(t.subtreeFlags&8772)!=0,t=t.child;t!==null;){var r=t.alternate,a=e,o=t,s=o.flags;switch(o.tag){case 0:case 11:case 15:_l(a,o,n),Fc(4,o);break;case 1:if(_l(a,o,n),r=o,a=r.stateNode,typeof a.componentDidMount==`function`)try{a.componentDidMount()}catch(e){Wu(r,r.return,e)}if(r=o,a=r.updateQueue,a!==null){var c=r.stateNode;try{var l=a.shared.hiddenCallbacks;if(l!==null)for(a.shared.hiddenCallbacks=null,a=0;a<l.length;a++)Ha(l[a],c)}catch(e){Wu(r,r.return,e)}}n&&s&64&&Lc(o),zc(o,o.return);break;case 27:qc(o);case 26:case 5:_l(a,o,n),n&&r===null&&s&4&&Vc(o),zc(o,o.return);break;case 12:_l(a,o,n);break;case 31:_l(a,o,n),n&&s&4&&ol(a,o);break;case 13:_l(a,o,n),n&&s&4&&sl(a,o);break;case 22:o.memoizedState===null&&_l(a,o,n),zc(o,o.return);break;case 30:break;default:_l(a,o,n)}t=t.sibling}}function vl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&ta(n))}function yl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ta(e))}function bl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)xl(e,t,n,r),t=t.sibling}function xl(e,t,n,r){var a=t.flags;switch(t.tag){case 0:case 11:case 15:bl(e,t,n,r),a&2048&&Fc(9,t);break;case 1:bl(e,t,n,r);break;case 3:bl(e,t,n,r),a&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ta(e)));break;case 12:if(a&2048){bl(e,t,n,r),e=t.stateNode;try{var o=t.memoizedProps,s=o.id,c=o.onPostCommit;typeof c==`function`&&c(s,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Wu(t,t.return,e)}}else bl(e,t,n,r);break;case 31:bl(e,t,n,r);break;case 13:bl(e,t,n,r);break;case 23:break;case 22:o=t.stateNode,s=t.alternate,t.memoizedState===null?o._visibility&2?bl(e,t,n,r):(o._visibility|=2,Sl(e,t,n,r,(t.subtreeFlags&10256)!=0||!1)):o._visibility&2?bl(e,t,n,r):Cl(e,t),a&2048&&vl(s,t);break;case 24:bl(e,t,n,r),a&2048&&yl(t.alternate,t);break;default:bl(e,t,n,r)}}function Sl(e,t,n,r,a){for(a&&=(t.subtreeFlags&10256)!=0||!1,t=t.child;t!==null;){var o=e,s=t,c=n,l=r,u=s.flags;switch(s.tag){case 0:case 11:case 15:Sl(o,s,c,l,a),Fc(8,s);break;case 23:break;case 22:var d=s.stateNode;s.memoizedState===null?(d._visibility|=2,Sl(o,s,c,l,a)):d._visibility&2?Sl(o,s,c,l,a):Cl(o,s),a&&u&2048&&vl(s.alternate,s);break;case 24:Sl(o,s,c,l,a),a&&u&2048&&yl(s.alternate,s);break;default:Sl(o,s,c,l,a)}t=t.sibling}}function Cl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,a=r.flags;switch(r.tag){case 22:Cl(n,r),a&2048&&vl(r.alternate,r);break;case 24:Cl(n,r),a&2048&&yl(r.alternate,r);break;default:Cl(n,r)}t=t.sibling}}var wl=8192;function Tl(e,t,n){if(e.subtreeFlags&wl)for(e=e.child;e!==null;)El(e,t,n),e=e.sibling}function El(e,t,n){switch(e.tag){case 26:Tl(e,t,n),e.flags&wl&&e.memoizedState!==null&&Kf(n,dl,e.memoizedState,e.memoizedProps);break;case 5:Tl(e,t,n);break;case 3:case 4:var r=dl;dl=_f(e.stateNode.containerInfo),Tl(e,t,n),dl=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=wl,wl=16777216,Tl(e,t,n),wl=r):Tl(e,t,n));break;default:Tl(e,t,n)}}function Dl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Ol(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];Qc=r,jl(r,e)}Dl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)kl(e),e=e.sibling}function kl(e){switch(e.tag){case 0:case 11:case 15:Ol(e),e.flags&2048&&Ic(9,e,e.return);break;case 3:Ol(e);break;case 12:Ol(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Al(e)):Ol(e);break;default:Ol(e)}}function Al(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];Qc=r,jl(r,e)}Dl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Ic(8,t,t.return),Al(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Al(t));break;default:Al(t)}e=e.sibling}}function jl(e,t){for(;Qc!==null;){var n=Qc;switch(n.tag){case 0:case 11:case 15:Ic(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:ta(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,Qc=r;else a:for(n=e;Qc!==null;){r=Qc;var a=r.sibling,o=r.return;if(tl(r),r===n){Qc=null;break a}if(a!==null){a.return=o,Qc=a;break a}Qc=o}}}var Ml={getCacheForType:function(e){var t=qi($i),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return qi($i).controller.signal}},Nl=typeof WeakMap==`function`?WeakMap:Map,Pl=0,Fl=null,Q=null,Il=0,Ll=0,Rl=null,zl=!1,Bl=!1,Vl=!1,Hl=0,Ul=0,Wl=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=null,Xl=null,Zl=!1,Ql=0,$l=0,eu=1/0,tu=null,nu=null,ru=0,iu=null,au=null,ou=0,su=0,cu=null,lu=null,uu=0,du=null;function fu(){return Pl&2&&Il!==0?Il&-Il:P.T===null?nt():dd()}function pu(){if(ql===0)if(!(Il&536870912)||J){var e=Ve;Ve<<=1,!(Ve&3932160)&&(Ve=262144),ql=e}else ql=536870912;return e=qa.current,e!==null&&(e.flags|=32),ql}function mu(e,t,n){(e===Fl&&(Ll===2||Ll===9)||e.cancelPendingCommit!==null)&&(xu(e,0),vu(e,Il,ql,!1)),Ye(e,n),(!(Pl&2)||e!==Fl)&&(e===Fl&&(!(Pl&2)&&(Gl|=n),Ul===4&&vu(e,Il,ql,!1)),rd(e))}function hu(e,t,n){if(Pl&6)throw Error(c(327));var r=!n&&(t&127)==0&&(t&e.expiredLanes)===0||Ge(e,t),a=r?ku(e,t):Du(e,t,!0),o=r;do{if(a===0){Bl&&!r&&vu(e,t,0,!1);break}else{if(n=e.current.alternate,o&&!_u(n)){a=Du(e,t,!1),o=!1;continue}if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var l=e;a=Yl;var u=l.current.memoizedState.isDehydrated;if(u&&(xu(l,s).flags|=256),s=Du(l,s,!1),s!==2){if(Vl&&!u){l.errorRecoveryDisabledLanes|=o,Gl|=o,a=4;break a}o=Xl,Xl=a,o!==null&&(Xl===null?Xl=o:Xl.push.apply(Xl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){xu(e,0),vu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(c(345));case 4:if((t&4194048)!==t)break;case 6:vu(r,t,ql,!zl);break a;case 2:Xl=null;break;case 3:case 5:break;default:throw Error(c(329))}if((t&62914560)===t&&(a=Ql+300-Oe(),10<a)){if(vu(r,t,ql,!zl),We(r,0,!0)!==0)break a;ou=t,r.timeoutHandle=qd(gu.bind(null,r,n,Xl,tu,Zl,t,ql,Gl,Jl,zl,o,`Throttled`,-0,0),a);break a}gu(r,n,Xl,tu,Zl,t,ql,Gl,Jl,zl,o,null,-0,0)}}break}while(1);rd(e)}function gu(e,t,n,r,a,o,s,c,l,u,d,f,p,m){if(e.timeoutHandle=-1,f=t.subtreeFlags,f&8192||(f&16785408)==16785408){f={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:K},El(t,o,f);var h=(o&62914560)===o?Ql-Oe():(o&4194048)===o?$l-Oe():0;if(h=Jf(f,h),h!==null){ou=o,e.cancelPendingCommit=h(Iu.bind(null,e,t,o,n,r,a,s,c,l,d,f,null,p,m)),vu(e,o,s,!u);return}}Iu(e,t,o,n,r,a,s,c,l)}function _u(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var a=n[r],o=a.getSnapshot;a=a.value;try{if(!mr(o(),a))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function vu(e,t,n,r){t&=~Kl,t&=~Gl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var a=t;0<a;){var o=31-Ie(a),s=1<<o;r[o]=-1,a&=~s}n!==0&&Ze(e,n,t)}function yu(){return Pl&6?!0:(id(0,!1),!1)}function bu(){if(Q!==null){if(Ll===0)var e=Q.return;else e=Q,zi=Ri=null,xo(e),wa=null,Ta=0,e=Q;for(;e!==null;)Pc(e.alternate,e),e=e.return;Q=null}}function xu(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,Jd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),ou=0,bu(),Fl=e,Q=n=ni(e.current,null),Il=t,Ll=0,Rl=null,zl=!1,Bl=Ge(e,t),Vl=!1,Jl=ql=Kl=Gl=Wl=Ul=0,Xl=Yl=null,Zl=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var a=31-Ie(r),o=1<<a;t|=e[a],r&=~o}return Hl=t,Kr(),n}function Su(e,t){Z=null,P.H=js,t===ma||t===ga?(t=Sa(),Ll=3):t===ha?(t=Sa(),Ll=4):Ll=t===Ys?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Rl=t,Q===null&&(Ul=1,Us(e,ui(t,e.current)))}function Cu(){var e=qa.current;return e===null?!0:(Il&4194048)===Il?Ja===null:(Il&62914560)===Il||Il&536870912?e===Ja:!1}function wu(){var e=P.H;return P.H=js,e===null?js:e}function Tu(){var e=P.A;return P.A=Ml,e}function Eu(){Ul=4,zl||(Il&4194048)!==Il&&qa.current!==null||(Bl=!0),!(Wl&134217727)&&!(Gl&134217727)||Fl===null||vu(Fl,Il,ql,!1)}function Du(e,t,n){var r=Pl;Pl|=2;var a=wu(),o=Tu();(Fl!==e||Il!==t)&&(tu=null,xu(e,t)),t=!1;var s=Ul;a:do try{if(Ll!==0&&Q!==null){var c=Q,l=Rl;switch(Ll){case 8:bu(),s=6;break a;case 3:case 2:case 9:case 6:qa.current===null&&(t=!0);var u=Ll;if(Ll=0,Rl=null,Nu(e,c,l,u),n&&Bl){s=0;break a}break;default:u=Ll,Ll=0,Rl=null,Nu(e,c,l,u)}}Ou(),s=Ul;break}catch(t){Su(e,t)}while(1);return t&&e.shellSuspendCounter++,zi=Ri=null,Pl=r,P.H=a,P.A=o,Q===null&&(Fl=null,Il=0,Kr()),s}function Ou(){for(;Q!==null;)ju(Q)}function ku(e,t){var n=Pl;Pl|=2;var r=wu(),a=Tu();Fl!==e||Il!==t?(tu=null,eu=Oe()+500,xu(e,t)):Bl=Ge(e,t);a:do try{if(Ll!==0&&Q!==null){t=Q;var o=Rl;b:switch(Ll){case 1:Ll=0,Rl=null,Nu(e,t,o,1);break;case 2:case 9:if(va(o)){Ll=0,Rl=null,Mu(t);break}t=function(){Ll!==2&&Ll!==9||Fl!==e||(Ll=7),rd(e)},o.then(t,t);break a;case 3:Ll=7;break a;case 4:Ll=5;break a;case 7:va(o)?(Ll=0,Rl=null,Mu(t)):(Ll=0,Rl=null,Nu(e,t,o,7));break;case 5:var s=null;switch(Q.tag){case 26:s=Q.memoizedState;case 5:case 27:var l=Q;if(s?Gf(s):l.stateNode.complete){Ll=0,Rl=null;var u=l.sibling;if(u!==null)Q=u;else{var d=l.return;d===null?Q=null:(Q=d,Pu(d))}break b}}Ll=0,Rl=null,Nu(e,t,o,5);break;case 6:Ll=0,Rl=null,Nu(e,t,o,6);break;case 8:bu(),Ul=6;break a;default:throw Error(c(462))}}Au();break}catch(t){Su(e,t)}while(1);return zi=Ri=null,P.H=r,P.A=a,Pl=n,Q===null?(Fl=null,Il=0,Kr(),Ul):0}function Au(){for(;Q!==null&&!Ee();)ju(Q)}function ju(e){var t=Tc(e.alternate,e,Hl);e.memoizedProps=e.pendingProps,t===null?Pu(e):Q=t}function Mu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=lc(n,t,t.pendingProps,t.type,void 0,Il);break;case 11:t=lc(n,t,t.pendingProps,t.type.render,t.ref,Il);break;case 5:xo(t);default:Pc(n,t),t=Q=ri(t,Hl),t=Tc(n,t,Hl)}e.memoizedProps=e.pendingProps,t===null?Pu(e):Q=t}function Nu(e,t,n,r){zi=Ri=null,xo(t),wa=null,Ta=0;var a=t.return;try{if(Js(e,a,t,n,Il)){Ul=1,Us(e,ui(n,e.current)),Q=null;return}}catch(t){if(a!==null)throw Q=a,t;Ul=1,Us(e,ui(n,e.current)),Q=null;return}t.flags&32768?(J||r===1?e=!0:Bl||Il&536870912?e=!1:(zl=e=!0,(r===2||r===9||r===3||r===6)&&(r=qa.current,r!==null&&r.tag===13&&(r.flags|=16384))),Fu(t,e)):Pu(t)}function Pu(e){var t=e;do{if(t.flags&32768){Fu(t,zl);return}e=t.return;var n=Mc(t.alternate,t,Hl);if(n!==null){Q=n;return}if(t=t.sibling,t!==null){Q=t;return}Q=t=e}while(t!==null);Ul===0&&(Ul=5)}function Fu(e,t){do{var n=Nc(e.alternate,e);if(n!==null){n.flags&=32767,Q=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Q=e;return}Q=e=n}while(e!==null);Ul=6,Q=null}function Iu(e,t,n,r,a,o,s,l,u){e.cancelPendingCommit=null;do Vu();while(ru!==0);if(Pl&6)throw Error(c(327));if(t!==null){if(t===e.current)throw Error(c(177));if(o=t.lanes|t.childLanes,o|=Gr,Xe(e,n,o,s,l,u),e===Fl&&(Q=Fl=null,Il=0),au=t,iu=e,ou=n,su=o,cu=a,lu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(je,function(){return Hu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=(t.flags&13878)!=0,t.subtreeFlags&13878||r){r=P.T,P.T=null,a=F.p,F.p=2,s=Pl,Pl|=4;try{$c(e,t,n)}finally{Pl=s,F.p=a,P.T=r}}ru=1,Lu(),Ru(),zu()}}function Lu(){if(ru===1){ru=0;var e=iu,t=au,n=(t.flags&13878)!=0;if(t.subtreeFlags&13878||n){n=P.T,P.T=null;var r=F.p;F.p=2;var a=Pl;Pl|=4;try{fl(t,e);var o=Bd,s=yr(e.containerInfo),c=o.focusedElem,l=o.selectionRange;if(s!==c&&c&&c.ownerDocument&&vr(c.ownerDocument.documentElement,c)){if(l!==null&&br(c)){var u=l.start,d=l.end;if(d===void 0&&(d=u),`selectionStart`in c)c.selectionStart=u,c.selectionEnd=Math.min(d,c.value.length);else{var f=c.ownerDocument||document,p=f&&f.defaultView||window;if(p.getSelection){var m=p.getSelection(),h=c.textContent.length,g=Math.min(l.start,h),_=l.end===void 0?g:Math.min(l.end,h);!m.extend&&g>_&&(s=_,_=g,g=s);var v=_r(c,g),y=_r(c,_);if(v&&y&&(m.rangeCount!==1||m.anchorNode!==v.node||m.anchorOffset!==v.offset||m.focusNode!==y.node||m.focusOffset!==y.offset)){var b=f.createRange();b.setStart(v.node,v.offset),m.removeAllRanges(),g>_?(m.addRange(b),m.extend(y.node,y.offset)):(b.setEnd(y.node,y.offset),m.addRange(b))}}}}for(f=[],m=c;m=m.parentNode;)m.nodeType===1&&f.push({element:m,left:m.scrollLeft,top:m.scrollTop});for(typeof c.focus==`function`&&c.focus(),c=0;c<f.length;c++){var x=f[c];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}cp=!!zd,Bd=zd=null}finally{Pl=a,F.p=r,P.T=n}}e.current=t,ru=2}}function Ru(){if(ru===2){ru=0;var e=iu,t=au,n=(t.flags&8772)!=0;if(t.subtreeFlags&8772||n){n=P.T,P.T=null;var r=F.p;F.p=2;var a=Pl;Pl|=4;try{el(e,t.alternate,t)}finally{Pl=a,F.p=r,P.T=n}}ru=3}}function zu(){if(ru===4||ru===3){ru=0,De();var e=iu,t=au,n=ou,r=lu;t.subtreeFlags&10256||t.flags&10256?ru=5:(ru=0,au=iu=null,Bu(e,e.pendingLanes));var a=e.pendingLanes;if(a===0&&(nu=null),tt(n),t=t.stateNode,Pe&&typeof Pe.onCommitFiberRoot==`function`)try{Pe.onCommitFiberRoot(B,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=P.T,a=F.p,F.p=2,P.T=null;try{for(var o=e.onRecoverableError,s=0;s<r.length;s++){var c=r[s];o(c.value,{componentStack:c.stack})}}finally{P.T=t,F.p=a}}ou&3&&Vu(),rd(e),a=e.pendingLanes,n&261930&&a&42?e===du?uu++:(uu=0,du=e):uu=0,id(0,!1)}}function Bu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ta(t)))}function Vu(){return Lu(),Ru(),zu(),Hu()}function Hu(){if(ru!==5)return!1;var e=iu,t=su;su=0;var n=tt(ou),r=P.T,a=F.p;try{F.p=32>n?32:n,P.T=null,n=cu,cu=null;var o=iu,s=ou;if(ru=0,au=iu=null,ou=0,Pl&6)throw Error(c(331));var l=Pl;if(Pl|=4,kl(o.current),xl(o,o.current,s,n),Pl=l,id(0,!1),Pe&&typeof Pe.onPostCommitFiberRoot==`function`)try{Pe.onPostCommitFiberRoot(B,o)}catch{}return!0}finally{F.p=a,P.T=r,Bu(e,t)}}function Uu(e,t,n){t=ui(n,t),t=Gs(e.stateNode,t,2),e=Ia(e,t,2),e!==null&&(Ye(e,2),rd(e))}function Wu(e,t,n){if(e.tag===3)Uu(e,e,n);else for(;t!==null;){if(t.tag===3){Uu(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(nu===null||!nu.has(r))){e=ui(n,e),n=Ks(2),r=Ia(t,n,2),r!==null&&(qs(n,r,t,e),Ye(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Nl;var a=new Set;r.set(t,a)}else a=r.get(t),a===void 0&&(a=new Set,r.set(t,a));a.has(n)||(Vl=!0,a.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Fl===e&&(Il&n)===n&&(Ul===4||Ul===3&&(Il&62914560)===Il&&300>Oe()-Ql?!(Pl&2)&&xu(e,0):Kl|=n,Jl===Il&&(Jl=0)),rd(e)}function qu(e,t){t===0&&(t=qe()),e=Yr(e,t),e!==null&&(Ye(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(c(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return we(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t)if(e!==0){var a=r.pendingLanes;if(a===0)var o=0;else{var s=r.suspendedLanes,c=r.pingedLanes;o=(1<<31-Ie(42|e)+1)-1,o&=a&~(s&~c),o=o&201326741?o&201326741|1:o?o|2:0}o!==0&&(n=!0,ld(r,o))}else o=Il,o=We(r,r===Fl?o:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(o&3)||Ge(r,o)||(n=!0,ld(r,o));r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Kd()&&(e=nd);for(var t=Oe(),n=null,r=Zu;r!==null;){var a=r.next,o=sd(r,t);o===0?(r.next=null,n===null?Zu=a:n.next=a,a===null&&(Qu=n)):(n=r,(e!==0||o&3)&&(ed=!0)),r=a}ru!==0&&ru!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,a=e.expirationTimes,o=e.pendingLanes&-62914561;0<o;){var s=31-Ie(o),c=1<<s,l=a[s];l===-1?((c&n)===0||(c&r)!==0)&&(a[s]=Ke(c,t)):l<=t&&(e.expiredLanes|=c),o&=~c}if(t=Fl,n=Il,n=We(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Ll===2||Ll===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Te(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||Ge(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Te(r),tt(n)){case 2:case 8:n=Ae;break;case 32:n=je;break;case 268435456:n=R;break;default:n=je}return r=cd.bind(null,e),n=we(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Te(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(ru!==0&&ru!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Vu()&&e.callbackNode!==n)return null;var r=Il;return r=We(e,e===Fl?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(hu(e,r,t),sd(e,Oe()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Vu())return null;hu(e,t,!0)}function ud(){Xd(function(){Pl&6?we(L,ad):od()})}function dd(){if(nd===0){var e=ia;e===0&&(e=Be,Be<<=1,!(Be&261888)&&(Be=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:Kt(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,a){if(t===`submit`&&n&&n.stateNode===a){var o=fd((a[ot]||null).action),s=r.submitter;s&&(t=(t=s[ot]||null)?fd(t.formAction):s.getAttribute(`formAction`),t!==null&&(o=t,s=null));var c=new mn(`action`,`action`,null,r,a);e.push({event:c,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=s?pd(a,s):new FormData(a);_s(n,{pending:!0,data:e,method:a.method,action:o},null,e)}}else typeof o==`function`&&(c.preventDefault(),e=s?pd(a,s):new FormData(a),_s(n,{pending:!0,data:e,method:a.method,action:o},o,e))},currentTarget:a}]})}}for(var hd=0;hd<Br.length;hd++){var gd=Br[hd];Vr(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}Vr(Mr,`onAnimationEnd`),Vr(Nr,`onAnimationIteration`),Vr(Pr,`onAnimationStart`),Vr(`dblclick`,`onDoubleClick`),Vr(`focusin`,`onFocus`),Vr(`focusout`,`onBlur`),Vr(Fr,`onTransitionRun`),Vr(Ir,`onTransitionStart`),Vr(Lr,`onTransitionCancel`),Vr(Rr,`onTransitionEnd`),St(`onMouseEnter`,[`mouseout`,`mouseover`]),St(`onMouseLeave`,[`mouseout`,`mouseover`]),St(`onPointerEnter`,[`pointerout`,`pointerover`]),St(`onPointerLeave`,[`pointerout`,`pointerover`]),xt(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),xt(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),xt(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),xt(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),xt(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),xt(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=(t&4)!=0;for(var n=0;n<e.length;n++){var r=e[n],a=r.event;r=r.listeners;a:{var o=void 0;if(t)for(var s=r.length-1;0<=s;s--){var c=r[s],l=c.instance,u=c.currentTarget;if(c=c.listener,l!==o&&a.isPropagationStopped())break a;o=c,a.currentTarget=u;try{o(a)}catch(e){Hr(e)}a.currentTarget=null,o=l}else for(s=0;s<r.length;s++){if(c=r[s],l=c.instance,u=c.currentTarget,c=c.listener,l!==o&&a.isPropagationStopped())break a;o=c,a.currentTarget=u;try{o(a)}catch(e){Hr(e)}a.currentTarget=null,o=l}}}}function $(e,t){var n=t[ct];n===void 0&&(n=t[ct]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,yt.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(hp(t)){case 2:var a=lp;break;case 8:a=up;break;default:a=dp}n=a.bind(null,t,n,e),a=void 0,!nn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(a=!0),r?a===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:a}):a===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:a})}function wd(e,t,n,r,a){var o=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===a)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===a)return;s=s.return}for(;c!==null;){if(s=mt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=o=s;continue a}c=c.parentNode}}r=r.return}$t(function(){var r=o,a=Jt(n),s=[];a:{var c=zr.get(e);if(c!==void 0){var l=mn,d=e;switch(e){case`keypress`:if(ln(n)===0)break a;case`keydown`:case`keyup`:l=Mn;break;case`focusin`:d=`focus`,l=Cn;break;case`focusout`:d=`blur`,l=Cn;break;case`beforeblur`:case`afterblur`:l=Cn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=xn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Sn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Pn;break;case Mr:case Nr:case Pr:l=wn;break;case Rr:l=Fn;break;case`scroll`:case`scrollend`:l=gn;break;case`wheel`:l=In;break;case`copy`:case`cut`:case`paste`:l=Tn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Nn;break;case`toggle`:case`beforetoggle`:l=Ln}var f=(t&4)!=0,p=!f&&(e===`scroll`||e===`scrollend`),m=f?c===null?null:c+`Capture`:c;f=[];for(var h=r,g;h!==null;){var _=h;if(g=_.stateNode,_=_.tag,_!==5&&_!==26&&_!==27||g===null||m===null||(_=en(h,m),_!=null&&f.push(Td(h,_,g))),p)break;h=h.return}0<f.length&&(c=new l(c,d,null,n,a),s.push({event:c,listeners:f}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==qt&&(d=n.relatedTarget||n.fromElement)&&(mt(d)||d[st]))break a;if((l||c)&&(c=a.window===a?a:(c=a.ownerDocument)?c.defaultView||c.parentWindow:window,l?(d=n.relatedTarget||n.toElement,l=r,d=d?mt(d):null,d!==null&&(p=u(d),f=d.tag,d!==p||f!==5&&f!==27&&f!==6)&&(d=null)):(l=null,d=r),l!==d)){if(f=xn,_=`onMouseLeave`,m=`onMouseEnter`,h=`mouse`,(e===`pointerout`||e===`pointerover`)&&(f=Nn,_=`onPointerLeave`,m=`onPointerEnter`,h=`pointer`),p=l==null?c:gt(l),g=d==null?c:gt(d),c=new f(_,h+`leave`,l,n,a),c.target=p,c.relatedTarget=g,_=null,mt(a)===r&&(f=new f(m,h+`enter`,d,n,a),f.target=g,f.relatedTarget=p,_=f),p=_,l&&d)b:{for(f=Dd,m=l,h=d,g=0,_=m;_;_=f(_))g++;_=0;for(var v=h;v;v=f(v))_++;for(;0<g-_;)m=f(m),g--;for(;0<_-g;)h=f(h),_--;for(;g--;){if(m===h||h!==null&&m===h.alternate){f=m;break b}m=f(m),h=f(h)}f=null}else f=null;l!==null&&Od(s,c,l,f,!1),d!==null&&p!==null&&Od(s,p,d,f,!0)}}a:{if(c=r?gt(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var y=nr;else if(Xn(c))if(rr)y=fr;else{y=ur;var b=lr}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&Ut(r.elementType)&&(y=nr):y=dr;if(y&&=y(e,r)){Zn(s,y,n,a);break a}b&&b(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Lt(c,`number`,c.value)}switch(b=r?gt(r):window,e){case`focusin`:(Xn(b)||b.contentEditable===`true`)&&(Sr=b,Cr=r,wr=null);break;case`focusout`:wr=Cr=Sr=null;break;case`mousedown`:Tr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Tr=!1,Er(s,n,a);break;case`selectionchange`:if(xr)break;case`keydown`:case`keyup`:Er(s,n,a)}var x;if(zn)b:{switch(e){case`compositionstart`:var S=`onCompositionStart`;break b;case`compositionend`:S=`onCompositionEnd`;break b;case`compositionupdate`:S=`onCompositionUpdate`;break b}S=void 0}else Kn?Wn(e,n)&&(S=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(S=`onCompositionStart`);S&&(Hn&&n.locale!==`ko`&&(Kn||S!==`onCompositionStart`?S===`onCompositionEnd`&&Kn&&(x=cn()):(an=a,on=`value`in an?an.value:an.textContent,Kn=!0)),b=Ed(r,S),0<b.length&&(S=new En(S,e,null,n,a),s.push({event:S,listeners:b}),x?S.data=x:(x=Gn(n),x!==null&&(S.data=x)))),(x=Vn?qn(e,n):Jn(e,n))&&(S=Ed(r,`onBeforeInput`),0<S.length&&(b=new En(`onBeforeInput`,`beforeinput`,null,n,a),s.push({event:b,listeners:S}),b.data=x)),md(s,e,r,n,a)}yd(s,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var a=e,o=a.stateNode;if(a=a.tag,a!==5&&a!==26&&a!==27||o===null||(a=en(e,n),a!=null&&r.unshift(Td(e,a,o)),a=en(e,t),a!=null&&r.push(Td(e,a,o))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,a){for(var o=t._reactName,s=[];n!==null&&n!==r;){var c=n,l=c.alternate,u=c.stateNode;if(c=c.tag,l!==null&&l===r)break;c!==5&&c!==26&&c!==27||u===null||(l=u,a?(u=en(n,o),u!=null&&s.unshift(Td(n,u,l))):a||(u=en(n,o),u!=null&&s.push(Td(n,u,l)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function Nd(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||W(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&W(e,``+r);break;case`className`:H(e,`class`,r);break;case`tabIndex`:H(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:H(e,n,r);break;case`style`:G(e,r,o);break;case`data`:if(t!==`object`){H(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Kt(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}else typeof o==`function`&&(n===`formAction`?(t!==`input`&&Nd(e,t,`name`,a.name,a,null),Nd(e,t,`formEncType`,a.formEncType,a,null),Nd(e,t,`formMethod`,a.formMethod,a,null),Nd(e,t,`formTarget`,a.formTarget,a,null)):(Nd(e,t,`encType`,a.encType,a,null),Nd(e,t,`method`,a.method,a,null),Nd(e,t,`target`,a.target,a,null)));if(r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Kt(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=K);break;case`onScroll`:r!=null&&$(`scroll`,e);break;case`onScrollEnd`:r!=null&&$(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(c(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(c(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=Kt(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:$(`beforetoggle`,e),$(`toggle`,e),V(e,`popover`,r);break;case`xlinkActuate`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:Dt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:Dt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:Dt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:Dt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:V(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=Wt.get(n)||n,V(e,n,r))}}function Pd(e,t,n,r,a,o){switch(n){case`style`:G(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(c(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(c(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?W(e,r):(typeof r==`number`||typeof r==`bigint`)&&W(e,``+r);break;case`onScroll`:r!=null&&$(`scroll`,e);break;case`onScrollEnd`:r!=null&&$(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=K);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!bt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[ot]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):V(e,n,r)}}}function Fd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:$(`error`,e),$(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(c(137,t));default:Nd(e,t,o,s,n,null)}}a&&Nd(e,t,`srcSet`,n.srcSet,n,null),r&&Nd(e,t,`src`,n.src,n,null);return;case`input`:$(`invalid`,e);var l=o=s=a=null,u=null,d=null;for(r in n)if(n.hasOwnProperty(r)){var f=n[r];if(f!=null)switch(r){case`name`:a=f;break;case`type`:s=f;break;case`checked`:u=f;break;case`defaultChecked`:d=f;break;case`value`:o=f;break;case`defaultValue`:l=f;break;case`children`:case`dangerouslySetInnerHTML`:if(f!=null)throw Error(c(137,t));break;default:Nd(e,t,r,f,n,null)}}It(e,o,l,u,d,s,a,!1);return;case`select`:for(a in $(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(l=n[a],l!=null))switch(a){case`value`:o=l;break;case`defaultValue`:s=l;break;case`multiple`:r=l;default:Nd(e,t,a,l,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&Rt(e,!!r,n,!0):Rt(e,!!r,t,!1);return;case`textarea`:for(s in $(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(l=n[s],l!=null))switch(s){case`value`:r=l;break;case`defaultValue`:a=l;break;case`children`:o=l;break;case`dangerouslySetInnerHTML`:if(l!=null)throw Error(c(91));break;default:Nd(e,t,s,l,n,null)}Bt(e,r,a,o);return;case`option`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:Nd(e,t,u,r,n,null)}return;case`dialog`:$(`beforetoggle`,e),$(`toggle`,e),$(`cancel`,e),$(`close`,e);break;case`iframe`:case`object`:$(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)$(_d[r],e);break;case`image`:$(`error`,e),$(`load`,e);break;case`details`:$(`toggle`,e);break;case`embed`:case`source`:case`link`:$(`error`,e),$(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(d in n)if(n.hasOwnProperty(d)&&(r=n[d],r!=null))switch(d){case`children`:case`dangerouslySetInnerHTML`:throw Error(c(137,t));default:Nd(e,t,d,r,n,null)}return;default:if(Ut(t)){for(f in n)n.hasOwnProperty(f)&&(r=n[f],r!==void 0&&Pd(e,t,f,r,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(r=n[l],r!=null&&Nd(e,t,l,r,n,null))}function Id(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,l=null,u=null,d=null,f=null;for(h in n){var p=n[h];if(n.hasOwnProperty(h)&&p!=null)switch(h){case`checked`:break;case`value`:break;case`defaultValue`:u=p;default:r.hasOwnProperty(h)||Nd(e,t,h,null,r,p)}}for(var m in r){var h=r[m];if(p=n[m],r.hasOwnProperty(m)&&(h!=null||p!=null))switch(m){case`type`:o=h;break;case`name`:a=h;break;case`checked`:d=h;break;case`defaultChecked`:f=h;break;case`value`:s=h;break;case`defaultValue`:l=h;break;case`children`:case`dangerouslySetInnerHTML`:if(h!=null)throw Error(c(137,t));break;default:h!==p&&Nd(e,t,m,h,r,p)}}Ft(e,s,l,u,d,f,o,a);return;case`select`:for(o in h=s=l=m=null,n)if(u=n[o],n.hasOwnProperty(o)&&u!=null)switch(o){case`value`:break;case`multiple`:h=u;default:r.hasOwnProperty(o)||Nd(e,t,o,null,r,u)}for(a in r)if(o=r[a],u=n[a],r.hasOwnProperty(a)&&(o!=null||u!=null))switch(a){case`value`:m=o;break;case`defaultValue`:l=o;break;case`multiple`:s=o;default:o!==u&&Nd(e,t,a,o,r,u)}t=l,n=s,r=h,m==null?!!r!=!!n&&(t==null?Rt(e,!!n,n?[]:``,!1):Rt(e,!!n,t,!0)):Rt(e,!!n,m,!1);return;case`textarea`:for(l in h=m=null,n)if(a=n[l],n.hasOwnProperty(l)&&a!=null&&!r.hasOwnProperty(l))switch(l){case`value`:break;case`children`:break;default:Nd(e,t,l,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:m=a;break;case`defaultValue`:h=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(c(91));break;default:a!==o&&Nd(e,t,s,a,r,o)}zt(e,m,h);return;case`option`:for(var g in n)if(m=n[g],n.hasOwnProperty(g)&&m!=null&&!r.hasOwnProperty(g))switch(g){case`selected`:e.selected=!1;break;default:Nd(e,t,g,null,r,m)}for(u in r)if(m=r[u],h=n[u],r.hasOwnProperty(u)&&m!==h&&(m!=null||h!=null))switch(u){case`selected`:e.selected=m&&typeof m!=`function`&&typeof m!=`symbol`;break;default:Nd(e,t,u,m,r,h)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var _ in n)m=n[_],n.hasOwnProperty(_)&&m!=null&&!r.hasOwnProperty(_)&&Nd(e,t,_,null,r,m);for(d in r)if(m=r[d],h=n[d],r.hasOwnProperty(d)&&m!==h&&(m!=null||h!=null))switch(d){case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(c(137,t));break;default:Nd(e,t,d,m,r,h)}return;default:if(Ut(t)){for(var v in n)m=n[v],n.hasOwnProperty(v)&&m!==void 0&&!r.hasOwnProperty(v)&&Pd(e,t,v,void 0,r,m);for(f in r)m=r[f],h=n[f],!r.hasOwnProperty(f)||m===h||m===void 0&&h===void 0||Pd(e,t,f,m,r,h);return}}for(var y in n)m=n[y],n.hasOwnProperty(y)&&m!=null&&!r.hasOwnProperty(y)&&Nd(e,t,y,null,r,m);for(p in r)m=r[p],h=n[p],!r.hasOwnProperty(p)||m===h||m==null&&h==null||Nd(e,t,p,m,r,h)}function Ld(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Rd(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var a=n[r],o=a.transferSize,s=a.initiatorType,c=a.duration;if(o&&c&&Ld(s)){for(s=0,c=a.responseEnd,r+=1;r<n.length;r++){var l=n[r],u=l.startTime;if(u>c)break;var d=l.transferSize,f=l.initiatorType;d&&Ld(f)&&(l=l.responseEnd,s+=d*(l<c?1:(c-u)/(l-u)))}if(--r,t+=8*(o+s)/(a.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var zd=null,Bd=null;function Vd(e){return e.nodeType===9?e:e.ownerDocument}function Hd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Ud(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Wd(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Gd=null;function Kd(){var e=window.event;return e&&e.type===`popstate`?e===Gd?!1:(Gd=e,!0):(Gd=null,!1)}var qd=typeof setTimeout==`function`?setTimeout:void 0,Jd=typeof clearTimeout==`function`?clearTimeout:void 0,Yd=typeof Promise==`function`?Promise:void 0,Xd=typeof queueMicrotask==`function`?queueMicrotask:Yd===void 0?qd:function(e){return Yd.resolve(null).then(e).catch(Zd)};function Zd(e){setTimeout(function(){throw e})}function Qd(e){return e===`head`}function $d(e,t){var n=t,r=0;do{var a=n.nextSibling;if(e.removeChild(n),a&&a.nodeType===8)if(n=a.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(a),Pp(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)mf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,mf(n);for(var o=n.firstChild;o;){var s=o.nextSibling,c=o.nodeName;o[ft]||c===`SCRIPT`||c===`STYLE`||c===`LINK`&&o.rel.toLowerCase()===`stylesheet`||n.removeChild(o),o=s}}else n===`body`&&mf(e.ownerDocument.body);n=a}while(n);Pp(t)}function ef(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8)if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++;n=r}while(n)}function tf(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:tf(n),pt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function nf(e,t,n,r){for(;e.nodeType===1;){var a=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r)if(t===`input`&&e.type===`hidden`){var o=a.name==null?null:``+a.name;if(a.type===`hidden`&&e.getAttribute(`name`)===o)return e}else return e;else if(!e[ft])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(o=e.getAttribute(`rel`),o===`stylesheet`&&e.hasAttribute(`data-precedence`)||o!==a.rel||e.getAttribute(`href`)!==(a.href==null||a.href===``?null:a.href)||e.getAttribute(`crossorigin`)!==(a.crossOrigin==null?null:a.crossOrigin)||e.getAttribute(`title`)!==(a.title==null?null:a.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(o=e.getAttribute(`src`),(o!==(a.src==null?null:a.src)||e.getAttribute(`type`)!==(a.type==null?null:a.type)||e.getAttribute(`crossorigin`)!==(a.crossOrigin==null?null:a.crossOrigin))&&o&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=lf(e.nextSibling),e===null)break}return null}function rf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=lf(e.nextSibling),e===null))return null;return e}function af(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=lf(e.nextSibling),e===null))return null;return e}function of(e){return e.data===`$?`||e.data===`$~`}function sf(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function cf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function lf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var uf=null;function df(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return lf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function ff(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function pf(e,t,n){switch(t=Vd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(c(452));return e;case`head`:if(e=t.head,!e)throw Error(c(453));return e;case`body`:if(e=t.body,!e)throw Error(c(454));return e;default:throw Error(c(451))}}function mf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);pt(e)}var hf=new Map,gf=new Set;function _f(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var vf=F.d;F.d={f:yf,r:bf,D:Cf,C:wf,L:Tf,m:Ef,X:Of,S:Df,M:kf};function yf(){var e=vf.f(),t=yu();return e||t}function bf(e){var t=ht(e);t!==null&&t.tag===5&&t.type===`form`?ys(t):vf.r(e)}var xf=typeof document>`u`?null:document;function Sf(e,t,n){var r=xf;if(r&&typeof t==`string`&&t){var a=U(t);a=`link[rel="`+e+`"][href="`+a+`"]`,typeof n==`string`&&(a+=`[crossorigin="`+n+`"]`),gf.has(a)||(gf.add(a),e={rel:e,crossOrigin:n,href:t},r.querySelector(a)===null&&(t=r.createElement(`link`),Fd(t,`link`,e),vt(t),r.head.appendChild(t)))}}function Cf(e){vf.D(e),Sf(`dns-prefetch`,e,null)}function wf(e,t){vf.C(e,t),Sf(`preconnect`,e,t)}function Tf(e,t,n){vf.L(e,t,n);var r=xf;if(r&&e&&t){var a=`link[rel="preload"][as="`+U(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(a+=`[imagesrcset="`+U(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(a+=`[imagesizes="`+U(n.imageSizes)+`"]`)):a+=`[href="`+U(e)+`"]`;var o=a;switch(t){case`style`:o=jf(e);break;case`script`:o=Ff(e)}hf.has(o)||(e=g({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),hf.set(o,e),r.querySelector(a)!==null||t===`style`&&r.querySelector(Mf(o))||t===`script`&&r.querySelector(If(o))||(t=r.createElement(`link`),Fd(t,`link`,e),vt(t),r.head.appendChild(t)))}}function Ef(e,t){vf.m(e,t);var n=xf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,a=`link[rel="modulepreload"][as="`+U(r)+`"][href="`+U(e)+`"]`,o=a;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:o=Ff(e)}if(!hf.has(o)&&(e=g({rel:`modulepreload`,href:e},t),hf.set(o,e),n.querySelector(a)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(If(o)))return}r=n.createElement(`link`),Fd(r,`link`,e),vt(r),n.head.appendChild(r)}}}function Df(e,t,n){vf.S(e,t,n);var r=xf;if(r&&e){var a=_t(r).hoistableStyles,o=jf(e);t||=`default`;var s=a.get(o);if(!s){var c={loading:0,preload:null};if(s=r.querySelector(Mf(o)))c.loading=5;else{e=g({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=hf.get(o))&&zf(e,n);var l=s=r.createElement(`link`);vt(l),Fd(l,`link`,e),l._p=new Promise(function(e,t){l.onload=e,l.onerror=t}),l.addEventListener(`load`,function(){c.loading|=1}),l.addEventListener(`error`,function(){c.loading|=2}),c.loading|=4,Rf(s,t,r)}s={type:`stylesheet`,instance:s,count:1,state:c},a.set(o,s)}}}function Of(e,t){vf.X(e,t);var n=xf;if(n&&e){var r=_t(n).hoistableScripts,a=Ff(e),o=r.get(a);o||(o=n.querySelector(If(a)),o||(e=g({src:e,async:!0},t),(t=hf.get(a))&&Bf(e,t),o=n.createElement(`script`),vt(o),Fd(o,`link`,e),n.head.appendChild(o)),o={type:`script`,instance:o,count:1,state:null},r.set(a,o))}}function kf(e,t){vf.M(e,t);var n=xf;if(n&&e){var r=_t(n).hoistableScripts,a=Ff(e),o=r.get(a);o||(o=n.querySelector(If(a)),o||(e=g({src:e,async:!0,type:`module`},t),(t=hf.get(a))&&Bf(e,t),o=n.createElement(`script`),vt(o),Fd(o,`link`,e),n.head.appendChild(o)),o={type:`script`,instance:o,count:1,state:null},r.set(a,o))}}function Af(e,t,n,r){var a=(a=ue.current)?_f(a):null;if(!a)throw Error(c(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=jf(n.href),n=_t(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=jf(n.href);var o=_t(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(Mf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),hf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},hf.set(e,n),o||Pf(a,e,n,s.state))),t&&r===null)throw Error(c(528,``));return s}if(t&&r!==null)throw Error(c(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Ff(n),n=_t(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(c(444,e))}}function jf(e){return`href="`+U(e)+`"`}function Mf(e){return`link[rel="stylesheet"][`+e+`]`}function Nf(e){return g({},e,{"data-precedence":e.precedence,precedence:null})}function Pf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Fd(t,`link`,n),vt(t),e.head.appendChild(t))}function Ff(e){return`[src="`+U(e)+`"]`}function If(e){return`script[async]`+e}function Lf(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+U(n.href)+`"]`);if(r)return t.instance=r,vt(r),r;var a=g({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),vt(r),Fd(r,`style`,a),Rf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=jf(n.href);var o=e.querySelector(Mf(a));if(o)return t.state.loading|=4,t.instance=o,vt(o),o;r=Nf(n),(a=hf.get(a))&&zf(r,a),o=(e.ownerDocument||e).createElement(`link`),vt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Fd(o,`link`,r),t.state.loading|=4,Rf(o,n.precedence,e),t.instance=o;case`script`:return o=Ff(n.src),(a=e.querySelector(If(o)))?(t.instance=a,vt(a),a):(r=n,(a=hf.get(o))&&(r=g({},n),Bf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),vt(a),Fd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(c(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Rf(r,n.precedence,e));return t.instance}function Rf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),a=r.length?r[r.length-1]:null,o=a,s=0;s<r.length;s++){var c=r[s];if(c.dataset.precedence===t)o=c;else if(o!==a)break}o?o.parentNode.insertBefore(e,o.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function zf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function Bf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Vf=null;function Hf(e,t,n){if(Vf===null){var r=new Map,a=Vf=new Map;a.set(n,r)}else a=Vf,r=a.get(n),r||(r=new Map,a.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),a=0;a<n.length;a++){var o=n[a];if(!(o[ft]||o[at]||e===`link`&&o.getAttribute(`rel`)===`stylesheet`)&&o.namespaceURI!==`http://www.w3.org/2000/svg`){var s=o.getAttribute(t)||``;s=e+s;var c=r.get(s);c?c.push(o):r.set(s,[o])}}return r}function Uf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Wf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Gf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Kf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var a=jf(r.href),o=t.querySelector(Mf(a));if(o){t=o._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Yf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=o,vt(o);return}o=t.ownerDocument||t,r=Nf(r),(a=hf.get(a))&&zf(r,a),o=o.createElement(`link`),vt(o);var s=o;s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Fd(o,`link`,r),n.instance=o}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Yf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var qf=0;function Jf(e,t){return e.stylesheets&&e.count===0&&Zf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Zf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&qf===0&&(qf=62500*Rd());var a=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Zf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>qf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(a)}}:null}function Yf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Zf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Xf=null;function Zf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Xf=new Map,t.forEach(Qf,e),Xf=null,Yf.call(e))}function Qf(e,t){if(!(t.state.loading&4)){var n=Xf.get(e);if(n)var r=n.get(null);else{n=new Map,Xf.set(e,n);for(var a=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),o=0;o<a.length;o++){var s=a[o];(s.nodeName===`LINK`||s.getAttribute(`media`)!==`not all`)&&(n.set(s.dataset.precedence,s),r=s)}r&&n.set(null,r)}a=t.instance,s=a.getAttribute(`data-precedence`),o=n.get(s)||r,o===r&&n.set(null,a),n.set(s,a),this.count++,r=Yf.bind(this),a.addEventListener(`load`,r),a.addEventListener(`error`,r),o?o.parentNode.insertBefore(a,o.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(a,e.firstChild)),t.state.loading|=4}}var $f={$$typeof:w,Provider:null,Consumer:null,_currentValue:re,_currentValue2:re,_threadCount:0};function ep(e,t,n,r,a,o,s,c,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Je(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Je(0),this.hiddenUpdates=Je(null),this.identifierPrefix=r,this.onUncaughtError=a,this.onCaughtError=o,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function tp(e,t,n,r,a,o,s,c,l,u,d,f){return e=new ep(e,t,n,s,l,u,d,f,c),t=1,!0===o&&(t|=24),o=ei(3,null,null,t),e.current=o,o.stateNode=e,t=ea(),t.refCount++,e.pooledCache=t,t.refCount++,o.memoizedState={element:r,isDehydrated:n,cache:t},Na(o),e}function np(e){return e?(e=Qr,e):Qr}function rp(e,t,n,r,a,o){a=np(a),r.context===null?r.context=a:r.pendingContext=a,r=Fa(t),r.payload={element:n},o=o===void 0?null:o,o!==null&&(r.callback=o),n=Ia(e,r,t),n!==null&&(mu(n,e,t),La(n,e,t))}function ip(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ap(e,t){ip(e,t),(e=e.alternate)&&ip(e,t)}function op(e){if(e.tag===13||e.tag===31){var t=Yr(e,67108864);t!==null&&mu(t,e,67108864),ap(e,67108864)}}function sp(e){if(e.tag===13||e.tag===31){var t=fu();t=et(t);var n=Yr(e,t);n!==null&&mu(n,e,t),ap(e,t)}}var cp=!0;function lp(e,t,n,r){var a=P.T;P.T=null;var o=F.p;try{F.p=2,dp(e,t,n,r)}finally{F.p=o,P.T=a}}function up(e,t,n,r){var a=P.T;P.T=null;var o=F.p;try{F.p=8,dp(e,t,n,r)}finally{F.p=o,P.T=a}}function dp(e,t,n,r){if(cp){var a=fp(r);if(a===null)wd(e,t,r,pp,n),wp(e,r);else if(Ep(a,e,t,n,r))r.stopPropagation();else if(wp(e,r),t&4&&-1<Cp.indexOf(e)){for(;a!==null;){var o=ht(a);if(o!==null)switch(o.tag){case 3:if(o=o.stateNode,o.current.memoizedState.isDehydrated){var s=Ue(o.pendingLanes);if(s!==0){var c=o;for(c.pendingLanes|=2,c.entangledLanes|=2;s;){var l=1<<31-Ie(s);c.entanglements[1]|=l,s&=~l}rd(o),!(Pl&6)&&(eu=Oe()+500,id(0,!1))}}break;case 31:case 13:c=Yr(o,2),c!==null&&mu(c,o,2),yu(),ap(o,2)}if(o=fp(r),o===null&&wd(e,t,r,pp,n),o===a)break;a=o}a!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function fp(e){return e=Jt(e),mp(e)}var pp=null;function mp(e){if(pp=null,e=mt(e),e!==null){var t=u(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=d(t),e!==null)return e;e=null}else if(n===31){if(e=f(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return pp=e,null}function hp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(ke()){case L:return 2;case Ae:return 8;case je:case Me:return 32;case R:return 268435456;default:return 32}default:return 32}}var gp=!1,_p=null,vp=null,yp=null,bp=new Map,xp=new Map,Sp=[],Cp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function wp(e,t){switch(e){case`focusin`:case`focusout`:_p=null;break;case`dragenter`:case`dragleave`:vp=null;break;case`mouseover`:case`mouseout`:yp=null;break;case`pointerover`:case`pointerout`:bp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:xp.delete(t.pointerId)}}function Tp(e,t,n,r,a,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:o,targetContainers:[a]},t!==null&&(t=ht(t),t!==null&&op(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,a!==null&&t.indexOf(a)===-1&&t.push(a),e)}function Ep(e,t,n,r,a){switch(t){case`focusin`:return _p=Tp(_p,e,t,n,r,a),!0;case`dragenter`:return vp=Tp(vp,e,t,n,r,a),!0;case`mouseover`:return yp=Tp(yp,e,t,n,r,a),!0;case`pointerover`:var o=a.pointerId;return bp.set(o,Tp(bp.get(o)||null,e,t,n,r,a)),!0;case`gotpointercapture`:return o=a.pointerId,xp.set(o,Tp(xp.get(o)||null,e,t,n,r,a)),!0}return!1}function Dp(e){var t=mt(e.target);if(t!==null){var n=u(t);if(n!==null){if(t=n.tag,t===13){if(t=d(n),t!==null){e.blockedOn=t,rt(e.priority,function(){sp(n)});return}}else if(t===31){if(t=f(n),t!==null){e.blockedOn=t,rt(e.priority,function(){sp(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Op(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=fp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);qt=r,n.target.dispatchEvent(r),qt=null}else return t=ht(n),t!==null&&op(t),e.blockedOn=n,!1;t.shift()}return!0}function kp(e,t,n){Op(e)&&n.delete(t)}function Ap(){gp=!1,_p!==null&&Op(_p)&&(_p=null),vp!==null&&Op(vp)&&(vp=null),yp!==null&&Op(yp)&&(yp=null),bp.forEach(kp),xp.forEach(kp)}function jp(e,n){e.blockedOn===n&&(e.blockedOn=null,gp||(gp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,Ap)))}var Mp=null;function Np(e){Mp!==e&&(Mp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){Mp===e&&(Mp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],a=e[t+2];if(typeof r!=`function`){if(mp(r||n)===null)continue;break}var o=ht(n);o!==null&&(e.splice(t,3),t-=3,_s(o,{pending:!0,data:a,method:n.method,action:r},r,a))}}))}function Pp(e){function t(t){return jp(t,e)}_p!==null&&jp(_p,e),vp!==null&&jp(vp,e),yp!==null&&jp(yp,e),bp.forEach(t),xp.forEach(t);for(var n=0;n<Sp.length;n++){var r=Sp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<Sp.length&&(n=Sp[0],n.blockedOn===null);)Dp(n),n.blockedOn===null&&Sp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var a=n[r],o=n[r+1],s=a[ot]||null;if(typeof o==`function`)s||Np(n);else if(s){var c=null;if(o&&o.hasAttribute(`formAction`)){if(a=o,s=o[ot]||null)c=s.formAction;else if(mp(a)!==null)continue}else c=s.action;typeof c==`function`?n[r+1]=c:(n.splice(r,3),r-=3),Np(n)}}}function Fp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return a=e})},focusReset:`manual`,scroll:`manual`})}function t(){a!==null&&(a(),a=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,a=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),a!==null&&(a(),a=null)}}}function Ip(e){this._internalRoot=e}Lp.prototype.render=Ip.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(c(409));var n=t.current;rp(n,fu(),e,t,null,null)},Lp.prototype.unmount=Ip.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;rp(e.current,2,null,e,null,null),yu(),t[st]=null}};function Lp(e){this._internalRoot=e}Lp.prototype.unstable_scheduleHydration=function(e){if(e){var t=nt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Sp.length&&t!==0&&t<Sp[n].priority;n++);Sp.splice(n,0,e),n===0&&Dp(e)}};var Rp=r.version;if(Rp!==`19.2.7`)throw Error(c(527,Rp,`19.2.7`));F.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(c(188)):(e=Object.keys(e).join(`,`),Error(c(268,e)));return e=m(t),e=e===null?null:h(e),e=e===null?null:e.stateNode,e};var zp={bundleType:0,version:`19.2.7`,rendererPackageName:`react-dom`,currentDispatcherRef:P,reconcilerVersion:`19.2.7`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var Bp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Bp.isDisabled&&Bp.supportsFiber)try{B=Bp.inject(zp),Pe=Bp}catch{}}e.createRoot=function(e,t){if(!l(e))throw Error(c(299));var n=!1,r=``,a=Bs,o=Vs,s=Hs;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(a=t.onUncaughtError),t.onCaughtError!==void 0&&(o=t.onCaughtError),t.onRecoverableError!==void 0&&(s=t.onRecoverableError)),t=tp(e,1,!1,null,null,n,r,null,a,o,s,Fp),e[st]=t.current,Sd(e),new Ip(t)}})),l=e(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=c()})),u=n(),d=l(),f=localStorage.getItem(`spd_token`)||``;function p(e){f=e,e?localStorage.setItem(`spd_token`,e):localStorage.removeItem(`spd_token`)}function m(){return f}function h(){let e=window.location.pathname;return e.substring(0,e.lastIndexOf(`/`)+1)}async function g(e,t,n,r){let a=h()+`index.php/api`+t,o={method:e,headers:{Authorization:`Bearer ${f}`}};r?o.body=n:n&&(o.headers[`Content-Type`]=`application/json`,o.body=JSON.stringify(n));let s=await fetch(a,o),c=await s.json().catch(()=>({}));if(!s.ok)throw Error(c.error||s.statusText);return c}var _={get:e=>g(`GET`,e),post:(e,t)=>g(`POST`,e,t),patch:(e,t)=>g(`PATCH`,e,t),del:e=>g(`DELETE`,e),upload:(e,t)=>g(`POST`,e,t,!0)};function v(){let[e,t]=(0,u.useState)(null),[n,r]=(0,u.useState)(!0);return{user:e,checking:n,tryAutoLogin:(0,u.useCallback)(async()=>{if(!m())return r(!1),!1;try{return t(await _.get(`/auth/me`)),r(!1),!0}catch{return p(``),r(!1),!1}},[]),login:(0,u.useCallback)(async(e,n)=>{let r=await _.post(`/auth/login`,{email:e,password:n});return p(r.token),t(r.user),r.user},[]),register:(0,u.useCallback)(async(e,n,r)=>{let a=await _.post(`/auth/register`,{name:e,email:n,password:r});return p(a.token),t(a.user),a.user},[]),logout:(0,u.useCallback)(()=>{p(``),t(null)},[])}}var y=640;function b(){let[e,t]=(0,u.useState)(()=>typeof window<`u`&&window.innerWidth<=y);return(0,u.useEffect)(()=>{let e=window.matchMedia(`(max-width: ${y}px)`),n=()=>t(e.matches);return n(),e.addEventListener(`change`,n),()=>e.removeEventListener(`change`,n)},[]),e}var x={dark:{name:`dark`,bg:`#060a0f`,surface:`#0a1628`,surface2:`#0b1929`,surface3:`#0d1e32`,border:`rgba(80,160,220,0.25)`,text:`#e8f4ff`,dim:`#7aaccc`,accent:`#00d4ff`,good:`#3dff9a`,warn:`#ffcc33`,bad:`#ff4466`,white:`#ffffff`,gridLine:`rgba(255,255,255,0.07)`,axisBorder:`rgba(80,140,180,0.4)`,axisLabel:`rgba(160,200,230,0.9)`,chartBg:`rgba(0,0,0,0.2)`,cvgInner:`rgba(240,244,250,1)`,cvgSectorMix:.4,cvgText:`rgba(20,20,20,0.9)`,cvgSubText:`rgba(30,30,30,0.55)`,spdCurve:`rgba(220,40,40,0.9)`,spdRef:`rgba(180,180,180,0.5)`,spdRefText:`#e8f4ff`,spdDimText:`#7aaccc`},light:{name:`light`,bg:`#f0f4f8`,surface:`#ffffff`,surface2:`#e8eef5`,surface3:`#dde6f0`,border:`rgba(60,120,180,0.2)`,text:`#1a2a3a`,dim:`#4a6a8a`,accent:`#0070cc`,good:`#1a8a40`,warn:`#cc8800`,bad:`#cc2244`,white:`#ffffff`,gridLine:`rgba(0,0,0,0.06)`,axisBorder:`rgba(60,120,180,0.3)`,axisLabel:`rgba(40,80,120,0.9)`,chartBg:`rgba(255,255,255,0.6)`,cvgInner:`rgba(255,255,255,1)`,cvgSectorMix:.3,cvgText:`rgba(20,20,20,0.9)`,cvgSubText:`rgba(30,30,30,0.6)`,spdCurve:`rgba(190,20,20,0.9)`,spdRef:`rgba(100,100,100,0.5)`,spdRefText:`#1a2a3a`,spdDimText:`#4a6a8a`}};function S(e){return x[e]||x.dark}var C=e((e=>{var t=Symbol.for(`react.transitional.element`);function n(e,n,r){var a=null;if(r!==void 0&&(a=``+r),n.key!==void 0&&(a=``+n.key),`key`in n)for(var o in r={},n)o!==`key`&&(r[o]=n[o]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:a,ref:n===void 0?null:n,props:r}}e.jsx=n,e.jsxs=n})),w=e(((e,t)=>{t.exports=C()}))(),T=(0,u.createContext)(null);function E({children:e}){let[t,n]=(0,u.useState)(()=>localStorage.getItem(`hcri_theme`)||`dark`),r=S(t);function a(){let e=t===`dark`?`light`:`dark`;n(e),localStorage.setItem(`hcri_theme`,e)}return(0,u.useEffect)(()=>{document.body.style.background=r.bg,document.documentElement.style.background=r.bg},[r.bg]),(0,w.jsx)(T.Provider,{value:{theme:r,themeName:t,toggleTheme:a},children:e})}function D(){return(0,u.useContext)(T)}function O({onLogin:e,onRegister:t,onGuestUpload:n}){let{theme:r,themeName:a,toggleTheme:o}=D(),[s,c]=(0,u.useState)(`login`),[l,d]=(0,u.useState)(``),[f,p]=(0,u.useState)(!1),[m,h]=(0,u.useState)(!1),[g,_]=(0,u.useState)(``),[v,y]=(0,u.useState)(``),[b,x]=(0,u.useState)(``),[S,C]=(0,u.useState)(``),[T,E]=(0,u.useState)(``),O=(0,u.useRef)(),[k,A]=(0,u.useState)(!1);async function j(n){n.preventDefault(),d(``),p(!0);try{s===`login`?await e(g,v):await t(b,S,T)}catch(e){d(e.message)}finally{p(!1)}}async function M(e){if(!e)return;h(!0),d(``);let t=new FormData;t.append(`file`,e),t.append(`label`,e.name.replace(/\.[^.]+$/,``));try{let e=await fetch(`./index.php/api/guest_analyze`,{method:`POST`,body:t}),r=await e.json();if(!e.ok)throw Error(r.error||e.statusText);n(r)}catch(e){d(`Upload error: `+e.message)}finally{h(!1)}}let ee={background:r.surface,border:`1px solid ${r.border}`,borderRadius:6,padding:`11px 13px`,color:r.text,fontSize:14,outline:`none`,width:`100%`,fontFamily:`monospace`},N={fontSize:12,textTransform:`uppercase`,letterSpacing:1,color:r.dim,fontWeight:700,display:`block`,marginBottom:6},te={background:r.surface,border:`1px solid ${r.border}`,borderRadius:12,padding:`28px 28px 24px`,display:`flex`,flexDirection:`column`,gap:16};return(0,w.jsxs)(`div`,{style:{position:`fixed`,inset:0,display:`flex`,alignItems:`center`,justifyContent:`center`,background:r.bg,padding:`20px`},children:[(0,w.jsx)(`button`,{onClick:o,style:{position:`absolute`,top:16,right:16,background:r.surface,border:`1px solid ${r.border}`,borderRadius:8,padding:`8px 12px`,fontSize:18,cursor:`pointer`,color:r.text},children:a===`dark`?`☀`:`🌙`}),(0,w.jsxs)(`div`,{style:{width:`100%`,maxWidth:860,display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:24,alignItems:`start`},children:[(0,w.jsxs)(`div`,{style:te,children:[(0,w.jsx)(`div`,{style:{fontSize:11,textTransform:`uppercase`,letterSpacing:1,color:r.accent,fontWeight:700},children:`No account needed`}),(0,w.jsx)(`div`,{style:{fontSize:22,fontWeight:900,color:r.white},children:`Quick Analysis`}),(0,w.jsx)(`div`,{style:{fontSize:13,color:r.dim,lineHeight:1.6,marginTop:-8},children:`Upload a CSV or JSON file for an instant TM-30 report. Results are not saved.`}),(0,w.jsxs)(`div`,{style:{border:`2px dashed ${r.accent}50`,borderRadius:10,padding:`28px 16px`,textAlign:`center`,cursor:`pointer`,transition:`all .2s`,background:k?`${r.accent}10`:`${r.accent}05`,...k?{borderColor:r.accent}:{}},onClick:()=>O.current.click(),onDragOver:e=>{e.preventDefault(),A(!0)},onDragLeave:()=>A(!1),onDrop:e=>{e.preventDefault(),A(!1),e.dataTransfer.files[0]&&M(e.dataTransfer.files[0])},children:[(0,w.jsx)(`div`,{style:{fontSize:36,marginBottom:8},children:m?`⏳`:`📂`}),(0,w.jsx)(`div`,{style:{fontSize:15,color:r.text,fontWeight:600,marginBottom:4},children:m?`Analyzing…`:`Drop CSV or JSON file here`}),(0,w.jsx)(`div`,{style:{fontSize:13,color:r.dim},children:`or click to browse`}),(0,w.jsx)(`div`,{style:{display:`flex`,gap:6,justifyContent:`center`,marginTop:10},children:[`.csv`,`.tsv`,`.txt`,`.json`].map(e=>(0,w.jsx)(`span`,{style:{fontSize:11,padding:`3px 8px`,borderRadius:20,background:`${r.accent}15`,border:`1px solid ${r.accent}40`,color:r.dim},children:e},e))})]}),(0,w.jsx)(`input`,{ref:O,type:`file`,accept:`.csv,.txt,.tsv,.json`,style:{display:`none`},onChange:e=>{e.target.files[0]&&(M(e.target.files[0]),e.target.value=``)}}),(0,w.jsx)(`div`,{style:{fontSize:12,color:r.dim,textAlign:`center`},children:`Results shown immediately · Not saved to database`})]}),(0,w.jsxs)(`div`,{style:te,children:[(0,w.jsx)(`div`,{style:{fontSize:11,textTransform:`uppercase`,letterSpacing:1,color:r.accent,fontWeight:700,cursor:`pointer`},onClick:()=>{c(s===`login`?`register`:`login`),d(``)},children:s===`login`?`New user? Register →`:`Have an account? Sign in →`}),(0,w.jsx)(`div`,{style:{fontSize:22,fontWeight:900,color:r.white},children:s===`login`?`Sign In`:`Create Account`}),(0,w.jsx)(`div`,{style:{fontSize:13,color:r.dim,lineHeight:1.6,marginTop:-8},children:`Save reports, track multiple sources, download PDFs.`}),(0,w.jsxs)(`form`,{style:{display:`flex`,flexDirection:`column`,gap:14},onSubmit:j,children:[s===`register`&&(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:N,children:`Name`}),(0,w.jsx)(`input`,{style:ee,type:`text`,value:b,onChange:e=>x(e.target.value),placeholder:`Your name`})]}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:N,children:`Email`}),(0,w.jsx)(`input`,{style:ee,type:`email`,value:s===`login`?g:S,onChange:e=>s===`login`?_(e.target.value):C(e.target.value),placeholder:`you@example.com`,autoComplete:`email`})]}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:N,children:`Password`}),(0,w.jsx)(`input`,{style:ee,type:`password`,value:s===`login`?v:T,onChange:e=>s===`login`?y(e.target.value):E(e.target.value),placeholder:s===`login`?`••••••••`:`Min 8 characters`,autoComplete:s===`login`?`current-password`:`new-password`})]}),(0,w.jsx)(`button`,{type:`submit`,disabled:f,style:{background:r.accent,color:`#060a0f`,border:`none`,borderRadius:8,padding:`13px`,fontWeight:900,fontSize:15,letterSpacing:1,cursor:`pointer`,marginTop:4,opacity:f?.7:1},children:f?`…`:s===`login`?`Sign In`:`Create Account`})]}),l&&(0,w.jsx)(`div`,{style:{fontSize:13,color:r.bad,textAlign:`center`,fontWeight:600},children:l})]})]}),(0,w.jsxs)(`div`,{style:{position:`absolute`,top:24,left:`50%`,transform:`translateX(-50%)`,fontWeight:900,fontSize:24,color:r.white,letterSpacing:1,whiteSpace:`nowrap`,fontFamily:`monospace`},children:[`hCRI`,(0,w.jsx)(`span`,{style:{color:r.accent},children:`.io`}),(0,w.jsx)(`span`,{style:{fontSize:12,color:r.dim,fontWeight:400,letterSpacing:`1px`,textTransform:`uppercase`,marginLeft:12},children:`LED · TM-30 · Color Rendering`})]})]})}function k(e,t){if(e==null)return t.dim;let n=e/100;return n<.7?t.bad:n<.85?t.warn:t.good}function A({user:e,reports:t,activeId:n,isMobile:r=!1,uploading:a,uploadProgress:o,uploadLabel:s,onUpload:c,onSelect:l,onDelete:d,onLogout:f,minRf:p,onMinRfChange:m}){let{theme:h,themeName:g,toggleTheme:_}=D(),v=(0,u.useRef)(),[y,b]=(0,u.useState)(!1),x={sidebar:{width:r?`100%`:290,flexShrink:0,background:h.surface2,borderRight:r?`none`:`1px solid ${h.border}`,display:`flex`,flexDirection:`column`,overflow:`hidden`},head:{padding:`18px 16px 14px`,borderBottom:`1px solid ${h.border}`,background:h.surface3},logoutBtn:{fontSize:12,color:h.dim,background:`none`,border:`1px solid ${h.border}`,borderRadius:4,padding:`4px 10px`,cursor:`pointer`},body:{flex:1,overflow:`hidden`,display:`flex`,flexDirection:`column`},dropZone:{margin:12,border:`2px dashed ${h.accent}40`,borderRadius:8,padding:`16px 14px`,textAlign:`center`,cursor:`pointer`,transition:`all .2s`,background:`${h.accent}05`},dropOver:{borderColor:h.accent,background:`${h.accent}12`},secHead:{padding:`10px 16px 6px`,fontSize:12,textTransform:`uppercase`,letterSpacing:`1.5px`,color:h.dim,borderBottom:`1px solid ${h.border}`,fontWeight:700},item:{display:`flex`,alignItems:`flex-start`,gap:8,padding:`10px 14px`,cursor:`pointer`,borderLeft:`3px solid transparent`,transition:`background .1s`},activeItem:{background:`${h.accent}12`,borderLeftColor:h.accent},delBtn:{fontSize:16,color:h.dim,border:`none`,background:`none`,cursor:`pointer`,padding:`2px 5px`,flexShrink:0},empty:{padding:`24px 16px`,textAlign:`center`,fontSize:14,color:h.dim,lineHeight:2.2},controls:{padding:`12px 14px`,borderTop:`1px solid ${h.border}`,marginTop:`auto`}};return(0,w.jsxs)(`div`,{style:x.sidebar,children:[(0,w.jsxs)(`div`,{style:x.head,children:[(0,w.jsxs)(`div`,{style:{fontWeight:900,fontSize:20,color:h.white,letterSpacing:1,marginBottom:6},children:[`hCRI`,(0,w.jsx)(`span`,{style:{color:h.accent},children:`.io`})]}),(0,w.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,w.jsx)(`span`,{style:{fontSize:14,color:h.text,fontWeight:500},children:e?.name}),(0,w.jsxs)(`div`,{style:{display:`flex`,gap:6},children:[(0,w.jsx)(`button`,{onClick:_,title:g===`dark`?`Switch to light mode`:`Switch to dark mode`,style:{...x.logoutBtn,fontSize:16,padding:`3px 8px`},children:g===`dark`?`☀`:`🌙`}),(0,w.jsx)(`button`,{style:x.logoutBtn,onClick:f,children:`Sign out`})]})]})]}),(0,w.jsxs)(`div`,{style:x.body,children:[(0,w.jsxs)(`div`,{style:{...x.dropZone,...y?x.dropOver:{}},onClick:()=>v.current.click(),onDragOver:e=>{e.preventDefault(),b(!0)},onDragLeave:()=>b(!1),onDrop:e=>{e.preventDefault(),b(!1),e.dataTransfer.files[0]&&c(e.dataTransfer.files[0])},children:[(0,w.jsx)(`div`,{style:{fontSize:28,marginBottom:6},children:`📂`}),(0,w.jsxs)(`div`,{style:{fontSize:14,color:h.text,lineHeight:1.6,fontWeight:500},children:[(0,w.jsx)(`strong`,{style:{color:h.accent,display:`block`,marginBottom:2},children:`Upload CSV or JSON`}),`wavelength · power · TM-30`]})]}),(0,w.jsx)(`input`,{ref:v,type:`file`,accept:`.csv,.txt,.tsv,.json`,style:{display:`none`},onChange:e=>{e.target.files[0]&&(c(e.target.files[0]),e.target.value=``)}}),a&&(0,w.jsxs)(`div`,{style:{padding:`0 12px 10px`},children:[(0,w.jsx)(`div`,{style:{height:4,background:`${h.accent}20`,borderRadius:2,overflow:`hidden`},children:(0,w.jsx)(`div`,{style:{height:`100%`,width:o+`%`,background:h.accent,transition:`width .4s`,borderRadius:2}})}),(0,w.jsx)(`div`,{style:{fontSize:13,color:h.dim,marginTop:4},children:s})]}),(0,w.jsx)(`div`,{style:x.secHead,children:`Saved Reports`}),(0,w.jsx)(`div`,{style:{flex:1,overflowY:`auto`},children:t.length?t.map(e=>(0,w.jsxs)(`div`,{style:{...x.item,...e.id===n?x.activeItem:{}},onClick:()=>l(e.id),children:[(0,w.jsx)(`div`,{style:{width:10,height:10,borderRadius:`50%`,background:k(e.Rf,h),flexShrink:0,marginTop:3}}),(0,w.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,w.jsx)(`div`,{style:{fontSize:14,color:h.text,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,fontWeight:600,marginBottom:2},children:e.label}),(0,w.jsxs)(`div`,{style:{fontSize:12,color:h.dim},children:[e.cct?e.cct+`K · `:``,new Date(e.createdAt.replace(` `,`T`)).toLocaleDateString()]})]}),(0,w.jsx)(`div`,{style:{fontSize:15,fontWeight:700,color:k(e.Rf,h),flexShrink:0,marginRight:6},children:e.Rf??`—`}),(0,w.jsx)(`button`,{style:x.delBtn,title:`Delete report`,onMouseEnter:e=>Object.assign(e.currentTarget.style,{color:`#ff4466`}),onMouseLeave:e=>Object.assign(e.currentTarget.style,{color:h.dim}),onClick:t=>{t.stopPropagation(),d(e.id)},children:`🗑`})]},e.id)):(0,w.jsxs)(`div`,{style:x.empty,children:[`No reports yet.`,(0,w.jsx)(`br`,{}),`Upload a CSV or JSON file to begin.`]})}),(0,w.jsxs)(`div`,{style:x.controls,children:[(0,w.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8,marginBottom:6},children:[(0,w.jsx)(`span`,{style:{fontSize:13,color:h.text,flex:1,fontWeight:500},children:`Min Rf filter`}),(0,w.jsx)(`span`,{style:{fontSize:14,color:h.accent,fontWeight:700,minWidth:28,textAlign:`right`},children:p})]}),(0,w.jsx)(`input`,{type:`range`,min:`0`,max:`100`,value:p,onChange:e=>m(+e.target.value),style:{width:`100%`,accentColor:h.accent}})]})]})]})}var j=1e3,M=1001,ee=1002,N=1003,te=1004,ne=1005,P=1006,F=1007,re=1008,ie=1009,ae=1010,oe=1011,se=1012,I=1013,ce=1014,le=1015,ue=1016,de=1017,fe=1018,pe=1020,me=35902,he=35899,ge=1021,_e=1022,ve=1023,ye=1026,be=1027,xe=1028,Se=1029,Ce=1030,we=1031,Te=1033,Ee=33776,De=33777,Oe=33778,ke=33779,L=35840,Ae=35841,je=35842,Me=35843,R=36196,Ne=37492,z=37496,B=37488,Pe=37489,Fe=37490,Ie=37491,Le=37808,Re=37809,ze=37810,Be=37811,Ve=37812,He=37813,Ue=37814,We=37815,Ge=37816,Ke=37817,qe=37818,Je=37819,Ye=37820,Xe=37821,Ze=36492,Qe=36494,$e=36495,et=36283,tt=36284,nt=36285,rt=36286,it=2300,at=2301,ot=2302,st=2303,ct=2400,lt=2401,ut=2402,dt=3200,ft=`srgb`,pt=`srgb-linear`,mt=`linear`,ht=`srgb`,gt=7680,_t=35044,vt=2e3;function yt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function bt(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function xt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function St(){let e=xt(`canvas`);return e.style.display=`block`,e}var Ct={},wt=null;function Tt(...e){let t=`THREE.`+e.shift();wt?wt(`log`,t,...e):console.log(t,...e)}function Et(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function V(...e){e=Et(e);let t=`THREE.`+e.shift();if(wt)wt(`warn`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function H(...e){e=Et(e);let t=`THREE.`+e.shift();if(wt)wt(`error`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Dt(...e){let t=e.join(` `);t in Ct||(Ct[t]=!0,V(...e))}function Ot(e,t,n){return new Promise(function(r,a){function o(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:a();break;case e.TIMEOUT_EXPIRED:setTimeout(o,n);break;default:r()}}setTimeout(o,n)})}var kt={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},At=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},jt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Mt=Math.PI/180,Nt=180/Math.PI;function Pt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(jt[e&255]+jt[e>>8&255]+jt[e>>16&255]+jt[e>>24&255]+`-`+jt[t&255]+jt[t>>8&255]+`-`+jt[t>>16&15|64]+jt[t>>24&255]+`-`+jt[n&63|128]+jt[n>>8&255]+`-`+jt[n>>16&255]+jt[n>>24&255]+jt[r&255]+jt[r>>8&255]+jt[r>>16&255]+jt[r>>24&255]).toLowerCase()}function U(e,t,n){return Math.max(t,Math.min(n,e))}function Ft(e,t){return(e%t+t)%t}function It(e,t,n){return(1-n)*e+n*t}function Lt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function Rt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var zt=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),a=this.x-e.x,o=this.y-e.y;return this.x=a*n-o*r+e.x,this.y=a*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Bt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,a,o,s){let c=n[r+0],l=n[r+1],u=n[r+2],d=n[r+3],f=a[o+0],p=a[o+1],m=a[o+2],h=a[o+3];if(d!==h||c!==f||l!==p||u!==m){let e=c*f+l*p+u*m+d*h;e<0&&(f=-f,p=-p,m=-m,h=-h,e=-e);let t=1-s;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,s=Math.sin(s*n)/r,c=c*t+f*s,l=l*t+p*s,u=u*t+m*s,d=d*t+h*s}else{c=c*t+f*s,l=l*t+p*s,u=u*t+m*s,d=d*t+h*s;let e=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=e,l*=e,u*=e,d*=e}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,r,a,o){let s=n[r],c=n[r+1],l=n[r+2],u=n[r+3],d=a[o],f=a[o+1],p=a[o+2],m=a[o+3];return e[t]=s*m+u*d+c*p-l*f,e[t+1]=c*m+u*f+l*d-s*p,e[t+2]=l*m+u*p+s*f-c*d,e[t+3]=u*m-s*d-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,a=e._z,o=e._order,s=Math.cos,c=Math.sin,l=s(n/2),u=s(r/2),d=s(a/2),f=c(n/2),p=c(r/2),m=c(a/2);switch(o){case`XYZ`:this._x=f*u*d+l*p*m,this._y=l*p*d-f*u*m,this._z=l*u*m+f*p*d,this._w=l*u*d-f*p*m;break;case`YXZ`:this._x=f*u*d+l*p*m,this._y=l*p*d-f*u*m,this._z=l*u*m-f*p*d,this._w=l*u*d+f*p*m;break;case`ZXY`:this._x=f*u*d-l*p*m,this._y=l*p*d+f*u*m,this._z=l*u*m+f*p*d,this._w=l*u*d-f*p*m;break;case`ZYX`:this._x=f*u*d-l*p*m,this._y=l*p*d+f*u*m,this._z=l*u*m-f*p*d,this._w=l*u*d+f*p*m;break;case`YZX`:this._x=f*u*d+l*p*m,this._y=l*p*d+f*u*m,this._z=l*u*m-f*p*d,this._w=l*u*d-f*p*m;break;case`XZY`:this._x=f*u*d-l*p*m,this._y=l*p*d-f*u*m,this._z=l*u*m+f*p*d,this._w=l*u*d+f*p*m;break;default:V(`Quaternion: .setFromEuler() encountered an unknown order: `+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],a=t[8],o=t[1],s=t[5],c=t[9],l=t[2],u=t[6],d=t[10],f=n+s+d;if(f>0){let e=.5/Math.sqrt(f+1);this._w=.25/e,this._x=(u-c)*e,this._y=(a-l)*e,this._z=(o-r)*e}else if(n>s&&n>d){let e=2*Math.sqrt(1+n-s-d);this._w=(u-c)/e,this._x=.25*e,this._y=(r+o)/e,this._z=(a+l)/e}else if(s>d){let e=2*Math.sqrt(1+s-n-d);this._w=(a-l)/e,this._x=(r+o)/e,this._y=.25*e,this._z=(c+u)/e}else{let e=2*Math.sqrt(1+d-n-s);this._w=(o-r)/e,this._x=(a+l)/e,this._y=(c+u)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(U(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,a=e._z,o=e._w,s=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*s+r*l-a*c,this._y=r*u+o*c+a*s-n*l,this._z=a*u+o*l+n*c-r*s,this._w=o*u-n*s-r*c-a*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,a=e._z,o=e._w,s=this.dot(e);s<0&&(n=-n,r=-r,a=-a,o=-o,s=-s);let c=1-t;if(s<.9995){let e=Math.acos(s),l=Math.sin(e);c=Math.sin(c*e)/l,t=Math.sin(t*e)/l,this._x=this._x*c+n*t,this._y=this._y*c+r*t,this._z=this._z*c+a*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+r*t,this._z=this._z*c+a*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),a*Math.sin(t),a*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ht.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ht.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[3]*n+a[6]*r,this.y=a[1]*t+a[4]*n+a[7]*r,this.z=a[2]*t+a[5]*n+a[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,a=e.elements,o=1/(a[3]*t+a[7]*n+a[11]*r+a[15]);return this.x=(a[0]*t+a[4]*n+a[8]*r+a[12])*o,this.y=(a[1]*t+a[5]*n+a[9]*r+a[13])*o,this.z=(a[2]*t+a[6]*n+a[10]*r+a[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,a=e.x,o=e.y,s=e.z,c=e.w,l=2*(o*r-s*n),u=2*(s*t-a*r),d=2*(a*n-o*t);return this.x=t+c*l+o*d-s*u,this.y=n+c*u+s*l-a*d,this.z=r+c*d+a*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r,this.y=a[1]*t+a[5]*n+a[9]*r,this.z=a[2]*t+a[6]*n+a[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,a=e.z,o=t.x,s=t.y,c=t.z;return this.x=r*c-a*s,this.y=a*o-n*c,this.z=n*s-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Vt.copy(this).projectOnVector(e),this.sub(Vt)}reflect(e){return this.sub(Vt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Vt=new W,Ht=new Bt,G=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,a,o,s,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,a,o,s,c,l)}set(e,t,n,r,a,o,s,c,l){let u=this.elements;return u[0]=e,u[1]=r,u[2]=s,u[3]=t,u[4]=a,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,a=this.elements,o=n[0],s=n[3],c=n[6],l=n[1],u=n[4],d=n[7],f=n[2],p=n[5],m=n[8],h=r[0],g=r[3],_=r[6],v=r[1],y=r[4],b=r[7],x=r[2],S=r[5],C=r[8];return a[0]=o*h+s*v+c*x,a[3]=o*g+s*y+c*S,a[6]=o*_+s*b+c*C,a[1]=l*h+u*v+d*x,a[4]=l*g+u*y+d*S,a[7]=l*_+u*b+d*C,a[2]=f*h+p*v+m*x,a[5]=f*g+p*y+m*S,a[8]=f*_+p*b+m*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],o=e[4],s=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*s*l-n*a*u+n*s*c+r*a*l-r*o*c}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],o=e[4],s=e[5],c=e[6],l=e[7],u=e[8],d=u*o-s*l,f=s*c-u*a,p=l*a-o*c,m=t*d+n*f+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let h=1/m;return e[0]=d*h,e[1]=(r*l-u*n)*h,e[2]=(s*n-r*o)*h,e[3]=f*h,e[4]=(u*t-r*c)*h,e[5]=(r*a-s*t)*h,e[6]=p*h,e[7]=(n*c-l*t)*h,e[8]=(o*t-n*a)*h,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,a,o,s){let c=Math.cos(a),l=Math.sin(a);return this.set(n*c,n*l,-n*(c*o+l*s)+o+e,-r*l,r*c,-r*(-l*o+c*s)+s+t,0,0,1),this}scale(e,t){return this.premultiply(Ut.makeScale(e,t)),this}rotate(e){return this.premultiply(Ut.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ut.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ut=new G,Wt=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gt=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kt(){let e={enabled:!0,workingColorSpace:pt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=qt(e.r),e.g=qt(e.g),e.b=qt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Jt(e.r),e.g=Jt(e.g),e.b=Jt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?mt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Dt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Dt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[pt]:{primaries:t,whitePoint:r,transfer:mt,toXYZ:Wt,fromXYZ:Gt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ft},outputColorSpaceConfig:{drawingBufferColorSpace:ft}},[ft]:{primaries:t,whitePoint:r,transfer:ht,toXYZ:Wt,fromXYZ:Gt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ft}}}),e}var K=Kt();function qt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Jt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Yt,Xt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Yt===void 0&&(Yt=xt(`canvas`)),Yt.width=e.width,Yt.height=e.height;let t=Yt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Yt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=xt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),a=r.data;for(let e=0;e<a.length;e++)a[e]=qt(a[e]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(qt(t[e]/255)*255):t[e]=qt(t[e]);return{data:t,width:e.width,height:e.height}}else return V(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Zt=0,Qt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Zt++}),this.uuid=Pt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push($t(r[t].image)):e.push($t(r[t]))}else e=$t(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function $t(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Xt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(V(`Texture: Unable to serialize Texture.`),{})}var en=0,tn=new W,nn=class e extends At{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=M,a=M,o=P,s=re,c=ve,l=ie,u=e.DEFAULT_ANISOTROPY,d=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:en++}),this.uuid=Pt(),this.name=``,this.source=new Qt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=o,this.minFilter=s,this.anisotropy=u,this.format=c,this.internalFormat=null,this.type=l,this.offset=new zt(0,0),this.repeat=new zt(1,1),this.center=new zt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(tn).x}get height(){return this.source.getSize(tn).y}get depth(){return this.source.getSize(tn).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){V(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case j:e.x-=Math.floor(e.x);break;case M:e.x=e.x<0?0:1;break;case ee:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case j:e.y-=Math.floor(e.y);break;case M:e.y=e.y<0?0:1;break;case ee:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};nn.DEFAULT_IMAGE=null,nn.DEFAULT_MAPPING=300,nn.DEFAULT_ANISOTROPY=1;var rn=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,a=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*a,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*a,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*a,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*a,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,a,o=.01,s=.1,c=e.elements,l=c[0],u=c[4],d=c[8],f=c[1],p=c[5],m=c[9],h=c[2],g=c[6],_=c[10];if(Math.abs(u-f)<o&&Math.abs(d-h)<o&&Math.abs(m-g)<o){if(Math.abs(u+f)<s&&Math.abs(d+h)<s&&Math.abs(m+g)<s&&Math.abs(l+p+_-3)<s)return this.set(1,0,0,0),this;t=Math.PI;let e=(l+1)/2,c=(p+1)/2,v=(_+1)/2,y=(u+f)/4,b=(d+h)/4,x=(m+g)/4;return e>c&&e>v?e<o?(n=0,r=.707106781,a=.707106781):(n=Math.sqrt(e),r=y/n,a=b/n):c>v?c<o?(n=.707106781,r=0,a=.707106781):(r=Math.sqrt(c),n=y/r,a=x/r):v<o?(n=.707106781,r=.707106781,a=0):(a=Math.sqrt(v),n=b/a,r=x/a),this.set(n,r,a,t),this}let v=Math.sqrt((g-m)*(g-m)+(d-h)*(d-h)+(f-u)*(f-u));return Math.abs(v)<.001&&(v=1),this.x=(g-m)/v,this.y=(d-h)/v,this.z=(f-u)/v,this.w=Math.acos((l+p+_-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this.w=U(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this.w=U(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},an=class extends At{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:P,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rn(0,0,e,t),this.scissorTest=!1,this.viewport=new rn(0,0,e,t),this.textures=[];let r=new nn({width:e,height:t,depth:n.depth}),a=n.count;for(let e=0;e<a;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:P,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,a=this.textures.length;r<a;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Qt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:`dispose`})}},on=class extends an{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},sn=class extends nn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=N,this.minFilter=N,this.wrapR=M,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},cn=class extends nn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=N,this.minFilter=N,this.wrapR=M,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ln=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,a,o,s,c,l,u,d,f,p,m,h,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,a,o,s,c,l,u,d,f,p,m,h,g){let _=this.elements;return _[0]=e,_[4]=t,_[8]=n,_[12]=r,_[1]=a,_[5]=o,_[9]=s,_[13]=c,_[2]=l,_[6]=u,_[10]=d,_[14]=f,_[3]=p,_[7]=m,_[11]=h,_[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,r=1/un.setFromMatrixColumn(e,0).length(),a=1/un.setFromMatrixColumn(e,1).length(),o=1/un.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,a=e.z,o=Math.cos(n),s=Math.sin(n),c=Math.cos(r),l=Math.sin(r),u=Math.cos(a),d=Math.sin(a);if(e.order===`XYZ`){let e=o*u,n=o*d,r=s*u,a=s*d;t[0]=c*u,t[4]=-c*d,t[8]=l,t[1]=n+r*l,t[5]=e-a*l,t[9]=-s*c,t[2]=a-e*l,t[6]=r+n*l,t[10]=o*c}else if(e.order===`YXZ`){let e=c*u,n=c*d,r=l*u,a=l*d;t[0]=e+a*s,t[4]=r*s-n,t[8]=o*l,t[1]=o*d,t[5]=o*u,t[9]=-s,t[2]=n*s-r,t[6]=a+e*s,t[10]=o*c}else if(e.order===`ZXY`){let e=c*u,n=c*d,r=l*u,a=l*d;t[0]=e-a*s,t[4]=-o*d,t[8]=r+n*s,t[1]=n+r*s,t[5]=o*u,t[9]=a-e*s,t[2]=-o*l,t[6]=s,t[10]=o*c}else if(e.order===`ZYX`){let e=o*u,n=o*d,r=s*u,a=s*d;t[0]=c*u,t[4]=r*l-n,t[8]=e*l+a,t[1]=c*d,t[5]=a*l+e,t[9]=n*l-r,t[2]=-l,t[6]=s*c,t[10]=o*c}else if(e.order===`YZX`){let e=o*c,n=o*l,r=s*c,a=s*l;t[0]=c*u,t[4]=a-e*d,t[8]=r*d+n,t[1]=d,t[5]=o*u,t[9]=-s*u,t[2]=-l*u,t[6]=n*d+r,t[10]=e-a*d}else if(e.order===`XZY`){let e=o*c,n=o*l,r=s*c,a=s*l;t[0]=c*u,t[4]=-d,t[8]=l*u,t[1]=e*d+a,t[5]=o*u,t[9]=n*d-r,t[2]=r*d-n,t[6]=s*u,t[10]=a*d+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(fn,e,pn)}lookAt(e,t,n){let r=this.elements;return gn.subVectors(e,t),gn.lengthSq()===0&&(gn.z=1),gn.normalize(),mn.crossVectors(n,gn),mn.lengthSq()===0&&(Math.abs(n.z)===1?gn.x+=1e-4:gn.z+=1e-4,gn.normalize(),mn.crossVectors(n,gn)),mn.normalize(),hn.crossVectors(gn,mn),r[0]=mn.x,r[4]=hn.x,r[8]=gn.x,r[1]=mn.y,r[5]=hn.y,r[9]=gn.y,r[2]=mn.z,r[6]=hn.z,r[10]=gn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,a=this.elements,o=n[0],s=n[4],c=n[8],l=n[12],u=n[1],d=n[5],f=n[9],p=n[13],m=n[2],h=n[6],g=n[10],_=n[14],v=n[3],y=n[7],b=n[11],x=n[15],S=r[0],C=r[4],w=r[8],T=r[12],E=r[1],D=r[5],O=r[9],k=r[13],A=r[2],j=r[6],M=r[10],ee=r[14],N=r[3],te=r[7],ne=r[11],P=r[15];return a[0]=o*S+s*E+c*A+l*N,a[4]=o*C+s*D+c*j+l*te,a[8]=o*w+s*O+c*M+l*ne,a[12]=o*T+s*k+c*ee+l*P,a[1]=u*S+d*E+f*A+p*N,a[5]=u*C+d*D+f*j+p*te,a[9]=u*w+d*O+f*M+p*ne,a[13]=u*T+d*k+f*ee+p*P,a[2]=m*S+h*E+g*A+_*N,a[6]=m*C+h*D+g*j+_*te,a[10]=m*w+h*O+g*M+_*ne,a[14]=m*T+h*k+g*ee+_*P,a[3]=v*S+y*E+b*A+x*N,a[7]=v*C+y*D+b*j+x*te,a[11]=v*w+y*O+b*M+x*ne,a[15]=v*T+y*k+b*ee+x*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],a=e[12],o=e[1],s=e[5],c=e[9],l=e[13],u=e[2],d=e[6],f=e[10],p=e[14],m=e[3],h=e[7],g=e[11],_=e[15],v=c*p-l*f,y=s*p-l*d,b=s*f-c*d,x=o*p-l*u,S=o*f-c*u,C=o*d-s*u;return t*(h*v-g*y+_*b)-n*(m*v-g*x+_*S)+r*(m*y-h*x+_*C)-a*(m*b-h*S+g*C)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],a=e[3],o=e[4],s=e[5],c=e[6],l=e[7],u=e[8],d=e[9],f=e[10],p=e[11],m=e[12],h=e[13],g=e[14],_=e[15],v=t*s-n*o,y=t*c-r*o,b=t*l-a*o,x=n*c-r*s,S=n*l-a*s,C=r*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let j=1/A;return e[0]=(s*k-c*O+l*D)*j,e[1]=(r*O-n*k-a*D)*j,e[2]=(h*C-g*S+_*x)*j,e[3]=(f*S-d*C-p*x)*j,e[4]=(c*E-o*k-l*T)*j,e[5]=(t*k-r*E+a*T)*j,e[6]=(g*b-m*C-_*y)*j,e[7]=(u*C-f*b+p*y)*j,e[8]=(o*O-s*E+l*w)*j,e[9]=(n*E-t*O-a*w)*j,e[10]=(m*S-h*b+_*v)*j,e[11]=(d*b-u*S-p*v)*j,e[12]=(s*T-o*D-c*w)*j,e[13]=(t*D-n*T+r*w)*j,e[14]=(h*y-m*x-g*v)*j,e[15]=(u*x-d*y+f*v)*j,this}scale(e){let t=this.elements,n=e.x,r=e.y,a=e.z;return t[0]*=n,t[4]*=r,t[8]*=a,t[1]*=n,t[5]*=r,t[9]*=a,t[2]*=n,t[6]*=r,t[10]*=a,t[3]*=n,t[7]*=r,t[11]*=a,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),a=1-n,o=e.x,s=e.y,c=e.z,l=a*o,u=a*s;return this.set(l*o+n,l*s-r*c,l*c+r*s,0,l*s+r*c,u*s+n,u*c-r*o,0,l*c-r*s,u*c+r*o,a*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,a,o){return this.set(1,n,a,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,a=t._x,o=t._y,s=t._z,c=t._w,l=a+a,u=o+o,d=s+s,f=a*l,p=a*u,m=a*d,h=o*u,g=o*d,_=s*d,v=c*l,y=c*u,b=c*d,x=n.x,S=n.y,C=n.z;return r[0]=(1-(h+_))*x,r[1]=(p+b)*x,r[2]=(m-y)*x,r[3]=0,r[4]=(p-b)*S,r[5]=(1-(f+_))*S,r[6]=(g+v)*S,r[7]=0,r[8]=(m+y)*C,r[9]=(g-v)*C,r[10]=(1-(f+h))*C,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let a=this.determinant();if(a===0)return n.set(1,1,1),t.identity(),this;let o=un.set(r[0],r[1],r[2]).length(),s=un.set(r[4],r[5],r[6]).length(),c=un.set(r[8],r[9],r[10]).length();a<0&&(o=-o),dn.copy(this);let l=1/o,u=1/s,d=1/c;return dn.elements[0]*=l,dn.elements[1]*=l,dn.elements[2]*=l,dn.elements[4]*=u,dn.elements[5]*=u,dn.elements[6]*=u,dn.elements[8]*=d,dn.elements[9]*=d,dn.elements[10]*=d,t.setFromRotationMatrix(dn),n.x=o,n.y=s,n.z=c,this}makePerspective(e,t,n,r,a,o,s=vt,c=!1){let l=this.elements,u=2*a/(t-e),d=2*a/(n-r),f=(t+e)/(t-e),p=(n+r)/(n-r),m,h;if(c)m=a/(o-a),h=o*a/(o-a);else if(s===2e3)m=-(o+a)/(o-a),h=-2*o*a/(o-a);else if(s===2001)m=-o/(o-a),h=-o*a/(o-a);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+s);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=h,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,a,o,s=vt,c=!1){let l=this.elements,u=2/(t-e),d=2/(n-r),f=-(t+e)/(t-e),p=-(n+r)/(n-r),m,h;if(c)m=1/(o-a),h=o/(o-a);else if(s===2e3)m=-2/(o-a),h=-(o+a)/(o-a);else if(s===2001)m=-1/(o-a),h=-a/(o-a);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+s);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=m,l[14]=h,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},un=new W,dn=new ln,fn=new W(0,0,0),pn=new W(1,1,1),mn=new W,hn=new W,gn=new W,_n=new ln,vn=new Bt,yn=class e{constructor(t=0,n=0,r=0,a=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,a=r[0],o=r[4],s=r[8],c=r[1],l=r[5],u=r[9],d=r[2],f=r[6],p=r[10];switch(t){case`XYZ`:this._y=Math.asin(U(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,a)):(this._x=Math.atan2(f,l),this._z=0);break;case`YXZ`:this._x=Math.asin(-U(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(s,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,a),this._z=0);break;case`ZXY`:this._x=Math.asin(U(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,a));break;case`ZYX`:this._y=Math.asin(-U(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,a)):(this._x=0,this._z=Math.atan2(-o,l));break;case`YZX`:this._z=Math.asin(U(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-d,a)):(this._x=0,this._y=Math.atan2(s,p));break;case`XZY`:this._z=Math.asin(-U(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(s,a)):(this._x=Math.atan2(-u,p),this._y=0);break;default:V(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return _n.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_n,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vn.setFromEuler(this),this.setFromQuaternion(vn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};yn.DEFAULT_ORDER=`XYZ`;var bn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},xn=0,Sn=new W,Cn=new Bt,wn=new ln,Tn=new W,En=new W,Dn=new W,On=new Bt,kn=new W(1,0,0),An=new W(0,1,0),jn=new W(0,0,1),Mn={type:`added`},Nn={type:`removed`},Pn={type:`childadded`,child:null},Fn={type:`childremoved`,child:null},In=class e extends At{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xn++}),this.uuid=Pt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new yn,r=new Bt,a=new W(1,1,1);function o(){r.setFromEuler(n,!1)}function s(){n.setFromQuaternion(r,void 0,!1)}n._onChange(o),r._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new ln},normalMatrix:{value:new G}}),this.matrix=new ln,this.matrixWorld=new ln,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cn.setFromAxisAngle(e,t),this.quaternion.multiply(Cn),this}rotateOnWorldAxis(e,t){return Cn.setFromAxisAngle(e,t),this.quaternion.premultiply(Cn),this}rotateX(e){return this.rotateOnAxis(kn,e)}rotateY(e){return this.rotateOnAxis(An,e)}rotateZ(e){return this.rotateOnAxis(jn,e)}translateOnAxis(e,t){return Sn.copy(e).applyQuaternion(this.quaternion),this.position.add(Sn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kn,e)}translateY(e){return this.translateOnAxis(An,e)}translateZ(e){return this.translateOnAxis(jn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(wn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Tn.copy(e):Tn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),En.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wn.lookAt(En,Tn,this.up):wn.lookAt(Tn,En,this.up),this.quaternion.setFromRotationMatrix(wn),r&&(wn.extractRotation(r.matrixWorld),Cn.setFromRotationMatrix(wn),this.quaternion.premultiply(Cn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(H(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Mn),Pn.child=e,this.dispatchEvent(Pn),Pn.child=null):H(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Nn),Fn.child=e,this.dispatchEvent(Fn),Fn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(wn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Mn),Pn.child=e,this.dispatchEvent(Pn),Pn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(En,e,Dn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(En,On,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,a=this.matrix.elements;a[12]+=t-a[0]*t-a[4]*n-a[8]*r,a[13]+=n-a[1]*t-a[5]*n-a[9]*r,a[14]+=r-a[2]*t-a[6]*n-a[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function a(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=a(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];a(e.shapes,r)}else a(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(a(e.materials,this.material[n]));r.material=t}else r.material=a(e.materials,this.material);if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(a(e.animations,n))}}if(t){let t=o(e.geometries),r=o(e.materials),a=o(e.textures),s=o(e.images),c=o(e.shapes),l=o(e.skeletons),u=o(e.animations),d=o(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),a.length>0&&(n.textures=a),s.length>0&&(n.images=s),c.length>0&&(n.shapes=c),l.length>0&&(n.skeletons=l),u.length>0&&(n.animations=u),d.length>0&&(n.nodes=d)}return n.object=r,n;function o(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};In.DEFAULT_UP=new W(0,1,0),In.DEFAULT_MATRIX_AUTO_UPDATE=!0,In.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ln=class extends In{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Rn={type:`move`},zn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ln,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ln,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ln,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,a=null,o=null,s=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(l&&e.hand){o=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),a=this._getHandJoint(l,r);e!==null&&(a.matrix.fromArray(e.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,a.jointRadius=e.radius),a.visible=e!==null}let r=l.joints[`index-finger-tip`],a=l.joints[`thumb-tip`],s=r.position.distanceTo(a.position);l.inputState.pinching&&s>.025?(l.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!l.inputState.pinching&&s<=.015&&(l.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,n),a!==null&&(c.matrix.fromArray(a.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,a.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(a.linearVelocity)):c.hasLinearVelocity=!1,a.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(a.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:`gripUpdated`,data:e,target:this})));s!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&a!==null&&(r=a),r!==null&&(s.matrix.fromArray(r.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,r.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(r.linearVelocity)):s.hasLinearVelocity=!1,r.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(r.angularVelocity)):s.hasAngularVelocity=!1,this.dispatchEvent(Rn)))}return s!==null&&(s.visible=r!==null),c!==null&&(c.visible=a!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ln;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Bn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vn={h:0,s:0,l:0},Hn={h:0,s:0,l:0};function Un(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var q=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,K.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=K.workingColorSpace){return this.r=e,this.g=t,this.b=n,K.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=K.workingColorSpace){if(e=Ft(e,1),t=U(t,0,1),n=U(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Un(a,r,e+1/3),this.g=Un(a,r,e),this.b=Un(a,r,e-1/3)}return K.colorSpaceToWorking(this,r),this}setStyle(e,t=ft){function n(t){t!==void 0&&parseFloat(t)<1&&V(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let a,o=r[1],s=r[2];switch(o){case`rgb`:case`rgba`:if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case`hsl`:case`hsla`:if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:V(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],a=n.length;if(a===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(n,16),t);V(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ft){let n=Bn[e.toLowerCase()];return n===void 0?V(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qt(e.r),this.g=qt(e.g),this.b=qt(e.b),this}copyLinearToSRGB(e){return this.r=Jt(e.r),this.g=Jt(e.g),this.b=Jt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ft){return K.workingToColorSpace(Wn.copy(this),e),Math.round(U(Wn.r*255,0,255))*65536+Math.round(U(Wn.g*255,0,255))*256+Math.round(U(Wn.b*255,0,255))}getHexString(e=ft){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=K.workingColorSpace){K.workingToColorSpace(Wn.copy(this),t);let n=Wn.r,r=Wn.g,a=Wn.b,o=Math.max(n,r,a),s=Math.min(n,r,a),c,l,u=(s+o)/2;if(s===o)c=0,l=0;else{let e=o-s;switch(l=u<=.5?e/(o+s):e/(2-o-s),o){case n:c=(r-a)/e+(r<a?6:0);break;case r:c=(a-n)/e+2;break;case a:c=(n-r)/e+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=K.workingColorSpace){return K.workingToColorSpace(Wn.copy(this),t),e.r=Wn.r,e.g=Wn.g,e.b=Wn.b,e}getStyle(e=ft){K.workingToColorSpace(Wn.copy(this),e);let t=Wn.r,n=Wn.g,r=Wn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Vn),this.setHSL(Vn.h+e,Vn.s+t,Vn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vn),e.getHSL(Hn);let n=It(Vn.h,Hn.h,t),r=It(Vn.s,Hn.s,t),a=It(Vn.l,Hn.l,t);return this.setHSL(n,r,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,a=e.elements;return this.r=a[0]*t+a[3]*n+a[6]*r,this.g=a[1]*t+a[4]*n+a[7]*r,this.b=a[2]*t+a[5]*n+a[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Wn=new q;q.NAMES=Bn;var Gn=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new q(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},Kn=class extends In{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yn,this.environmentIntensity=1,this.environmentRotation=new yn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},qn=new W,Jn=new W,Yn=new W,Xn=new W,Zn=new W,Qn=new W,$n=new W,er=new W,tr=new W,nr=new W,rr=new rn,ir=new rn,ar=new rn,or=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),qn.subVectors(e,t),r.cross(qn);let a=r.lengthSq();return a>0?r.multiplyScalar(1/Math.sqrt(a)):r.set(0,0,0)}static getBarycoord(e,t,n,r,a){qn.subVectors(r,t),Jn.subVectors(n,t),Yn.subVectors(e,t);let o=qn.dot(qn),s=qn.dot(Jn),c=qn.dot(Yn),l=Jn.dot(Jn),u=Jn.dot(Yn),d=o*l-s*s;if(d===0)return a.set(0,0,0),null;let f=1/d,p=(l*c-s*u)*f,m=(o*u-s*c)*f;return a.set(1-p-m,m,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Xn)===null?!1:Xn.x>=0&&Xn.y>=0&&Xn.x+Xn.y<=1}static getInterpolation(e,t,n,r,a,o,s,c){return this.getBarycoord(e,t,n,r,Xn)===null?(c.x=0,c.y=0,`z`in c&&(c.z=0),`w`in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(a,Xn.x),c.addScaledVector(o,Xn.y),c.addScaledVector(s,Xn.z),c)}static getInterpolatedAttribute(e,t,n,r,a,o){return rr.setScalar(0),ir.setScalar(0),ar.setScalar(0),rr.fromBufferAttribute(e,t),ir.fromBufferAttribute(e,n),ar.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(rr,a.x),o.addScaledVector(ir,a.y),o.addScaledVector(ar,a.z),o}static isFrontFacing(e,t,n,r){return qn.subVectors(n,t),Jn.subVectors(e,t),qn.cross(Jn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qn.subVectors(this.c,this.b),Jn.subVectors(this.a,this.b),qn.cross(Jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,a,o){return e.getInterpolation(t,this.a,this.b,this.c,n,r,a,o)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,a=this.c,o,s;Zn.subVectors(r,n),Qn.subVectors(a,n),er.subVectors(e,n);let c=Zn.dot(er),l=Qn.dot(er);if(c<=0&&l<=0)return t.copy(n);tr.subVectors(e,r);let u=Zn.dot(tr),d=Qn.dot(tr);if(u>=0&&d<=u)return t.copy(r);let f=c*d-u*l;if(f<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(Zn,o);nr.subVectors(e,a);let p=Zn.dot(nr),m=Qn.dot(nr);if(m>=0&&p<=m)return t.copy(a);let h=p*l-c*m;if(h<=0&&l>=0&&m<=0)return s=l/(l-m),t.copy(n).addScaledVector(Qn,s);let g=u*m-p*d;if(g<=0&&d-u>=0&&p-m>=0)return $n.subVectors(a,r),s=(d-u)/(d-u+(p-m)),t.copy(r).addScaledVector($n,s);let _=1/(g+h+f);return o=h*_,s=f*_,t.copy(n).addScaledVector(Zn,o).addScaledVector(Qn,s)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},sr=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(lr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(lr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=lr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,lr):lr.fromBufferAttribute(r,t),lr.applyMatrix4(e.matrixWorld),this.expandByPoint(lr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),ur.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),ur.copy(e.boundingBox)),ur.applyMatrix4(e.matrixWorld),this.union(ur)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,lr),lr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_r),vr.subVectors(this.max,_r),dr.subVectors(e.a,_r),fr.subVectors(e.b,_r),pr.subVectors(e.c,_r),mr.subVectors(fr,dr),hr.subVectors(pr,fr),gr.subVectors(dr,pr);let t=[0,-mr.z,mr.y,0,-hr.z,hr.y,0,-gr.z,gr.y,mr.z,0,-mr.x,hr.z,0,-hr.x,gr.z,0,-gr.x,-mr.y,mr.x,0,-hr.y,hr.x,0,-gr.y,gr.x,0];return!xr(t,dr,fr,pr,vr)||(t=[1,0,0,0,1,0,0,0,1],!xr(t,dr,fr,pr,vr))?!1:(yr.crossVectors(mr,hr),t=[yr.x,yr.y,yr.z],xr(t,dr,fr,pr,vr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,lr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(lr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(cr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),cr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),cr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),cr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),cr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),cr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),cr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),cr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(cr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},cr=[new W,new W,new W,new W,new W,new W,new W,new W],lr=new W,ur=new sr,dr=new W,fr=new W,pr=new W,mr=new W,hr=new W,gr=new W,_r=new W,vr=new W,yr=new W,br=new W;function xr(e,t,n,r,a){for(let o=0,s=e.length-3;o<=s;o+=3){br.fromArray(e,o);let s=a.x*Math.abs(br.x)+a.y*Math.abs(br.y)+a.z*Math.abs(br.z),c=t.dot(br),l=n.dot(br),u=r.dot(br);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>s)return!1}return!0}var Sr=new W,Cr=new zt,wr=0,Tr=class extends At{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=_t,this.updateRanges=[],this.gpuType=le,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,a=this.itemSize;r<a;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Cr.fromBufferAttribute(this,t),Cr.applyMatrix3(e),this.setXY(t,Cr.x,Cr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyMatrix3(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyMatrix4(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.applyNormalMatrix(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Sr.fromBufferAttribute(this,t),Sr.transformDirection(e),this.setXYZ(t,Sr.x,Sr.y,Sr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Lt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Rt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Lt(t,this.array)),t}setX(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Lt(t,this.array)),t}setY(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Lt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Lt(t,this.array)),t}setW(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),r=Rt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,a){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),r=Rt(r,this.array),a=Rt(a,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:`dispose`})}},Er=class extends Tr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Dr=class extends Tr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Or=class extends Tr{constructor(e,t,n){super(new Float32Array(e),t,n)}},kr=new sr,Ar=new W,jr=new W,Mr=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?kr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,a=e.length;t<a;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ar.subVectors(e,this.center);let t=Ar.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ar,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(jr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ar.copy(e.center).add(jr)),this.expandByPoint(Ar.copy(e.center).sub(jr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Nr=0,Pr=new ln,Fr=new In,Ir=new W,Lr=new sr,Rr=new sr,zr=new W,Br=class e extends At{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nr++}),this.uuid=Pt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(yt(e)?Dr:Er)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Pr.makeRotationFromQuaternion(e),this.applyMatrix4(Pr),this}rotateX(e){return Pr.makeRotationX(e),this.applyMatrix4(Pr),this}rotateY(e){return Pr.makeRotationY(e),this.applyMatrix4(Pr),this}rotateZ(e){return Pr.makeRotationZ(e),this.applyMatrix4(Pr),this}translate(e,t,n){return Pr.makeTranslation(e,t,n),this.applyMatrix4(Pr),this}scale(e,t,n){return Pr.makeScale(e,t,n),this.applyMatrix4(Pr),this}lookAt(e){return Fr.lookAt(e),Fr.updateMatrix(),this.applyMatrix4(Fr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ir).negate(),this.translate(Ir.x,Ir.y,Ir.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Or(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&V(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new sr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Lr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(this.boundingBox.min,Lr.min),this.boundingBox.expandByPoint(zr),zr.addVectors(this.boundingBox.max,Lr.max),this.boundingBox.expandByPoint(zr)):(this.boundingBox.expandByPoint(Lr.min),this.boundingBox.expandByPoint(Lr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&H(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);return}if(e){let n=this.boundingSphere.center;if(Lr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Rr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(Lr.min,Rr.min),Lr.expandByPoint(zr),zr.addVectors(Lr.max,Rr.max),Lr.expandByPoint(zr)):(Lr.expandByPoint(Rr.min),Lr.expandByPoint(Rr.max))}Lr.getCenter(n);let r=0;for(let t=0,a=e.count;t<a;t++)zr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(zr));if(t)for(let a=0,o=t.length;a<o;a++){let o=t[a],s=this.morphTargetsRelative;for(let t=0,a=o.count;t<a;t++)zr.fromBufferAttribute(o,t),s&&(Ir.fromBufferAttribute(e,t),zr.add(Ir)),r=Math.max(r,n.distanceToSquared(zr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&H(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){H(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,a=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Tr(new Float32Array(4*n.count),4));let o=this.getAttribute(`tangent`),s=[],c=[];for(let e=0;e<n.count;e++)s[e]=new W,c[e]=new W;let l=new W,u=new W,d=new W,f=new zt,p=new zt,m=new zt,h=new W,g=new W;function _(e,t,r){l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(a,e),p.fromBufferAttribute(a,t),m.fromBufferAttribute(a,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let o=1/(p.x*m.y-m.x*p.y);isFinite(o)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(o),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(o),s[e].add(h),s[t].add(h),s[r].add(h),c[e].add(g),c[t].add(g),c[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,a=n.count;for(let t=r,n=r+a;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new W,b=new W,x=new W,S=new W;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=s[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(c[e])<0?-1:1;o.setXYZW(e,y.x,y.y,y.z,n)}for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,a=n.count;for(let t=r,n=r+a;t<n;t+=3)C(e.getX(t+0)),C(e.getX(t+1)),C(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Tr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W,d=new W;if(e)for(let f=0,p=e.count;f<p;f+=3){let p=e.getX(f+0),m=e.getX(f+1),h=e.getX(f+2);r.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),o.fromBufferAttribute(t,h),u.subVectors(o,a),d.subVectors(r,a),u.cross(d),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),l.fromBufferAttribute(n,h),s.add(u),c.add(u),l.add(u),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z),n.setXYZ(h,l.x,l.y,l.z)}else for(let e=0,s=t.count;e<s;e+=3)r.fromBufferAttribute(t,e+0),a.fromBufferAttribute(t,e+1),o.fromBufferAttribute(t,e+2),u.subVectors(o,a),d.subVectors(r,a),u.cross(d),n.setXYZ(e+0,u.x,u.y,u.z),n.setXYZ(e+1,u.x,u.y,u.z),n.setXYZ(e+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zr.fromBufferAttribute(e,t),zr.normalize(),e.setXYZ(t,zr.x,zr.y,zr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,a=e.normalized,o=new n.constructor(t.length*r),s=0,c=0;for(let a=0,l=t.length;a<l;a++){s=e.isInterleavedBufferAttribute?t[a]*e.data.stride+e.offset:t[a]*r;for(let e=0;e<r;e++)o[c++]=n[s++]}return new Tr(o,r,a)}if(this.index===null)return V(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,a=this.attributes;for(let e in a){let o=a[e],s=t(o,r);n.setAttribute(e,s)}let o=this.morphAttributes;for(let e in o){let a=[],s=o[e];for(let e=0,n=s.length;e<n;e++){let n=s[e],o=t(n,r);a.push(o)}n.morphAttributes[e]=a}n.morphTargetsRelative=this.morphTargetsRelative;let s=this.groups;for(let e=0,t=s.length;e<t;e++){let t=s[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},a=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],o=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];o.push(r.toJSON(e.data))}o.length>0&&(r[t]=o,a=!0)}a&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let s=this.boundingSphere;return s!==null&&(e.data.boundingSphere=s.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let a=e.morphAttributes;for(let e in a){let n=[],r=a[e];for(let e=0,a=r.length;e<a;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];this.addGroup(t.start,t.count,t.materialIndex)}let s=e.boundingBox;s!==null&&(this.boundingBox=s.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Vr=0,Hr=class extends At{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Vr++}),this.uuid=Pt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new q(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gt,this.stencilZFail=gt,this.stencilZPass=gt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){V(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),a=r(e.images);t.length>0&&(n.textures=t),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Ur=new W,Wr=new W,Gr=new W,Kr=new W,qr=new W,Jr=new W,Yr=new W,Xr=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ur)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ur.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ur.copy(this.origin).addScaledVector(this.direction,t),Ur.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Wr.copy(e).add(t).multiplyScalar(.5),Gr.copy(t).sub(e).normalize(),Kr.copy(this.origin).sub(Wr);let a=e.distanceTo(t)*.5,o=-this.direction.dot(Gr),s=Kr.dot(this.direction),c=-Kr.dot(Gr),l=Kr.lengthSq(),u=Math.abs(1-o*o),d,f,p,m;if(u>0)if(d=o*c-s,f=o*s-c,m=a*u,d>=0)if(f>=-m)if(f<=m){let e=1/u;d*=e,f*=e,p=d*(d+o*f+2*s)+f*(o*d+f+2*c)+l}else f=a,d=Math.max(0,-(o*f+s)),p=-d*d+f*(f+2*c)+l;else f=-a,d=Math.max(0,-(o*f+s)),p=-d*d+f*(f+2*c)+l;else f<=-m?(d=Math.max(0,-(-o*a+s)),f=d>0?-a:Math.min(Math.max(-a,-c),a),p=-d*d+f*(f+2*c)+l):f<=m?(d=0,f=Math.min(Math.max(-a,-c),a),p=f*(f+2*c)+l):(d=Math.max(0,-(o*a+s)),f=d>0?a:Math.min(Math.max(-a,-c),a),p=-d*d+f*(f+2*c)+l);else f=o>0?-a:a,d=Math.max(0,-(o*f+s)),p=-d*d+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(Wr).addScaledVector(Gr,f),p}intersectSphere(e,t){Ur.subVectors(e.center,this.origin);let n=Ur.dot(this.direction),r=Ur.dot(Ur)-n*n,a=e.radius*e.radius;if(r>a)return null;let o=Math.sqrt(a-r),s=n-o,c=n+o;return c<0?null:s<0?this.at(c,t):this.at(s,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,a,o,s,c,l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,r=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,r=(e.min.x-f.x)*l),u>=0?(a=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(a=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),n>o||a>r||((a>n||isNaN(n))&&(n=a),(o<r||isNaN(r))&&(r=o),d>=0?(s=(e.min.z-f.z)*d,c=(e.max.z-f.z)*d):(s=(e.max.z-f.z)*d,c=(e.min.z-f.z)*d),n>c||s>r)||((s>n||n!==n)&&(n=s),(c<r||r!==r)&&(r=c),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Ur)!==null}intersectTriangle(e,t,n,r,a){qr.subVectors(t,e),Jr.subVectors(n,e),Yr.crossVectors(qr,Jr);let o=this.direction.dot(Yr),s;if(o>0){if(r)return null;s=1}else if(o<0)s=-1,o=-o;else return null;Kr.subVectors(this.origin,e);let c=s*this.direction.dot(Jr.crossVectors(Kr,Jr));if(c<0)return null;let l=s*this.direction.dot(qr.cross(Kr));if(l<0||c+l>o)return null;let u=-s*Kr.dot(Yr);return u<0?null:this.at(u/o,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Zr=class extends Hr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Qr=new ln,$r=new Xr,ei=new Mr,ti=new W,ni=new W,ri=new W,ii=new W,ai=new W,oi=new W,si=new W,ci=new W,li=class extends In{constructor(e=new Br,t=new Zr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,a=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let s=this.morphTargetInfluences;if(a&&s){oi.set(0,0,0);for(let n=0,r=a.length;n<r;n++){let r=s[n],c=a[n];r!==0&&(ai.fromBufferAttribute(c,e),o?oi.addScaledVector(ai,r):oi.addScaledVector(ai.sub(t),r))}t.add(oi)}return t}raycast(e,t){let n=this.geometry,r=this.material,a=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ei.copy(n.boundingSphere),ei.applyMatrix4(a),$r.copy(e.ray).recast(e.near),!(ei.containsPoint($r.origin)===!1&&($r.intersectSphere(ei,ti)===null||$r.origin.distanceToSquared(ti)>(e.far-e.near)**2))&&(Qr.copy(a).invert(),$r.copy(e.ray).applyMatrix4(Qr),!(n.boundingBox!==null&&$r.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,$r)))}_computeIntersections(e,t,n){let r,a=this.geometry,o=this.material,s=a.index,c=a.attributes.position,l=a.attributes.uv,u=a.attributes.uv1,d=a.attributes.normal,f=a.groups,p=a.drawRange;if(s!==null)if(Array.isArray(o))for(let a=0,c=f.length;a<c;a++){let c=f[a],m=o[c.materialIndex],h=Math.max(c.start,p.start),g=Math.min(s.count,Math.min(c.start+c.count,p.start+p.count));for(let a=h,o=g;a<o;a+=3){let o=s.getX(a),f=s.getX(a+1),p=s.getX(a+2);r=di(this,m,e,n,l,u,d,o,f,p),r&&(r.faceIndex=Math.floor(a/3),r.face.materialIndex=c.materialIndex,t.push(r))}}else{let a=Math.max(0,p.start),c=Math.min(s.count,p.start+p.count);for(let f=a,p=c;f<p;f+=3){let a=s.getX(f),c=s.getX(f+1),p=s.getX(f+2);r=di(this,o,e,n,l,u,d,a,c,p),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let a=0,s=f.length;a<s;a++){let s=f[a],m=o[s.materialIndex],h=Math.max(s.start,p.start),g=Math.min(c.count,Math.min(s.start+s.count,p.start+p.count));for(let a=h,o=g;a<o;a+=3){let o=a,c=a+1,f=a+2;r=di(this,m,e,n,l,u,d,o,c,f),r&&(r.faceIndex=Math.floor(a/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let a=Math.max(0,p.start),s=Math.min(c.count,p.start+p.count);for(let c=a,f=s;c<f;c+=3){let a=c,s=c+1,f=c+2;r=di(this,o,e,n,l,u,d,a,s,f),r&&(r.faceIndex=Math.floor(c/3),t.push(r))}}}};function ui(e,t,n,r,a,o,s,c){let l;if(l=t.side===1?r.intersectTriangle(s,o,a,!0,c):r.intersectTriangle(a,o,s,t.side===0,c),l===null)return null;ci.copy(c),ci.applyMatrix4(e.matrixWorld);let u=n.ray.origin.distanceTo(ci);return u<n.near||u>n.far?null:{distance:u,point:ci.clone(),object:e}}function di(e,t,n,r,a,o,s,c,l,u){e.getVertexPosition(c,ni),e.getVertexPosition(l,ri),e.getVertexPosition(u,ii);let d=ui(e,t,n,r,ni,ri,ii,si);if(d){let e=new W;or.getBarycoord(si,ni,ri,ii,e),a&&(d.uv=or.getInterpolatedAttribute(a,c,l,u,e,new zt)),o&&(d.uv1=or.getInterpolatedAttribute(o,c,l,u,e,new zt)),s&&(d.normal=or.getInterpolatedAttribute(s,c,l,u,e,new W),d.normal.dot(r.direction)>0&&d.normal.multiplyScalar(-1));let t={a:c,b:l,c:u,normal:new W,materialIndex:0};or.getNormal(ni,ri,ii,t.normal),d.face=t,d.barycoord=e}return d}var fi=class extends nn{constructor(e=null,t=1,n=1,r,a,o,s,c,l=N,u=N,d,f){super(null,o,s,c,l,u,r,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},pi=new W,mi=new W,hi=new G,gi=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=pi.subVectors(n,t).cross(mi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(pi),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/a;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||hi.getNormalMatrix(e),r=this.coplanarPoint(pi).applyMatrix4(e),a=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},_i=new Mr,vi=new zt(.5,.5),yi=new W,bi=class{constructor(e=new gi,t=new gi,n=new gi,r=new gi,a=new gi,o=new gi){this.planes=[e,t,n,r,a,o]}set(e,t,n,r,a,o){let s=this.planes;return s[0].copy(e),s[1].copy(t),s[2].copy(n),s[3].copy(r),s[4].copy(a),s[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vt,n=!1){let r=this.planes,a=e.elements,o=a[0],s=a[1],c=a[2],l=a[3],u=a[4],d=a[5],f=a[6],p=a[7],m=a[8],h=a[9],g=a[10],_=a[11],v=a[12],y=a[13],b=a[14],x=a[15];if(r[0].setComponents(l-o,p-u,_-m,x-v).normalize(),r[1].setComponents(l+o,p+u,_+m,x+v).normalize(),r[2].setComponents(l+s,p+d,_+h,x+y).normalize(),r[3].setComponents(l-s,p-d,_-h,x-y).normalize(),n)r[4].setComponents(c,f,g,b).normalize(),r[5].setComponents(l-c,p-f,_-g,x-b).normalize();else if(r[4].setComponents(l-c,p-f,_-g,x-b).normalize(),t===2e3)r[5].setComponents(l+c,p+f,_+g,x+b).normalize();else if(t===2001)r[5].setComponents(c,f,g,b).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(e){return _i.center.set(0,0,0),_i.radius=.7071067811865476+vi.distanceTo(e.center),_i.applyMatrix4(e.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(yi.x=r.normal.x>0?e.max.x:e.min.x,yi.y=r.normal.y>0?e.max.y:e.min.y,yi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(yi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},xi=class extends Hr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new q(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Si=new W,Ci=new W,wi=new ln,Ti=new Xr,Ei=new Mr,J=new W,Di=new W,Oi=class extends In{constructor(e=new Br,t=new xi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Si.fromBufferAttribute(t,e-1),Ci.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Si.distanceTo(Ci);e.setAttribute(`lineDistance`,new Or(n,1))}else V(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,a=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ei.copy(n.boundingSphere),Ei.applyMatrix4(r),Ei.radius+=a,e.ray.intersectsSphere(Ei)===!1)return;wi.copy(r).invert(),Ti.copy(e.ray).applyMatrix4(wi);let s=a/((this.scale.x+this.scale.y+this.scale.z)/3),c=s*s,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let n=Math.max(0,o.start),r=Math.min(u.count,o.start+o.count);for(let a=n,o=r-1;a<o;a+=l){let n=u.getX(a),r=u.getX(a+1),o=ki(this,e,Ti,c,n,r,a);o&&t.push(o)}if(this.isLineLoop){let a=u.getX(r-1),o=u.getX(n),s=ki(this,e,Ti,c,a,o,r-1);s&&t.push(s)}}else{let n=Math.max(0,o.start),r=Math.min(d.count,o.start+o.count);for(let a=n,o=r-1;a<o;a+=l){let n=ki(this,e,Ti,c,a,a+1,a);n&&t.push(n)}if(this.isLineLoop){let a=ki(this,e,Ti,c,r-1,n,r-1);a&&t.push(a)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ki(e,t,n,r,a,o,s){let c=e.geometry.attributes.position;if(Si.fromBufferAttribute(c,a),Ci.fromBufferAttribute(c,o),n.distanceSqToSegment(Si,Ci,J,Di)>r)return;J.applyMatrix4(e.matrixWorld);let l=t.ray.origin.distanceTo(J);if(!(l<t.near||l>t.far))return{distance:l,point:Di.clone().applyMatrix4(e.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:e}}var Ai=new W,ji=new W,Mi=class extends Oi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Ai.fromBufferAttribute(t,e),ji.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Ai.distanceTo(ji);e.setAttribute(`lineDistance`,new Or(n,1))}else V(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Ni=class extends nn{constructor(e=[],t=301,n,r,a,o,s,c,l,u){super(e,t,n,r,a,o,s,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Pi=class extends nn{constructor(e,t,n=ce,r,a,o,s=N,c=N,l,u=ye,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Qt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Fi=class extends Pi{constructor(e,t=ce,n=301,r,a,o=N,s=N,c,l=ye){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ii=class extends nn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Li=class e extends Br{constructor(e=1,t=1,n=1,r=1,a=1,o=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:a,depthSegments:o};let s=this;r=Math.floor(r),a=Math.floor(a),o=Math.floor(o);let c=[],l=[],u=[],d=[],f=0,p=0;m(`z`,`y`,`x`,-1,-1,n,t,e,o,a,0),m(`z`,`y`,`x`,1,-1,n,t,-e,o,a,1),m(`x`,`z`,`y`,1,1,e,n,t,r,o,2),m(`x`,`z`,`y`,1,-1,e,n,-t,r,o,3),m(`x`,`y`,`z`,1,-1,e,t,n,r,a,4),m(`x`,`y`,`z`,-1,-1,e,t,-n,r,a,5),this.setIndex(c),this.setAttribute(`position`,new Or(l,3)),this.setAttribute(`normal`,new Or(u,3)),this.setAttribute(`uv`,new Or(d,2));function m(e,t,n,r,a,o,m,h,g,_,v){let y=o/g,b=m/_,x=o/2,S=m/2,C=h/2,w=g+1,T=_+1,E=0,D=0,O=new W;for(let o=0;o<T;o++){let s=o*b-S;for(let c=0;c<w;c++)O[e]=(c*y-x)*r,O[t]=s*a,O[n]=C,l.push(O.x,O.y,O.z),O[e]=0,O[t]=0,O[n]=h>0?1:-1,u.push(O.x,O.y,O.z),d.push(c/g),d.push(1-o/_),E+=1}for(let e=0;e<_;e++)for(let t=0;t<g;t++){let n=f+t+w*e,r=f+t+w*(e+1),a=f+(t+1)+w*(e+1),o=f+(t+1)+w*e;c.push(n,r,o),c.push(r,a,o),D+=6}s.addGroup(p,D,v),p+=D,f+=E}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ri=class e extends Br{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let a=[],o=[],s=[],c=[],l=new W,u=new zt;o.push(0,0,0),s.push(0,0,1),c.push(.5,.5);for(let a=0,d=3;a<=t;a++,d+=3){let f=n+a/t*r;l.x=e*Math.cos(f),l.y=e*Math.sin(f),o.push(l.x,l.y,l.z),s.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,c.push(u.x,u.y)}for(let e=1;e<=t;e++)a.push(e,e+1,0);this.setIndex(a),this.setAttribute(`position`,new Or(o,3)),this.setAttribute(`normal`,new Or(s,3)),this.setAttribute(`uv`,new Or(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},zi=class e extends Br{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let a=e/2,o=t/2,s=Math.floor(n),c=Math.floor(r),l=s+1,u=c+1,d=e/s,f=t/c,p=[],m=[],h=[],g=[];for(let e=0;e<u;e++){let t=e*f-o;for(let n=0;n<l;n++){let r=n*d-a;m.push(r,-t,0),h.push(0,0,1),g.push(n/s),g.push(1-e/c)}}for(let e=0;e<c;e++)for(let t=0;t<s;t++){let n=t+l*e,r=t+l*(e+1),a=t+1+l*(e+1),o=t+1+l*e;p.push(n,r,o),p.push(r,a,o)}this.setIndex(p),this.setAttribute(`position`,new Or(m,3)),this.setAttribute(`normal`,new Or(h,3)),this.setAttribute(`uv`,new Or(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Bi=class e extends Br{constructor(e=.5,t=1,n=32,r=1,a=0,o=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:a,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);let s=[],c=[],l=[],u=[],d=e,f=(t-e)/r,p=new W,m=new zt;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=a+e/n*o;p.x=d*Math.cos(r),p.y=d*Math.sin(r),c.push(p.x,p.y,p.z),l.push(0,0,1),m.x=(p.x/t+1)/2,m.y=(p.y/t+1)/2,u.push(m.x,m.y)}d+=f}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,a=r,o=r+n+1,c=r+n+2,l=r+1;s.push(a,o,l),s.push(o,c,l)}}this.setIndex(s),this.setAttribute(`position`,new Or(c,3)),this.setAttribute(`normal`,new Or(l,3)),this.setAttribute(`uv`,new Or(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Vi=class e extends Br{constructor(e=1,t=32,n=16,r=0,a=Math.PI*2,o=0,s=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:a,thetaStart:o,thetaLength:s},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+s,Math.PI),l=0,u=[],d=new W,f=new W,p=[],m=[],h=[],g=[];for(let p=0;p<=n;p++){let _=[],v=p/n,y=0;p===0&&o===0?y=.5/t:p===n&&c===Math.PI&&(y=-.5/t);for(let n=0;n<=t;n++){let c=n/t;d.x=-e*Math.cos(r+c*a)*Math.sin(o+v*s),d.y=e*Math.cos(o+v*s),d.z=e*Math.sin(r+c*a)*Math.sin(o+v*s),m.push(d.x,d.y,d.z),f.copy(d).normalize(),h.push(f.x,f.y,f.z),g.push(c+y,1-v),_.push(l++)}u.push(_)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=u[e][r+1],a=u[e][r],s=u[e+1][r],l=u[e+1][r+1];(e!==0||o>0)&&p.push(t,a,l),(e!==n-1||c<Math.PI)&&p.push(a,s,l)}this.setIndex(p),this.setAttribute(`position`,new Or(m,3)),this.setAttribute(`normal`,new Or(h,3)),this.setAttribute(`uv`,new Or(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Hi(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let a=e[n][r];if(Wi(a))a.isRenderTargetTexture?(V(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=a.clone();else if(Array.isArray(a))if(Wi(a[0])){let e=[];for(let t=0,n=a.length;t<n;t++)e[t]=a[t].clone();t[n][r]=e}else t[n][r]=a.slice();else t[n][r]=a}}return t}function Ui(e){let t={};for(let n=0;n<e.length;n++){let r=Hi(e[n]);for(let e in r)t[e]=r[e]}return t}function Wi(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Gi(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Ki(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:K.workingColorSpace}var qi={clone:Hi,merge:Ui},Ji=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yi=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Xi=class extends Hr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ji,this.fragmentShader=Yi,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hi(e.uniforms),this.uniformsGroups=Gi(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Zi=class extends Xi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Qi=class extends Hr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=dt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},$i=class extends Hr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ea(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}var ta=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],a=t[n-1];validate_interval:{seek:{let o;linear_scan:{forward_scan:if(!(e<r)){for(let o=n+2;;){if(r===void 0){if(e<a)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(a=r,r=t[++n],e<r)break seek}o=t.length;break linear_scan}if(!(e>=a)){let s=t[1];e<s&&(n=2,a=s);for(let o=n-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(r=a,a=t[--n-1],e>=a)break seek}o=n,n=0;break linear_scan}break validate_interval}for(;n<o;){let r=n+o>>>1;e<t[r]?o=r:n=r+1}if(r=t[n],a=t[n-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,a,r)}return this.interpolate_(n,a,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,a=e*r;for(let e=0;e!==r;++e)t[e]=n[a+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},na=class extends ta{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ct,endingEnd:ct}}intervalChanged_(e,t,n){let r=this.parameterPositions,a=e-2,o=e+1,s=r[a],c=r[o];if(s===void 0)switch(this.getSettings_().endingStart){case lt:a=e,s=2*t-n;break;case ut:a=r.length-2,s=t+r[a]-r[a+1];break;default:a=e,s=n}if(c===void 0)switch(this.getSettings_().endingEnd){case lt:o=e,c=2*n-t;break;case ut:o=1,c=n+r[1]-r[0];break;default:o=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-s),this._weightNext=l/(c-n),this._offsetPrev=a*u,this._offsetNext=o*u}interpolate_(e,t,n,r){let a=this.resultBuffer,o=this.sampleValues,s=this.valueSize,c=e*s,l=c-s,u=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,p=this._weightNext,m=(n-t)/(r-t),h=m*m,g=h*m,_=-f*g+2*f*h-f*m,v=(1+f)*g+(-1.5-2*f)*h+(-.5+f)*m+1,y=(-1-p)*g+(1.5+p)*h+.5*m,b=p*g-p*h;for(let e=0;e!==s;++e)a[e]=_*o[u+e]+v*o[l+e]+y*o[c+e]+b*o[d+e];return a}},ra=class extends ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let a=this.resultBuffer,o=this.sampleValues,s=this.valueSize,c=e*s,l=c-s,u=(n-t)/(r-t),d=1-u;for(let e=0;e!==s;++e)a[e]=o[l+e]*d+o[c+e]*u;return a}},ia=class extends ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},aa=class extends ta{interpolate_(e,t,n,r){let a=this.resultBuffer,o=this.sampleValues,s=this.valueSize,c=e*s,l=c-s,u=this.settings||this.DefaultSettings_,d=u.inTangents,f=u.outTangents;if(!d||!f){let e=(n-t)/(r-t),u=1-e;for(let t=0;t!==s;++t)a[t]=o[l+t]*u+o[c+t]*e;return a}let p=s*2,m=e-1;for(let u=0;u!==s;++u){let s=o[l+u],h=o[c+u],g=m*p+u*2,_=f[g],v=f[g+1],y=e*p+u*2,b=d[y],x=d[y+1],S=(n-t)/(r-t),C,w,T,E,D;for(let e=0;e<8;e++){C=S*S,w=C*S,T=1-S,E=T*T,D=E*T;let e=D*t+3*E*S*_+3*T*C*b+w*r-n;if(Math.abs(e)<1e-10)break;let a=3*E*(_-t)+6*T*S*(b-_)+3*C*(r-b);if(Math.abs(a)<1e-10)break;S-=e/a,S=Math.max(0,Math.min(1,S))}a[u]=D*s+3*E*S*v+3*T*C*x+w*h}return a}},oa=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=ea(t,this.TimeBufferType),this.values=ea(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ea(e.times,Array),values:ea(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ia(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ra(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new na(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new aa(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.settings=this.settings),t}setInterpolation(e){let t;switch(e){case it:t=this.InterpolantFactoryMethodDiscrete;break;case at:t=this.InterpolantFactoryMethodLinear;break;case ot:t=this.InterpolantFactoryMethodSmooth;break;case st:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t);return V(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return it;case this.InterpolantFactoryMethodLinear:return at;case this.InterpolantFactoryMethodSmooth:return ot;case this.InterpolantFactoryMethodBezier:return st}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,a=0,o=r-1;for(;a!==r&&n[a]<e;)++a;for(;o!==-1&&n[o]>t;)--o;if(++o,a!==0||o!==r){a>=o&&(o=Math.max(o,1),a=o-1);let e=this.getValueSize();this.times=n.slice(a,o),this.values=this.values.slice(a*e,o*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(H(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,a=n.length;a===0&&(H(`KeyframeTrack: Track is empty.`,this),e=!1);let o=null;for(let t=0;t!==a;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){H(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(o!==null&&o>r){H(`KeyframeTrack: Out of order keys.`,this,t,r,o),e=!1;break}o=r}if(r!==void 0&&bt(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){H(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ot,a=e.length-1,o=1;for(let s=1;s<a;++s){let a=!1,c=e[s];if(c!==e[s+1]&&(s!==1||c!==e[0]))if(r)a=!0;else{let e=s*n,r=e-n,o=e+n;for(let s=0;s!==n;++s){let n=t[e+s];if(n!==t[r+s]||n!==t[o+s]){a=!0;break}}}if(a){if(s!==o){e[o]=e[s];let r=s*n,a=o*n;for(let e=0;e!==n;++e)t[a+e]=t[r+e]}++o}}if(a>0){e[o]=e[a];for(let e=a*n,r=o*n,s=0;s!==n;++s)t[r+s]=t[e+s];++o}return o===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,o),this.values=t.slice(0,o*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};oa.prototype.ValueTypeName=``,oa.prototype.TimeBufferType=Float32Array,oa.prototype.ValueBufferType=Float32Array,oa.prototype.DefaultInterpolation=at;var sa=class extends oa{constructor(e,t,n){super(e,t,n)}};sa.prototype.ValueTypeName=`bool`,sa.prototype.ValueBufferType=Array,sa.prototype.DefaultInterpolation=it,sa.prototype.InterpolantFactoryMethodLinear=void 0,sa.prototype.InterpolantFactoryMethodSmooth=void 0;var ca=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};ca.prototype.ValueTypeName=`color`;var la=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};la.prototype.ValueTypeName=`number`;var ua=class extends ta{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let a=this.resultBuffer,o=this.sampleValues,s=this.valueSize,c=(n-t)/(r-t),l=e*s;for(let e=l+s;l!==e;l+=4)Bt.slerpFlat(a,0,o,l-s,o,l,c);return a}},da=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ua(this.times,this.values,this.getValueSize(),e)}};da.prototype.ValueTypeName=`quaternion`,da.prototype.InterpolantFactoryMethodSmooth=void 0;var fa=class extends oa{constructor(e,t,n){super(e,t,n)}};fa.prototype.ValueTypeName=`string`,fa.prototype.ValueBufferType=Array,fa.prototype.DefaultInterpolation=it,fa.prototype.InterpolantFactoryMethodLinear=void 0,fa.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends oa{constructor(e,t,n,r){super(e,t,n,r)}};pa.prototype.ValueTypeName=`vector`;var ma=new class{constructor(e,t,n){let r=this,a=!1,o=0,s=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){s++,a===!1&&r.onStart!==void 0&&r.onStart(e,o,s),a=!0},this.itemEnd=function(e){o++,r.onProgress!==void 0&&r.onProgress(e,o,s),o===s&&(a=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return c?c(e):e},this.setURLModifier=function(e){return c=e,this},this.addHandler=function(e,t){return l.push(e,t),this},this.removeHandler=function(e){let t=l.indexOf(e);return t!==-1&&l.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=l.length;t<n;t+=2){let n=l[t],r=l[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},ha=class{constructor(e){this.manager=e===void 0?ma:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,a){n.load(e,r,t,a)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ha.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var ga=new W,_a=new Bt,va=new W,ya=class extends In{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new ln,this.projectionMatrix=new ln,this.projectionMatrixInverse=new ln,this.coordinateSystem=vt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ga,_a,va),va.x===1&&va.y===1&&va.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ga,_a,va.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(ga,_a,va),va.x===1&&va.y===1&&va.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ga,_a,va.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ba=new W,xa=new zt,Sa=new zt,Ca=class extends ya{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Nt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Mt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Nt*2*Math.atan(Math.tan(Mt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ba.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ba.x,ba.y).multiplyScalar(-e/ba.z),ba.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ba.x,ba.y).multiplyScalar(-e/ba.z)}getViewSize(e,t){return this.getViewBounds(e,xa,Sa),t.subVectors(Sa,xa)}setViewOffset(e,t,n,r,a,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Mt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,a=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let e=o.fullWidth,s=o.fullHeight;a+=o.offsetX*r/e,t-=o.offsetY*n/s,r*=o.width/e,n*=o.height/s}let s=this.filmOffset;s!==0&&(a+=e*s/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},wa=class extends ya{constructor(e=-1,t=1,n=1,r=-1,a=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=a,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,a,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,a=n-e,o=n+e,s=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=e*this.view.offsetX,o=a+e*this.view.width,s-=t*this.view.offsetY,c=s-t*this.view.height}this.projectionMatrix.makeOrthographic(a,o,s,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ta=-90,Ea=1,Da=class extends In{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Ca(Ta,Ea,e,t);r.layers=this.layers,this.add(r);let a=new Ca(Ta,Ea,e,t);a.layers=this.layers,this.add(a);let o=new Ca(Ta,Ea,e,t);o.layers=this.layers,this.add(o);let s=new Ca(Ta,Ea,e,t);s.layers=this.layers,this.add(s);let c=new Ca(Ta,Ea,e,t);c.layers=this.layers,this.add(c);let l=new Ca(Ta,Ea,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,a,o,s,c]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),s.up.set(0,1,0),s.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),s.up.set(0,-1,0),s.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[a,o,s,c,l,u]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let h=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;g=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,1,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,3,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=h,e.setRenderTarget(n,5,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,f,p),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},Oa=class extends Ca{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},ka=`\\[\\]\\.:\\/`,Aa=RegExp(`[\\[\\]\\.:\\/]`,`g`),ja=`[^\\[\\]\\.:\\/]`,Ma=`[^`+ka.replace(`\\.`,``)+`]`,Na=`((?:WC+[\\/:])*)`.replace(`WC`,ja),Pa=`(WCOD+)?`.replace(`WCOD`,Ma),Fa=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ja),Ia=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ja),La=RegExp(`^`+Na+Pa+Fa+Ia+`$`),Ra=[`material`,`materials`,`bones`,`map`],za=class{constructor(e,t,n){let r=n||Ba.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,a=n.length;r!==a;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ba=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Aa,``)}static parseTrackName(e){let t=La.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ra.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let a=e[r];if(a.name===t||a.uuid===t)return a;let o=n(a.children);if(o)return o}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,a=n.length;r!==a;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,a=n.length;r!==a;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,a=n.length;r!==a;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,a=n.length;r!==a;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,a=n.propertyName,o=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){V(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){H(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){H(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){H(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){H(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){H(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let s=t[a];if(s===void 0){let e=n.nodeName;H(`PropertyBinding: Trying to update property for track: `+e+`.`+a+` but it wasn't found.`,t);return}let c=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?c=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(o!==void 0){if(a===`morphTargetInfluences`){if(!t.geometry){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[o]!==void 0&&(o=t.morphTargetDictionary[o])}l=this.BindingType.ArrayElement,this.resolvedProperty=s,this.propertyIndex=o}else s.fromArray!==void 0&&s.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=s):Array.isArray(s)?(l=this.BindingType.EntireArray,this.resolvedProperty=s):this.propertyName=a;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ba.Composite=za,Ba.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ba.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ba.prototype.GetterByBindingType=[Ba.prototype._getValue_direct,Ba.prototype._getValue_array,Ba.prototype._getValue_arrayElement,Ba.prototype._getValue_toArray],Ba.prototype.SetterByBindingTypeAndVersioning=[[Ba.prototype._setValue_direct,Ba.prototype._setValue_direct_setNeedsUpdate,Ba.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ba.prototype._setValue_array,Ba.prototype._setValue_array_setNeedsUpdate,Ba.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ba.prototype._setValue_arrayElement,Ba.prototype._setValue_arrayElement_setNeedsUpdate,Ba.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ba.prototype._setValue_fromArray,Ba.prototype._setValue_fromArray_setNeedsUpdate,Ba.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let a=this.elements;return a[0]=e,a[2]=t,a[1]=n,a[3]=r,this}};var Va=class extends Mi{constructor(e=10,t=10,n=4473924,r=8947848){n=new q(n),r=new q(r);let a=t/2,o=e/t,s=e/2,c=[],l=[];for(let e=0,u=0,d=-s;e<=t;e++,d+=o){c.push(-s,0,d,s,0,d),c.push(d,0,-s,d,0,s);let t=e===a?n:r;t.toArray(l,u),u+=3,t.toArray(l,u),u+=3,t.toArray(l,u),u+=3,t.toArray(l,u),u+=3}let u=new Br;u.setAttribute(`position`,new Or(c,3)),u.setAttribute(`color`,new Or(l,3));let d=new xi({vertexColors:!0,toneMapped:!1});super(u,d),this.type=`GridHelper`}dispose(){this.geometry.dispose(),this.material.dispose()}};function Ha(e,t,n,r){let a=Ua(r);switch(n){case ge:return e*t;case xe:return e*t/a.components*a.byteLength;case Se:return e*t/a.components*a.byteLength;case Ce:return e*t*2/a.components*a.byteLength;case we:return e*t*2/a.components*a.byteLength;case _e:return e*t*3/a.components*a.byteLength;case ve:return e*t*4/a.components*a.byteLength;case Te:return e*t*4/a.components*a.byteLength;case Ee:case De:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Oe:case ke:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ae:case Me:return Math.max(e,16)*Math.max(t,8)/4;case L:case je:return Math.max(e,8)*Math.max(t,8)/2;case R:case Ne:case B:case Pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case z:case Fe:case Ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Le:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Re:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ze:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Be:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Ve:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case He:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Ue:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case We:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Ge:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Ke:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case qe:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Je:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ye:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Xe:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Ze:case Qe:case $e:return Math.ceil(e/4)*Math.ceil(t/4)*16;case et:case tt:return Math.ceil(e/4)*Math.ceil(t/4)*8;case nt:case rt:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ua(e){switch(e){case ie:case ae:return{byteLength:1,components:1};case se:case oe:case ue:return{byteLength:2,components:1};case de:case fe:return{byteLength:2,components:4};case ce:case I:case le:return{byteLength:4,components:1};case me:case he:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`184`}})),typeof window<`u`&&(window.__THREE__?V(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`184`);function Wa(){let e=null,t=!1,n=null,r=null;function a(t,o){n(t,o),r=e.requestAnimationFrame(a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(a),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ga(e){let t=new WeakMap;function n(t,n){let r=t.array,a=t.usage,o=r.byteLength,s=e.createBuffer();e.bindBuffer(n,s),e.bufferData(n,r,a),t.onUploadCallback();let c;if(r instanceof Float32Array)c=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)c=e.HALF_FLOAT;else if(r instanceof Uint16Array)c=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)c=e.SHORT;else if(r instanceof Uint32Array)c=e.UNSIGNED_INT;else if(r instanceof Int32Array)c=e.INT;else if(r instanceof Int8Array)c=e.BYTE;else if(r instanceof Uint8Array)c=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)c=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:s,type:c,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:o}}function r(t,n,r){let a=n.array,o=n.updateRanges;if(e.bindBuffer(r,t),o.length===0)e.bufferSubData(r,0,a);else{o.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<o.length;e++){let n=o[t],r=o[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,o[t]=r)}o.length=t+1;for(let t=0,n=o.length;t<n;t++){let n=o[t];e.bufferSubData(r,n.start*a.BYTES_PER_ELEMENT,a,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function a(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function o(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function s(e,a){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let o=t.get(e);if(o===void 0)t.set(e,n(e,a));else if(o.version<e.version){if(o.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(o.buffer,e,a),o.version=e.version}}return{get:a,remove:o,update:s}}var Y={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},X={common:{diffuse:{value:new q(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new zt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new q(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new q(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new q(16777215)},opacity:{value:1},center:{value:new zt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},Ka={basic:{uniforms:Ui([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:Ui([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new q(0)},envMapIntensity:{value:1}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:Ui([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new q(0)},specular:{value:new q(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:Ui([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new q(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:Ui([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new q(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:Ui([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:Ui([X.points,X.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:Ui([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:Ui([X.common,X.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:Ui([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:Ui([X.sprite,X.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distance:{uniforms:Ui([X.common,X.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distance_vert,fragmentShader:Y.distance_frag},shadow:{uniforms:Ui([X.lights,X.fog,{color:{value:new q(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};Ka.physical={uniforms:Ui([Ka.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new zt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new q(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new zt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new q(0)},specularColor:{value:new q(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new zt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var qa={r:0,b:0,g:0},Ja=new ln,Ya=new G;Ya.set(-1,0,0,0,1,0,0,0,1);function Xa(e,t,n,r,a,o){let s=new q(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function h(t){let r=!1,a=m(t);a===null?_(s,c):a&&a.isColor&&(_(a,1),r=!0);let l=e.xr.getEnvironmentBlendMode();l===`additive`?n.buffers.color.setClear(0,0,0,1,o):l===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,o),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let a=m(n);a&&(a.isCubeTexture||a.mapping===306)?(u===void 0&&(u=new li(new Li(1,1,1),new Xi({name:`BackgroundCubeMaterial`,uniforms:Hi(Ka.backgroundCube.uniforms),vertexShader:Ka.backgroundCube.vertexShader,fragmentShader:Ka.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=a,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ja.makeRotationFromEuler(n.backgroundRotation)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(Ya),u.material.toneMapped=K.getTransfer(a.colorSpace)!==ht,(d!==a||f!==a.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=a,f=a.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):a&&a.isTexture&&(l===void 0&&(l=new li(new zi(2,2),new Xi({name:`BackgroundMaterial`,uniforms:Hi(Ka.background.uniforms),vertexShader:Ka.background.vertexShader,fragmentShader:Ka.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=a,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=K.getTransfer(a.colorSpace)!==ht,a.matrixAutoUpdate===!0&&a.updateMatrix(),l.material.uniforms.uvTransform.value.copy(a.matrix),(d!==a||f!==a.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=a,f=a.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,r){t.getRGB(qa,Ki(e)),n.buffers.color.setClear(qa.r,qa.g,qa.b,r,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Za(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},a=p(null),o=a,s=!1;function c(n,r,a,c,l){let d=!1,p=f(n,c,a,r);o!==p&&(o=p,u(o.object)),d=m(n,c,a,l),d&&h(n,c,a,l),l!==null&&t.update(l,e.ELEMENT_ARRAY_BUFFER),(d||s)&&(s=!1,x(n,r,a,c),l!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(l).buffer))}function l(){return e.createVertexArray()}function u(t){return e.bindVertexArray(t)}function d(t){return e.deleteVertexArray(t)}function f(e,t,n,a){let o=a.wireframe===!0,s=r[t.id];s===void 0&&(s={},r[t.id]=s);let c=e.isInstancedMesh===!0?e.id:0,u=s[c];u===void 0&&(u={},s[c]=u);let d=u[n.id];d===void 0&&(d={},u[n.id]=d);let f=d[o];return f===void 0&&(f=p(l()),d[o]=f),f}function p(e){let t=[],r=[],a=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,a[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:a,object:e,attributes:{},index:null}}function m(e,t,n,r){let a=o.attributes,s=t.attributes,c=0,l=n.getAttributes();for(let t in l)if(l[t].location>=0){let n=a[t],r=s[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;c++}return o.attributesNum!==c||o.index!==r}function h(e,t,n,r){let a={},s=t.attributes,c=0,l=n.getAttributes();for(let t in l)if(l[t].location>=0){let n=s[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),a[t]=r,c++}o.attributes=a,o.attributesNum=c,o.index=r}function g(){let e=o.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function _(e){v(e,0)}function v(t,n){let r=o.newAttributes,a=o.enabledAttributes,s=o.attributeDivisors;r[t]=1,a[t]===0&&(e.enableVertexAttribArray(t),a[t]=1),s[t]!==n&&(e.vertexAttribDivisor(t,n),s[t]=n)}function y(){let t=o.newAttributes,n=o.enabledAttributes;for(let r=0,a=n.length;r<a;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function b(t,n,r,a,o,s,c){c===!0?e.vertexAttribIPointer(t,n,r,o,s):e.vertexAttribPointer(t,n,r,a,o,s)}function x(n,r,a,o){g();let s=o.attributes,c=a.getAttributes(),l=r.defaultAttributeValues;for(let r in c){let a=c[r];if(a.location>=0){let c=s[r];if(c===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(c=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(c=n.instanceColor)),c!==void 0){let r=c.normalized,s=c.itemSize,l=t.get(c);if(l===void 0)continue;let u=l.buffer,d=l.type,f=l.bytesPerElement,p=d===e.INT||d===e.UNSIGNED_INT||c.gpuType===1013;if(c.isInterleavedBufferAttribute){let t=c.data,l=t.stride,m=c.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<a.locationSize;e++)v(a.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&o._maxInstanceCount===void 0&&(o._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<a.locationSize;e++)_(a.location+e);e.bindBuffer(e.ARRAY_BUFFER,u);for(let e=0;e<a.locationSize;e++)b(a.location+e,s/a.locationSize,d,r,l*f,(m+s/a.locationSize*e)*f,p)}else{if(c.isInstancedBufferAttribute){for(let e=0;e<a.locationSize;e++)v(a.location+e,c.meshPerAttribute);n.isInstancedMesh!==!0&&o._maxInstanceCount===void 0&&(o._maxInstanceCount=c.meshPerAttribute*c.count)}else for(let e=0;e<a.locationSize;e++)_(a.location+e);e.bindBuffer(e.ARRAY_BUFFER,u);for(let e=0;e<a.locationSize;e++)b(a.location+e,s/a.locationSize,d,r,s*f,s/a.locationSize*e*f,p)}}else if(l!==void 0){let t=l[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(a.location,t);break;case 3:e.vertexAttrib3fv(a.location,t);break;case 4:e.vertexAttrib4fv(a.location,t);break;default:e.vertexAttrib1fv(a.location,t)}}}}y()}function S(){E();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)d(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function C(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)d(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function w(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let a=r[e.id];for(let e in a)d(a[e].object),delete a[e];delete r[e.id]}}}function T(e){for(let t in r){let n=r[t],a=e.isInstancedMesh===!0?e.id:0,o=n[a];if(o!==void 0){for(let e in o){let t=o[e];for(let e in t)d(t[e].object),delete t[e];delete o[e]}delete n[a],Object.keys(n).length===0&&delete r[t]}}}function E(){D(),s=!0,o!==a&&(o=a,u(o.object))}function D(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:c,reset:E,resetDefaultState:D,dispose:S,releaseStatesOfGeometry:C,releaseStatesOfObject:T,releaseStatesOfProgram:w,initAttributes:g,enableAttribute:_,disableUnusedAttributes:y}}function Qa(e,t,n){let r;function a(e){r=e}function o(t,a){e.drawArrays(r,t,a),n.update(a,r,1)}function s(t,a,o){o!==0&&(e.drawArraysInstanced(r,t,a,o),n.update(a,r,o))}function c(e,a,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,a,0,o);let s=0;for(let e=0;e<o;e++)s+=a[e];n.update(s,r,1)}this.setMode=a,this.render=o,this.renderInstances=s,this.renderMultiDraw=c}function $a(e,t,n,r){let a;function o(){if(a!==void 0)return a;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);a=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function s(t){return!(t!==1023&&r.convert(t)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function c(n){let a=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!a)}function l(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let u=n.precision===void 0?`highp`:n.precision,d=l(u);d!==u&&(V(`WebGLRenderer:`,u,`not supported, using`,d,`instead.`),u=d);let f=n.logarithmicDepthBuffer===!0,p=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&p===!1&&V(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let m=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_TEXTURE_SIZE),_=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),v=e.getParameter(e.MAX_VERTEX_ATTRIBS),y=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),b=e.getParameter(e.MAX_VARYING_VECTORS),x=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),S=e.getParameter(e.MAX_SAMPLES),C=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:l,textureFormatReadable:s,textureTypeReadable:c,precision:u,logarithmicDepthBuffer:f,reversedDepthBuffer:p,maxTextures:m,maxVertexTextures:h,maxTextureSize:g,maxCubemapSize:_,maxAttributes:v,maxVertexUniforms:y,maxVaryings:b,maxFragmentUniforms:x,maxSamples:S,samples:C}}function eo(e){let t=this,n=null,r=0,a=!1,o=!1,s=new gi,c=new G,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||a;return a=t,r=e.length,n},this.beginShadows=function(){o=!0,d(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(e,t){n=d(e,t,0)},this.setState=function(t,s,c){let f=t.clippingPlanes,p=t.clipIntersection,m=t.clipShadows,h=e.get(t);if(!a||f===null||f.length===0||o&&!m)o?d(null):u();else{let e=o?0:r,t=e*4,a=h.clippingState||null;l.value=a,a=d(f,s,t,c);for(let e=0;e!==t;++e)a[e]=n[e];h.clippingState=a,this.numIntersection=p?this.numPlanes:0,this.numPlanes+=e}};function u(){l.value!==n&&(l.value=n,l.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function d(e,n,r,a){let o=e===null?0:e.length,u=null;if(o!==0){if(u=l.value,a!==!0||u===null){let t=r+o*4,a=n.matrixWorldInverse;c.getNormalMatrix(a),(u===null||u.length<t)&&(u=new Float32Array(t));for(let t=0,n=r;t!==o;++t,n+=4)s.copy(e[t]).applyMatrix4(a,c),s.normal.toArray(u,n),u[n+3]=s.constant}l.value=u,l.needsUpdate=!0}return t.numPlanes=o,t.numIntersection=0,u}}var to=4,no=[.125,.215,.35,.446,.526,.582],Z=20,ro=256,io=new wa,ao=new q,oo=null,so=0,co=0,lo=!1,uo=new W,fo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,a={}){let{size:o=256,position:s=uo}=a;oo=this._renderer.getRenderTarget(),so=this._renderer.getActiveCubeFace(),co=this._renderer.getActiveMipmapLevel(),lo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,r,c,s),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=yo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(oo,so,co),this._renderer.xr.enabled=lo,e.scissorTest=!1,ho(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),oo=this._renderer.getRenderTarget(),so=this._renderer.getActiveCubeFace(),co=this._renderer.getActiveMipmapLevel(),lo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:P,minFilter:P,generateMipmaps:!1,type:ue,format:ve,colorSpace:pt,depthBuffer:!1},r=mo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mo(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=po(r)),this._blurMaterial=_o(r,e,t),this._ggxMaterial=go(r,e,t)}return r}_compileMaterial(e){let t=new li(new Br,e);this._renderer.compile(t,io)}_sceneToCubeUV(e,t,n,r,a){let o=new Ca(90,1,t,n),s=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],l=this._renderer,u=l.autoClear,d=l.toneMapping;l.getClearColor(ao),l.toneMapping=0,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(r),l.clearDepth(),l.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new li(new Li,new Zr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let f=this._backgroundBox,p=f.material,m=!1,h=e.background;h?h.isColor&&(p.color.copy(h),e.background=null,m=!0):(p.color.copy(ao),m=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(o.up.set(0,s[t],0),o.position.set(a.x,a.y,a.z),o.lookAt(a.x+c[t],a.y,a.z)):n===1?(o.up.set(0,0,s[t]),o.position.set(a.x,a.y,a.z),o.lookAt(a.x,a.y+c[t],a.z)):(o.up.set(0,s[t],0),o.position.set(a.x,a.y,a.z),o.lookAt(a.x,a.y,a.z+c[t]));let u=this._cubeSize;ho(r,n*u,t>2?u:0,u,u),l.setRenderTarget(r),m&&l.render(f,o),l.render(e,o)}l.toneMapping=d,l.autoClear=u,e.background=h}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=yo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vo());let a=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=a;let s=a.uniforms;s.envMap.value=e;let c=this._cubeSize;ho(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,io)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,a=this._pingPongRenderTarget,o=this._ggxMaterial,s=this._lodMeshes[n];s.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-u*u)*(0+l*1.25),{_lodMax:f}=this,p=this._sizeLods[n],m=3*p*(n>f-to?n-f+to:0),h=4*(this._cubeSize-p);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=f-t,ho(a,m,h,3*p,2*p),r.setRenderTarget(a),r.render(s,io),c.envMap.value=a.texture,c.roughness.value=0,c.mipInt.value=f-n,ho(e,m,h,3*p,2*p),r.setRenderTarget(e),r.render(s,io)}_blur(e,t,n,r,a){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,`latitudinal`,a),this._halfBlur(o,e,n,n,r,`longitudinal`,a)}_halfBlur(e,t,n,r,a,o,s){let c=this._renderer,l=this._blurMaterial;o!==`latitudinal`&&o!==`longitudinal`&&H(`blur direction must be either latitudinal or longitudinal!`);let u=this._lodMeshes[r];u.material=l;let d=l.uniforms,f=this._sizeLods[n]-1,p=isFinite(a)?Math.PI/(2*f):2*Math.PI/(2*Z-1),m=a/p,h=isFinite(a)?1+Math.floor(3*m):Z;h>Z&&V(`sigmaRadians, ${a}, is too large and will clip, as it requested ${h} samples when the maximum is set to ${Z}`);let g=[],_=0;for(let e=0;e<Z;++e){let t=e/m,n=Math.exp(-t*t/2);g.push(n),e===0?_+=n:e<h&&(_+=2*n)}for(let e=0;e<g.length;e++)g[e]=g[e]/_;d.envMap.value=e.texture,d.samples.value=h,d.weights.value=g,d.latitudinal.value=o===`latitudinal`,s&&(d.poleAxis.value=s);let{_lodMax:v}=this;d.dTheta.value=p,d.mipInt.value=v-n;let y=this._sizeLods[r];ho(t,3*y*(r>v-to?r-v+to:0),4*(this._cubeSize-y),3*y,2*y),c.setRenderTarget(t),c.render(u,io)}};function po(e){let t=[],n=[],r=[],a=e,o=e-to+1+no.length;for(let s=0;s<o;s++){let o=2**a;t.push(o);let c=1/o;s>e-to?c=no[s-e+to-1]:s===0&&(c=0),n.push(c);let l=1/(o-2),u=-l,d=1+l,f=[u,u,d,u,d,d,u,u,d,d,u,d],p=new Float32Array(108),m=new Float32Array(72),h=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];p.set(r,18*e),m.set(f,12*e);let a=[e,e,e,e,e,e];h.set(a,6*e)}let g=new Br;g.setAttribute(`position`,new Tr(p,3)),g.setAttribute(`uv`,new Tr(m,2)),g.setAttribute(`faceIndex`,new Tr(h,1)),r.push(new li(g,null)),a>to&&a--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function mo(e,t,n){let r=new on(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function ho(e,t,n,r,a){e.viewport.set(t,n,r,a),e.scissor.set(t,n,r,a)}function go(e,t,n){return new Xi({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:ro,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:bo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function _o(e,t,n){let r=new Float32Array(Z),a=new W(0,1,0);return new Xi({name:`SphericalGaussianBlur`,defines:{n:Z,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:bo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function vo(){return new Xi({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:bo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function yo(){return new Xi({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function bo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var xo=class extends on{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ni(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Li(5,5,5),a=new Xi({name:`CubemapFromEquirect`,uniforms:Hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});a.uniforms.tEquirect.value=t;let o=new li(r,a),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=P),new Da(1,10,this).update(e,o),t.minFilter=s,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let a=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(a)}};function So(e){let t=new WeakMap,n=new WeakMap,r=null;function a(e,t=!1){return e==null?null:t?s(e):o(e)}function o(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304)if(t.has(n)){let e=t.get(n).texture;return c(e,n.mapping)}else{let r=n.image;if(r&&r.height>0){let a=new xo(r.height);return a.fromEquirectangularTexture(e,n),t.set(n,a),n.addEventListener(`dispose`,u),c(a.texture,n.mapping)}else return null}}return n}function s(t){if(t&&t.isTexture){let a=t.mapping,o=a===303||a===304,s=a===301||a===302;if(o||s){let a=n.get(t),c=a===void 0?0:a.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==c)return r===null&&(r=new fo(e)),a=o?r.fromEquirectangular(t,a):r.fromCubemap(t,a),a.texture.pmremVersion=t.pmremVersion,n.set(t,a),a.texture;if(a!==void 0)return a.texture;{let c=t.image;return o&&c&&c.height>0||s&&c&&l(c)?(r===null&&(r=new fo(e)),a=o?r.fromEquirectangular(t):r.fromCubemap(t),a.texture.pmremVersion=t.pmremVersion,n.set(t,a),t.addEventListener(`dispose`,d),a.texture):null}}}return t}function c(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function l(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function u(e){let n=e.target;n.removeEventListener(`dispose`,u);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function d(e){let t=e.target;t.removeEventListener(`dispose`,d);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function f(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:a,dispose:f}}function Co(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Dt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function wo(e,t,n,r){let a={},o=new WeakMap;function s(e){let c=e.target;c.index!==null&&t.remove(c.index);for(let e in c.attributes)t.remove(c.attributes[e]);c.removeEventListener(`dispose`,s),delete a[c.id];let l=o.get(c);l&&(t.remove(l),o.delete(c)),r.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,n.memory.geometries--}function c(e,t){return a[t.id]===!0?t:(t.addEventListener(`dispose`,s),a[t.id]=!0,n.memory.geometries++,t)}function l(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function u(e){let n=[],r=e.index,a=e.attributes.position,s=0;if(a===void 0)return;if(r!==null){let e=r.array;s=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],a=e[t+1],o=e[t+2];n.push(r,a,a,o,o,r)}}else{let e=a.array;s=a.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,a=t+2;n.push(e,r,r,a,a,e)}}let c=new(a.count>=65535?Dr:Er)(n,1);c.version=s;let l=o.get(e);l&&t.remove(l),o.set(e,c)}function d(e){let t=o.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&u(e)}else u(e);return o.get(e)}return{get:c,update:l,getWireframeAttribute:d}}function To(e,t,n){let r;function a(e){r=e}let o,s;function c(e){o=e.type,s=e.bytesPerElement}function l(t,a){e.drawElements(r,a,o,t*s),n.update(a,r,1)}function u(t,a,c){c!==0&&(e.drawElementsInstanced(r,a,o,t*s,c),n.update(a,r,c))}function d(e,a,s){if(s===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,a,0,o,e,0,s);let c=0;for(let e=0;e<s;e++)c+=a[e];n.update(c,r,1)}this.setMode=a,this.setIndex=c,this.render=l,this.renderInstances=u,this.renderMultiDraw=d}function Eo(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,a){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*a;break;case e.LINES:n.lines+=t/2*a;break;case e.LINE_STRIP:n.lines+=a*(t-1);break;case e.LINE_LOOP:n.lines+=a*t;break;case e.POINTS:n.points+=a*t;break;default:H(`WebGLInfo: Unknown draw mode:`,r);break}}function a(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:a,update:r}}function Do(e,t,n){let r=new WeakMap,a=new rn;function o(o,s,c){let l=o.morphTargetInfluences,u=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,d=u===void 0?0:u.length,f=r.get(s);if(f===void 0||f.count!==d){f!==void 0&&f.texture.dispose();let e=s.morphAttributes.position!==void 0,n=s.morphAttributes.normal!==void 0,o=s.morphAttributes.color!==void 0,c=s.morphAttributes.position||[],l=s.morphAttributes.normal||[],u=s.morphAttributes.color||[],p=0;e===!0&&(p=1),n===!0&&(p=2),o===!0&&(p=3);let m=s.attributes.position.count*p,h=1;m>t.maxTextureSize&&(h=Math.ceil(m/t.maxTextureSize),m=t.maxTextureSize);let g=new Float32Array(m*h*4*d),_=new sn(g,m,h,d);_.type=le,_.needsUpdate=!0;let v=p*4;for(let t=0;t<d;t++){let r=c[t],s=l[t],d=u[t],f=m*h*4*t;for(let t=0;t<r.count;t++){let c=t*v;e===!0&&(a.fromBufferAttribute(r,t),g[f+c+0]=a.x,g[f+c+1]=a.y,g[f+c+2]=a.z,g[f+c+3]=0),n===!0&&(a.fromBufferAttribute(s,t),g[f+c+4]=a.x,g[f+c+5]=a.y,g[f+c+6]=a.z,g[f+c+7]=0),o===!0&&(a.fromBufferAttribute(d,t),g[f+c+8]=a.x,g[f+c+9]=a.y,g[f+c+10]=a.z,g[f+c+11]=d.itemSize===4?a.w:1)}}f={count:d,texture:_,size:new zt(m,h)},r.set(s,f);function y(){_.dispose(),r.delete(s),s.removeEventListener(`dispose`,y)}s.addEventListener(`dispose`,y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(e,`morphTexture`,o.morphTexture,n);else{let t=0;for(let e=0;e<l.length;e++)t+=l[e];let n=s.morphTargetsRelative?1:1-t;c.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),c.getUniforms().setValue(e,`morphTargetInfluences`,l)}c.getUniforms().setValue(e,`morphTargetsTexture`,f.texture,n),c.getUniforms().setValue(e,`morphTargetsTextureSize`,f.size)}return{update:o}}function Oo(e,t,n,r,a){let o=new WeakMap;function s(r){let s=a.render.frame,c=r.geometry,u=t.get(r,c);if(o.get(u)!==s&&(t.update(u),o.set(u,s)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,l)===!1&&r.addEventListener(`dispose`,l),o.get(r)!==s&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),o.set(r,s))),r.isSkinnedMesh){let e=r.skeleton;o.get(e)!==s&&(e.update(),o.set(e,s))}return u}function c(){o=new WeakMap}function l(e){let t=e.target;t.removeEventListener(`dispose`,l),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:s,dispose:c}}var ko={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Ao(e,t,n,r,a){let o=new on(t,n,{type:e,depthBuffer:r,stencilBuffer:a,depthTexture:r?new Pi(t,n):void 0}),s=new on(t,n,{type:ue,depthBuffer:!1,stencilBuffer:!1}),c=new Br;c.setAttribute(`position`,new Or([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute(`uv`,new Or([0,2,0,0,2,0],2));let l=new Zi({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new li(c,l),d=new wa(-1,1,1,-1,0,1),f=null,p=null,m=!1,h,g=null,_=[],v=!1;this.setSize=function(e,t){o.setSize(e,t),s.setSize(e,t);for(let n=0;n<_.length;n++){let r=_[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){_=e,v=_.length>0&&_[0].isRenderPass===!0;let t=o.width,n=o.height;for(let e=0;e<_.length;e++){let r=_[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(m||e.toneMapping===0&&_.length===0)return!1;if(g=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return v===!1&&e.setRenderTarget(o),h=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return v},this.end=function(e,t){e.toneMapping=h,m=!0;let n=o,r=s;for(let a=0;a<_.length;a++){let o=_[a];if(o.enabled!==!1&&(o.render(e,r,n,t),o.needsSwap!==!1)){let e=n;n=r,r=e}}if(f!==e.outputColorSpace||p!==e.toneMapping){f=e.outputColorSpace,p=e.toneMapping,l.defines={},K.getTransfer(f)===`srgb`&&(l.defines.SRGB_TRANSFER=``);let t=ko[p];t&&(l.defines[t]=``),l.needsUpdate=!0}l.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(g),e.render(u,d),g=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),s.dispose(),c.dispose(),l.dispose()}}var jo=new nn,Mo=new Pi(1,1),No=new sn,Po=new cn,Fo=new Ni,Io=[],Lo=[],Ro=new Float32Array(16),zo=new Float32Array(9),Bo=new Float32Array(4);function Vo(e,t,n){let r=e[0];if(r<=0||r>0)return e;let a=t*n,o=Io[a];if(o===void 0&&(o=new Float32Array(a),Io[a]=o),t!==0){r.toArray(o,0);for(let r=1,a=0;r!==t;++r)a+=n,e[r].toArray(o,a)}return o}function Ho(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Uo(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Wo(e,t){let n=Lo[t];n===void 0&&(n=new Int32Array(t),Lo[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Go(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ko(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ho(n,t))return;e.uniform2fv(this.addr,t),Uo(n,t)}}function qo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ho(n,t))return;e.uniform3fv(this.addr,t),Uo(n,t)}}function Jo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ho(n,t))return;e.uniform4fv(this.addr,t),Uo(n,t)}}function Yo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ho(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Uo(n,t)}else{if(Ho(n,r))return;Bo.set(r),e.uniformMatrix2fv(this.addr,!1,Bo),Uo(n,r)}}function Xo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ho(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Uo(n,t)}else{if(Ho(n,r))return;zo.set(r),e.uniformMatrix3fv(this.addr,!1,zo),Uo(n,r)}}function Zo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ho(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Uo(n,t)}else{if(Ho(n,r))return;Ro.set(r),e.uniformMatrix4fv(this.addr,!1,Ro),Uo(n,r)}}function Qo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function $o(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ho(n,t))return;e.uniform2iv(this.addr,t),Uo(n,t)}}function es(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ho(n,t))return;e.uniform3iv(this.addr,t),Uo(n,t)}}function ts(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ho(n,t))return;e.uniform4iv(this.addr,t),Uo(n,t)}}function ns(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function rs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ho(n,t))return;e.uniform2uiv(this.addr,t),Uo(n,t)}}function is(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ho(n,t))return;e.uniform3uiv(this.addr,t),Uo(n,t)}}function as(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ho(n,t))return;e.uniform4uiv(this.addr,t),Uo(n,t)}}function os(e,t,n){let r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(e.uniform1i(this.addr,a),r[0]=a);let o;this.type===e.SAMPLER_2D_SHADOW?(Mo.compareFunction=n.isReversedDepthBuffer()?518:515,o=Mo):o=jo,n.setTexture2D(t||o,a)}function ss(e,t,n){let r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(e.uniform1i(this.addr,a),r[0]=a),n.setTexture3D(t||Po,a)}function cs(e,t,n){let r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(e.uniform1i(this.addr,a),r[0]=a),n.setTextureCube(t||Fo,a)}function ls(e,t,n){let r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(e.uniform1i(this.addr,a),r[0]=a),n.setTexture2DArray(t||No,a)}function us(e){switch(e){case 5126:return Go;case 35664:return Ko;case 35665:return qo;case 35666:return Jo;case 35674:return Yo;case 35675:return Xo;case 35676:return Zo;case 5124:case 35670:return Qo;case 35667:case 35671:return $o;case 35668:case 35672:return es;case 35669:case 35673:return ts;case 5125:return ns;case 36294:return rs;case 36295:return is;case 36296:return as;case 35678:case 36198:case 36298:case 36306:case 35682:return os;case 35679:case 36299:case 36307:return ss;case 35680:case 36300:case 36308:case 36293:return cs;case 36289:case 36303:case 36311:case 36292:return ls}}function ds(e,t){e.uniform1fv(this.addr,t)}function fs(e,t){let n=Vo(t,this.size,2);e.uniform2fv(this.addr,n)}function ps(e,t){let n=Vo(t,this.size,3);e.uniform3fv(this.addr,n)}function ms(e,t){let n=Vo(t,this.size,4);e.uniform4fv(this.addr,n)}function hs(e,t){let n=Vo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function gs(e,t){let n=Vo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function _s(e,t){let n=Vo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function vs(e,t){e.uniform1iv(this.addr,t)}function ys(e,t){e.uniform2iv(this.addr,t)}function bs(e,t){e.uniform3iv(this.addr,t)}function xs(e,t){e.uniform4iv(this.addr,t)}function Ss(e,t){e.uniform1uiv(this.addr,t)}function Cs(e,t){e.uniform2uiv(this.addr,t)}function ws(e,t){e.uniform3uiv(this.addr,t)}function Ts(e,t){e.uniform4uiv(this.addr,t)}function Es(e,t,n){let r=this.cache,a=t.length,o=Wo(n,a);Ho(r,o)||(e.uniform1iv(this.addr,o),Uo(r,o));let s;s=this.type===e.SAMPLER_2D_SHADOW?Mo:jo;for(let e=0;e!==a;++e)n.setTexture2D(t[e]||s,o[e])}function Ds(e,t,n){let r=this.cache,a=t.length,o=Wo(n,a);Ho(r,o)||(e.uniform1iv(this.addr,o),Uo(r,o));for(let e=0;e!==a;++e)n.setTexture3D(t[e]||Po,o[e])}function Os(e,t,n){let r=this.cache,a=t.length,o=Wo(n,a);Ho(r,o)||(e.uniform1iv(this.addr,o),Uo(r,o));for(let e=0;e!==a;++e)n.setTextureCube(t[e]||Fo,o[e])}function ks(e,t,n){let r=this.cache,a=t.length,o=Wo(n,a);Ho(r,o)||(e.uniform1iv(this.addr,o),Uo(r,o));for(let e=0;e!==a;++e)n.setTexture2DArray(t[e]||No,o[e])}function As(e){switch(e){case 5126:return ds;case 35664:return fs;case 35665:return ps;case 35666:return ms;case 35674:return hs;case 35675:return gs;case 35676:return _s;case 5124:case 35670:return vs;case 35667:case 35671:return ys;case 35668:case 35672:return bs;case 35669:case 35673:return xs;case 5125:return Ss;case 36294:return Cs;case 36295:return ws;case 36296:return Ts;case 35678:case 36198:case 36298:case 36306:case 35682:return Es;case 35679:case 36299:case 36307:return Ds;case 35680:case 36300:case 36308:case 36293:return Os;case 36289:case 36303:case 36311:case 36292:return ks}}var js=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=us(t.type)}},Ms=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=As(t.type)}},Ns=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let a=0,o=r.length;a!==o;++a){let o=r[a];o.setValue(e,t[o.id],n)}}},Ps=/(\w+)(\])?(\[|\.)?/g;function Fs(e,t){e.seq.push(t),e.map[t.id]=t}function Is(e,t,n){let r=e.name,a=r.length;for(Ps.lastIndex=0;;){let o=Ps.exec(r),s=Ps.lastIndex,c=o[1],l=o[2]===`]`,u=o[3];if(l&&(c|=0),u===void 0||u===`[`&&s+2===a){Fs(n,u===void 0?new js(c,e,t):new Ms(c,e,t));break}else{let e=n.map[c];e===void 0&&(e=new Ns(c),Fs(n,e)),n=e}}}var Ls=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Is(n,e.getUniformLocation(t,n.name),this)}let r=[],a=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):a.push(t);r.length>0&&(this.seq=r.concat(a))}setValue(e,t,n,r){let a=this.map[t];a!==void 0&&a.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let a=0,o=t.length;a!==o;++a){let o=t[a],s=n[o.id];s.needsUpdate!==!1&&o.setValue(e,s.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,a=e.length;r!==a;++r){let a=e[r];a.id in t&&n.push(a)}return n}};function Rs(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var zs=37297,Bs=0;function Vs(e,t){let n=e.split(`
`),r=[],a=Math.max(t-6,0),o=Math.min(t+6,n.length);for(let e=a;e<o;e++){let a=e+1;r.push(`${a===t?`>`:` `} ${a}: ${n[e]}`)}return r.join(`
`)}var Hs=new G;function Us(e){K._getMatrix(Hs,K.workingColorSpace,e);let t=`mat3( ${Hs.elements.map(e=>e.toFixed(4))} )`;switch(K.getTransfer(e)){case mt:return[t,`LinearTransferOETF`];case ht:return[t,`sRGBTransferOETF`];default:return V(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ws(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||``).trim();if(r&&a===``)return``;let o=/ERROR: 0:(\d+)/.exec(a);if(o){let r=parseInt(o[1]);return n.toUpperCase()+`

`+a+`

`+Vs(e.getShaderSource(t),r)}else return a}function Gs(e,t){let n=Us(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Ks={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function qs(e,t){let n=Ks[t];return n===void 0?(V(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Js=new W;function Ys(){return K.getLuminanceCoefficients(Js),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Js.x.toFixed(4)}, ${Js.y.toFixed(4)}, ${Js.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Xs(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter($s).join(`
`)}function Zs(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Qs(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){let r=e.getActiveAttrib(t,a),o=r.name,s=1;r.type===e.FLOAT_MAT2&&(s=2),r.type===e.FLOAT_MAT3&&(s=3),r.type===e.FLOAT_MAT4&&(s=4),n[o]={type:r.type,location:e.getAttribLocation(t,o),locationSize:s}}return n}function $s(e){return e!==``}function ec(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function tc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var nc=/^[ \t]*#include +<([\w\d./]+)>/gm;function rc(e){return e.replace(nc,ac)}var ic=new Map;function ac(e,t){let n=Y[t];if(n===void 0){let e=ic.get(t);if(e!==void 0)n=Y[e],V(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return rc(n)}var oc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sc(e){return e.replace(oc,cc)}function cc(e,t,n,r){let a=``;for(let e=parseInt(t);e<parseInt(n);e++)a+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return a}function lc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var uc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function dc(e){return uc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var fc={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function pc(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:fc[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var mc={302:`ENVMAP_MODE_REFRACTION`};function hc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:mc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var gc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function _c(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:gc[e.combine]||`ENVMAP_BLENDING_NONE`}function vc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function yc(e,t,n,r){let a=e.getContext(),o=n.defines,s=n.vertexShader,c=n.fragmentShader,l=dc(n),u=pc(n),d=hc(n),f=_c(n),p=vc(n),m=Xs(n),h=Zs(o),g=a.createProgram(),_,v,y=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,h].filter($s).join(`
`),_.length>0&&(_+=`
`),v=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,h].filter($s).join(`
`),v.length>0&&(v+=`
`)):(_=[lc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,h,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+d:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+l:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter($s).join(`
`),v=[lc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,h,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMap?`#define `+f:``,p?`#define CUBEUV_TEXEL_WIDTH `+p.texelWidth:``,p?`#define CUBEUV_TEXEL_HEIGHT `+p.texelHeight:``,p?`#define CUBEUV_MAX_MIP `+p.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+l:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Y.tonemapping_pars_fragment,n.toneMapping===0?``:qs(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Y.colorspace_pars_fragment,Gs(`linearToOutputTexel`,n.outputColorSpace),Ys(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter($s).join(`
`)),s=rc(s),s=ec(s,n),s=tc(s,n),c=rc(c),c=ec(c,n),c=tc(c,n),s=sc(s),c=sc(c),n.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,_=[m,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+_,v=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+v);let b=y+_+s,x=y+v+c,S=Rs(a,a.VERTEX_SHADER,b),C=Rs(a,a.FRAGMENT_SHADER,x);a.attachShader(g,S),a.attachShader(g,C),n.index0AttributeName===void 0?n.morphTargets===!0&&a.bindAttribLocation(g,0,`position`):a.bindAttribLocation(g,0,n.index0AttributeName),a.linkProgram(g);function w(t){if(e.debug.checkShaderErrors){let n=a.getProgramInfoLog(g)||``,r=a.getShaderInfoLog(S)||``,o=a.getShaderInfoLog(C)||``,s=n.trim(),c=r.trim(),l=o.trim(),u=!0,d=!0;if(a.getProgramParameter(g,a.LINK_STATUS)===!1)if(u=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(a,g,S,C);else{let e=Ws(a,S,`vertex`),n=Ws(a,C,`fragment`);H(`THREE.WebGLProgram: Shader Error `+a.getError()+` - VALIDATE_STATUS `+a.getProgramParameter(g,a.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+s+`
`+e+`
`+n)}else s===``?(c===``||l===``)&&(d=!1):V(`WebGLProgram: Program Info Log:`,s);d&&(t.diagnostics={runnable:u,programLog:s,vertexShader:{log:c,prefix:_},fragmentShader:{log:l,prefix:v}})}a.deleteShader(S),a.deleteShader(C),T=new Ls(a,g),E=Qs(a,g)}let T;this.getUniforms=function(){return T===void 0&&w(this),T};let E;this.getAttributes=function(){return E===void 0&&w(this),E};let D=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=a.getProgramParameter(g,zs)),D},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(g),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Bs++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=S,this.fragmentShader=C,this}var bc=0,xc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),a=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(a)===!1&&(o.add(a),a.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Sc(e),t.set(e,n)),n}},Sc=class{constructor(e){this.id=bc++,this.code=e,this.usedTimes=0}};function Cc(e){return e===1030||e===37490||e===36285}function wc(e,t,n,r,a,o){let s=new bn,c=new xc,l=new Set,u=[],d=new Map,f=r.logarithmicDepthBuffer,p=r.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,d,g,_){let v=d.fog,y=g.geometry,b=a.isMeshStandardMaterial||a.isMeshLambertMaterial||a.isMeshPhongMaterial?d.environment:null,x=a.isMeshStandardMaterial||a.isMeshLambertMaterial&&!a.envMap||a.isMeshPhongMaterial&&!a.envMap,S=t.get(a.envMap||b,x),C=S&&S.mapping===306?S.image.height:null,w=m[a.type];a.precision!==null&&(p=r.getMaxPrecision(a.precision),p!==a.precision&&V(`WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let T=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,E=T===void 0?0:T.length,D=0;y.morphAttributes.position!==void 0&&(D=1),y.morphAttributes.normal!==void 0&&(D=2),y.morphAttributes.color!==void 0&&(D=3);let O,k,A,j;if(w){let e=Ka[w];O=e.vertexShader,k=e.fragmentShader}else O=a.vertexShader,k=a.fragmentShader,c.update(a),A=c.getVertexShaderID(a),j=c.getFragmentShaderID(a);let M=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),N=g.isInstancedMesh===!0,te=g.isBatchedMesh===!0,ne=!!a.map,P=!!a.matcap,F=!!S,re=!!a.aoMap,ie=!!a.lightMap,ae=!!a.bumpMap,oe=!!a.normalMap,se=!!a.displacementMap,I=!!a.emissiveMap,ce=!!a.metalnessMap,le=!!a.roughnessMap,ue=a.anisotropy>0,de=a.clearcoat>0,fe=a.dispersion>0,pe=a.iridescence>0,me=a.sheen>0,he=a.transmission>0,ge=ue&&!!a.anisotropyMap,_e=de&&!!a.clearcoatMap,ve=de&&!!a.clearcoatNormalMap,ye=de&&!!a.clearcoatRoughnessMap,be=pe&&!!a.iridescenceMap,xe=pe&&!!a.iridescenceThicknessMap,Se=me&&!!a.sheenColorMap,Ce=me&&!!a.sheenRoughnessMap,we=!!a.specularMap,Te=!!a.specularColorMap,Ee=!!a.specularIntensityMap,De=he&&!!a.transmissionMap,Oe=he&&!!a.thicknessMap,ke=!!a.gradientMap,L=!!a.alphaMap,Ae=a.alphaTest>0,je=!!a.alphaHash,Me=!!a.extensions,R=0;a.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(R=e.toneMapping);let Ne={shaderID:w,shaderType:a.type,shaderName:a.name,vertexShader:O,fragmentShader:k,defines:a.defines,customVertexShaderID:A,customFragmentShaderID:j,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:te,batchingColor:te&&g._colorsTexture!==null,instancing:N,instancingColor:N&&g.instanceColor!==null,instancingMorph:N&&g.morphTexture!==null,outputColorSpace:M===null?e.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:K.workingColorSpace,alphaToCoverage:!!a.alphaToCoverage,map:ne,matcap:P,envMap:F,envMapMode:F&&S.mapping,envMapCubeUVHeight:C,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:se,emissiveMap:I,normalMapObjectSpace:oe&&a.normalMapType===1,normalMapTangentSpace:oe&&a.normalMapType===0,packedNormalMap:oe&&a.normalMapType===0&&Cc(a.normalMap.format),metalnessMap:ce,roughnessMap:le,anisotropy:ue,anisotropyMap:ge,clearcoat:de,clearcoatMap:_e,clearcoatNormalMap:ve,clearcoatRoughnessMap:ye,dispersion:fe,iridescence:pe,iridescenceMap:be,iridescenceThicknessMap:xe,sheen:me,sheenColorMap:Se,sheenRoughnessMap:Ce,specularMap:we,specularColorMap:Te,specularIntensityMap:Ee,transmission:he,transmissionMap:De,thicknessMap:Oe,gradientMap:ke,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:L,alphaTest:Ae,alphaHash:je,combine:a.combine,mapUv:ne&&h(a.map.channel),aoMapUv:re&&h(a.aoMap.channel),lightMapUv:ie&&h(a.lightMap.channel),bumpMapUv:ae&&h(a.bumpMap.channel),normalMapUv:oe&&h(a.normalMap.channel),displacementMapUv:se&&h(a.displacementMap.channel),emissiveMapUv:I&&h(a.emissiveMap.channel),metalnessMapUv:ce&&h(a.metalnessMap.channel),roughnessMapUv:le&&h(a.roughnessMap.channel),anisotropyMapUv:ge&&h(a.anisotropyMap.channel),clearcoatMapUv:_e&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:ve&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:be&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:xe&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:Se&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&h(a.sheenRoughnessMap.channel),specularMapUv:we&&h(a.specularMap.channel),specularColorMapUv:Te&&h(a.specularColorMap.channel),specularIntensityMapUv:Ee&&h(a.specularIntensityMap.channel),transmissionMapUv:De&&h(a.transmissionMap.channel),thicknessMapUv:Oe&&h(a.thicknessMap.channel),alphaMapUv:L&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(oe||ue),vertexNormals:!!y.attributes.normal,vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:g.isPoints===!0&&!!y.attributes.uv&&(ne||L),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.wireframe===!1&&(a.flatShading===!0||y.attributes.normal===void 0&&oe===!1&&(a.isMeshLambertMaterial||a.isMeshPhongMaterial||a.isMeshStandardMaterial||a.isMeshPhysicalMaterial)),sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:ee,skinning:g.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:E,morphTextureStride:D,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numLightProbeGrids:_.length,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:R,decodeVideoTexture:ne&&a.map.isVideoTexture===!0&&K.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:I&&a.emissiveMap.isVideoTexture===!0&&K.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Me&&a.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&a.extensions.multiDraw===!0||te)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Ne.vertexUv1s=l.has(1),Ne.vertexUv2s=l.has(2),Ne.vertexUv3s=l.has(3),l.clear(),Ne}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.instancing&&s.enable(0),t.instancingColor&&s.enable(1),t.instancingMorph&&s.enable(2),t.matcap&&s.enable(3),t.envMap&&s.enable(4),t.normalMapObjectSpace&&s.enable(5),t.normalMapTangentSpace&&s.enable(6),t.clearcoat&&s.enable(7),t.iridescence&&s.enable(8),t.alphaTest&&s.enable(9),t.vertexColors&&s.enable(10),t.vertexAlphas&&s.enable(11),t.vertexUv1s&&s.enable(12),t.vertexUv2s&&s.enable(13),t.vertexUv3s&&s.enable(14),t.vertexTangents&&s.enable(15),t.anisotropy&&s.enable(16),t.alphaHash&&s.enable(17),t.batching&&s.enable(18),t.dispersion&&s.enable(19),t.batchingColor&&s.enable(20),t.gradientMap&&s.enable(21),t.packedNormalMap&&s.enable(22),t.vertexNormals&&s.enable(23),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),t.numLightProbeGrids>0&&s.enable(22),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Ka[t];n=qi.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r=d.get(n);return r===void 0?(r=new yc(e,n,t,a),u.push(r),d.set(n,r)):++r.usedTimes,r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),d.delete(e.cacheKey),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Tc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function a(t,n,r){e.get(t)[n]=r}function o(){e=new WeakMap}return{has:t,get:n,remove:r,update:a,dispose:o}}function Ec(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Dc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Oc(){let e=[],t=0,n=[],r=[],a=[];function o(){t=0,n.length=0,r.length=0,a.length=0}function s(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function c(n,r,a,o,c,l){let u=e[t];return u===void 0?(u={id:n.id,object:n,geometry:r,material:a,materialVariant:s(n),groupOrder:o,renderOrder:n.renderOrder,z:c,group:l},e[t]=u):(u.id=n.id,u.object=n,u.geometry=r,u.material=a,u.materialVariant=s(n),u.groupOrder=o,u.renderOrder=n.renderOrder,u.z=c,u.group=l),t++,u}function l(e,t,o,s,l,u){let d=c(e,t,o,s,l,u);o.transmission>0?r.push(d):o.transparent===!0?a.push(d):n.push(d)}function u(e,t,o,s,l,u){let d=c(e,t,o,s,l,u);o.transmission>0?r.unshift(d):o.transparent===!0?a.unshift(d):n.unshift(d)}function d(e,t){n.length>1&&n.sort(e||Ec),r.length>1&&r.sort(t||Dc),a.length>1&&a.sort(t||Dc)}function f(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:a,init:o,push:l,unshift:u,finish:f,sort:d}}function kc(){let e=new WeakMap;function t(t,n){let r=e.get(t),a;return r===void 0?(a=new Oc,e.set(t,[a])):n>=r.length?(a=new Oc,r.push(a)):a=r[n],a}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ac(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new W,color:new q};break;case`SpotLight`:n={position:new W,direction:new W,color:new q,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new q,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new q,groundColor:new q};break;case`RectAreaLight`:n={color:new q,position:new W,halfWidth:new W,halfHeight:new W};break}return e[t.id]=n,n}}}function jc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var Mc=0;function Nc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Pc(e){let t=new Ac,n=jc(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let a=new W,o=new ln,s=new ln;function c(a){let o=0,s=0,c=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0;a.sort(Nc);for(let e=0,b=a.length;e<b;e++){let b=a[e],x=b.color,S=b.intensity,C=b.distance,w=null;if(b.shadow&&b.shadow.map&&(w=b.shadow.map.texture.format===1030?b.shadow.map.texture:b.shadow.map.depthTexture||b.shadow.map.texture),b.isAmbientLight)o+=x.r*S,s+=x.g*S,c+=x.b*S;else if(b.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(b.sh.coefficients[e],S);y++}else if(b.isDirectionalLight){let e=t.get(b);if(e.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){let e=b.shadow,t=n.get(b);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[l]=t,r.directionalShadowMap[l]=w,r.directionalShadowMatrix[l]=b.shadow.matrix,m++}r.directional[l]=e,l++}else if(b.isSpotLight){let e=t.get(b);e.position.setFromMatrixPosition(b.matrixWorld),e.color.copy(x).multiplyScalar(S),e.distance=C,e.coneCos=Math.cos(b.angle),e.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),e.decay=b.decay,r.spot[d]=e;let a=b.shadow;if(b.map&&(r.spotLightMap[_]=b.map,_++,a.updateMatrices(b),b.castShadow&&v++),r.spotLightMatrix[d]=a.matrix,b.castShadow){let e=n.get(b);e.shadowIntensity=a.intensity,e.shadowBias=a.bias,e.shadowNormalBias=a.normalBias,e.shadowRadius=a.radius,e.shadowMapSize=a.mapSize,r.spotShadow[d]=e,r.spotShadowMap[d]=w,g++}d++}else if(b.isRectAreaLight){let e=t.get(b);e.color.copy(x).multiplyScalar(S),e.halfWidth.set(b.width*.5,0,0),e.halfHeight.set(0,b.height*.5,0),r.rectArea[f]=e,f++}else if(b.isPointLight){let e=t.get(b);if(e.color.copy(b.color).multiplyScalar(b.intensity),e.distance=b.distance,e.decay=b.decay,b.castShadow){let e=b.shadow,t=n.get(b);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[u]=t,r.pointShadowMap[u]=w,r.pointShadowMatrix[u]=b.shadow.matrix,h++}r.point[u]=e,u++}else if(b.isHemisphereLight){let e=t.get(b);e.skyColor.copy(b.color).multiplyScalar(S),e.groundColor.copy(b.groundColor).multiplyScalar(S),r.hemi[p]=e,p++}}f>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=o,r.ambient[1]=s,r.ambient[2]=c;let b=r.hash;(b.directionalLength!==l||b.pointLength!==u||b.spotLength!==d||b.rectAreaLength!==f||b.hemiLength!==p||b.numDirectionalShadows!==m||b.numPointShadows!==h||b.numSpotShadows!==g||b.numSpotMaps!==_||b.numLightProbes!==y)&&(r.directional.length=l,r.spot.length=d,r.rectArea.length=f,r.point.length=u,r.hemi.length=p,r.directionalShadow.length=m,r.directionalShadowMap.length=m,r.pointShadow.length=h,r.pointShadowMap.length=h,r.spotShadow.length=g,r.spotShadowMap.length=g,r.directionalShadowMatrix.length=m,r.pointShadowMatrix.length=h,r.spotLightMatrix.length=g+_-v,r.spotLightMap.length=_,r.numSpotLightShadowsWithMaps=v,r.numLightProbes=y,b.directionalLength=l,b.pointLength=u,b.spotLength=d,b.rectAreaLength=f,b.hemiLength=p,b.numDirectionalShadows=m,b.numPointShadows=h,b.numSpotShadows=g,b.numSpotMaps=_,b.numLightProbes=y,r.version=Mc++)}function l(e,t){let n=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(p.matrixWorld),a.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(a),e.direction.transformDirection(f),n++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),a.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(a),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),s.identity(),o.copy(p.matrixWorld),o.premultiply(f),s.extractRotation(o),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(s),e.halfHeight.applyMatrix4(s),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:c,setupView:l,state:r}}function Fc(e){let t=new Pc(e),n=[],r=[],a=[];function o(e){f.camera=e,n.length=0,r.length=0,a.length=0}function s(e){n.push(e)}function c(e){r.push(e)}function l(e){a.push(e)}function u(){t.setup(n)}function d(e){t.setupView(n,e)}let f={lightsArray:n,shadowsArray:r,lightProbeGridArray:a,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:o,state:f,setupLights:u,setupLightsView:d,pushLight:s,pushShadow:c,pushLightProbeGrid:l}}function Ic(e){let t=new WeakMap;function n(n,r=0){let a=t.get(n),o;return a===void 0?(o=new Fc(e),t.set(n,[o])):r>=a.length?(o=new Fc(e),a.push(o)):o=a[r],o}function r(){t=new WeakMap}return{get:n,dispose:r}}var Lc=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Rc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,zc=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],Bc=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],Vc=new ln,Hc=new W,Uc=new W;function Wc(e,t,n){let r=new bi,a=new zt,o=new zt,s=new rn,c=new Qi,l=new $i,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new Xi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new zt},radius:{value:4}},vertexShader:Lc,fragmentShader:Rc}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new Br;h.setAttribute(`position`,new Tr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new li(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;this.type===2&&(V(`WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.`),this.type=1);let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=v!==this.type;m&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){V(`WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;a.copy(f.mapSize);let h=f.getFrameExtents();a.multiply(h),o.copy(f.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(o.x=Math.floor(d/h.x),a.x=o.x*h.x,f.mapSize.x=o.x),a.y>d&&(o.y=Math.floor(d/h.y),a.y=o.y*h.y,f.mapSize.y=o.y));let g=e.state.buffers.depth.getReversed();if(f.camera._reversedDepth=g,f.map===null||m===!0){if(f.map!==null&&(f.map.depthTexture!==null&&(f.map.depthTexture.dispose(),f.map.depthTexture=null),f.map.dispose()),this.type===3){if(u.isPointLight){V(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}f.map=new on(a.x,a.y,{format:Ce,type:ue,minFilter:P,magFilter:P,generateMipmaps:!1}),f.map.texture.name=u.name+`.shadowMap`,f.map.depthTexture=new Pi(a.x,a.y,le),f.map.depthTexture.name=u.name+`.shadowMapDepth`,f.map.depthTexture.format=ye,f.map.depthTexture.compareFunction=null,f.map.depthTexture.minFilter=N,f.map.depthTexture.magFilter=N}else u.isPointLight?(f.map=new xo(a.x),f.map.depthTexture=new Fi(a.x,ce)):(f.map=new on(a.x,a.y),f.map.depthTexture=new Pi(a.x,a.y,ce)),f.map.depthTexture.name=u.name+`.shadowMap`,f.map.depthTexture.format=ye,this.type===1?(f.map.depthTexture.compareFunction=g?518:515,f.map.depthTexture.minFilter=P,f.map.depthTexture.magFilter=P):(f.map.depthTexture.compareFunction=null,f.map.depthTexture.minFilter=N,f.map.depthTexture.magFilter=N);f.camera.updateProjectionMatrix()}let _=f.map.isWebGLCubeRenderTarget?6:1;for(let t=0;t<_;t++){if(f.map.isWebGLCubeRenderTarget)e.setRenderTarget(f.map,t),e.clear();else{t===0&&(e.setRenderTarget(f.map),e.clear());let n=f.getViewport(t);s.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),p.viewport(s)}if(u.isPointLight){let e=f.camera,n=f.matrix,r=u.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Hc.setFromMatrixPosition(u.matrixWorld),e.position.copy(Hc),Uc.copy(e.position),Uc.add(zc[t]),e.up.copy(Bc[t]),e.lookAt(Uc),e.updateMatrixWorld(),n.makeTranslation(-Hc.x,-Hc.y,-Hc.z),Vc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),f._frustum.setFromProjectionMatrix(Vc,e.coordinateSystem,e.reversedDepth)}else f.updateMatrices(u);r=f.getFrustum(),x(n,c,f.camera,u,this.type)}f.isPointLightShadow!==!0&&this.type===3&&y(f,c),f.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function y(n,r){let o=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new on(a.x,a.y,{format:Ce,type:ue})),p.uniforms.shadow_pass.value=n.map.depthTexture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,o,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,o,m,g,null)}function b(t,n,r,a){let o=null,s=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(s!==void 0)o=s;else if(o=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=o.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let a=r[t];a===void 0&&(a=o.clone(),r[t]=a,n.addEventListener(`dispose`,S)),o=a}if(o.visible=n.visible,o.wireframe=n.wireframe,a===3?o.side=n.shadowSide===null?n.side:n.shadowSide:o.side=n.shadowSide===null?f[n.side]:n.shadowSide,o.alphaMap=n.alphaMap,o.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,o.map=n.map,o.clipShadows=n.clipShadows,o.clippingPlanes=n.clippingPlanes,o.clipIntersection=n.clipIntersection,o.displacementMap=n.displacementMap,o.displacementScale=n.displacementScale,o.displacementBias=n.displacementBias,o.wireframeLinewidth=n.wireframeLinewidth,o.linewidth=n.linewidth,r.isPointLight===!0&&o.isMeshDistanceMaterial===!0){let t=e.properties.get(o);t.light=r}return o}function x(n,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(a.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(o.matrixWorldInverse,n.matrixWorld);let r=t.update(n),l=n.material;if(Array.isArray(l)){let t=r.groups;for(let u=0,d=t.length;u<d;u++){let d=t[u],f=l[d.materialIndex];if(f&&f.visible){let t=b(n,f,s,c);n.onBeforeShadow(e,n,a,o,r,t,d),e.renderBufferDirect(o,null,r,t,n,d),n.onAfterShadow(e,n,a,o,r,t,d)}}}else if(l.visible){let t=b(n,l,s,c);n.onBeforeShadow(e,n,a,o,r,t,null),e.renderBufferDirect(o,null,r,t,n,null),n.onAfterShadow(e,n,a,o,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)x(l[e],a,o,s,c)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Gc(e,t){function n(){let t=!1,n=new rn,r=null,a=new rn(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,o,s,c){c===!0&&(t*=s,r*=s,o*=s),n.set(t,r,o,s),a.equals(n)===!1&&(e.clearColor(t,r,o,s),a.copy(n))},reset:function(){t=!1,r=null,a.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,a=null,o=null,s=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let a=s;s=null,this.setClear(a)}},getReversed:function(){return r},setTest:function(t){t?ce(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(t){a!==t&&!n&&(e.depthMask(t),a=t)},setFunc:function(t){if(r&&(t=kt[t]),o!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}o=t}},setLocked:function(e){n=e},setClear:function(t){s!==t&&(s=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,a=null,o=null,s=null,r=!1}}}function a(){let t=!1,n=null,r=null,a=null,o=null,s=null,c=null,l=null,u=null;return{setTest:function(n){t||(n?ce(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,s){(r!==t||a!==n||o!==s)&&(e.stencilFunc(t,n,s),r=t,a=n,o=s)},setOp:function(t,n,r){(s!==t||c!==n||l!==r)&&(e.stencilOp(t,n,r),s=t,c=n,l=r)},setLocked:function(e){t=e},setClear:function(t){u!==t&&(e.clearStencil(t),u=t)},reset:function(){t=!1,n=null,r=null,a=null,o=null,s=null,c=null,l=null,u=null}}}let o=new n,s=new r,c=new a,l=new WeakMap,u=new WeakMap,d={},f={},p={},m=new WeakMap,h=[],g=null,_=!1,v=null,y=null,b=null,x=null,S=null,C=null,w=null,T=new q(0,0,0),E=0,D=!1,O=null,k=null,A=null,j=null,M=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),N=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),N=te>=1);let P=null,F={},re=e.getParameter(e.SCISSOR_BOX),ie=e.getParameter(e.VIEWPORT),ae=new rn().fromArray(re),oe=new rn().fromArray(ie);function se(t,n,r,a){let o=new Uint8Array(4),s=e.createTexture();e.bindTexture(t,s),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let s=0;s<r;s++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,a,0,e.RGBA,e.UNSIGNED_BYTE,o):e.texImage2D(n+s,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,o);return s}let I={};I[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),I[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),I[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),I[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),o.setClear(0,0,0,1),s.setClear(1),c.setClear(0),ce(e.DEPTH_TEST),s.setFunc(3),_e(!1),ve(1),ce(e.CULL_FACE),he(0);function ce(t){d[t]!==!0&&(e.enable(t),d[t]=!0)}function le(t){d[t]!==!1&&(e.disable(t),d[t]=!1)}function ue(t,n){return p[t]===n?!1:(e.bindFramebuffer(t,n),p[t]=n,t===e.DRAW_FRAMEBUFFER&&(p[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(p[e.DRAW_FRAMEBUFFER]=n),!0)}function de(t,n){let r=h,a=!1;if(t){r=m.get(n),r===void 0&&(r=[],m.set(n,r));let o=t.textures;if(r.length!==o.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=o.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=o.length,a=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,a=!0);a&&e.drawBuffers(r)}function fe(t){return g===t?!1:(e.useProgram(t),g=t,!0)}let pe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};pe[103]=e.MIN,pe[104]=e.MAX;let me={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function he(t,n,r,a,o,s,c,l,u,d){if(t===0){_===!0&&(le(e.BLEND),_=!1);return}if(_===!1&&(ce(e.BLEND),_=!0),t!==5){if(t!==v||d!==D){if((y!==100||S!==100)&&(e.blendEquation(e.FUNC_ADD),y=100,S=100),d)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:H(`WebGLState: Invalid blending: `,t);break}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:H(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:H(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:H(`WebGLState: Invalid blending: `,t);break}b=null,x=null,C=null,w=null,T.set(0,0,0),E=0,v=t,D=d}return}o||=n,s||=r,c||=a,(n!==y||o!==S)&&(e.blendEquationSeparate(pe[n],pe[o]),y=n,S=o),(r!==b||a!==x||s!==C||c!==w)&&(e.blendFuncSeparate(me[r],me[a],me[s],me[c]),b=r,x=a,C=s,w=c),(l.equals(T)===!1||u!==E)&&(e.blendColor(l.r,l.g,l.b,u),T.copy(l),E=u),v=t,D=!1}function ge(t,n){t.side===2?le(e.CULL_FACE):ce(e.CULL_FACE);let r=t.side===1;n&&(r=!r),_e(r),t.blending===1&&t.transparent===!1?he(0):he(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),s.setFunc(t.depthFunc),s.setTest(t.depthTest),s.setMask(t.depthWrite),o.setMask(t.colorWrite);let a=t.stencilWrite;c.setTest(a),a&&(c.setMask(t.stencilWriteMask),c.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),c.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),be(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ce(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function _e(t){O!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),O=t)}function ve(t){t===0?le(e.CULL_FACE):(ce(e.CULL_FACE),t!==k&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),k=t}function ye(t){t!==A&&(N&&e.lineWidth(t),A=t)}function be(t,n,r){t?(ce(e.POLYGON_OFFSET_FILL),(j!==n||M!==r)&&(j=n,M=r,s.getReversed()&&(n=-n),e.polygonOffset(n,r))):le(e.POLYGON_OFFSET_FILL)}function xe(t){t?ce(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function Se(t){t===void 0&&(t=e.TEXTURE0+ee-1),P!==t&&(e.activeTexture(t),P=t)}function Ce(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+ee-1:P);let a=F[r];a===void 0&&(a={type:void 0,texture:void 0},F[r]=a),(a.type!==t||a.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||I[t]),a.type=t,a.texture=n)}function we(){let t=F[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ee(){try{e.compressedTexImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function De(){try{e.texSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function L(){try{e.compressedTexSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ae(){try{e.texStorage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function je(){try{e.texStorage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Me(){try{e.texImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function R(){try{e.texImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ne(t){return f[t]===void 0?e.getParameter(t):f[t]}function z(t,n){f[t]!==n&&(e.pixelStorei(t,n),f[t]=n)}function B(t){ae.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ae.copy(t))}function Pe(t){oe.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),oe.copy(t))}function Fe(t,n){let r=u.get(n);r===void 0&&(r=new WeakMap,u.set(n,r));let a=r.get(t);a===void 0&&(a=e.getUniformBlockIndex(n,t.name),r.set(t,a))}function Ie(t,n){let r=u.get(n).get(t);l.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),l.set(n,r))}function Le(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),s.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),d={},f={},P=null,F={},p={},m=new WeakMap,h=[],g=null,_=!1,v=null,y=null,b=null,x=null,S=null,C=null,w=null,T=new q(0,0,0),E=0,D=!1,O=null,k=null,A=null,j=null,M=null,ae.set(0,0,e.canvas.width,e.canvas.height),oe.set(0,0,e.canvas.width,e.canvas.height),o.reset(),s.reset(),c.reset()}return{buffers:{color:o,depth:s,stencil:c},enable:ce,disable:le,bindFramebuffer:ue,drawBuffers:de,useProgram:fe,setBlending:he,setMaterial:ge,setFlipSided:_e,setCullFace:ve,setLineWidth:ye,setPolygonOffset:be,setScissorTest:xe,activeTexture:Se,bindTexture:Ce,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:Ee,texImage2D:Me,texImage3D:R,pixelStorei:z,getParameter:Ne,updateUBOMapping:Fe,uniformBlockBinding:Ie,texStorage2D:Ae,texStorage3D:je,texSubImage2D:De,texSubImage3D:Oe,compressedTexSubImage2D:ke,compressedTexSubImage3D:L,scissor:B,viewport:Pe,reset:Le}}function Kc(e,t,n,r,a,o,s){let c=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,l=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),u=new zt,d=new WeakMap,f=new Set,p,m=new WeakMap,h=!1;try{h=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function g(e,t){return h?new OffscreenCanvas(e,t):xt(`canvas`)}function _(e,t,n){let r=1,a=Ne(e);if((a.width>n||a.height>n)&&(r=n/Math.max(a.width,a.height)),r<1)if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*a.width),o=Math.floor(r*a.height);p===void 0&&(p=g(n,o));let s=t?g(n,o):p;return s.width=n,s.height=o,s.getContext(`2d`).drawImage(e,0,0,n,o),V(`WebGLRenderer: Texture has been resized from (`+a.width+`x`+a.height+`) to (`+n+`x`+o+`).`),s}else return`data`in e&&V(`WebGLRenderer: Image in DataTexture is too big (`+a.width+`x`+a.height+`).`),e;return e}function v(e){return e.generateMipmaps}function y(t){e.generateMipmap(t)}function b(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function x(n,r,a,o,s,c=!1){if(n!==null){if(e[n]!==void 0)return e[n];V(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let l;o&&(l=t.get(`EXT_texture_norm16`),l||V(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let u=r;if(r===e.RED&&(a===e.FLOAT&&(u=e.R32F),a===e.HALF_FLOAT&&(u=e.R16F),a===e.UNSIGNED_BYTE&&(u=e.R8),a===e.UNSIGNED_SHORT&&l&&(u=l.R16_EXT),a===e.SHORT&&l&&(u=l.R16_SNORM_EXT)),r===e.RED_INTEGER&&(a===e.UNSIGNED_BYTE&&(u=e.R8UI),a===e.UNSIGNED_SHORT&&(u=e.R16UI),a===e.UNSIGNED_INT&&(u=e.R32UI),a===e.BYTE&&(u=e.R8I),a===e.SHORT&&(u=e.R16I),a===e.INT&&(u=e.R32I)),r===e.RG&&(a===e.FLOAT&&(u=e.RG32F),a===e.HALF_FLOAT&&(u=e.RG16F),a===e.UNSIGNED_BYTE&&(u=e.RG8),a===e.UNSIGNED_SHORT&&l&&(u=l.RG16_EXT),a===e.SHORT&&l&&(u=l.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(a===e.UNSIGNED_BYTE&&(u=e.RG8UI),a===e.UNSIGNED_SHORT&&(u=e.RG16UI),a===e.UNSIGNED_INT&&(u=e.RG32UI),a===e.BYTE&&(u=e.RG8I),a===e.SHORT&&(u=e.RG16I),a===e.INT&&(u=e.RG32I)),r===e.RGB_INTEGER&&(a===e.UNSIGNED_BYTE&&(u=e.RGB8UI),a===e.UNSIGNED_SHORT&&(u=e.RGB16UI),a===e.UNSIGNED_INT&&(u=e.RGB32UI),a===e.BYTE&&(u=e.RGB8I),a===e.SHORT&&(u=e.RGB16I),a===e.INT&&(u=e.RGB32I)),r===e.RGBA_INTEGER&&(a===e.UNSIGNED_BYTE&&(u=e.RGBA8UI),a===e.UNSIGNED_SHORT&&(u=e.RGBA16UI),a===e.UNSIGNED_INT&&(u=e.RGBA32UI),a===e.BYTE&&(u=e.RGBA8I),a===e.SHORT&&(u=e.RGBA16I),a===e.INT&&(u=e.RGBA32I)),r===e.RGB&&(a===e.UNSIGNED_SHORT&&l&&(u=l.RGB16_EXT),a===e.SHORT&&l&&(u=l.RGB16_SNORM_EXT),a===e.UNSIGNED_INT_5_9_9_9_REV&&(u=e.RGB9_E5),a===e.UNSIGNED_INT_10F_11F_11F_REV&&(u=e.R11F_G11F_B10F)),r===e.RGBA){let t=c?mt:K.getTransfer(s);a===e.FLOAT&&(u=e.RGBA32F),a===e.HALF_FLOAT&&(u=e.RGBA16F),a===e.UNSIGNED_BYTE&&(u=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),a===e.UNSIGNED_SHORT&&l&&(u=l.RGBA16_EXT),a===e.SHORT&&l&&(u=l.RGBA16_SNORM_EXT),a===e.UNSIGNED_SHORT_4_4_4_4&&(u=e.RGBA4),a===e.UNSIGNED_SHORT_5_5_5_1&&(u=e.RGB5_A1)}return(u===e.R16F||u===e.R32F||u===e.RG16F||u===e.RG32F||u===e.RGBA16F||u===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),u}function S(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,V(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function C(e,t){return v(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),E(t),t.isVideoTexture&&d.delete(t),t.isHTMLTexture&&f.delete(t)}function T(e){let t=e.target;t.removeEventListener(`dispose`,T),O(t)}function E(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,a=m.get(n);if(a){let r=a[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&D(e),Object.keys(a).length===0&&m.delete(n)}r.remove(e)}function D(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let a=t.source,o=m.get(a);delete o[n.__cacheKey],s.memory.textures--}function O(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),s.memory.textures--),r.remove(a[t])}r.remove(t)}let k=0;function A(){k=0}function ie(){return k}function ae(e){k=e}function oe(){let e=k;return e>=a.maxTextures&&V(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+a.maxTextures),k+=1,e}function se(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function I(t,a){let o=r.get(t);if(t.isVideoTexture&&Me(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&o.__version!==t.version){let e=t.image;if(e===null)V(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)V(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ve(o,t,a);return}}else t.isExternalTexture&&(o.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,o.__webglTexture,e.TEXTURE0+a)}function ce(t,a){let o=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&o.__version!==t.version){ve(o,t,a);return}else t.isExternalTexture&&(o.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,o.__webglTexture,e.TEXTURE0+a)}function le(t,a){let o=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&o.__version!==t.version){ve(o,t,a);return}n.bindTexture(e.TEXTURE_3D,o.__webglTexture,e.TEXTURE0+a)}function ue(t,a){let o=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&o.__version!==t.version){ye(o,t,a);return}n.bindTexture(e.TEXTURE_CUBE_MAP,o.__webglTexture,e.TEXTURE0+a)}let de={[j]:e.REPEAT,[M]:e.CLAMP_TO_EDGE,[ee]:e.MIRRORED_REPEAT},fe={[N]:e.NEAREST,[te]:e.NEAREST_MIPMAP_NEAREST,[ne]:e.NEAREST_MIPMAP_LINEAR,[P]:e.LINEAR,[F]:e.LINEAR_MIPMAP_NEAREST,[re]:e.LINEAR_MIPMAP_LINEAR},pe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function me(n,o){if(o.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(o.magFilter===1006||o.magFilter===1007||o.magFilter===1005||o.magFilter===1008||o.minFilter===1006||o.minFilter===1007||o.minFilter===1005||o.minFilter===1008)&&V(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,de[o.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,de[o.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,de[o.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,fe[o.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,fe[o.minFilter]),o.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,pe[o.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(o.magFilter===1003||o.minFilter!==1005&&o.minFilter!==1008||o.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(o.anisotropy>1||r.get(o).__currentAnisotropy){let s=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,s.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(o.anisotropy,a.getMaxAnisotropy())),r.get(o).__currentAnisotropy=o.anisotropy}}}function he(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,w));let a=n.source,o=m.get(a);o===void 0&&(o={},m.set(a,o));let c=se(n);if(c!==t.__cacheKey){o[c]===void 0&&(o[c]={texture:e.createTexture(),usedTimes:0},s.memory.textures++,r=!0),o[c].usedTimes++;let a=o[t.__cacheKey];a!==void 0&&(o[t.__cacheKey].usedTimes--,a.usedTimes===0&&D(n)),t.__cacheKey=c,t.__webglTexture=o[c].texture}return r}function ge(e,t,n){return Math.floor(Math.floor(e/n)/t)}function _e(t,r,a,o){let s=t.updateRanges;if(s.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,a,o,r.data);else{s.sort((e,t)=>e.start-t.start);let c=0;for(let e=1;e<s.length;e++){let t=s[c],n=s[e],a=t.start+t.count,o=ge(n.start,r.width,4),l=ge(t.start,r.width,4);n.start<=a+1&&o===l&&ge(n.start+n.count-1,r.width,4)===o?t.count=Math.max(t.count,n.start+n.count-t.start):(++c,s[c]=n)}s.length=c+1;let l=n.getParameter(e.UNPACK_ROW_LENGTH),u=n.getParameter(e.UNPACK_SKIP_PIXELS),d=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,c=s.length;t<c;t++){let c=s[t],l=Math.floor(c.start/4),u=Math.ceil(c.count/4),d=l%r.width,f=Math.floor(l/r.width),p=u;n.pixelStorei(e.UNPACK_SKIP_PIXELS,d),n.pixelStorei(e.UNPACK_SKIP_ROWS,f),n.texSubImage2D(e.TEXTURE_2D,0,d,f,p,1,a,o,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,l),n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d)}}function ve(t,s,c){let l=e.TEXTURE_2D;(s.isDataArrayTexture||s.isCompressedArrayTexture)&&(l=e.TEXTURE_2D_ARRAY),s.isData3DTexture&&(l=e.TEXTURE_3D);let u=he(t,s),d=s.source;n.bindTexture(l,t.__webglTexture,e.TEXTURE0+c);let p=r.get(d);if(d.version!==p.__version||u===!0){if(n.activeTexture(e.TEXTURE0+c),!(typeof ImageBitmap<`u`&&s.image instanceof ImageBitmap)){let t=K.getPrimaries(K.workingColorSpace),r=s.colorSpace===``?null:K.getPrimaries(s.colorSpace),a=s.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,s.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,s.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,a)}n.pixelStorei(e.UNPACK_ALIGNMENT,s.unpackAlignment);let t=_(s.image,!1,a.maxTextureSize);t=R(s,t);let r=o.convert(s.format,s.colorSpace),m=o.convert(s.type),h=x(s.internalFormat,r,m,s.normalized,s.colorSpace,s.isVideoTexture);me(l,s);let g,b=s.mipmaps,w=s.isVideoTexture!==!0,T=p.__version===void 0||u===!0,E=d.dataReady,D=C(s,t);if(s.isDepthTexture)h=S(s.format===be,s.type),T&&(w?n.texStorage2D(e.TEXTURE_2D,1,h,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,h,t.width,t.height,0,r,m,null));else if(s.isDataTexture)if(b.length>0){w&&T&&n.texStorage2D(e.TEXTURE_2D,D,h,b[0].width,b[0].height);for(let t=0,a=b.length;t<a;t++)g=b[t],w?E&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,m,g.data):n.texImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,r,m,g.data);s.generateMipmaps=!1}else w?(T&&n.texStorage2D(e.TEXTURE_2D,D,h,t.width,t.height),E&&_e(s,t,r,m)):n.texImage2D(e.TEXTURE_2D,0,h,t.width,t.height,0,r,m,t.data);else if(s.isCompressedTexture)if(s.isCompressedArrayTexture){w&&T&&n.texStorage3D(e.TEXTURE_2D_ARRAY,D,h,b[0].width,b[0].height,t.depth);for(let a=0,o=b.length;a<o;a++)if(g=b[a],s.format!==1023)if(r!==null)if(w){if(E)if(s.layerUpdates.size>0){let t=Ha(g.width,g.height,s.format,s.type);for(let o of s.layerUpdates){let s=g.data.subarray(o*t/g.data.BYTES_PER_ELEMENT,(o+1)*t/g.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,o,g.width,g.height,1,r,s)}s.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,t.depth,r,g.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,a,h,g.width,g.height,t.depth,0,g.data,0,0);else V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`);else w?E&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,t.depth,r,m,g.data):n.texImage3D(e.TEXTURE_2D_ARRAY,a,h,g.width,g.height,t.depth,0,r,m,g.data)}else{w&&T&&n.texStorage2D(e.TEXTURE_2D,D,h,b[0].width,b[0].height);for(let t=0,a=b.length;t<a;t++)g=b[t],s.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,m,g.data):n.texImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,r,m,g.data):r===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,g.data):n.compressedTexImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,g.data)}else if(s.isDataArrayTexture)if(w){if(T&&n.texStorage3D(e.TEXTURE_2D_ARRAY,D,h,t.width,t.height,t.depth),E)if(s.layerUpdates.size>0){let a=Ha(t.width,t.height,s.format,s.type);for(let o of s.layerUpdates){let s=t.data.subarray(o*a/t.data.BYTES_PER_ELEMENT,(o+1)*a/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,o,t.width,t.height,1,r,m,s)}s.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,m,t.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,h,t.width,t.height,t.depth,0,r,m,t.data);else if(s.isData3DTexture)w?(T&&n.texStorage3D(e.TEXTURE_3D,D,h,t.width,t.height,t.depth),E&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,m,t.data)):n.texImage3D(e.TEXTURE_3D,0,h,t.width,t.height,t.depth,0,r,m,t.data);else if(s.isFramebufferTexture){if(T)if(w)n.texStorage2D(e.TEXTURE_2D,D,h,t.width,t.height);else{let a=t.width,o=t.height;for(let t=0;t<D;t++)n.texImage2D(e.TEXTURE_2D,t,h,a,o,0,r,m,null),a>>=1,o>>=1}}else if(s.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),f.add(s),n.onpaint=e=>{let t=e.changedElements;for(let e of f)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}let r=e.RGBA,a=e.RGBA,o=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,r,a,o,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(b.length>0){if(w&&T){let t=Ne(b[0]);n.texStorage2D(e.TEXTURE_2D,D,h,t.width,t.height)}for(let t=0,a=b.length;t<a;t++)g=b[t],w?E&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,m,g):n.texImage2D(e.TEXTURE_2D,t,h,r,m,g);s.generateMipmaps=!1}else if(w){if(T){let r=Ne(t);n.texStorage2D(e.TEXTURE_2D,D,h,r.width,r.height)}E&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,m,t)}else n.texImage2D(e.TEXTURE_2D,0,h,r,m,t);v(s)&&y(l),p.__version=d.version,s.onUpdate&&s.onUpdate(s)}t.__version=s.version}function ye(t,s,c){if(s.image.length!==6)return;let l=he(t,s),u=s.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+c);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+c);let t=K.getPrimaries(K.workingColorSpace),r=s.colorSpace===``?null:K.getPrimaries(s.colorSpace),f=s.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,s.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,s.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,s.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=s.isCompressedTexture||s.image[0].isCompressedTexture,m=s.image[0]&&s.image[0].isDataTexture,h=[];for(let e=0;e<6;e++)!p&&!m?h[e]=_(s.image[e],!0,a.maxCubemapSize):h[e]=m?s.image[e].image:s.image[e],h[e]=R(s,h[e]);let g=h[0],b=o.convert(s.format,s.colorSpace),S=o.convert(s.type),w=x(s.internalFormat,b,S,s.normalized,s.colorSpace),T=s.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=C(s,g);me(e.TEXTURE_CUBE_MAP,s);let k;if(p){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,w,g.width,g.height);for(let t=0;t<6;t++){k=h[t].mipmaps;for(let r=0;r<k.length;r++){let a=k[r];s.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,a.width,a.height,b,S,a.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,w,a.width,a.height,0,b,S,a.data):b===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,a.width,a.height,b,a.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,w,a.width,a.height,0,a.data)}}}else{if(k=s.mipmaps,T&&E){k.length>0&&O++;let t=Ne(h[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,w,t.width,t.height)}for(let t=0;t<6;t++)if(m){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,h[t].width,h[t].height,b,S,h[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,w,h[t].width,h[t].height,0,b,S,h[t].data);for(let r=0;r<k.length;r++){let a=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,a.width,a.height,b,S,a.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,w,a.width,a.height,0,b,S,a.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,h[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,w,b,S,h[t]);for(let r=0;r<k.length;r++){let a=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,a.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,w,b,S,a.image[t])}}}v(s)&&y(e.TEXTURE_CUBE_MAP),d.__version=u.version,s.onUpdate&&s.onUpdate(s)}t.__version=s.version}function xe(t,a,s,l,u,d){let f=o.convert(s.format,s.colorSpace),p=o.convert(s.type),m=x(s.internalFormat,f,p,s.normalized,s.colorSpace),h=r.get(a),g=r.get(s);if(g.__renderTarget=a,!h.__hasExternalTextures){let t=Math.max(1,a.width>>d),r=Math.max(1,a.height>>d);u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY?n.texImage3D(u,d,m,t,r,a.depth,0,f,p,null):n.texImage2D(u,d,m,t,r,0,f,p,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),je(a)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,l,u,g.__webglTexture,0,Ae(a)):(u===e.TEXTURE_2D||u>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&u<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,l,u,g.__webglTexture,d),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Se(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let a=n.depthTexture,o=a&&a.isDepthTexture?a.type:null,s=S(n.stencilBuffer,o),l=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;je(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ae(n),s,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ae(n),s,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,s,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,l,e.RENDERBUFFER,t)}else{let t=n.textures;for(let a=0;a<t.length;a++){let s=t[a],l=o.convert(s.format,s.colorSpace),u=o.convert(s.type),d=x(s.internalFormat,l,u,s.normalized,s.colorSpace);je(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ae(n),d,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ae(n),d,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,d,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ce(t,a,s){let l=a.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(a.depthTexture&&a.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let u=r.get(a.depthTexture);if(u.__renderTarget=a,(!u.__webglTexture||a.depthTexture.image.width!==a.width||a.depthTexture.image.height!==a.height)&&(a.depthTexture.image.width=a.width,a.depthTexture.image.height=a.height,a.depthTexture.needsUpdate=!0),l){if(u.__webglInit===void 0&&(u.__webglInit=!0,a.depthTexture.addEventListener(`dispose`,w)),u.__webglTexture===void 0){u.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture),me(e.TEXTURE_CUBE_MAP,a.depthTexture);let t=o.convert(a.depthTexture.format),r=o.convert(a.depthTexture.type),s;a.depthTexture.format===1026?s=e.DEPTH_COMPONENT24:a.depthTexture.format===1027&&(s=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,s,a.width,a.height,0,t,r,null)}}else I(a.depthTexture,0);let d=u.__webglTexture,f=Ae(a),p=l?e.TEXTURE_CUBE_MAP_POSITIVE_X+s:e.TEXTURE_2D,m=a.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(a.depthTexture.format===1026)je(a)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,m,p,d,0,f):e.framebufferTexture2D(e.FRAMEBUFFER,m,p,d,0);else if(a.depthTexture.format===1027)je(a)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,m,p,d,0,f):e.framebufferTexture2D(e.FRAMEBUFFER,m,p,d,0);else throw Error(`Unknown depthTexture format`)}function we(t){let a=r.get(t),o=t.isWebGLCubeRenderTarget===!0;if(a.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(a.__depthDisposeCallback&&a.__depthDisposeCallback(),e){let t=()=>{delete a.__boundDepthTexture,delete a.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),a.__depthDisposeCallback=t}a.__boundDepthTexture=e}if(t.depthTexture&&!a.__autoAllocateDepthBuffer)if(o)for(let e=0;e<6;e++)Ce(a.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?Ce(a.__webglFramebuffer[0],t,0):Ce(a.__webglFramebuffer,t,0)}else if(o){a.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[r]),a.__webglDepthbuffer[r]===void 0)a.__webglDepthbuffer[r]=e.createRenderbuffer(),Se(a.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,o=a.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,o)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer),a.__webglDepthbuffer===void 0)a.__webglDepthbuffer=e.createRenderbuffer(),Se(a.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=a.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Te(t,n,a){let o=r.get(t);n!==void 0&&xe(o.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),a!==void 0&&we(t)}function Ee(t){let a=t.texture,c=r.get(t),l=r.get(a);t.addEventListener(`dispose`,T);let u=t.textures,d=t.isWebGLCubeRenderTarget===!0,f=u.length>1;if(f||(l.__webglTexture===void 0&&(l.__webglTexture=e.createTexture()),l.__version=a.version,s.memory.textures++),d){c.__webglFramebuffer=[];for(let t=0;t<6;t++)if(a.mipmaps&&a.mipmaps.length>0){c.__webglFramebuffer[t]=[];for(let n=0;n<a.mipmaps.length;n++)c.__webglFramebuffer[t][n]=e.createFramebuffer()}else c.__webglFramebuffer[t]=e.createFramebuffer()}else{if(a.mipmaps&&a.mipmaps.length>0){c.__webglFramebuffer=[];for(let t=0;t<a.mipmaps.length;t++)c.__webglFramebuffer[t]=e.createFramebuffer()}else c.__webglFramebuffer=e.createFramebuffer();if(f)for(let t=0,n=u.length;t<n;t++){let n=r.get(u[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),s.memory.textures++)}if(t.samples>0&&je(t)===!1){c.__webglMultisampledFramebuffer=e.createFramebuffer(),c.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,c.__webglMultisampledFramebuffer);for(let n=0;n<u.length;n++){let r=u[n];c.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,c.__webglColorRenderbuffer[n]);let a=o.convert(r.format,r.colorSpace),s=o.convert(r.type),l=x(r.internalFormat,a,s,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),d=Ae(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,d,l,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,c.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(c.__webglDepthRenderbuffer=e.createRenderbuffer(),Se(c.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(d){n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),me(e.TEXTURE_CUBE_MAP,a);for(let n=0;n<6;n++)if(a.mipmaps&&a.mipmaps.length>0)for(let r=0;r<a.mipmaps.length;r++)xe(c.__webglFramebuffer[n][r],t,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else xe(c.__webglFramebuffer[n],t,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);v(a)&&y(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(f){for(let a=0,o=u.length;a<o;a++){let o=u[a],s=r.get(o),l=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(l=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(l,s.__webglTexture),me(l,o),xe(c.__webglFramebuffer,t,o,e.COLOR_ATTACHMENT0+a,l,0),v(o)&&y(l)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,l.__webglTexture),me(r,a),a.mipmaps&&a.mipmaps.length>0)for(let n=0;n<a.mipmaps.length;n++)xe(c.__webglFramebuffer[n],t,a,e.COLOR_ATTACHMENT0,r,n);else xe(c.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0,r,0);v(a)&&y(r),n.unbindTexture()}t.depthBuffer&&we(t)}function De(e){let t=e.textures;for(let a=0,o=t.length;a<o;a++){let o=t[a];if(v(o)){let t=b(e),a=r.get(o).__webglTexture;n.bindTexture(t,a),y(t),n.unbindTexture()}}}let Oe=[],ke=[];function L(t){if(t.samples>0){if(je(t)===!1){let a=t.textures,o=t.width,s=t.height,c=e.COLOR_BUFFER_BIT,u=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,d=r.get(t),f=a.length>1;if(f)for(let t=0;t<a.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,d.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,d.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,d.__webglMultisampledFramebuffer);let p=t.texture.mipmaps;p&&p.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,d.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,d.__webglFramebuffer);for(let n=0;n<a.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(c|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(c|=e.STENCIL_BUFFER_BIT)),f){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,d.__webglColorRenderbuffer[n]);let t=r.get(a[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,o,s,0,0,o,s,c,e.NEAREST),l===!0&&(Oe.length=0,ke.length=0,Oe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(Oe.push(u),ke.push(u),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,ke)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Oe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),f)for(let t=0;t<a.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,d.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,d.__webglColorRenderbuffer[t]);let o=r.get(a[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,d.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,o,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,d.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&l){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Ae(e){return Math.min(a.maxSamples,e.samples)}function je(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Me(e){let t=s.render.frame;d.get(e)!==t&&(d.set(e,t),e.update())}function R(e,t){let n=e.colorSpace,r=e.format,a=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(K.getTransfer(n)===`srgb`?(r!==1023||a!==1009)&&V(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):H(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ne(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(u.width=e.naturalWidth||e.width,u.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(u.width=e.displayWidth,u.height=e.displayHeight):(u.width=e.width,u.height=e.height),u}this.allocateTextureUnit=oe,this.resetTextureUnits=A,this.getTextureUnits=ie,this.setTextureUnits=ae,this.setTexture2D=I,this.setTexture2DArray=ce,this.setTexture3D=le,this.setTextureCube=ue,this.rebindTextures=Te,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=De,this.updateMultisampleRenderTarget=L,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=je,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function qc(e,t){function n(n,r=``){let a,o=K.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(o===`srgb`)if(a=t.get(`WEBGL_compressed_texture_s3tc_srgb`),a!==null){if(n===33776)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get(`WEBGL_compressed_texture_s3tc`),a!==null){if(n===33776)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(a=t.get(`WEBGL_compressed_texture_pvrtc`),a!==null){if(n===35840)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491)if(a=t.get(`WEBGL_compressed_texture_etc`),a!==null){if(n===36196||n===37492)return o===`srgb`?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===37496)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return a.COMPRESSED_R11_EAC;if(n===37489)return a.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return a.COMPRESSED_RG11_EAC;if(n===37491)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(a=t.get(`WEBGL_compressed_texture_astc`),a!==null){if(n===37808)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return o===`srgb`?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(a=t.get(`EXT_texture_compression_bptc`),a!==null){if(n===36492)return o===`srgb`?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(a=t.get(`EXT_texture_compression_rgtc`),a!==null){if(n===36283)return a.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Jc=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Yc=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Xc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ii(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Xi({vertexShader:Jc,fragmentShader:Yc,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new li(new zi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zc=class extends At{constructor(e,t){super();let n=this,r=null,a=1,o=null,s=`local-floor`,c=1,l=null,u=null,d=null,f=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,g=new Xc,_={},v=t.getContextAttributes(),y=null,b=null,x=[],S=[],C=new zt,w=null,T=new Ca;T.viewport=new rn;let E=new Ca;E.viewport=new rn;let D=[T,E],O=new Oa,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=x[e];return t===void 0&&(t=new zn,x[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=x[e];return t===void 0&&(t=new zn,x[e]=t),t.getGripSpace()},this.getHand=function(e){let t=x[e];return t===void 0&&(t=new zn,x[e]=t),t.getHandSpace()};function j(e){let t=S.indexOf(e.inputSource);if(t===-1)return;let n=x[t];n!==void 0&&(n.update(e.inputSource,e.frame,l||o),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,ee);for(let e=0;e<x.length;e++){let t=S[e];t!==null&&(S[e]=null,x[e].disconnect(t))}k=null,A=null,g.reset();for(let e in _)delete _[e];e.setRenderTarget(y),p=null,f=null,d=null,r=null,b=null,oe.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){a=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){s=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(e){l=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&h&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(y=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,ee),v.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(C),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,o=null,s=null;v.depth&&(s=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=v.stencil?be:ye,o=v.stencil?pe:ce);let c={colorFormat:t.RGBA8,depthFormat:s,scaleFactor:a};d=this.getBinding(),f=d.createProjectionLayer(c),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),b=new on(f.textureWidth,f.textureHeight,{format:ve,type:ie,depthTexture:new Pi(f.textureWidth,f.textureHeight,o,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:a};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new on(p.framebufferWidth,p.framebufferHeight,{format:ve,type:ie,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await r.requestReferenceSpace(s),oe.setContext(r),oe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ee(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=S.indexOf(n);r>=0&&(S[r]=null,x[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=S.indexOf(n);if(r===-1){for(let e=0;e<x.length;e++)if(e>=S.length){S.push(n),r=e;break}else if(S[e]===null){S[e]=n,r=e;break}if(r===-1)break}let a=x[r];a&&a.connect(n)}}let N=new W,te=new W;function ne(e,t,n){N.setFromMatrixPosition(t.matrixWorld),te.setFromMatrixPosition(n.matrixWorld);let r=N.distanceTo(te),a=t.projectionMatrix.elements,o=n.projectionMatrix.elements,s=a[14]/(a[10]-1),c=a[14]/(a[10]+1),l=(a[9]+1)/a[5],u=(a[9]-1)/a[5],d=(a[8]-1)/a[0],f=(o[8]+1)/o[0],p=s*d,m=s*f,h=r/(-d+f),g=h*-d;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(g),e.translateZ(h),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),a[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=s+h,n=c+h,a=p-g,o=m+(r-g),d=l*c/n*t,f=u*c/n*t;e.projectionMatrix.makePerspective(a,o,d,f,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function P(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;g.texture!==null&&(g.depthNear>0&&(t=g.depthNear),g.depthFar>0&&(n=g.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let a=e.parent,o=O.cameras;P(O,a);for(let e=0;e<o.length;e++)P(o[e],a);o.length===2?ne(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),F(e,O,a)};function F(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Nt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(e){c=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(e){return _[e]};let re=null;function ae(t,a){if(u=a.getViewerPose(l||o),m=a,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(b,p.framebuffer),e.setRenderTarget(b));let a=!1;t.length!==O.cameras.length&&(O.cameras.length=0,a=!0);for(let n=0;n<t.length;n++){let r=t[n],o=null;if(p!==null)o=p.getViewport(r);else{let t=d.getViewSubImage(f,r);o=t.viewport,n===0&&(e.setRenderTargetTextures(b,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(b))}let s=D[n];s===void 0&&(s=new Ca,s.layers.enable(n),s.viewport=new rn,D[n]=s),s.matrix.fromArray(r.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.projectionMatrix.fromArray(r.projectionMatrix),s.projectionMatrixInverse.copy(s.projectionMatrix).invert(),s.viewport.set(o.x,o.y,o.width,o.height),n===0&&(O.matrix.copy(s.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),a===!0&&O.cameras.push(s)}let o=r.enabledFeatures;if(o&&o.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&g.init(e,r.renderState)}if(o&&o.includes(`camera-access`)&&h){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=_[n];e||(e=new Ii,_[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<x.length;e++){let t=S[e],n=x[e];t!==null&&n!==void 0&&n.update(t,a,l||o)}re&&re(t,a),a.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:a}),m=null}let oe=new Wa;oe.setAnimationLoop(ae),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},Qc=new ln,$c=new G;$c.set(-1,0,0,0,1,0,0,0,1);function el(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Ki(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function a(e,t,n,r,a){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?o(e,t):t.isMeshLambertMaterial?(o(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(o(e,t),f(e,t)):t.isMeshPhongMaterial?(o(e,t),d(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(o(e,t),p(e,t),t.isMeshPhysicalMaterial&&m(e,t,a)):t.isMeshMatcapMaterial?(o(e,t),h(e,t)):t.isMeshDepthMaterial?o(e,t):t.isMeshDistanceMaterial?(o(e,t),g(e,t)):t.isMeshNormalMaterial?o(e,t):t.isLineBasicMaterial?(s(e,t),t.isLineDashedMaterial&&c(e,t)):t.isPointsMaterial?l(e,t,n,r):t.isSpriteMaterial?u(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function o(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let a=t.get(r),o=a.envMap,s=a.envMapRotation;o&&(e.envMap.value=o,e.envMapRotation.value.setFromMatrix4(Qc.makeRotationFromEuler(s)).transpose(),o.isCubeTexture&&o.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply($c),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function s(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function c(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function l(e,t,r,a){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=a*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function d(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function f(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function p(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function m(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function h(e,t){t.matcap&&(e.matcap.value=t.matcap)}function g(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function tl(e,t,n,r){let a={},o={},s=[],c=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function u(e,n){let s=a[e.id];s===void 0&&(h(e),s=d(e),a[e.id]=s,e.addEventListener(`dispose`,_));let c=n.program;r.updateUBOMapping(e,c);let l=t.render.frame;o[e.id]!==l&&(p(e),o[e.id]=l)}function d(t){let n=f();t.__bindingPointIndex=n;let r=e.createBuffer(),a=t.__size,o=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,a,o),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function f(){for(let e=0;e<c;e++)if(s.indexOf(e)===-1)return s.push(e),e;return H(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function p(t){let n=a[t.id],r=t.uniforms,o=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,a=n.length;r<a;r++){let a=n[r];if(m(a,t,r,o)===!0){let t=a.__offset,n=Array.isArray(a.value)?a.value:[a.value],r=0;for(let o=0;o<n.length;o++){let s=n[o],c=g(s);typeof s==`number`||typeof s==`boolean`?(a.__data[0]=s,e.bufferSubData(e.UNIFORM_BUFFER,t+r,a.__data)):s.isMatrix3?(a.__data[0]=s.elements[0],a.__data[1]=s.elements[1],a.__data[2]=s.elements[2],a.__data[3]=0,a.__data[4]=s.elements[3],a.__data[5]=s.elements[4],a.__data[6]=s.elements[5],a.__data[7]=0,a.__data[8]=s.elements[6],a.__data[9]=s.elements[7],a.__data[10]=s.elements[8],a.__data[11]=0):ArrayBuffer.isView(s)?a.__data.set(new s.constructor(s.buffer,s.byteOffset,a.__data.length)):(s.toArray(a.__data,r),r+=c.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,a.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function m(e,t,n,r){let a=e.value,o=t+`_`+n;if(r[o]===void 0)return typeof a==`number`||typeof a==`boolean`?r[o]=a:ArrayBuffer.isView(a)?r[o]=a.slice():r[o]=a.clone(),!0;{let e=r[o];if(typeof a==`number`||typeof a==`boolean`){if(e!==a)return r[o]=a,!0}else if(ArrayBuffer.isView(a))return!0;else if(e.equals(a)===!1)return e.copy(a),!0}return!1}function h(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],a=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=a.length;e<r;e++){let r=a[e],o=g(r),s=n%16,c=s%o.boundary,l=s+c;n+=c,l!==0&&16-l<o.storage&&(n+=16-l),t.__data=new Float32Array(o.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=o.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function g(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?V(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):V(`WebGLRenderer: Unsupported uniform value type.`,e),t}function _(t){let n=t.target;n.removeEventListener(`dispose`,_);let r=s.indexOf(n.__bindingPointIndex);s.splice(r,1),e.deleteBuffer(a[n.id]),delete a[n.id],delete o[n.id]}function v(){for(let t in a)e.deleteBuffer(a[t]);s=[],a={},o={}}return{bind:l,update:u,dispose:v}}var nl=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),rl=null;function il(){return rl===null&&(rl=new fi(nl,16,16,Ce,ue),rl.name=`DFG_LUT`,rl.minFilter=P,rl.magFilter=P,rl.wrapS=M,rl.wrapT=M,rl.generateMipmaps=!1,rl.needsUpdate=!0),rl}var al=class{constructor(e={}){let{canvas:t=St(),context:n=null,depth:r=!0,stencil:a=!1,alpha:o=!1,antialias:s=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u=`default`,failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:p=ie}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=n.getContextAttributes().alpha}else m=o;let h=p,g=new Set([Te,we,Se]),_=new Set([ie,ce,se,pe,de,fe]),v=new Uint32Array(4),y=new Int32Array(4),b=new W,x=null,S=null,C=[],w=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let E=this,D=!1,O=null;this._outputColorSpace=ft;let k=0,A=0,j=null,M=-1,ee=null,N=new rn,te=new rn,ne=null,P=new q(0),F=0,ae=t.width,oe=t.height,I=1,le=null,me=null,he=new rn(0,0,ae,oe),ge=new rn(0,0,ae,oe),_e=!1,ve=new bi,ye=!1,be=!1,xe=new ln,Ce=new W,Ee=new rn,De={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Oe=!1;function ke(){return j===null?I:1}let L=n;function Ae(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:a,antialias:s,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r184`),t.addEventListener(`webglcontextlost`,$e,!1),t.addEventListener(`webglcontextrestored`,et,!1),t.addEventListener(`webglcontextcreationerror`,tt,!1),L===null){let t=`webgl2`;if(L=Ae(t,e),L===null)throw Ae(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw H(`WebGLRenderer: `+e.message),e}let je,Me,R,Ne,z,B,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe;function Ze(){je=new Co(L),je.init(),Je=new qc(L,je),Me=new $a(L,je,e,Je),R=new Gc(L,je),Me.reversedDepthBuffer&&f&&R.buffers.depth.setReversed(!0),Ne=new Eo(L),z=new Tc,B=new Kc(L,je,R,z,Me,Je,Ne),Pe=new So(E),Fe=new Ga(L),Ye=new Za(L,Fe),Ie=new wo(L,Fe,Ne,Ye),Le=new Oo(L,Ie,Fe,Ye,Ne),Ge=new Do(L,Me,B),He=new eo(z),Re=new wc(E,Pe,je,Me,Ye,He),ze=new el(E,z),Be=new kc,Ve=new Ic(je),We=new Xa(E,Pe,R,Le,m,c),Ue=new Wc(E,Le,Me),Xe=new tl(L,Ne,Me,R),Ke=new Qa(L,je,Ne),qe=new To(L,je,Ne),Ne.programs=Re.programs,E.capabilities=Me,E.extensions=je,E.properties=z,E.renderLists=Be,E.shadowMap=Ue,E.state=R,E.info=Ne}Ze(),h!==1009&&(T=new Ao(h,t.width,t.height,r,a));let Qe=new Zc(E,L);this.xr=Qe,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let e=je.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=je.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return I},this.setPixelRatio=function(e){e!==void 0&&(I=e,this.setSize(ae,oe,!1))},this.getSize=function(e){return e.set(ae,oe)},this.setSize=function(e,n,r=!0){if(Qe.isPresenting){V(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ae=e,oe=n,t.width=Math.floor(e*I),t.height=Math.floor(n*I),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ae*I,oe*I).floor()},this.setDrawingBufferSize=function(e,n,r){ae=e,oe=n,I=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(h===1009){H(`THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){V(`THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}T.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(N)},this.getViewport=function(e){return e.copy(he)},this.setViewport=function(e,t,n,r){e.isVector4?he.set(e.x,e.y,e.z,e.w):he.set(e,t,n,r),R.viewport(N.copy(he).multiplyScalar(I).round())},this.getScissor=function(e){return e.copy(ge)},this.setScissor=function(e,t,n,r){e.isVector4?ge.set(e.x,e.y,e.z,e.w):ge.set(e,t,n,r),R.scissor(te.copy(ge).multiplyScalar(I).round())},this.getScissorTest=function(){return _e},this.setScissorTest=function(e){R.setScissorTest(_e=e)},this.setOpaqueSort=function(e){le=e},this.setTransparentSort=function(e){me=e},this.getClearColor=function(e){return e.copy(We.getClearColor())},this.setClearColor=function(){We.setClearColor(...arguments)},this.getClearAlpha=function(){return We.getClearAlpha()},this.setClearAlpha=function(){We.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(j!==null){let t=j.texture.format;e=g.has(t)}if(e){let e=j.texture.type,t=_.has(e),n=We.getClearColor(),r=We.getClearAlpha(),a=n.r,o=n.g,s=n.b;t?(v[0]=a,v[1]=o,v[2]=s,v[3]=r,L.clearBufferuiv(L.COLOR,0,v)):(y[0]=a,y[1]=o,y[2]=s,y[3]=r,L.clearBufferiv(L.COLOR,0,y))}else r|=L.COLOR_BUFFER_BIT}t&&(r|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&L.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),O=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,$e,!1),t.removeEventListener(`webglcontextrestored`,et,!1),t.removeEventListener(`webglcontextcreationerror`,tt,!1),We.dispose(),Be.dispose(),Ve.dispose(),z.dispose(),Pe.dispose(),Le.dispose(),Ye.dispose(),Xe.dispose(),Re.dispose(),Qe.dispose(),Qe.removeEventListener(`sessionstart`,ct),Qe.removeEventListener(`sessionend`,lt),ut.stop()};function $e(e){e.preventDefault(),Tt(`WebGLRenderer: Context Lost.`),D=!0}function et(){Tt(`WebGLRenderer: Context Restored.`),D=!1;let e=Ne.autoReset,t=Ue.enabled,n=Ue.autoUpdate,r=Ue.needsUpdate,a=Ue.type;Ze(),Ne.autoReset=e,Ue.enabled=t,Ue.autoUpdate=n,Ue.needsUpdate=r,Ue.type=a}function tt(e){H(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function nt(e){let t=e.target;t.removeEventListener(`dispose`,nt),rt(t)}function rt(e){it(e),z.remove(e)}function it(e){let t=z.get(e).programs;t!==void 0&&(t.forEach(function(e){Re.releaseProgram(e)}),e.isShaderMaterial&&Re.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,a,o){t===null&&(t=De);let s=a.isMesh&&a.matrixWorld.determinant()<0,c=Ct(e,t,n,r,a);R.setMaterial(r,s);let l=n.index,u=1;if(r.wireframe===!0){if(l=Ie.getWireframeAttribute(n),l===void 0)return;u=2}let d=n.drawRange,f=n.attributes.position,p=d.start*u,m=(d.start+d.count)*u;o!==null&&(p=Math.max(p,o.start*u),m=Math.min(m,(o.start+o.count)*u)),l===null?f!=null&&(p=Math.max(p,0),m=Math.min(m,f.count)):(p=Math.max(p,0),m=Math.min(m,l.count));let h=m-p;if(h<0||h===1/0)return;Ye.setup(a,r,c,n,l);let g,_=Ke;if(l!==null&&(g=Fe.get(l),_=qe,_.setIndex(g)),a.isMesh)r.wireframe===!0?(R.setLineWidth(r.wireframeLinewidth*ke()),_.setMode(L.LINES)):_.setMode(L.TRIANGLES);else if(a.isLine){let e=r.linewidth;e===void 0&&(e=1),R.setLineWidth(e*ke()),a.isLineSegments?_.setMode(L.LINES):a.isLineLoop?_.setMode(L.LINE_LOOP):_.setMode(L.LINE_STRIP)}else a.isPoints?_.setMode(L.POINTS):a.isSprite&&_.setMode(L.TRIANGLES);if(a.isBatchedMesh)if(je.get(`WEBGL_multi_draw`))_.renderMultiDraw(a._multiDrawStarts,a._multiDrawCounts,a._multiDrawCount);else{let e=a._multiDrawStarts,t=a._multiDrawCounts,n=a._multiDrawCount,o=l?Fe.get(l).bytesPerElement:1,s=z.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)s.setValue(L,`_gl_DrawID`,r),_.render(e[r]/o,t[r])}else if(a.isInstancedMesh)_.renderInstances(p,h,a.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);_.renderInstances(p,h,t)}else _.render(p,h)};function at(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,_t(e,t,n),e.side=0,e.needsUpdate=!0,_t(e,t,n),e.side=2):_t(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),S=Ve.get(n),S.init(t),w.push(S),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(S.pushLight(e),e.castShadow&&S.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(S.pushLight(e),e.castShadow&&S.pushShadow(e))}),S.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t)if(Array.isArray(t))for(let a=0;a<t.length;a++){let o=t[a];at(o,n,e),r.add(o)}else at(t,n,e),r.add(t)}),S=w.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){z.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}je.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ot=null;function st(e){ot&&ot(e)}function ct(){ut.stop()}function lt(){ut.start()}let ut=new Wa;ut.setAnimationLoop(st),typeof self<`u`&&ut.setContext(self),this.setAnimationLoop=function(e){ot=e,Qe.setAnimationLoop(e),e===null?ut.stop():ut.start()},Qe.addEventListener(`sessionstart`,ct),Qe.addEventListener(`sessionend`,lt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){H(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(D===!0)return;O!==null&&O.renderStart(e,t);let n=Qe.enabled===!0&&Qe.isPresenting===!0,r=T!==null&&(j===null||n)&&T.begin(E,j);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Qe.enabled===!0&&Qe.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Qe.cameraAutoUpdate===!0&&Qe.updateCamera(t),t=Qe.getCamera()),e.isScene===!0&&e.onBeforeRender(E,e,t,j),S=Ve.get(e,w.length),S.init(t),S.state.textureUnits=B.getTextureUnits(),w.push(S),xe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ve.setFromProjectionMatrix(xe,vt,t.reversedDepth),be=this.localClippingEnabled,ye=He.init(this.clippingPlanes,be),x=Be.get(e,C.length),x.init(),C.push(x),Qe.enabled===!0&&Qe.isPresenting===!0){let e=E.xr.getDepthSensingMesh();e!==null&&dt(e,t,-1/0,E.sortObjects)}dt(e,t,0,E.sortObjects),x.finish(),E.sortObjects===!0&&x.sort(le,me),Oe=Qe.enabled===!1||Qe.isPresenting===!1||Qe.hasDepthSensing()===!1,Oe&&We.addToRenderList(x,e),this.info.render.frame++,ye===!0&&He.beginShadows();let a=S.state.shadowsArray;if(Ue.render(a,e,t),ye===!0&&He.endShadows(),this.info.autoReset===!0&&this.info.reset(),(r&&T.hasRenderPass())===!1){let n=x.opaque,r=x.transmissive;if(S.setupLights(),t.isArrayCamera){let a=t.cameras;if(r.length>0)for(let t=0,o=a.length;t<o;t++){let o=a[t];mt(n,r,e,o)}Oe&&We.render(e);for(let t=0,n=a.length;t<n;t++){let n=a[t];pt(x,e,n,n.viewport)}}else r.length>0&&mt(n,r,e,t),Oe&&We.render(e),pt(x,e,t)}j!==null&&A===0&&(B.updateMultisampleRenderTarget(j),B.updateRenderTargetMipmap(j)),r&&T.end(E),e.isScene===!0&&e.onAfterRender(E,e,t),Ye.resetDefaultState(),M=-1,ee=null,w.pop(),w.length>0?(S=w[w.length-1],B.setTextureUnits(S.state.textureUnits),ye===!0&&He.setGlobalState(E.clippingPlanes,S.state.camera)):S=null,C.pop(),x=C.length>0?C[C.length-1]:null,O!==null&&O.renderEnd()};function dt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)S.pushLightProbeGrid(e);else if(e.isLight)S.pushLight(e),e.castShadow&&S.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ve.intersectsSprite(e)){r&&Ee.setFromMatrixPosition(e.matrixWorld).applyMatrix4(xe);let t=Le.update(e),a=e.material;a.visible&&x.push(e,t,a,n,Ee.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ve.intersectsObject(e))){let t=Le.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),Ee.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ee.copy(e.boundingSphere.center)),Ee.applyMatrix4(e.matrixWorld).applyMatrix4(xe)),Array.isArray(a)){let r=t.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&x.push(e,t,c,n,Ee.z,s)}}else a.visible&&x.push(e,t,a,n,Ee.z,null)}}let a=e.children;for(let e=0,o=a.length;e<o;e++)dt(a[e],t,n,r)}function pt(e,t,n,r){let{opaque:a,transmissive:o,transparent:s}=e;S.setupLightsView(n),ye===!0&&He.setGlobalState(E.clippingPlanes,n),r&&R.viewport(N.copy(r)),a.length>0&&ht(a,t,n),o.length>0&&ht(o,t,n),s.length>0&&ht(s,t,n),R.buffers.depth.setTest(!0),R.buffers.depth.setMask(!0),R.buffers.color.setMask(!0),R.setPolygonOffset(!1)}function mt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[r.id]===void 0){let e=je.has(`EXT_color_buffer_half_float`)||je.has(`EXT_color_buffer_float`);S.state.transmissionRenderTarget[r.id]=new on(1,1,{generateMipmaps:!0,type:e?ue:ie,minFilter:re,samples:Math.max(4,Me.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:K.workingColorSpace})}let o=S.state.transmissionRenderTarget[r.id],s=r.viewport||N;o.setSize(s.z*E.transmissionResolutionScale,s.w*E.transmissionResolutionScale);let c=E.getRenderTarget(),l=E.getActiveCubeFace(),u=E.getActiveMipmapLevel();E.setRenderTarget(o),E.getClearColor(P),F=E.getClearAlpha(),F<1&&E.setClearColor(16777215,.5),E.clear(),Oe&&We.render(n);let d=E.toneMapping;E.toneMapping=0;let f=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),S.setupLightsView(r),ye===!0&&He.setGlobalState(E.clippingPlanes,r),ht(e,n,r),B.updateMultisampleRenderTarget(o),B.updateRenderTargetMipmap(o),je.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let a=0,o=t.length;a<o;a++){let{object:o,geometry:s,material:c,group:l}=t[a];if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,gt(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(B.updateMultisampleRenderTarget(o),B.updateRenderTargetMipmap(o))}E.setRenderTarget(c,l,u),E.setClearColor(P,F),f!==void 0&&(r.viewport=f),E.toneMapping=d}function ht(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let a=0,o=e.length;a<o;a++){let o=e[a],{object:s,geometry:c,group:l}=o,u=o.material;u.allowOverride===!0&&r!==null&&(u=r),s.layers.test(n.layers)&&gt(s,t,n,c,u,l)}}function gt(e,t,n,r,a,o){e.onBeforeRender(E,t,n,r,a,o),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),a.onBeforeRender(E,t,n,r,e,o),a.transparent===!0&&a.side===2&&a.forceSinglePass===!1?(a.side=1,a.needsUpdate=!0,E.renderBufferDirect(n,t,r,a,e,o),a.side=0,a.needsUpdate=!0,E.renderBufferDirect(n,t,r,a,e,o),a.side=2):E.renderBufferDirect(n,t,r,a,e,o),e.onAfterRender(E,t,n,r,a,o)}function _t(e,t,n){t.isScene!==!0&&(t=De);let r=z.get(e),a=S.state.lights,o=S.state.shadowsArray,s=a.state.version,c=Re.getParameters(e,a.state,o,t,n,S.state.lightProbeGridArray),l=Re.getProgramCacheKey(c),u=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let d=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Pe.get(e.envMap||r.environment,d),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,u===void 0&&(e.addEventListener(`dispose`,nt),u=new Map,r.programs=u);let f=u.get(l);if(f!==void 0){if(r.currentProgram===f&&r.lightsStateVersion===s)return bt(e,c),f}else c.uniforms=Re.getUniforms(e),O!==null&&e.isNodeMaterial&&O.build(e,n,c),e.onBeforeCompile(c,E),f=Re.acquireProgram(c,l),u.set(l,f),r.uniforms=c.uniforms;let p=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(p.clippingPlanes=He.uniform),bt(e,c),r.needsLights=Et(e),r.lightsStateVersion=s,r.needsLights&&(p.ambientLightColor.value=a.state.ambient,p.lightProbe.value=a.state.probe,p.directionalLights.value=a.state.directional,p.directionalLightShadows.value=a.state.directionalShadow,p.spotLights.value=a.state.spot,p.spotLightShadows.value=a.state.spotShadow,p.rectAreaLights.value=a.state.rectArea,p.ltc_1.value=a.state.rectAreaLTC1,p.ltc_2.value=a.state.rectAreaLTC2,p.pointLights.value=a.state.point,p.pointLightShadows.value=a.state.pointShadow,p.hemisphereLights.value=a.state.hemi,p.directionalShadowMatrix.value=a.state.directionalShadowMatrix,p.spotLightMatrix.value=a.state.spotLightMatrix,p.spotLightMap.value=a.state.spotLightMap,p.pointShadowMatrix.value=a.state.pointShadowMatrix),r.lightProbeGrid=S.state.lightProbeGridArray.length>0,r.currentProgram=f,r.uniformsList=null,f}function yt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Ls.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function bt(e,t){let n=z.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function xt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];b.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(b))return n}return null}function Ct(e,t,n,r,a){t.isScene!==!0&&(t=De),B.resetTextureUnits();let o=t.fog,s=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,c=j===null?E.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:K.workingColorSpace,l=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,u=Pe.get(r.envMap||s,l),d=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,f=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),p=!!n.morphAttributes.position,m=!!n.morphAttributes.normal,h=!!n.morphAttributes.color,g=0;r.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(g=E.toneMapping);let _=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,v=_===void 0?0:_.length,y=z.get(r),b=S.state.lights;if(ye===!0&&(be===!0||e!==ee)){let t=e===ee&&r.id===M;He.setState(r,e,t)}let x=!1;r.version===y.__version?y.needsLights&&y.lightsStateVersion!==b.state.version?x=!0:y.outputColorSpace===c?a.isBatchedMesh&&y.batching===!1||!a.isBatchedMesh&&y.batching===!0||a.isBatchedMesh&&y.batchingColor===!0&&a.colorTexture===null||a.isBatchedMesh&&y.batchingColor===!1&&a.colorTexture!==null||a.isInstancedMesh&&y.instancing===!1||!a.isInstancedMesh&&y.instancing===!0||a.isSkinnedMesh&&y.skinning===!1||!a.isSkinnedMesh&&y.skinning===!0||a.isInstancedMesh&&y.instancingColor===!0&&a.instanceColor===null||a.isInstancedMesh&&y.instancingColor===!1&&a.instanceColor!==null||a.isInstancedMesh&&y.instancingMorph===!0&&a.morphTexture===null||a.isInstancedMesh&&y.instancingMorph===!1&&a.morphTexture!==null?x=!0:y.envMap===u?r.fog===!0&&y.fog!==o||y.numClippingPlanes!==void 0&&(y.numClippingPlanes!==He.numPlanes||y.numIntersection!==He.numIntersection)?x=!0:y.vertexAlphas===d&&y.vertexTangents===f&&y.morphTargets===p&&y.morphNormals===m&&y.morphColors===h&&y.toneMapping===g&&y.morphTargetsCount===v?!!y.lightProbeGrid!=S.state.lightProbeGridArray.length>0&&(x=!0):x=!0:x=!0:x=!0:(x=!0,y.__version=r.version);let C=y.currentProgram;x===!0&&(C=_t(r,t,a),O&&r.isNodeMaterial&&O.onUpdateProgram(r,C,y));let w=!1,T=!1,D=!1,k=C.getUniforms(),A=y.uniforms;if(R.useProgram(C.program)&&(w=!0,T=!0,D=!0),r.id!==M&&(M=r.id,T=!0),y.needsLights){let e=xt(S.state.lightProbeGridArray,a);y.lightProbeGrid!==e&&(y.lightProbeGrid=e,T=!0)}if(w||ee!==e){R.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(L,`projectionMatrix`,e.projectionMatrix),k.setValue(L,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(L,Ce.setFromMatrixPosition(e.matrixWorld)),Me.logarithmicDepthBuffer&&k.setValue(L,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(L,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,T=!0,D=!0)}if(y.needsLights&&(b.state.directionalShadowMap.length>0&&k.setValue(L,`directionalShadowMap`,b.state.directionalShadowMap,B),b.state.spotShadowMap.length>0&&k.setValue(L,`spotShadowMap`,b.state.spotShadowMap,B),b.state.pointShadowMap.length>0&&k.setValue(L,`pointShadowMap`,b.state.pointShadowMap,B)),a.isSkinnedMesh){k.setOptional(L,a,`bindMatrix`),k.setOptional(L,a,`bindMatrixInverse`);let e=a.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(L,`boneTexture`,e.boneTexture,B))}a.isBatchedMesh&&(k.setOptional(L,a,`batchingTexture`),k.setValue(L,`batchingTexture`,a._matricesTexture,B),k.setOptional(L,a,`batchingIdTexture`),k.setValue(L,`batchingIdTexture`,a._indirectTexture,B),k.setOptional(L,a,`batchingColorTexture`),a._colorsTexture!==null&&k.setValue(L,`batchingColorTexture`,a._colorsTexture,B));let N=n.morphAttributes;if((N.position!==void 0||N.normal!==void 0||N.color!==void 0)&&Ge.update(a,n,C),(T||y.receiveShadow!==a.receiveShadow)&&(y.receiveShadow=a.receiveShadow,k.setValue(L,`receiveShadow`,a.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),A.dfgLUT!==void 0&&(A.dfgLUT.value=il()),T){if(k.setValue(L,`toneMappingExposure`,E.toneMappingExposure),y.needsLights&&wt(A,D),o&&r.fog===!0&&ze.refreshFogUniforms(A,o),ze.refreshMaterialUniforms(A,r,I,oe,S.state.transmissionRenderTarget[e.id]),y.needsLights&&y.lightProbeGrid){let e=y.lightProbeGrid;A.probesSH.value=e.texture,A.probesMin.value.copy(e.boundingBox.min),A.probesMax.value.copy(e.boundingBox.max),A.probesResolution.value.copy(e.resolution)}Ls.upload(L,yt(y),A,B)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Ls.upload(L,yt(y),A,B),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(L,`center`,a.center),k.setValue(L,`modelViewMatrix`,a.modelViewMatrix),k.setValue(L,`normalMatrix`,a.normalMatrix),k.setValue(L,`modelMatrix`,a.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Xe.update(n,C),Xe.bind(n,C)}}return C}function wt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Et(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(e,t,n){let r=z.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),z.get(e.texture).__webglTexture=t,z.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=z.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let Dt=L.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){j=e,k=t,A=n;let r=null,a=!1,o=!1;if(e){let s=z.get(e);if(s.__useDefaultFramebuffer!==void 0){R.bindFramebuffer(L.FRAMEBUFFER,s.__webglFramebuffer),N.copy(e.viewport),te.copy(e.scissor),ne=e.scissorTest,R.viewport(N),R.scissor(te),R.setScissorTest(ne),M=-1;return}else if(s.__webglFramebuffer===void 0)B.setupRenderTarget(e);else if(s.__hasExternalTextures)B.rebindTextures(e,z.get(e.texture).__webglTexture,z.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&z.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);B.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=z.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(l[t])?l[t][n]:l[t],a=!0):r=e.samples>0&&B.useMultisampledRTT(e)===!1?z.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,N.copy(e.viewport),te.copy(e.scissor),ne=e.scissorTest}else N.copy(he).multiplyScalar(I).floor(),te.copy(ge).multiplyScalar(I).floor(),ne=_e;if(n!==0&&(r=Dt),R.bindFramebuffer(L.FRAMEBUFFER,r)&&R.drawBuffers(e,r),R.viewport(N),R.scissor(te),R.setScissorTest(ne),a){let r=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let a=z.get(e.textures[t]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+t,a.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,t.__webglTexture,n)}M=-1},this.readRenderTargetPixels=function(e,t,n,r,a,o,s,c=0){if(!(e&&e.isWebGLRenderTarget)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let l=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&s!==void 0&&(l=l[s]),l){R.bindFramebuffer(L.FRAMEBUFFER,l);try{let s=e.textures[c],l=s.format,u=s.type;if(e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+c),!Me.textureFormatReadable(l)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!Me.textureTypeReadable(u)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-a&&L.readPixels(t,n,r,a,Je.convert(l),Je.convert(u),o)}finally{let e=j===null?null:z.get(j).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,a,o,s,c=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let l=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&s!==void 0&&(l=l[s]),l)if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-a){R.bindFramebuffer(L.FRAMEBUFFER,l);let s=e.textures[c],u=s.format,d=s.type;if(e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+c),!Me.textureFormatReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!Me.textureTypeReadable(d))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,f),L.bufferData(L.PIXEL_PACK_BUFFER,o.byteLength,L.STREAM_READ),L.readPixels(t,n,r,a,Je.convert(u),Je.convert(d),0);let p=j===null?null:z.get(j).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,p);let m=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Ot(L,m,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,f),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,o),L.deleteBuffer(f),L.deleteSync(m),o}else throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,a=Math.floor(e.image.width*r),o=Math.floor(e.image.height*r),s=t===null?0:t.x,c=t===null?0:t.y;B.setTexture2D(e,0),L.copyTexSubImage2D(L.TEXTURE_2D,n,0,0,s,c,a,o),R.unbindTexture()};let kt=L.createFramebuffer(),At=L.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,a=0,o=0){let s,c,l,u,d,f,p,m,h,g=e.isCompressedTexture?e.mipmaps[o]:e.image;if(n!==null)s=n.max.x-n.min.x,c=n.max.y-n.min.y,l=n.isBox3?n.max.z-n.min.z:1,u=n.min.x,d=n.min.y,f=n.isBox3?n.min.z:0;else{let t=2**-a;s=Math.floor(g.width*t),c=Math.floor(g.height*t),l=e.isDataArrayTexture?g.depth:e.isData3DTexture?Math.floor(g.depth*t):1,u=0,d=0,f=0}r===null?(p=0,m=0,h=0):(p=r.x,m=r.y,h=r.z);let _=Je.convert(t.format),v=Je.convert(t.type),y;t.isData3DTexture?(B.setTexture3D(t,0),y=L.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(B.setTexture2DArray(t,0),y=L.TEXTURE_2D_ARRAY):(B.setTexture2D(t,0),y=L.TEXTURE_2D),R.activeTexture(L.TEXTURE0),R.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),R.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),R.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let b=R.getParameter(L.UNPACK_ROW_LENGTH),x=R.getParameter(L.UNPACK_IMAGE_HEIGHT),S=R.getParameter(L.UNPACK_SKIP_PIXELS),C=R.getParameter(L.UNPACK_SKIP_ROWS),w=R.getParameter(L.UNPACK_SKIP_IMAGES);R.pixelStorei(L.UNPACK_ROW_LENGTH,g.width),R.pixelStorei(L.UNPACK_IMAGE_HEIGHT,g.height),R.pixelStorei(L.UNPACK_SKIP_PIXELS,u),R.pixelStorei(L.UNPACK_SKIP_ROWS,d),R.pixelStorei(L.UNPACK_SKIP_IMAGES,f);let T=e.isDataArrayTexture||e.isData3DTexture,E=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=z.get(e),r=z.get(t),g=z.get(n.__renderTarget),_=z.get(r.__renderTarget);R.bindFramebuffer(L.READ_FRAMEBUFFER,g.__webglFramebuffer),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,_.__webglFramebuffer);for(let n=0;n<l;n++)T&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(e).__webglTexture,a,f+n),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(t).__webglTexture,o,h+n)),L.blitFramebuffer(u,d,s,c,p,m,s,c,L.DEPTH_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(a!==0||e.isRenderTargetTexture||z.has(e)){let n=z.get(e),r=z.get(t);R.bindFramebuffer(L.READ_FRAMEBUFFER,kt),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,At);for(let e=0;e<l;e++)T?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,n.__webglTexture,a,f+e):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,n.__webglTexture,a),E?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,r.__webglTexture,o,h+e):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,r.__webglTexture,o),a===0?E?L.copyTexSubImage3D(y,o,p,m,h+e,u,d,s,c):L.copyTexSubImage2D(y,o,p,m,u,d,s,c):L.blitFramebuffer(u,d,s,c,p,m,s,c,L.COLOR_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else E?e.isDataTexture||e.isData3DTexture?L.texSubImage3D(y,o,p,m,h,s,c,l,_,v,g.data):t.isCompressedArrayTexture?L.compressedTexSubImage3D(y,o,p,m,h,s,c,l,_,g.data):L.texSubImage3D(y,o,p,m,h,s,c,l,_,v,g):e.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,o,p,m,s,c,_,v,g.data):e.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,o,p,m,g.width,g.height,_,g.data):L.texSubImage2D(L.TEXTURE_2D,o,p,m,s,c,_,v,g);R.pixelStorei(L.UNPACK_ROW_LENGTH,b),R.pixelStorei(L.UNPACK_IMAGE_HEIGHT,x),R.pixelStorei(L.UNPACK_SKIP_PIXELS,S),R.pixelStorei(L.UNPACK_SKIP_ROWS,C),R.pixelStorei(L.UNPACK_SKIP_IMAGES,w),o===0&&t.generateMipmaps&&L.generateMipmap(y),R.unbindTexture()},this.initRenderTarget=function(e){z.get(e).__webglFramebuffer===void 0&&B.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?B.setTextureCube(e,0):e.isData3DTexture?B.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?B.setTexture2DArray(e,0):B.setTexture2D(e,0),R.unbindTexture()},this.resetState=function(){k=0,A=0,j=null,R.reset(),Ye.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return vt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=K._getDrawingBufferColorSpace(e),t.unpackColorSpace=K._getUnpackColorSpace()}};function ol(e){if(e<380)return[80,0,130];if(e<440){let t=(e-380)/60;return[0,0,Math.min(255,Math.round(130+125*t))]}if(e<490){let t=(e-440)/50;return[0,Math.round(255*t),255]}if(e<510){let t=(e-490)/20;return[0,255,Math.round(255*(1-t))]}if(e<580){let t=(e-510)/70;return[Math.round(255*t),Math.round(255*(1-t*.2)),0]}if(e<645){let t=(e-580)/65;return[255,Math.round(180*(1-t)),0]}if(e<=780){let t=(e-645)/135;return[Math.round(255*(1-t*.3)),0,0]}return[80,0,0]}function sl(e){return[Math.max(30,Math.min(240,Math.round(128+127*Math.cos(e*Math.PI/180)))),Math.max(30,Math.min(240,Math.round(128+127*Math.cos((e-120)*Math.PI/180)))),Math.max(30,Math.min(240,Math.round(128+127*Math.cos((e+120)*Math.PI/180))))]}var cl={};function ll({wls:e,vals:t,theme:n={}}){let r=(0,u.useRef)();return(0,u.useEffect)(()=>{let a=r.current;if(!a||!e?.length)return;let o=devicePixelRatio||1,s=a.offsetWidth,c=a.offsetHeight;a.width=s*o,a.height=c*o;let l=a.getContext(`2d`);l.scale(o,o);let u=s-42-12,d=c-10-32,f=Math.max(...t),p=Math.min(...e),m=Math.max(1,Math.max(...e)-p);l.fillStyle=n.chartBg||`rgba(0,0,0,0.2)`,l.fillRect(42,10,u,d),l.strokeStyle=n.gridLine||`rgba(255,255,255,0.07)`,l.lineWidth=.5;for(let e=0;e<=4;e++){let t=10+d-e/4*d;l.beginPath(),l.moveTo(42,t),l.lineTo(42+u,t),l.stroke()}[400,450,500,550,600,650,700,750].forEach(e=>{let t=42+(e-p)/m*u;t<42||t>42+u||(l.beginPath(),l.moveTo(t,10),l.lineTo(t,10+d),l.stroke())}),e.forEach((n,r)=>{if(r===0)return;let a=(n+e[r-1])/2,[o,s,c]=ol(Math.round(a)),h=42+(e[r-1]-p)/m*u,g=42+(n-p)/m*u,_=(t[r-1]+t[r])/2/f*d*.95;l.fillStyle=`rgba(${Math.min(255,Math.round(180+(o-180)*.55))},${Math.min(255,Math.round(180+(s-180)*.55))},${Math.min(255,Math.round(180+(c-180)*.55))},0.9)`,l.fillRect(h,10+d-_,Math.max(.5,g-h),_)}),l.beginPath(),e.forEach((e,n)=>{let r=42+(e-p)/m*u,a=10+d-t[n]/f*d*.95;n===0?l.moveTo(r,a):l.lineTo(r,a)}),l.strokeStyle=n.spdCurve||`rgba(220,40,40,0.9)`,l.lineWidth=1.5,l.stroke(),l.beginPath(),l.moveTo(42,10+d*.05),l.lineTo(42+u,10+d*.05),l.strokeStyle=`rgba(180,180,180,0.5)`,l.lineWidth=.8,l.setLineDash([3,3]),l.stroke(),l.setLineDash([]),l.strokeStyle=n.axisBorder||`rgba(100,140,180,0.4)`,l.lineWidth=.8,l.strokeRect(42,10,u,d),l.font=`12px monospace`,l.fillStyle=n.axisLabel||`rgba(160,200,230,0.9)`,l.textAlign=`center`,[400,450,500,550,600,650,700,750].forEach(e=>{let t=42+(e-p)/m*u;t<42||t>42+u||l.fillText(e,t,10+d+14)}),l.fillStyle=n.dim||`#7aaccc`,l.font=`11px monospace`,l.fillText(`Wavelength (nm)`,42+u/2,c-4),l.textAlign=`right`,l.font=`11px monospace`,[`0`,`0.5`,`1.0`].forEach((e,t)=>l.fillText(e,38,10+d-t/2*d+3)),l.font=`bold 12px monospace`,l.textAlign=`left`,l.strokeStyle=`rgba(220,40,40,0.9)`,l.lineWidth=1.5,l.beginPath(),l.moveTo(50,18),l.lineTo(64,18),l.stroke(),l.fillStyle=`#e8f4ff`,l.fillText(`Test`,68,22),l.strokeStyle=`rgba(180,180,180,0.6)`,l.setLineDash([3,3]),l.beginPath(),l.moveTo(97,18),l.lineTo(111,18),l.stroke(),l.setLineDash([]),l.fillStyle=n.spdDimText||`#7aaccc`,l.fillText(`Reference`,115,22)},[e,t]),(0,w.jsx)(`canvas`,{ref:r,style:{width:`100%`,height:160,display:`block`}})}function ul({title:e,rfBins:t,mode:n,theme:r={}}){let a=(0,u.useRef)();return(0,u.useEffect)(()=>{let e=a.current;if(!e)return;let o=devicePixelRatio||1,s=e.offsetWidth,c=e.offsetHeight;e.width=s*o,e.height=c*o;let l=e.getContext(`2d`);l.scale(o,o);let u=s-36-8,d=c-8-20;l.fillStyle=r.chartBg||`rgba(0,0,0,0.2)`,l.fillRect(36,8,u,d);let f=u/16;if(n===`fidelity`)l.strokeStyle=r.gridLine||`rgba(255,255,255,0.07)`,l.lineWidth=.5,[25,50,75,100].forEach(e=>{let t=8+d-e/100*d;l.beginPath(),l.moveTo(36,t),l.lineTo(36+u,t),l.stroke()}),t.forEach((e,t)=>{let n=e/100*d*.95,[a,o,s]=sl(t*22.5+11.25);l.fillStyle=`rgb(${a},${o},${s})`,l.fillRect(36+t*f+1,8+d-n,f-2,n),l.font=`bold 11px monospace`,l.fillStyle=r.text||`#e8f4ff`,l.textAlign=`center`,l.fillText(Math.round(e),36+t*f+f/2,8+d-n-2),l.fillStyle=`#7aaccc`,l.fillText(t+1,36+t*f+f/2,8+d+14)}),l.font=`11px monospace`,l.fillStyle=r.dim||`#7aaccc`,l.textAlign=`center`,l.fillText(`Hue-Angle Bin (j)`,36+u/2,c-2),l.textAlign=`right`,l.font=`11px monospace`,l.fillStyle=r.dim||`#7aaccc`,[`100`,`75`,`50`,`25`].forEach((e,t)=>{l.fillText(e,33,8+t/4*d+4)});else{let e=8+d/2;l.strokeStyle=`rgba(100,140,180,0.5)`,l.lineWidth=.8,l.beginPath(),l.moveTo(36,e),l.lineTo(36+u,e),l.stroke(),l.strokeStyle=`rgba(255,255,255,0.05)`,l.lineWidth=.5,[-.5,-.25,.25,.5].forEach(t=>{let n=e-d/2*t*.9;l.beginPath(),l.moveTo(36,n),l.lineTo(36+u,n),l.stroke()}),t.forEach((t,a)=>{let o=n===`chroma`?(t-85)/300:(85-t)/2e3,s=d/2*Math.abs(o)*.9,[c,u,p]=sl(a*22.5+11.25);l.fillStyle=`rgb(${c},${u},${p})`,o>=0?l.fillRect(36+a*f+1,e-s,f-2,s):l.fillRect(36+a*f+1,e,f-2,s),l.font=`bold 10px monospace`,l.fillStyle=`#e8f4ff`,l.textAlign=`center`;let m=o>=0?e-s-2:e+s+7,h=n===`chroma`?Math.round(o*100)+`%`:o.toFixed(2);l.fillText(h,36+a*f+f/2,m),l.fillStyle=r.dim||`#7aaccc`,l.font=`10px monospace`,l.fillText(a+1,36+a*f+f/2,8+d+14)});let a=n===`chroma`?[`40%`,`0%`,`-40%`]:[`0.50`,`0`,`-0.50`];l.textAlign=`right`,l.font=`11px monospace`,l.fillStyle=r.dim||`#7aaccc`,a.forEach((e,t)=>l.fillText(e,33,8+t/2*d+4))}l.strokeStyle=r.axisBorder||`rgba(80,140,200,0.2)`,l.lineWidth=.5,l.strokeRect(36,8,u,d)},[t,n]),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`div`,{style:{fontSize:12,color:cl.dim,textTransform:`uppercase`,letterSpacing:1.5,marginBottom:6,fontWeight:700},children:e}),(0,w.jsx)(`canvas`,{ref:a,style:{width:`100%`,height:70,display:`block`}})]})}function dl({rfBins:e,theme:t={}}){let n=(0,u.useRef)();return(0,u.useEffect)(()=>{let r=n.current;if(!r)return;let a=devicePixelRatio||1,o=r.offsetWidth,s=r.offsetHeight;r.width=o*a,r.height=s*a;let c=r.getContext(`2d`);c.scale(a,a);let l=o-36-8,u=s-8-20;c.fillStyle=t.chartBg||`rgba(0,0,0,0.2)`,c.fillRect(36,8,l,u);let d=l/99;c.strokeStyle=t.gridLine||`rgba(255,255,255,0.07)`,c.lineWidth=.5,[25,50,75,100].forEach(e=>{let t=8+u-e/100*u;c.beginPath(),c.moveTo(36,t),c.lineTo(36+l,t),c.stroke()});for(let t=0;t<99;t++){let n=t/99*16,r=Math.floor(n),a=Math.min(15,r+1),o=n-r,s=Math.min(100,Math.max(0,(e[r]??75)*(1-o)+(e[a]??75)*o))/100*u*.95,[l,f,p]=sl(t/99*360);c.fillStyle=`rgb(${l},${f},${p})`,c.fillRect(36+t*d,8+u-s,Math.max(.5,d),s)}c.font=`11px monospace`,c.fillStyle=t.dim||`#7aaccc`,c.textAlign=`center`,[1,5,9,13,17,21,25,29,33,37,41,45,49,53,57,61,65,69,73,77,81,85,89,93,97].forEach(e=>{let t=36+(e-1)*d+d/2;c.fillText(e,t,8+u+12)}),c.fillStyle=t.dim||`#7aaccc`,c.fillText(`CES Color`,36+l/2,s-1),c.textAlign=`right`,c.font=`11px monospace`,c.fillStyle=t.dim||`#7aaccc`,[`100`,`50`,`0`].forEach((e,t)=>c.fillText(e,33,8+t/2*u+4)),c.strokeStyle=t.axisBorder||`rgba(80,140,200,0.2)`,c.lineWidth=.5,c.strokeRect(36,8,l,u)},[e]),(0,w.jsxs)(`div`,{children:[(0,w.jsxs)(`div`,{style:{fontSize:12,color:cl.dim,textTransform:`uppercase`,letterSpacing:1.5,marginBottom:6,fontWeight:700},children:[`Color Sample Fidelity, R`,(0,w.jsx)(`sub`,{children:`f,CES`})]}),(0,w.jsx)(`canvas`,{ref:n,style:{width:`100%`,height:80,display:`block`}})]})}function fl({rfBins:e,Rg:t,Rf:n,cct:r,duv:a,size:o=280,theme:s={}}){let c=(0,u.useRef)(),l=Math.round(o*.14),d=o+l*2,f=d/2,p=d/2,m=o*.36,h=o*.05;return(0,u.useEffect)(()=>{let u=c.current;if(!u)return;let g=devicePixelRatio||1;u.width=d*g,u.height=d*g;let _=u.getContext(`2d`);_.scale(g,g);for(let e=0;e<16;e++){let t=(90-e*22.5)*Math.PI/180,n=(90-(e+1)*22.5)*Math.PI/180,[r,a,s]=sl(e*22.5+11.25);_.beginPath(),_.moveTo(f,p),_.arc(f,p,m+o*.055,n,t),_.closePath(),_.fillStyle=`rgb(${Math.min(255,Math.round(160+(r-160)*.4))},${Math.min(255,Math.round(160+(a-160)*.4))},${Math.min(255,Math.round(160+(s-160)*.4))})`,_.fill()}_.beginPath(),_.arc(f,p,m,0,Math.PI*2),_.fillStyle=s.cvgInner||`rgb(240,244,250)`,_.fill(),[.25,.5,.75,1].forEach(e=>{_.beginPath(),_.arc(f,p,m*e,0,Math.PI*2),_.strokeStyle=e===1?`rgba(0,0,0,0.55)`:`rgba(0,0,0,0.12)`,_.lineWidth=e===1?1.2:.5,_.stroke()}),_.strokeStyle=`rgba(0,0,0,0.1)`,_.lineWidth=.4;for(let e=0;e<16;e++){let t=(90-e*22.5)*Math.PI/180;_.beginPath(),_.moveTo(f+h*Math.cos(t),p-h*Math.sin(t)),_.lineTo(f+m*Math.cos(t),p-m*Math.sin(t)),_.stroke()}let v=(e.length===16?e:Array(16).fill(n||75)).map((e,t)=>{let n=report?.cvgTest&&report.cvgTest.length===16?report.cvgTest[i]:null,r=report?.rcsBins&&report.rcsBins.length===16?report.rcsBins[i]:null,a=Math.max(.05,Math.min(1.45,n?Math.hypot(n[0],n[1]):r===null?1:1+Number(r||0))),o=(90-t*22.5)*Math.PI/180;return[f+m*a*Math.cos(o),p-m*a*Math.sin(o)]});_.beginPath(),_.moveTo(...v[0]),v.slice(1).forEach(e=>_.lineTo(...e)),_.closePath(),_.fillStyle=`rgba(200,30,30,0.12)`,_.fill(),_.strokeStyle=`rgba(190,25,25,0.9)`,_.lineWidth=1.6,_.stroke(),v.forEach(([e,t])=>{_.beginPath(),_.arc(e,t,3,0,Math.PI*2),_.fillStyle=`rgba(170,15,15,0.9)`,_.fill()}),_.beginPath(),_.arc(f,p,m,0,Math.PI*2),_.strokeStyle=`rgba(0,0,0,0.65)`,_.lineWidth=1.3,_.stroke(),_.font=`bold ${Math.round(o*.044)}px monospace`,_.fillStyle=`rgba(20,20,20,0.9)`,_.textAlign=`center`,_.textBaseline=`middle`;for(let e=0;e<16;e++){let t=(90-e*22.5)*Math.PI/180,n=m+o*.115;_.fillText(e+1,f+n*Math.cos(t),p-n*Math.sin(t))}let y=n==null?`—`:String(n),b=t==null?`—`:String(t),x=n==null?`#6a9ab8`:n>=85?`#4fffb0`:n>=70?`#ffcc44`:`#ff5577`,S=t==null?`#6a9ab8`:Math.abs(t-100)<=8?`#4fffb0`:`#ffcc44`;_.textAlign=`left`,_.textBaseline=`top`,_.font=`900 ${Math.round(o*.115)}px monospace`,_.fillStyle=x,_.fillText(y,l*.12,l*.08),_.font=`${Math.round(o*.05)}px monospace`,_.fillStyle=`#6a9ab8`,_.fillText(`Rf`,l*.12,l*.08+Math.round(o*.115)+2),_.textAlign=`right`,_.textBaseline=`top`,_.font=`900 ${Math.round(o*.115)}px monospace`,_.fillStyle=S,_.fillText(b,d-l*.12,l*.08),_.font=`${Math.round(o*.05)}px monospace`,_.fillStyle=`#6a9ab8`,_.fillText(`Rg`,d-l*.12,l*.08+Math.round(o*.115)+2);let C=p+m*.62;_.textAlign=`left`,_.textBaseline=`alphabetic`,_.font=`bold ${Math.round(o*.042)}px monospace`,_.fillStyle=s.cvgSubText||`rgba(30,30,30,0.55)`,_.fillText(`CCT`,f-m*.78,C),_.font=`bold ${Math.round(o*.058)}px monospace`,_.fillStyle=s.cvgText||`rgba(10,10,10,0.85)`,_.fillText(r?r+` K`:`—`,f-m*.78,C+o*.065),_.textAlign=`right`,_.font=`bold ${Math.round(o*.042)}px monospace`,_.fillStyle=s.cvgSubText||`rgba(30,30,30,0.55)`,_.fillText(`Duv`,f+m*.78,C),_.font=`bold ${Math.round(o*.058)}px monospace`,_.fillStyle=s.cvgText||`rgba(10,10,10,0.85)`,_.fillText(a==null?`—`:(a>=0?`+`:``)+a.toFixed(4),f+m*.78,C+o*.065)},[e,t,n,r,a,o]),(0,w.jsx)(`div`,{style:{flexShrink:0},children:(0,w.jsx)(`canvas`,{ref:c,style:{width:d,height:d,display:`block`}})})}function pl({reports:e,activeId:t,minRf:n,viewCmd:r}){let a=(0,u.useRef)(),o=(0,u.useRef)({});function s(e){let t=(e??0)/100;return t<.5?new q(.8+.2*t*2,.2+.4*t*2,.1):new q(.8-.6*(t-.5)*2,.7,.1+.7*(t-.5)*2)}function c(e){if(e<1667||e>25e3)return null;let t=e<=4e3?-266123900/e**3-234358/e**2+877.6956/e+.17991:-3025846900/e**3+2107037.9/e**2+222.6347/e+.24039;return{x:t,y:e<=2222?-1.1063814*t**3-1.3481102*t**2+2.18555832*t-.20219683:e<=4e3?-.9549476*t**3-1.37418593*t**2+2.09137015*t-.16748867:3.081758*t**3-5.8733867*t**2+3.75112997*t-.37001483}}function l(e,t,n){return new W(e/.8,n/100,t/.9)}let d=[[.1741,.005],[.174,.005],[.1736,.0049],[.173,.0048],[.1726,.0048],[.1714,.0051],[.1689,.0069],[.1644,.0138],[.1566,.0177],[.144,.0297],[.1241,.0578],[.0913,.1327],[.0454,.295],[.0082,.5384],[.0139,.695],[.0743,.8338],[.1547,.8059],[.2296,.7543],[.3016,.6923],[.3731,.6245],[.4441,.5547],[.5125,.4866],[.5752,.4242],[.627,.3725],[.6658,.334],[.6915,.3083],[.7079,.292],[.714,.2859]],f=[{x:.4476,y:.4074,Rf:100,label:`CIE A`},{x:.3127,y:.329,Rf:100,label:`D65`},{x:.3818,y:.3797,Rf:80,label:`LED 3000K`},{x:.3447,y:.3553,Rf:80,label:`LED 4000K`},{x:.38,y:.35,Rf:24,label:`HPS`}];return(0,u.useEffect)(()=>{let e=a.current,t=new al({canvas:e,antialias:!0});t.setPixelRatio(Math.min(devicePixelRatio,2)),t.setClearColor(395791);let n=new Kn;n.fog=new Gn(395791,.13);let r=new Ca(50,1,.01,100),u={theta:.9,phi:.85,r:4},p=new W(.5,.5,.5);function m(){r.position.set(u.r*Math.sin(u.phi)*Math.sin(u.theta)+p.x,u.r*Math.cos(u.phi)+p.y,u.r*Math.sin(u.phi)*Math.cos(u.theta)+p.z),r.lookAt(p)}let h=!1,g=!1,_={x:0,y:0};e.addEventListener(`mousedown`,e=>{h=!0,g=e.button===2,_={x:e.clientX,y:e.clientY}}),e.addEventListener(`contextmenu`,e=>e.preventDefault());let v=e=>{if(!h)return;let t=(e.clientX-_.x)*.007,n=(e.clientY-_.y)*.007;if(_={x:e.clientX,y:e.clientY},g){let e=new W;r.getWorldDirection(e),e.cross(r.up).normalize(),p.addScaledVector(e,-t*.4),p.addScaledVector(r.up,n*.4)}else u.theta-=t,u.phi=Math.max(.05,Math.min(Math.PI-.05,u.phi+n));m()};window.addEventListener(`mousemove`,v),window.addEventListener(`mouseup`,()=>h=!1),e.addEventListener(`wheel`,e=>{u.r=Math.max(.5,Math.min(12,u.r+e.deltaY*.003)),m()});let y=null,b=e=>Math.hypot(e[0].clientX-e[1].clientX,e[0].clientY-e[1].clientY);e.addEventListener(`touchstart`,e=>{e.touches.length===1?(h=!0,g=!1,_={x:e.touches[0].clientX,y:e.touches[0].clientY}):e.touches.length===2&&(h=!1,y=b(e.touches))},{passive:!0}),e.addEventListener(`touchmove`,e=>{if(e.touches.length===1&&h){e.preventDefault();let t=e.touches[0],n=(t.clientX-_.x)*.007,r=(t.clientY-_.y)*.007;_={x:t.clientX,y:t.clientY},u.theta-=n,u.phi=Math.max(.05,Math.min(Math.PI-.05,u.phi+r)),m()}else if(e.touches.length===2&&y!=null){e.preventDefault();let t=b(e.touches);u.r=Math.max(.5,Math.min(12,u.r-(t-y)*.01)),y=t,m()}},{passive:!1});let x=e=>{e.touches.length<1&&(h=!1),e.touches.length<2&&(y=null)};e.addEventListener(`touchend`,x),e.addEventListener(`touchcancel`,x);let S=new Va(1.3,13,927800,596e3);S.position.set(.5,0,.5),n.add(S),[[new W(0,0,0),new W(1.15,0,0),16733525],[new W(0,0,0),new W(0,1.15,0),5614335],[new W(0,0,0),new W(0,0,1.15),5635993]].forEach(([e,t,r])=>n.add(new Oi(new Br().setFromPoints([e,t]),new xi({color:r,transparent:!0,opacity:.55}))));let C=d.map(([e,t])=>l(e,t,0));C.push(C[0].clone()),n.add(new Oi(new Br().setFromPoints(C),new xi({color:16777215,transparent:!0,opacity:.1})));let w=[];for(let e=1500;e<=12e3;e+=60)w.push(e);[0,50,100].forEach((e,t)=>{let r=w.map(t=>{let n=c(t);return n?l(n.x,n.y,e):null}).filter(Boolean);n.add(new Oi(new Br().setFromPoints(r),new xi({color:16766336,transparent:!0,opacity:t===0?.3:.08})))});let T=[];w.forEach(e=>{let t=c(e);t&&(T.push(l(t.x,t.y,0)),T.push(l(t.x,t.y,100)))}),n.add(new Mi(new Br().setFromPoints(T),new xi({color:16766336,transparent:!0,opacity:.05})));let E=[];f.forEach(e=>{let t=new li(new Vi(.013,10,7),new Zr({color:s(e.Rf),transparent:!0,opacity:.35}));t.position.copy(l(e.x,e.y,e.Rf)),t.userData={...e,isRef:!0},n.add(t),E.push(t)});function D(){let n=e.parentElement;t.setSize(n.clientWidth,n.clientHeight),r.aspect=n.clientWidth/n.clientHeight,r.updateProjectionMatrix()}window.addEventListener(`resize`,D),D();let O;function k(){O=requestAnimationFrame(k),n.children.forEach(e=>{e.userData?.isRing&&e.lookAt(r.position)}),t.render(n,r)}return k(),m(),o.current={scene:n,camera:r,renderer:t,allMeshes:E,sph:u,pan:p,camUpdate:m},()=>{cancelAnimationFrame(O),window.removeEventListener(`mousemove`,v),window.removeEventListener(`resize`,D),t.dispose()}},[]),(0,u.useEffect)(()=>{let{scene:t,allMeshes:n}=o.current;t&&(t.children.filter(e=>e.userData?.isUser||e.userData?.isRing||e.userData?.isDrop||e.userData?.isDot).forEach(e=>t.remove(e)),n.length=0,t.children.filter(e=>e.userData?.isRef).forEach(e=>n.push(e)),e.forEach(e=>{if(!e.x||!e.y)return;let r=l(e.x,e.y,e.Rf||0),a=s(e.Rf),o=new li(new Vi(.021,14,9),new Zr({color:a}));o.position.copy(r),o.userData={...e,isUser:!0},t.add(o),n.push(o);let c=new li(new Bi(.025,.033,16),new Zr({color:a,transparent:!0,opacity:.3,side:2}));c.position.copy(r),c.userData={isRing:!0},t.add(c);let u=new Oi(new Br().setFromPoints([r.clone(),new W(r.x,0,r.z)]),new xi({color:a,transparent:!0,opacity:.3}));u.userData={isDrop:!0},t.add(u);let d=new li(new Ri(.013,10),new Zr({color:a,transparent:!0,opacity:.4}));d.rotation.x=-Math.PI/2,d.position.set(r.x,.002,r.z),d.userData={isDot:!0},t.add(d)}))},[e]),(0,u.useEffect)(()=>{if(!r||!o.current.camUpdate)return;let{sph:e,pan:t,camUpdate:n}=o.current;if(r===`persp`)e.theta=.9,e.phi=.85,e.r=4,t.set(.5,.5,.5);else if(r===`top`)e.theta=0,e.phi=.04,e.r=3,t.set(.5,0,.5);else if(r.startsWith(`focus:`)){let[,n,a,o]=r.split(`:`).map(Number),s=l(n,a,o||0);t.set(s.x,s.y,s.z),e.r=1.6}n()},[r]),(0,w.jsx)(`canvas`,{ref:a,style:{display:`block`,width:`100%`,height:`100%`}})}var ml={background:`rgba(0,212,255,0.1)`,border:`1px solid rgba(0,212,255,0.35)`,color:`#00d4ff`,borderRadius:5,padding:`5px 12px`,fontSize:12,cursor:`pointer`,fontFamily:`monospace`,fontWeight:600},hl={background:`rgba(0,0,0,0.3)`,border:`1px solid rgba(80,160,220,0.25)`,borderRadius:5,padding:`7px 10px`,color:`#e8f4ff`,fontSize:13,outline:`none`,fontFamily:`monospace`,width:`100%`},gl={fontSize:11,textTransform:`uppercase`,letterSpacing:1,color:`#7aaccc`,fontWeight:700,display:`block`,marginBottom:4};function _l({report:e,isGuest:t,onSave:n,isMobile:r=!1}){let[a,o]=(0,u.useState)(!1),[s,c]=(0,u.useState)(!1),[l,d]=(0,u.useState)(e.label||``),[f,p]=(0,u.useState)(e.model||``),[m,h]=(0,u.useState)(e.manufacturer||``),[g,_]=(0,u.useState)(e.ledDetails||``),[v,y]=(0,u.useState)(e.notes||``),b=(0,u.useRef)(e.id);b.current!==e.id&&(b.current=e.id,d(e.label||``),p(e.model||``),h(e.manufacturer||``),_(e.ledDetails||``),y(e.notes||``),o(!1));async function x(){c(!0);try{await n({label:l,model:f,manufacturer:m,ledDetails:g,notes:v}),o(!1)}catch(e){alert(`Save failed: `+e.message)}finally{c(!1)}}return(0,w.jsxs)(`div`,{style:{padding:r?`12px 14px`:`14px 22px`,borderBottom:`1px solid rgba(80,160,220,0.25)`},children:[(0,w.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:a?14:0},children:[(0,w.jsx)(`div`,{style:{fontSize:12,textTransform:`uppercase`,letterSpacing:1.5,color:`#7aaccc`,fontWeight:700},children:`Source Details`}),!t&&(a?(0,w.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,w.jsx)(`button`,{onClick:()=>o(!1),style:{...ml,background:`none`,color:`#7aaccc`,border:`1px solid rgba(80,160,220,0.25)`},children:`Cancel`}),(0,w.jsx)(`button`,{onClick:x,disabled:s,style:{...ml,opacity:s?.6:1},children:s?`Saving...`:`Save`})]}):(0,w.jsx)(`button`,{onClick:()=>o(!0),style:{...ml,background:`none`,color:`#00d4ff`,border:`1px solid rgba(0,212,255,0.3)`},children:`Edit`})),t&&(0,w.jsx)(`span`,{style:{fontSize:11,color:`#7aaccc`,fontStyle:`italic`},children:`Sign in to save details`})]}),a?(0,w.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:r?`1fr`:`1fr 1fr`,gap:12},children:[(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:gl,children:`Label / Source`}),(0,w.jsx)(`input`,{style:hl,value:l,onChange:e=>d(e.target.value),placeholder:`Source name`})]}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:gl,children:`Model`}),(0,w.jsx)(`input`,{style:hl,value:f,onChange:e=>p(e.target.value),placeholder:`e.g. Sc13C`})]}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:gl,children:`Manufacturer`}),(0,w.jsx)(`input`,{style:hl,value:m,onChange:e=>h(e.target.value),placeholder:`e.g. Sofirn`})]}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`label`,{style:gl,children:`LED Details`}),(0,w.jsx)(`input`,{style:hl,value:g,onChange:e=>_(e.target.value),placeholder:`e.g. SFT40 3000K`})]}),(0,w.jsxs)(`div`,{style:{gridColumn:`1/-1`},children:[(0,w.jsx)(`label`,{style:gl,children:`Notes`}),(0,w.jsx)(`textarea`,{style:{...hl,resize:`vertical`},value:v,onChange:e=>y(e.target.value),rows:2,placeholder:`Any additional notes...`})]})]}):(0,w.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:r?`1fr 1fr`:`repeat(4,1fr)`,gap:8,marginTop:8},children:[[[`Source`,l],[`Model`,f||`-`],[`Manufacturer`,m||`-`],[`LED`,g||`-`]].map(([e,t])=>(0,w.jsxs)(`div`,{style:{background:`#0a1628`,border:`1px solid rgba(80,160,220,0.2)`,borderRadius:4,padding:`6px 10px`},children:[(0,w.jsx)(`div`,{style:{fontSize:10,color:`#7aaccc`,textTransform:`uppercase`,letterSpacing:1,marginBottom:2,fontWeight:700},children:e}),(0,w.jsx)(`div`,{style:{fontSize:13,color:`#e8f4ff`,fontWeight:500,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:t})]},e)),v&&(0,w.jsxs)(`div`,{style:{gridColumn:`1/-1`,background:`#0a1628`,border:`1px solid rgba(80,160,220,0.2)`,borderRadius:4,padding:`6px 10px`},children:[(0,w.jsx)(`div`,{style:{fontSize:10,color:`#7aaccc`,textTransform:`uppercase`,letterSpacing:1,marginBottom:2,fontWeight:700},children:`Notes`}),(0,w.jsx)(`div`,{style:{fontSize:13,color:`#e8f4ff`},children:v})]})]})]})}var vl={1:`#c08878`,2:`#b09858`,3:`#8a9a60`,4:`#4a7848`,5:`#60989a`,6:`#6890b8`,7:`#8878a8`,8:`#c07898`,9:`#cc2828`,10:`#d4b424`,11:`#3e8850`,12:`#1e3ea8`,13:`#d49878`,14:`#4e6030`,15:`#c08868`};function yl({ri:e,C:t}){let n=(0,u.useRef)(null);(0,u.useEffect)(()=>{let r=n.current;if(!r)return;let a=Math.min(window.devicePixelRatio||1,2),o=r.clientWidth,s=r.clientHeight;if(!o||!s)return;r.width=Math.round(o*a),r.height=Math.round(s*a);let c=r.getContext(`2d`);c.setTransform(a,0,0,a,0,0),c.clearRect(0,0,o,s);let l=[];for(let t=1;t<=15;t++){let n=e[`r`+t];n==null||isNaN(n)||l.push({i:t,v:+n})}if(!l.length)return;let u=Math.max(11,Math.min(13,Math.round(o*.018))),d=Math.round(u*3)+8,f=u+12,p=o-d-8,m=s-f-6,h=Math.min(0,...l.map(e=>e.v)),g=e=>d+(e-h)/(100-h)*p,_=t.dim||`rgba(150,160,175,0.85)`;c.textBaseline=`alphabetic`,c.textAlign=`center`,c.font=`${u-1}px monospace`;for(let e=Math.ceil(h/20)*20;e<=100;e+=20){let t=g(e);c.strokeStyle=`rgba(128,128,128,0.16)`,c.lineWidth=1,c.beginPath(),c.moveTo(t,f),c.lineTo(t,f+m),c.stroke(),c.fillStyle=_,c.fillText(String(e),t,f-5)}let v=(e,t,n,r,a)=>{a=Math.min(a,r/2,n/2),c.beginPath(),c.roundRect?c.roundRect(e,t,n,r,a):(c.moveTo(e+a,t),c.arcTo(e+n,t,e+n,t+r,a),c.arcTo(e+n,t+r,e,t+r,a),c.arcTo(e,t+r,e,t,a),c.arcTo(e,t,e+n,t,a),c.closePath())},y=e=>{let t=e.replace(`#`,``),n=parseInt(t.slice(0,2),16),r=parseInt(t.slice(2,4),16),a=parseInt(t.slice(4,6),16);return(.299*n+.587*r+.114*a)/255>.6?`rgba(0,0,0,0.85)`:`rgba(255,255,255,0.96)`},b=m/l.length,x=Math.min(b*.62,16);l.forEach((e,n)=>{let r=f+b*(n+.5),a=r-x/2,o=g(h),s=Math.max(x,g(e.v)-o),l=vl[e.i]||`#888`;c.fillStyle=l,v(o,a,s,x,x/2),c.fill(),c.fillStyle=_,c.font=`bold ${u}px monospace`,c.textAlign=`right`,c.textBaseline=`middle`,c.fillText(`R`+e.i,d-6,r);let p=String(Math.round(e.v));s>c.measureText(p).width+16?(c.fillStyle=y(l),c.textAlign=`right`,c.fillText(p,o+s-9,r)):(c.fillStyle=t.text||`rgba(230,240,255,0.95)`,c.textAlign=`left`,c.fillText(p,o+s+6,r))})},[e,t]);let r=Object.keys(e).filter(e=>/^r\d+$/.test(e)).length||15,a=Math.max(220,r*22+28);return(0,w.jsxs)(`div`,{style:{marginTop:12,maxWidth:480},children:[(0,w.jsx)(`div`,{style:{fontSize:11,color:t.dim,textTransform:`uppercase`,letterSpacing:1,fontWeight:700,marginBottom:4},children:`CRI R1–R15`}),(0,w.jsx)(`canvas`,{ref:n,style:{width:`100%`,height:a,display:`block`}})]})}function bl({report:e,allReports:t=[],isGuest:n=!1,onMetaSave:r,isMobile:a=!1,onBack:o}){let{theme:s,themeName:c,toggleTheme:l}=D();cl={bg:s.bg,surface:s.surface,surface2:s.surface2,border:s.border,text:s.text,dim:s.dim,accent:s.accent,good:s.good,warn:s.warn,bad:s.bad,red:s.bad};let[d,f]=(0,u.useState)(`report`),[p,h]=(0,u.useState)(!1);if(!e)return(0,w.jsxs)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,color:cl.dim,fontSize:13,gap:6,background:cl.bg},children:[(0,w.jsx)(`div`,{style:{fontSize:48,opacity:.15},children:`📊`}),(0,w.jsx)(`div`,{children:`Select a report from the list to view it`})]});let g=e.rfBins||Array(16).fill(e.Rf||75);async function _(t){e.id&&(await fetch(`./index.php/api/reports/${e.id}`,{method:`PATCH`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${m()}`},body:JSON.stringify(t)}).then(e=>{if(!e.ok)throw Error(`Save failed`)}),r&&r({...e,...t}))}return(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`,background:cl.bg,fontFamily:`monospace`,overflow:`hidden`},children:[(0,w.jsxs)(`div`,{style:{padding:a?`10px 14px`:`14px 22px`,borderBottom:`1px solid ${cl.border}`,display:`flex`,flexDirection:a?`column`:`row`,alignItems:a?`stretch`:`flex-start`,justifyContent:`space-between`,gap:10,flexShrink:0,background:cl.surface2},children:[(0,w.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10,minWidth:0},children:[a&&o&&(0,w.jsx)(`button`,{onClick:o,"aria-label":`Back to reports list`,style:{background:`none`,border:`1px solid ${cl.border}`,color:cl.text,borderRadius:6,padding:`7px 10px`,fontSize:15,cursor:`pointer`,flexShrink:0},children:`←`}),(0,w.jsxs)(`div`,{style:{minWidth:0},children:[(0,w.jsx)(`div`,{style:{fontSize:18,fontWeight:700,color:`#ffffff`,marginBottom:4,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:e.label}),(0,w.jsxs)(`div`,{style:{fontSize:13,color:cl.dim,fontWeight:500},children:[e.sourceType?.toUpperCase(),` · `,new Date(e.createdAt.replace(` `,`T`)).toLocaleString()]})]})]}),(0,w.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`,justifyContent:a?`space-between`:`flex-start`},children:[(0,w.jsx)(`div`,{style:{display:`flex`,border:`1px solid ${cl.border}`,borderRadius:6,overflow:`hidden`},children:[`report`,`3d`].map(e=>(0,w.jsx)(`button`,{onClick:()=>f(e),style:{background:d===e?`rgba(0,212,255,0.14)`:`none`,border:`none`,padding:a?`8px 12px`:`8px 16px`,fontSize:13,textTransform:`uppercase`,letterSpacing:1,color:d===e?cl.accent:cl.dim,cursor:`pointer`,fontFamily:`monospace`,fontWeight:d===e?700:400},children:e===`report`?`Report`:`3D Plot`},e))}),(0,w.jsx)(`button`,{onClick:l,title:c===`dark`?`Light mode`:`Dark mode`,style:{background:s.surface,border:`1px solid ${s.border}`,color:s.text,borderRadius:6,padding:`7px 12px`,fontSize:16,cursor:`pointer`},children:c===`dark`?`☀`:`🌙`})]})]}),d===`report`?(0,w.jsxs)(`div`,{style:{flex:1,overflowY:`auto`,display:`flex`,flexDirection:`column`},children:[(0,w.jsx)(_l,{report:e,isGuest:n,onSave:_,isMobile:a}),(0,w.jsxs)(`div`,{style:{padding:a?`14px`:`16px 22px`,borderBottom:`1px solid ${cl.border}`,display:`grid`,gridTemplateColumns:a?`1fr`:`1fr 1fr`,gap:a?16:20},children:[(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:10},children:[(0,w.jsx)(`div`,{style:Tl.sHead,children:`Spectral Power Distribution`}),e.wls&&e.vals?(0,w.jsx)(ll,{wls:e.wls,vals:e.vals,theme:s}):(0,w.jsx)(`div`,{style:{height:160,background:cl.surface,borderRadius:4,display:`flex`,alignItems:`center`,justifyContent:`center`,color:cl.dim,fontSize:11},children:`No spectral data`})]}),(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:14},children:[(0,w.jsx)(ul,{title:`Local Chroma Shift (Rcs,hj)`,rfBins:g,mode:`chroma`,theme:s}),(0,w.jsx)(ul,{title:`Local Hue Shift (Rhs,hj)`,rfBins:g,mode:`hue`,theme:s}),(0,w.jsx)(ul,{title:`Local Color Fidelity (Rf,hj)`,rfBins:g,mode:`fidelity`,theme:s})]})]}),(0,w.jsxs)(`div`,{style:{padding:a?`14px`:`16px 22px`,borderBottom:`1px solid ${cl.border}`,display:`grid`,gridTemplateColumns:a?`1fr`:`auto 1fr`,gap:a?16:24},children:[(0,w.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`},children:(0,w.jsx)(fl,{rfBins:g,Rg:e.Rg||100,Rf:e.Rf||80,cct:e.cct,duv:e.duv,size:a?190:260,theme:s})}),(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,w.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:a?`1fr 1fr`:`1fr 1fr 1fr`,gap:8},children:[(0,w.jsx)(xl,{label:`CIE x`,value:e.x?.toFixed(4)}),(0,w.jsx)(xl,{label:`CIE y`,value:e.y?.toFixed(4)}),(0,w.jsx)(xl,{label:`CCT`,value:e.cct?e.cct+`K`:null,color:cl.accent}),(0,w.jsx)(xl,{label:`Duv`,value:e.duv==null?null:(e.duv>=0?`+`:``)+e.duv.toFixed(4),color:Math.abs(e.duv??1)<.006?cl.good:Math.abs(e.duv??1)<.012?cl.warn:cl.bad}),(0,w.jsx)(xl,{label:`Ra (CRI)`,value:e.ra==null?null:Math.round(e.ra)}),(0,w.jsx)(xl,{label:`R9`,value:e.r9==null?null:Math.round(e.r9)})]}),e.ri&&Object.keys(e.ri).length>0&&(0,w.jsx)(yl,{ri:e.ri,C:cl}),(0,w.jsxs)(`div`,{style:{background:cl.surface,border:`1px solid ${cl.border}`,borderRadius:6,padding:`10px 14px`},children:[(0,w.jsx)(`div`,{style:Tl.sHead,children:`Interpretation`}),[[e.Rf==null?`Rf -`:`Rf ${e.Rf}`,Sl(e.Rf)],[e.Rg==null?`Rg -`:`Rg ${e.Rg}`,Cl(e.Rg)],[e.duv==null?`Duv -`:`Duv ${(e.duv>=0?`+`:``)+e.duv.toFixed(4)}`,wl(e.duv)]].map(([e,t])=>(0,w.jsxs)(`div`,{style:{display:`flex`,gap:10,padding:`6px 0`,borderBottom:`1px solid ${cl.border}`,flexDirection:a?`column`:`row`},children:[(0,w.jsx)(`div`,{style:{fontSize:13,fontWeight:700,color:cl.accent,minWidth:a?0:90,flexShrink:0},children:e}),(0,w.jsx)(`div`,{style:{fontSize:13,color:cl.text,lineHeight:1.7},children:t})]},e))]}),(0,w.jsx)(`div`,{style:{fontSize:12,color:cl.dim,textAlign:`center`,fontStyle:`italic`},children:`Colors are for visual orientation purposes only.`})]})]}),(0,w.jsx)(`div`,{style:{padding:a?`14px 14px 24px`:`16px 22px 32px`},children:(0,w.jsx)(dl,{rfBins:g,theme:s})})]}):(0,w.jsxs)(`div`,{style:{flex:1,position:`relative`},children:[(0,w.jsx)(pl,{reports:t.filter(e=>e.x&&e.y),activeId:e.id,minRf:0,viewCmd:`focus:${e.x||.33}:${e.y||.33}:${e.Rf||50}`}),(0,w.jsx)(`div`,{style:{position:`absolute`,bottom:12,left:14,fontSize:11,color:cl.dim,pointerEvents:`none`,lineHeight:2},children:a?`drag rotate · pinch zoom`:`drag rotate · scroll zoom · right-drag pan`})]})]})}function xl({label:e,value:t,color:n}){return(0,w.jsxs)(`div`,{style:{background:`rgba(0,0,0,0.3)`,border:`1px solid rgba(80,160,220,0.2)`,borderRadius:6,padding:`10px 12px`},children:[(0,w.jsx)(`div`,{style:{fontSize:11,textTransform:`uppercase`,letterSpacing:1,color:`#7aaccc`,marginBottom:5,fontWeight:700},children:e}),(0,w.jsx)(`div`,{style:{fontSize:24,fontWeight:700,color:n||`#e8f4ff`},children:t??`—`})]})}function Sl(e){return e==null?`No data.`:e>=90?`Excellent fidelity. Colors appear nearly identical to a reference illuminant.`:e>=80?`Good fidelity. Minor color differences under close comparison.`:e>=70?`Moderate fidelity. Noticeable shifts in some hues.`:`Low fidelity. Significant color distortion likely.`}function Cl(e){return e==null?`No data.`:e>110?`Gamut significantly expanded — colors appear more vivid/saturated.`:e>102?`Slightly expanded gamut. Objects may appear marginally more vivid.`:e>=98?`Gamut closely matches the reference — natural color saturation.`:e>=90?`Slightly reduced gamut. Colors may appear less saturated.`:`Gamut significantly reduced — colors appear notably desaturated.`}function wl(e){if(e==null)return`No data.`;let t=e>0?`above BBL (slight green tint)`:`below BBL (slight pink tint)`,n=Math.abs(e);return n<.002?`Extremely close to the Planckian locus.`:n<.006?`Very close (${t}). Within acceptable limits.`:n<.012?`Moderate deviation ${t}.`:`Large deviation ${t}.`}var Tl={sHead:{fontSize:12,textTransform:`uppercase`,letterSpacing:1.5,color:`#7aaccc`,marginBottom:10,fontWeight:700}};function El(){let{theme:e,themeName:t,toggleTheme:n}=D(),{user:r,checking:a,tryAutoLogin:o,login:s,register:c,logout:l}=v(),d=b(),[f,p]=(0,u.useState)([]),[m,h]=(0,u.useState)(null),[g,y]=(0,u.useState)(null),[x,S]=(0,u.useState)(0),[C,T]=(0,u.useState)(!1),[E,k]=(0,u.useState)(0),[j,M]=(0,u.useState)(``),[ee,N]=(0,u.useState)(null),[te,ne]=(0,u.useState)(null),[P,F]=(0,u.useState)(`list`);(0,u.useEffect)(()=>{o()},[]),(0,u.useEffect)(()=>{if(!r){p([]),h(null),F(`list`);return}ne(null),_.get(`/reports`).then(p).catch(e=>re(e.message,`err`))},[r]);function re(e,t=`ok`){N({msg:e,type:t}),setTimeout(()=>N(null),3200)}function ie(e){ne(e)}async function ae(e){T(!0),k(20),M(`Uploading…`);let t=new FormData;t.append(`file`,e),t.append(`label`,e.name.replace(/\.[^.]+$/,``));try{k(60),M(`Analyzing…`);let e=await _.upload(`/reports`,t);k(100),M(`Done ✓`),p(t=>[e,...t]),oe(e.id),re(`Saved: `+e.label,`ok`),setTimeout(()=>T(!1),1500)}catch(e){T(!1),re(e.message,`err`)}}async function oe(e){if(e){y(e),d&&F(`detail`);try{h(await _.get(`/reports/${e}`))}catch(e){re(e.message,`err`)}}}async function se(e){p(t=>t.map(t=>t.id===e.id?{...t,...e}:t)),h(t=>t&&{...t,...e})}async function I(e){if(confirm(`Delete this report?`))try{await _.del(`/reports/${e}`),p(t=>t.filter(t=>t.id!==e)),g===e&&(y(null),h(null)),re(`Deleted`,`ok`)}catch(e){re(e.message,`err`)}}if(a)return(0,w.jsx)(`div`,{style:{background:e.bg,height:`100vh`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:e.dim,fontFamily:`monospace`,fontSize:14},children:`Loading…`});if(!r&&te)return(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100vh`,background:`#060a0f`},children:[(0,w.jsxs)(`div`,{style:{background:e.surface2,borderBottom:`1px solid ${e.border}`,padding:d?`10px 14px`:`10px 20px`,display:`flex`,flexWrap:`wrap`,alignItems:`center`,justifyContent:`space-between`,gap:8,flexShrink:0},children:[(0,w.jsxs)(`div`,{style:{fontWeight:900,fontSize:18,color:e.white,fontFamily:`monospace`},children:[`hCRI`,(0,w.jsx)(`span`,{style:{color:e.accent},children:`.io`}),(0,w.jsx)(`span`,{style:{fontSize:12,color:e.dim,fontWeight:400,marginLeft:12},children:`Guest mode — results not saved`})]}),(0,w.jsxs)(`div`,{style:{display:`flex`,gap:10,flexWrap:`wrap`},children:[(0,w.jsx)(`button`,{onClick:n,style:{background:e.surface,border:`1px solid ${e.border}`,color:e.text,borderRadius:6,padding:`7px 12px`,fontSize:16,cursor:`pointer`},children:t===`dark`?`☀`:`🌙`}),(0,w.jsx)(`button`,{onClick:()=>ne(null),style:{background:`${e.accent}15`,border:`1px solid ${e.accent}50`,color:e.accent,borderRadius:6,padding:`7px 14px`,fontSize:13,cursor:`pointer`,fontFamily:`monospace`,fontWeight:600},children:`← Analyze Another`}),(0,w.jsx)(`button`,{onClick:()=>ne(null),style:{background:e.accent,border:`none`,color:`#060a0f`,borderRadius:6,padding:`7px 14px`,fontSize:13,cursor:`pointer`,fontFamily:`monospace`,fontWeight:700},children:`Sign In to Save`})]})]}),(0,w.jsx)(`div`,{style:{flex:1,overflow:`hidden`},children:(0,w.jsx)(bl,{report:te,allReports:[te],isGuest:!0,isMobile:d})})]});if(!r)return(0,w.jsx)(O,{onLogin:s,onRegister:c,onGuestUpload:ie});let ce=!d||P===`list`,le=!d||P===`detail`;return(0,w.jsxs)(`div`,{style:{display:`flex`,height:`100vh`,overflow:`hidden`,background:e.bg},children:[ce&&(0,w.jsx)(A,{user:r,reports:f,activeId:g,isMobile:d,uploading:C,uploadProgress:E,uploadLabel:j,onUpload:ae,onSelect:oe,onDelete:I,onLogout:l,minRf:x,onMinRfChange:S}),le&&(0,w.jsx)(`div`,{style:{flex:1,overflow:`hidden`,display:`flex`,flexDirection:`column`},children:(0,w.jsx)(bl,{report:m,allReports:f,onMetaSave:se,isMobile:d,onBack:d?()=>F(`list`):void 0})}),ee&&(0,w.jsx)(`div`,{style:{position:`fixed`,bottom:18,left:`50%`,transform:`translateX(-50%)`,background:e.surface2,borderRadius:6,padding:`10px 18px`,fontSize:13,letterSpacing:.5,zIndex:200,pointerEvents:`none`,border:`1px solid ${ee.type===`err`?e.bad+`60`:e.good+`60`}`,color:ee.type===`err`?e.bad:e.good},children:ee.msg})]})}(0,d.createRoot)(document.getElementById(`root`)).render((0,w.jsx)(u.StrictMode,{children:(0,w.jsx)(E,{children:(0,w.jsx)(El,{})})}));
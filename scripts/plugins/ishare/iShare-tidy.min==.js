(function(a,b){if(typeof define==="function"&&define.amd){define([],b(a))}else{if(typeof exports==="object"){module.exports=b(a)}else{a.iShare=b(a)}}})(typeof global!=="undefined"?global:this.window||this.global,function(a){var d={event:{addEvent:function(e,g,f){if(e.addEventListener){e.addEventListener(g,f,false)}else{if(e.attachEvent){e.attachEvent("on"+g,f)}else{e["on"+g]=f}}},removeEvent:function(e,g,f){if(e.removeEventListener){e.removeEventListener(g,f,false)}else{if(e.detachEvent){e.detachEvent("on"+g,f)}else{e["on"+g]=null}}},stopPropagation:function(e){if(e.stopPropagation){e.stopPropagation()}else{e.cancelBubble=true}},preventDefault:function(e){if(e.preventDefault){e.preventDefault()}else{e.returnValue=false}}},trim:function(e){if(String.prototype.trim){return e.trim()}return e.replace(/^\s+|s+$/g,"")},indexOf:function(f,h){if(!this.isArray(f)){throw new Error(f.toString()+" is a non-Array！")}if(Array.prototype.indexOf){return f.indexOf(h)}for(var g=0,e=f.length;g<e;g++){if(f[g]===h){return g}}},isArray:function(e){if(Array.isArray){return Array.isArray(e)}return Object.prototype.toString.call(e)==="[object Array]"},validate:function(j,k){var g,f=[];if(this.isArray(k)){for(var e=0,h;h=k[e++];){if(this.indexOf(j,h)<0){f.push(h)}}}else{for(g in k){if(!(g in j)){f.push(g)}}}if(f.length!==0){throw new Error("there is such no property: "+f.join(", "))}},getElementTop:function(e){var g=e.offsetTop,f=e.offsetParent;while(f!==null){g+=f.offsetTop;f=f.offsetParent}return g},getElementLeft:function(e){var g=e.offsetLeft,f=e.offsetParent;while(f!==null){g+=f.offsetLeft;f=f.offsetParent}return g},handleParameters:function(e){var g="";for(var f in e){g=g+f+"="+encodeURIComponent(e[f])+"&"}return g},extend:function(){var e,g,f={};for(e=0;e<arguments.length;e++){for(g in arguments[e]){if(arguments[e].hasOwnProperty(g)){f[g]=arguments[e][g]}}}return f},each:function(h,j){if(!h){return}var g;for(var f=0,e=h.length;f<e;f++){g=j.call(h[f],f,h[f])}return g},getElementByclassN:function(f,n){if(!f){return}var m=[];if(!n&&document.querySelectorAll){m=document.querySelectorAll(f);if(m.length>0){return m}}var k=f.split("."),o=k[0]||"*",l=k[1],h=n?n:document.body,j=h.getElementsByTagName(o),g,e;var i=this;this.each(j,function(p,q){if(q.nodeType===1){g=q.className.split(/\s+/g);e=q;i.each(g,function(r,s){if((s+"")===l){m.push(e)}})}});return m},getmeta:function(e){var h=document.getElementsByTagName("meta");for(var g=0,f;f=h[g++];){if(f.getAttribute("name")&&f.getAttribute("name").toLowerCase()===e){return f.content}}},getimg:function(){var e=this.convertToArray(document.body.getElementsByTagName("img"));if(e.length===0){return}return encodeURIComponent(e[0].src)},getElement:function(e){var f;if(e.charAt(0)==="#"){f=document.getElementById(e)}else{f=this.getElementByclassN(e)[0]}return f},parseUrl:function(g,h){var f={};for(var e in g){f[e]=g[e].replace(/{{([A-Z]*)}}/g,function(i,k){var j=k.toLowerCase();if(h[j]){return encodeURIComponent(h[j])}else{return""}})}return f},isWeixinBrowser:function(){var e=navigator.userAgent.toLowerCase();return(/micromessenger/.test(e))?true:false},convertToArray:function(f){var j=null;try{j=Array.prototype.slice.call(f,0)}catch(h){j=new Array();for(var g=0,e=f.length;g<e;g++){j.push(f[g])}}return j},parseClassName:function(j,f){var h=null;var e=j.split(/\s+/);for(var g=0,k;k=e[g++];){if(k in f){return f[k]}}},getWinDimension:function(){var f=window.innerWidth,e=window.innerHeight;if(typeof f!=="number"){if(document.compatMode==="CSS1Compat"){f=document.documentElement.clientWidth;e=document.documentElement.clientHeight}else{f=document.body.clientWidth;e=document.body.clientHeight}}return{pageWidth:f,pageHeight:e}},throttle:function(f,e){var g=null;return function(){var i=this,h=arguments;clearTimeout(g);g=setTimeout(function(){f.apply(i,h)},e)}},loadjs:function(){var f=false,e=[];return function(h,l){var i=document.getElementsByTagName("head")[0],k=document.createElement("script"),g=document.getElementById("loaded"),j=document.dispatchEvent;e.push(l);if(!f){k.setAttribute("type","text/javascript");k.setAttribute("id","loaded");k.setAttribute("src",h);k[j?"onload":"onreadystatechange"]=function(){if(f){return}if(j||/loaded|complete/i.test(k.readyState)){f=true;var m;while(m=e.pop()){m()}}};(!g)&&(i.appendChild(k))}else{if(l){l()}}}}()};function c(g,e,f){this.element=g;this.wxbox=document.createElement("div");this.URL=e;this.settings=f;this.style=f.style;this.bgcolor=f.bgcolor;this.evenType=f.evenType||"mouseover";this.isTitleVisibility=(f.isTitleVisibility===void (0))?true:f.isTitleVisibility;this.title=f.title||"分享到微信";this.isTipVisibility=(f.isTipVisibility===void (0))?true:f.isTipVisibility;this.tip=f.tip||"“扫一扫” 即可将网页分享到朋友圈。";this.upDownFlag="";this.status=false;this.visibility=false;this.qrcode=null}c.prototype=function(){return{constructor:c,init:function(){this.render();this.init=this.show;this.bindEvent()},render:function(){var k="",i="",r="",q="",j="",g=this.bgcolor?this.bgcolor:"#ddd",e="";if(d.getWinDimension().pageHeight/2<d.getElementTop(this.element)){i="";k="display:none;";this.upDownFlag="down";e="border-bottom-left-radius: 0;"}else{i="display:none;";k="";this.upDownFlag="up";e="border-top-left-radius: 0;"}var n='<div style="text-align: center;background-color: '+g+";box-shadow: 1px 1px 4px #888888;padding: 8px 8px 4px;border-radius: 4px;"+e+'">',f=this.isTitleVisibility?'<p class="tt" style="line-height: 30px;margin:0; text-shadow: 1px 1px rgba(0,0,0,0.1);font-weight: 700;margin-bottom: 4px;'+q+'">'+this.title+"</p>":"",l='<div class="qrcode" style="width:'+this.settings.qrcodeW+"px; height:"+this.settings.qrcodeH+'px; overflow:hidden;"></div>',p=this.isTipVisibility?'<p style="font-size: 12px;line-height: 20px; margin: 4px auto;width: 120px;'+j+'">'+this.tip+"</p>":"",h='<div style="'+k+"position: relative;height: 0;width: 0;border-style: solid;border-width: 12px;border-color: transparent;border-bottom-color: "+g+';border-top: none;"></div>',m='</div><div style="'+i+"position: relative;height: 0;width: 0;border-style: solid;border-width: 12px;border-color: transparent;border-top-color: "+g+';border-bottom: none;"></div>';var o=h+n+f+l+p+m;this.wxbox.innerHTML=o;this.wxbox.style.cssText="position:absolute; left: -99999px;";document.body.appendChild(this.wxbox)},setLocation:function(f){var h=this.wxbox.offsetWidth,l=this.wxbox.offsetHeight,k=this.element.offsetWidth,g=this.element.offsetHeight,j=d.getElementTop(this.element),e=d.getElementLeft(this.element),i="position:absolute; color: #000;z-index: 99999;";i=i+"left: "+(k/2-12+e)+"px;";if(this.upDownFlag==="down"){i=i+"top: "+(j-l)+"px;"}else{i=i+"top: "+(j+g)+"px;"}this.wxbox.style.cssText=i+this.style;f&&(this.hide())},bindEvent:function(){var e=this;if(this.evenType==="click"){d.event.addEvent(this.element,"click",function(g){var f=g||window.event;d.event.stopPropagation(f);d.event.preventDefault(f);if(!e.visibility){e.show()}else{e.hide()}})}else{d.event.addEvent(this.element,"mouseover",function(g){var f=g||window.event;e.show()});d.event.addEvent(this.element,"mouseout",function(g){var f=g||window.event;e.hide()})}d.event.addEvent(window,"resize",d.throttle(function(){(e.status)&&(e.visibility)&&(e.setLocation())},200))},startQR:function(){var e=this;return function(){if(!e.qrcode){e.qrcode=new QRCode(d.getElementByclassN(".qrcode",e.wxbox)[0],{text:e.URL,width:e.settings.qrcodeW,height:e.settings.qrcodeH,colorDark:e.settings.qrcodeFgc,colorLight:e.settings.qrcodeBgc})}}},show:function(){this.status=true;this.wxbox.style.display="block";this.visibility=true;this.show=function(){this.wxbox.style.display="block";this.visibility=true}},hide:function(){this.wxbox.style.display="none";this.visibility=false}}}();function b(e){var g={title:document.title,url:location.href,host:location.origin||"",description:d.getmeta("description"),image:d.getimg(),WXoptions:{qrcodeW:120,qrcodeH:120,qrcodeBgc:"#fff",qrcodeFgc:"#000",bgcolor:"#2BAD13"}};var i=e||window.iShare_config;if(i){if(i.container){if(d.getElement(i.container)){this.container=d.getElement(i.container)}else{throw new Error('there is such no className|id: "'+i.container+'".')}}else{throw new Error("container property is required.")}}else{throw new Error("container property is required.")}var h=this.container.getAttribute("data-sites"),f=h?h.split(/\s*,\s*/g):null;(f)&&(d.validate(g.sites,f));(i.config)&&(d.validate(g,i.config));(i.config.sites)&&(d.validate(g.sites,i.config.sites));this.wx=null;this.defaults=g;this.dataSites=f?{sites:f}:{};this.config=i.config?i.config:{};this.settings=d.extend(g,this.config,this.dataSites);this.settings.WXoptions=d.extend(g.WXoptions,this.config.WXoptions);this.init()}b.prototype=(function(){var e={iShare_qq:"http://connect.qq.com/widget/shareqq/index.html?url={{URL}}&title={{TITLE}}&desc={{DESCRIPTION}}&summary=&pics={{IMAGE}}",iShare_qzone:"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{URL}}&title={{TITLE}}&summary={{DESCRIPTION}}&pics={{IMAGE}}&desc=&site=",iShare_tencent:"http://share.v.t.qq.com/index.php?c=share&a=index&title={{TITLE}}&url={{URL}}&pic={{IMAGE}}",iShare_weibo:"http://service.weibo.com/share/share.php?url={{URL}}&title={{TITLE}}&pic={{IMAGE}}",iShare_wechat:"",iShare_douban:"http://shuo.douban.com/!service/share?href={{URL}}&name={{TITLE}}&text={{DESCRIPTION}}&image={{IMAGE}}",iShare_renren:"http://widget.renren.com/dialog/share?resourceUrl={{URL}}&title={{TITLE}}&pic={{IMAGE}}&description={{DESCRIPTION}}",iShare_youdaonote:"http://note.youdao.com/memory/?title={{TITLE}}&pic={{IMAGE}}&summary={{DESCRIPTION}}&url={{URL}}",iShare_linkedin:"http://www.linkedin.com/shareArticle?mini=true&ro=true&title={{TITLE}}&url={{URL}}&summary={{DESCRIPTION}}&armin=armin",iShare_facebook:"https://www.facebook.com/sharer/sharer.php?s=100&p[title]={{TITLE}}p[summary]={{DESCRIPTION}}&p[url]={{URL}}&p[images]={{IMAGE}}",iShare_twitter:"https://twitter.com/intent/tweet?text={{TITLE}}&url={{URL}}",iShare_googleplus:"https://plus.google.com/share?url={{URL}}&t={{TITLE}}",iShare_pinterest:"https://www.pinterest.com/pin/create/button/?url={{URL}}&description={{DESCRIPTION}}&media={{IMAGE}}",iShare_tumblr:"https://www.tumblr.com/widgets/share/tool?shareSource=legacy&canonicalUrl=&url={{URL}}&title={{TITLE}}"};function f(){if(this.container===void (0)||!this.container.hasChildNodes()){return}var j=this.container.childNodes,h;for(var g=0,k;k=j[g++];){if(k.nodeType===1){h=d.parseClassName(k.className,d.parseUrl(e,this.settings));if((k.className).indexOf("iShare_wechat")>-1&&!(d.isWeixinBrowser())){this.wx=new c(k,this.settings.url,this.settings.WXoptions)}else{h&&(k.href=h);k.target="_blank"}}}}return{constructor:b,init:function(){f.call(this);if(this.wx){this.bindEvent();this.wx.init();d.loadjs("qrcode.min.js",this.wx.startQR())}},bindEvent:function(){var h=this;function g(){h.wx.setLocation(true);d.event.removeEvent(h.container,"mouseover",g)}d.event.addEvent(this.container,"mouseover",g)}}})();if(window.iShare_config){return(new b())}else{return b}});
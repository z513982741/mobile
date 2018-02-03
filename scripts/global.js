
define(['cookie', 'jquery'], function(cookie, $) {

window.Cookies = cookie;
$.global = {};

if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

Array.prototype.remove = function(v) {
    return $.grep(this, function(e) {
        return e !== v;
    });
};

var xhrs = [];
$.abortx = function() {
	$.each(xhrs, function(k, xhr) {
		if (xhr && xhr.abort) {
			xhr.abort();
		}
	});
	xhrs = [];
};

$.ajaxSettings.beforeSend = function(xhr) {
    xhrs.push(xhr);
}

$.ajaxSettings.complete = function(xhr) {
    var index = xhrs.indexOf(xhr);
    if (index > -1) {
        xhrs.splice(index, 1);
    }
}

$.fn.extend({
    serializeHash: function() {
        var hash = {};
        $.each(this.serializeArray(), function() {
            hash[this.name] = this.value.trim();
        });
        return hash;
    }
});

$.fn.ohtml = function(val) {
	if (val) {
		$(val).insertBefore(this);
		$(this).remove();
	} else {
		return $("<div>").append($(this).clone()).html();
	}
}

$.fn.selectRange = function(start, end) {
	if(end === undefined) {
        end = start;
    }
	
    return this.each(function(){
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		} else if (selectionStart) {
			this.selectionStart = start;
            this.selectionEnd = end;
		}
    });
};

$.fn.extend({
	inputInsert: function(myValue){
	  return this.each(function(i) {
		if (document.selection) {
		  //For browsers like Internet Explorer
		  this.focus();
		  var sel = document.selection.createRange();
		  sel.text = myValue;
		  this.focus();
		} else if (this.selectionStart || this.selectionStart == '0') {
		  //For browsers like Firefox and Webkit based
		  var startPos = this.selectionStart;
		  var endPos = this.selectionEnd;
		  var scrollTop = this.scrollTop;
		  this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
		  this.focus();
		  this.selectionStart = startPos + myValue.length;
		  this.selectionEnd = startPos + myValue.length;
		  this.scrollTop = scrollTop;
		} else {
		  this.value += myValue;
		  this.focus();
		}
	  });
	}
});

Number.prototype.toFixedNumber = function(x) {
    return (Math.round((this * Math.pow(10, x)).toFixed(x-1))/Math.pow(10, x)).toFixed(x);
}

String.prototype.bytes = function() {
	function fixedCharCodeAt(str, idx) {
		idx = idx || 0;
		var code = str.charCodeAt(idx);
		var hi, low;
		if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
			hi = code;
			low = str.charCodeAt(idx + 1);
			if (isNaN(low)) {
				throw 'Kein gültiges Schriftzeichen oder Speicherfehler!';
			}
			return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
		}
		if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
			// We return false to allow loops to skip this iteration since should have already handled high surrogate above in the previous iteration
			return false;
			/*hi = str.charCodeAt(idx-1);
		low = code;
		return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
		}
		return code;
	}

	function countUtf8(str) {
		var result = 0;
		for (var n = 0; n < str.length; n++) {
			var charCode = fixedCharCodeAt(str, n);
			if (typeof charCode === "number") {
				if (charCode < 128) {
					result = result + 1;
				} else if (charCode < 2048) {
					result = result + 2;
				} else if (charCode < 65536) {
					result = result + 3;
				} else if (charCode < 2097152) {
					result = result + 4;
				} else if (charCode < 67108864) {
					result = result + 5;
				} else {
					result = result + 6;
				}
			}
		}
		return result;
	}

	return countUtf8(this);
}

$.autoTextarea = function(elem, extra, maxHeight) {
	extra = extra || 0;
	var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
		isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),

		addEvent = function(type, callback) {
			elem.addEventListener ?
				elem.addEventListener(type, callback, false) :
				elem.attachEvent('on' + type, callback);
		},

		getStyle = elem.currentStyle ? function(name) {
			var val = elem.currentStyle[name];
			if (name === 'height' && val.search(/px/i) !== 1) {
				var rect = elem.getBoundingClientRect();
				return rect.bottom - rect.top -
					parseFloat(getStyle('paddingTop')) -
					parseFloat(getStyle('paddingBottom')) + 'px';
			};
			return val;
		} : function(name) {
			return getComputedStyle(elem, null)[name];
		},
		minHeight = parseFloat(getStyle('height'));

	elem.style.resize = 'none';

	var lineHeight = elem.style.lineHeight;

	var change = function() {
		var scrollTop, height,
			padding = 0,
			style = elem.style;
		if (elem._length === elem.value.length) return;
		elem._length = elem.value.length;
		if (!isFirefox && !isOpera) {
			padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
		};
		scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		elem.style.height = minHeight + 'px';
		if (elem.scrollHeight > minHeight) {//scrollHeight包含padding
			style.lineHeight = 'normal';
			if (maxHeight && elem.scrollHeight > maxHeight) {
				height = maxHeight - padding;
				style.overflowY = 'auto';
			} else {
				height = elem.scrollHeight - padding;
				style.overflowY = 'hidden';
			};
			style.height = height + extra + 'px';
			scrollTop += parseInt(style.height) - elem.currHeight;
			if (scrollTop) {
				document.body.scrollTop = scrollTop;
				document.documentElement.scrollTop = scrollTop;
			}
			elem.currHeight = parseInt(style.height);
		} else {
			style.lineHeight = lineHeight;
		}
	};
	addEvent('propertychange', change);
	addEvent('input', change);
	addEvent('focus', change);
	change();
};

/* ===============================================================================
************   Tabs   ************
=============================================================================== */
+function ($) {
    "use strict";
    $.initFixedTab = function(){
        var $fixedTab = $('.fixed-tab');
        if ($fixedTab.length === 0) return;
        $('.fixed-tab').fixedTab();//默认{offset: 0}
    };
    var FixedTab = function(pageContent, _options) {
        var $pageContent = this.$pageContent = $(pageContent);
        var shadow = $pageContent.clone();
        var fixedTop = $pageContent[0].getBoundingClientRect().top;

        shadow.css('visibility', 'hidden');
        this.options = $.extend({}, this._defaults, {
            fixedTop: fixedTop,
            shadow: shadow,
            offset: 0
        }, _options);

        this._bindEvents();
    };

    FixedTab.prototype = {
        _defaults: {
            offset: 0,
        },
        _bindEvents: function() {
            this.$pageContent.parents('.content').on('scroll', this._scrollHandler.bind(this));
            this.$pageContent.on('active', '.tab-link', this._tabLinkHandler.bind(this));
        },
        _tabLinkHandler: function(ev) {
            var isFixed = $(ev.target).parents('.buttons-fixed').length > 0;
            var fixedTop = this.options.fixedTop;
            var offset = this.options.offset;
            $.refreshScroller();
            if (!isFixed) return;
            this.$pageContent.parents('.content').scrollTop(fixedTop - offset);
        },
        // 滚动核心代码
        _scrollHandler: function(ev) {
            var $scroller = $(ev.target);
            var $pageContent = this.$pageContent;
            var shadow = this.options.shadow;
            var offset = this.options.offset;
            var fixedTop = this.options.fixedTop;
            var scrollTop = $scroller.scrollTop();
            var isFixed = scrollTop >= fixedTop - offset;
            if (isFixed) {
                shadow.insertAfter($pageContent);
                $pageContent.addClass('buttons-fixed').css('top', offset);
            } else {
                shadow.remove();
                $pageContent.removeClass('buttons-fixed').css('top', 0);
            }
        }
    };

    //FixedTab PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        this.each(function() {
            var $this = $(this);
            if ($this.hasClass('buttons-fixed')) {
                return;
            }

            var options = $.extend({}, $this.dataset(), typeof option === 'object' && option);
            var data = $this.data('fixedtab');
            if (!data) {
                //获取data-api的
                $this.data('fixedtab', (data = new FixedTab(this, options)));
            }
        });

    }
    $.fn.fixedTab = Plugin;
    $.fn.fixedTab.Constructor = FixedTab;
    $(document).on('pageInit',function(){
        $.initFixedTab();
    });
}($);

$.utils = {
	isDate: function(value) {
		var re = /^(0[1-9]|1[012]|[1-9])[- /.](0[1-9]|[12][0-9]|3[01]|[1-9])[- /.](19|20)\d\d$/;
		value = value.replace(/(\d{4})[- /.](\d+)[- /.](\d+)/, "$2/$3/$1");
		if (!re.test(value)) {
			return false;
		}

		value = value.replace(/-/g, "/");
		return !!Date.parse(value);
	},

	isEmail: function(str) {
		var r = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
		return r.test(str);
	},

	isMobile: function(str) {
		var r = /^(86)?1[3-9][0-9]{9}$/;
		return r.test(str);
	},

    isIos: function() {
        var u = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
        //return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        return /ip(ad|hone|od)/.test(u);
    },

    isAndroid: function() {
        var u = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
        return u.indexOf('Android') > -1;
    },
	
	isFileRequest: function() {
		return /^file:\/{3}[^\/]/i.test(window.location.href);
	},

	isJson: function(str) {
		return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(str.replace(/"(\\.|[^"\\])*"/g, '')));
	},

	//判断是否在微信浏览器
	isWeixin: function() {
		return navigator.userAgent.toLowerCase().indexOf('micromessenger') != -1;
	},

    isInt: function(n) {
        n = parseInt(n, 10);
        return n === +n && n === (n | 0);
    },

	intval: function(str) {
		return +(parseInt(str, 10)) || 0;
	},

    getExt: function(file) {
        return file.substr(file.lastIndexOf('.') + 1).split(/\#|\?/)[0];
    },

	hasQueryArg: function(url, name, value) {
		var r = new RegExp('[?&]' + name + '=' + value + '(&|$)');
		return r.test(url);
	},

	getQueryArg: function(name, url) {
        if (!url) {
          url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

	removeQueryArg: function(url, name) {
		var frag = url.split('#');
		var parts = frag[0].split('?');

		if (parts.length >= 2) {
			var base = parts.shift();
			var query = parts.join('?');
			var prefix = encodeURIComponent(name) + '=';
			var pars = query.split(/[&;]/g);
			for (var i = pars.length; i-- > 0;) {
				if (pars[i].lastIndexOf(prefix, 0) !== -1) {
					pars.splice(i, 1);
				}
			}
			url = base + '?' + pars.join('&');
			if (frag[1]) {
				url += "#" + frag[1];
			}
		}
		return url;
	},

	addQueryArg: function(url, name, value) {
		var frag = url.split('#');
		var parts = frag[0].split('?');
		var base = parts.shift();
		if (parts.length >= 1) {
			var query = parts.join('?');
			var prefix = encodeURIComponent(name) + '=';
			var pars = query.split(/[&;]/g);
			var found = false;
			for (var i = pars.length; i-- > 0;) {
				if (pars[i].lastIndexOf(prefix, 0) !== -1) {
					pars[i] = prefix + value;
					found = true;
					break;
				}
			}

			if (!found) {
				pars[pars.length] = prefix + value;
			}

			url = base + '?' + pars.join('&');
		} else {
			url = base + '?' + name + '=' + value;
		}

		if (frag[1]) {
			url += "#" + frag[1];
		}
		return url;
	},

    removecsv: function(list, value) {
        return list.replace(new RegExp(',?' + value + ',?'), function(match) {
            var first_comma = match.charAt(0) === ',',
                second_comma;
            if (first_comma && (second_comma = match.charAt(match.length - 1) === ',')) {
                return ',';
            }

            return '';
        });
    },

    hascsv: function(list, value) {
        if (list.match(new RegExp("(?:^|,\\s*)" + value + "(?:,\\s*|$)"))) {
            return true;
        }
        return false;
    },

    parseUrl: function(url) {
        var re = /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
        var matches = re.exec(url || "") || [];
        return {
            href: matches[0] || "",
            hrefNoHash: matches[1] || "",
            hrefNoSearch: matches[2] || "",
            domain: matches[3] || "",
            protocol: matches[4] || "",
            doubleSlash: matches[5] || "",
            authority: matches[6] || "",
            username: matches[8] || "",
            password: matches[9] || "",
            host: matches[10] || "",
            hostname: matches[11] || "",
            port: matches[12] || "",
            pathname: matches[13] || "",
            directory: matches[14] || "",
            filename: matches[15] || "",
            search: matches[16] || "",
            hash: matches[17] || ""
        };
    }
};


!function(e, t) {
    var n = function(e) {
        var n = [];
        for (; e && e.tagName !== t; e = e.parentNode) {
            if (e.tagName.toLowerCase() == 'body' || e.tagName.toLowerCase() == 'html') {
              break;
            }

            if (e.id && !/\s/.test(e.id)) {
                n.unshift(e.id);
                n.unshift("#");
            } else if (e.className) {
                var r = e.className.split(" ");
                for (var i in r) {
                    if (r.hasOwnProperty(i) && r[i]) {
                        n.unshift(r[i]);
                        n.unshift(".")
                    }
                }

                n.unshift(e.tagName);
            }
            n.unshift(" > ")
        }
        return n.slice(1).join("")
    };

    e.fn.getSelector = function(t) {
        if (true === t) {
            return n(this[0])
        } else {
            return e.map(this, function(e) {
                return n(e)
            })
        }
    }
}($);

});
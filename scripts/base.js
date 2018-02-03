define(['global', 'ishare'], function(global, ishare) {

$.getCurPage = function() {
    var $page = $('.page-current');
    if (!$page[0]) {
        $page = $('.page');
    }
    return $page;
};

window.$j = function(selector, context) {
    if (typeof selector === 'string' && !context) {
        context = $.getCurPage();
    }
    return $(selector, context);
}

$.info = function(msg, t) {
    t = t || 2000;
    $.toast(msg, t, 'info center');
};

$.success = function(msg, callback, t) {
    t = t || 2000;
    $.toast(msg, t, 'success center');
};

$.error = function(msg, t) {
    t = t || 2000;
    $.toast(msg, t, 'error center');
};

$.insertTokenToForm = function($form, token) {
    if ($form.find("input.tok").length) {
        $form.find("input.tok").each(function() {
            if ($(this).attr('name').length > 10) {
                $(this).remove();
            }
        });
    }

    var l = token.substr(-2),
        t;
    l = parseInt(l, 10);
    token = token.substr(0, token.length - 2);
    t = token.substr(-l);
    token = token.substr(0, token.length - l);
    $form.prepend('<input class="tok" type="hidden" name="' + t + '" value="' + token + '">');
};

function prettyDate(time) {
    if ($.utils.isInt(time)) {
        time *= 1000;
    } else {
        time = (time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")
    }

    var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var date = new Date(time);
    time = date.getTime() / 1000;

    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        wday = date.getDay(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

    var now = new Date(),
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        todayTime = today.getTime() / 1000,
        tomorrow = new Date(today.getTime() + 86400 * 1000),
        tomorrowTime = tomorrow.getTime() / 1000;

    var n = today.getDay();
    if (n == 0) {
        n = 7;
    }
    var mondayTime = todayTime - (n - 1) * 86400;

    if (time >= todayTime && time < tomorrowTime) {
        return ((hour < 10) ? '0' + hour : hour) + ':' +
            ((minute < 10) ? '0' + minute : minute);
    }

    if (time < todayTime && time >= (todayTime - 86400)) {
        return '昨天' + ' ' +
            ((hour < 10) ? '0' + hour : hour) + ':' +
            ((minute < 10) ? '0' + minute : minute);
    }

    if (time >= tomorrowTime && time < (tomorrowTime + 86400)) {
        return '明天' + ' ' +
            ((hour < 10) ? '0' + hour : hour) + ':' +
            ((minute < 10) ? '0' + minute : minute);
    }

    if (time >= mondayTime && time < (mondayTime + (6 * 86400))) {
        return days[wday] + ' ' +
            ((hour < 10) ? '0' + hour : hour) + ':' +
            ((minute < 10) ? '0' + minute : minute);
    }

    return year + '-' +
        ((month < 10) ? '0' + month : month) + '-' +
        ((day < 10) ? '0' + day : day) + ' ' +
        ((hour < 10) ? '0' + hour : hour) + ':' +
        ((minute < 10) ? '0' + minute : minute);
}

(function($) {
    $.prettyDate = prettyDate;

    $.fn.prettyDate = function() {
        return this.each(function() {
            var t = $(this).text();
            var date = prettyDate(t);
            if (date) {
                $(this).text(date);
            }
        });
    };
})(jQuery);

(function($) {
    $.fn.scrollTo = function(scrollHeight, duration) { //目的 时间
        var $el = this;
        var el = $el[0];
        var startPosition = el.scrollTop;
        var delta = scrollHeight - startPosition;
        var startTime = Date.now();

        function scroll() {
            var fraction = Math.min(1, (Date.now() - startTime) / duration);
            el.scrollTop = delta * fraction + startPosition;
            if (fraction < 1) {
                setTimeout(scroll, 10);
            }
        }
        scroll();
    };
})(jQuery);

$(window).on('load', function(e) {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 0);
});

$(document).on('pageInit', function(e, pageId, $page) {
    var result = doPage($page);

    if ($.utils.isWeixin()) {
        initWeiXin(result, $page);
    }

    if ($page.find('.iShare').length) {
        ishare.new({
            container: '.iShare',
            config: {
                title: result.title,
                description: result.desc,
                url: result.url,
                WXoptions: {
                    evenType: 'click',
                    isTitleVisibility: true,
                    title: '小库优选分享',
                    isTipVisibility: true,
                    tip: '请扫描上面二维码',
                    qrcodeW: '120',
                    qrcodeH: '120'
                    //qrcodeBgc: '#e1bee7',
                    //qrcodeFgc: '#4a148c',
                    //bgcolor: '#ffffff'
                }
            }
        });
    }
});

$.currentPageId = null;
$.currentPage = null;
$(document).on('pageInit', function(e, pageId, $page) {
    $.currentPageId = pageId;
    $.currentPage = $page;

    if ($('.city-list').length) {
        require(['citypanel']);
    }
});

$(document).on('pageInit', function(e, pageId, $page) {
    initFootBarTab(e, pageId, $page);
});

$(document).on('pageReinit', function(e, pageId, $page) {
    initFootBarTab(e, pageId, $page);
});

$(document).on('pageInit', function(e, pageId, $page) {
    if ($page.find('form').length) {
        $.get('/member/get-token', function(token) {
            $('form').each(function() {
                $.insertTokenToForm($(this), token);
            });
        });
    }
});

$(document).on('pageInit', function(e, pageId, $page) {
    $page.find('img, video').css({
        'max-width': '100%',
    });

    $page.find('table').css({
        'width': '100%',
        'height': 'auto'
    });

    $page.find('td').each(function() {
        var $this = $(this);
        var width = $this.css('width');
        width = width.replace('px', '');
        if (width != 'auto') {
            width = parseInt(width, 10);
            if (width > 200) {
                $this.css('width', 'auto');
            }
        }
    });

    if ($page.find('textarea').length) {
        $('textarea').each(function() {
            var ta = $(this)[0];
            $.autoTextarea(ta);
        });
    }
});

$(document).on('pageInit', function(e, pageId, $page) {
    if ($.utils.isIos()) {
        $("a[href*='/treasure/recharge']").addClass('external'); //充值链接
        $("a[href*='/expert/reward']").addClass('external'); //专家打赏
        $("a[href*='/qa/ask']").addClass('external'); //快速提问
        $("a[href*='/order/all']").addClass('external'); //订单
    }

    if (self != top && self.location.href.indexOf('alipay') != -1) {
        $page.find('header').remove();
    }

    if (!$page.find('a.jumpto').length) {
        return;
    }

    var jumpurl = $page.find('a.jumpto').attr('href');
    var delay = $page.find('span.delay').text();
    delay = $.utils.intval(delay);
    var t = setInterval(function() {
        delay--;
        if (delay > -1) {
            $page.find('span.delay').text(delay);
        } else {
            clearInterval(t);
            window.location.href = jumpurl;
        }
    }, 1e3);
});


$(document).on('pageBeforeBack', function(e, pageId, $page) {
	if ($('.popup.modal-in').length) {
		$.closeModal();
		return false;
	}
    return true;
});


$(document).on('pageAfterBack', function(e, pageId, $page) {
    if (t = Cookies.get('lasttime')) {
        var url = location.href;
        Cookies.remove('lasttime');
        //$.router.loadPage(url, true);
        $(location).prop('href', url);
    }
    //initWeiXinShare($page);
});

$(document).on('click', '#panel-right a', function(e) {
    if (!$(this).hasClass('share-link')) {
        $.closePanel();
    }
});

$(document).on('pageInit', function(e, pageId, $page) {
    $('.page-loader').hide();
});

$(document).on('infinite', '.infinite-scroll', function() {
    var $this = $(this);
    if ($this.prop('loading')) {
        return;
    }
	
    $this.prop('loading', true);
	
	$(document).off('ajaxStart');
	$this.find('.infinite-scroll-preloader').show();
	
    var page = $this.attr('page');
    var psize = $this.attr('psize');
    var url = $this.data('url') || $(location).prop('href');
    var hasTabs = false;
    var $tabcontent;
    psize = $.utils.intval(psize);
    psize <= 0 && (psize = 5);

    if (!$this.find('.buttons-tab').length) {
        //
    } else {
        hasTabs = true;
        $tabcontent = $this.find('.tabs .tab.swiper-slide-active');
        if (!$tabcontent.length) {
            $tabcontent = $this.find('.tabs .tab.active');
        }

        page = $tabcontent.attr('page');

        if ($tabcontent.data('url')) {
            url = $tabcontent.data('url');
        }
    }

    page = $.utils.intval(page);
    page < 2 && (page = 2);
    url = $.utils.addQueryArg(url, 'page', page);

    $.get(url, {}, function(response) {
        $this.prop('loading', false);

        try {
            page++;
			
            if (!hasTabs) {
                $this.attr('page', page);
				var render = $this.data('render');
				var detach = false;
				if ($.isFunction(render)) {
					var content = render(response);
					if (!content) {
						detach = true;
					} else {
						$this.find('.infinite-scroll-item').parent().append(content);
					}
				} else {
					var $loaded = $(response);
					var $items = $loaded.find('.infinite-scroll-item');
					if (!$items.length || $items.length < psize) {
						detach = true;
					} else {
						$this.find('.infinite-scroll-item').parent().append($items);
					}
				}
				
				if (detach) {
					$.detachInfiniteScroll($this);
					$this.find('.infinite-scroll-preloader').hide();
				}
            } else {
				var $loaded = $(response);
                $tabcontent.attr('page', page);
                var $content = $loaded.find('.tab-content-storage ul');
                if ($content.find('li').length) {
                    $tabcontent.find('ul').append($content.html());
                    return;
                }

                if (!$content.find('li').length || $content.find('li').length < psize) {
                    $.detachInfiniteScroll($this);
                }
            }

            if (page > 20) {
                $.detachInfiniteScroll($this);
				$this.find('.infinite-scroll-preloader').hide();
            }
        } catch (ex) {
            console.log(response);
            throw ex;
            $.detachInfiniteScroll($this);
        }
    });
});


$(function(){
    //登录注册
    $(document).on("pageInit", "#login,#userSubscribe,#orderSubscribe,#orderCancel", function (e, id, page) {
        // 模拟多选框
        $(".register-checkbox").click(function(){
          var span = $(this).find("span");
               che = $(this).parent().find("input[type='checkbox']");
          if(span.hasClass("iconfont icon-xuanzhong")){
            span.attr("class","iconfont icon-weixuanzhong");
            che.attr("checked",false);
          } else {
            span.attr("class","iconfont icon-xuanzhong");
            che.attr("checked",true);
          }
        })

        //全选
        $("#quanxuan").click(function(){
            var btn = $(this).parent("li").find("input[type='checkbox']").attr("checked"),
                span = $(".register-checkbox").find("span");
            if(btn == undefined){
                span.attr("class","iconfont icon-weixuanzhong");
                $(".xuanzhong").attr("checked",false);  
            } else {
                span.attr("class","iconfont icon-xuanzhong");
                $(".xuanzhong").attr("checked",true);  
            }
        })
    });

    //商品详情
    $(document).on("pageInit", "#shopDetails,#shopDetails-1", function (e, id, page) {
      
        $(".product-swiper").swiper({
          pagination: ".swiper-pagination",
          paginationClickable: true
        });

        $(".product-popup").click(function(){
          $(".productImg-swiper").swiper({
            observer:true,
            observeParents:true,
            pagination: ".swiper-pagination"
          });
        })
        $(".share-btn").click(function(){
            $('.share-box').toggleClass("active");
        });
        $(".share-cancel-btn,.share-bg").click(function(){
            $('.share-box').toggleClass("active");
        });

        $(".icon-xihuan").click(function(){
            $(this).toggleClass("active");
        })

        $(".buttons-tab a").click(function(){
            if($(this).index() == "0") {
                $("#details-flag").addClass("none");
            } else {
                $("#details-flag").removeClass("none");
            }
        })

    });

    //发起采购
    $(document).on("pageInit", "#release", function (e, id, page) {
        $(".release-box dl dd span").click(function(){

            if($(this).parents("dd").hasClass("many")){
                if($(this).hasClass("off")){
                    active(this);
                } else {
                    $(this).toggleClass("active").siblings(".off").removeClass('active');
                }
            } else {
                active(this);
            }
        });
    });

    //订单
    $(document).on("pageInit", "#orderPayment,#orderCancel", function (e, id, page) {
        
        // 选中支付方式——勾
        $(".model-pay-body dl dd").click(function(){
            active(this)
        })

        // 充值金额
        $(".model-pay-body ul li").click(function(){
            active(this);
        })
       
    });

    //评价
    $(document).on("pageInit", "#orderEvaluate", function (e, id, page) {
        // 评分
        $(".evaluate-icon span").click(function(){
            var index = $(this).index(),
                span = $(this).parent().find("span"),
                text = $("#evaluate-text");

            span.removeClass("active");

            for( i = 0; i < index+1; i++){
                span.eq(i).addClass("active");
            }
            if($(this).parent().hasClass("evaluate-pj")){
                switch(index){
                    case 0:
                        text.html("极差");
                        break;
                    case 1:
                        text.html("差");
                        break;
                    case 2:
                        text.html("一般");
                        break;
                    case 3:
                        text.html("好");
                        break;
                    case 4:
                        text.html("很好");
                        break;
                }
            }
            
        })

    });

    //订单跟踪
    $(document).on("pageInit", "#orderTrack", function (e, id, page) {
        // 竖线高度
        var h = $(".content").innerHeight(),
            th = $("#track-title").innerHeight();
        console.log(h,th);
        $(".track-box").attr("style","min-height:"+(h-th-10)+"px");
        $(window).resize(function(){
            $(".track-box").attr("style","min-height:"+(h-th-10)+"px");
        })
    });
    
    //个人中心 收货地址
    $(document).on("pageInit","#userAddress",function(e, id, page){

        // 选中地址
        $(".address-box ul li .address-icon").click(function(){
            $(".address-box ul li .address-icon").removeClass("active");
            $(this).addClass("active");
        })
    })

    // 编辑地址
    $(document).on("pageInit","#userAddressEdit",function(e, id, page){

        // 选中地址
        $(".address-box ul li .address-icon").click(function(){
            $(".address-box ul li .address-icon").removeClass("active");
            $(this).addClass("active");
        })

        // 选择地址
        $("#picker-name").picker({
          toolbarTemplate: '<header class="bar bar-nav">\
          <button class="button button-link pull-right close-picker">确定</button>\
          <h1 class="title">请选择称呼</h1>\
          </header>',
          cols: [
            {
              textAlign: 'center',
              values: ['赵', '钱', '孙', '李', '周', '吴', '郑', '王']
              //如果你希望显示文案和实际值不同，可以在这里加一个displayValues: [.....]
            },
            {
              textAlign: 'center',
              values: ['杰伦', '磊', '明', '小鹏', '燕姿', '菲菲', 'Baby']
            },
            {
              textAlign: 'center',
              values: ['先生', '小姐']
            }
          ]
        });
    })

    
    $(document).on("pageInit","#userCase",function(){
        // 选择银行
        $("#picker-card").picker({
          toolbarTemplate: '<header class="bar bar-nav">\
          <button class="button button-link pull-left">按钮</button>\
          <button class="button button-link pull-right close-picker">确定</button>\
          <h1 class="title">标题</h1>\
          </header>',
          cols: [
            {
              textAlign: 'center',
              values: ['iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6 Plus', 'iPad 2', 'iPad Retina', 'iPad Air', 'iPad mini', 'iPad mini 2', 'iPad mini 3']
            }
          ]
        });
    })
    
})



function active(e) {
  $(e).addClass('active').siblings().removeClass('active');
}

function initFootBarTab(e, pageId, $page) {
    if (!$page.find('.bar .tab-item').length) {
        return;
    }

    var uri = $(location).prop('pathname');
    var level = 0;
    var curLevel = 0;
    var $item;
    $page.find('.bar .tab-item').each(function() {
        var pathname = $(this).prop('pathname');
        if (uri.indexOf(pathname) == 0) {
            curLevel = pathname.length;
        }

        if (curLevel > level) {
            $item = $(this);
        }
        level = curLevel;
    });

    if (!$item) {
        return;
    }

    if ($item.prop('pathname') == '/' && uri != '/') {
        return;
    }
    $item.addClass('active').siblings().removeClass('active');
}


function initWeiXin(options, $page)
{
    var url = $(location).prop('href');
    url = encodeURIComponent(url.split('#')[0]);
    require(['weixin'], function(wx) {
        window.wx = wx;
        $.ajax({
            url: '/wxjsapi/get-js-config?url=' + url,
            dataType: 'jsonp',
			global: false,
            success: function(response) {
                try {
                    var result = (typeof response === 'string') ? JSON.parse(response) : response;
                    if (result.code < 0) {
                        return false;
                    }

                    var data = result.data;
                    wx.config({
                        debug: false,
                        appId: data.appid,
                        timestamp: data.timestamp,
                        signature: data.signature,
                        nonceStr: data.noncestr,
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'onMenuShareQZone',
                            'uploadImage',
                            'chooseImage',
                            'downloadImage',
                            'scanQRCode'
                        ]
                    });

                    wx.ready(function() {
                        initWeiXinShare(wx, options, $page);
                    });

                    wx.error(function(res) {
                        console.log(res);
                    });

                } catch (ex) {
                    console.log(response);
                    throw ex;
                }
            }
        });
    });
}

function initWeiXinShare(wx, shareOptions, $page) {
    var ukey = Cookies.get('ukey');

    if (ukey) {
        shareOptions.link = $.utils.addQueryArg(shareOptions.link, 'ukey', ukey);
        shareOptions.link = $.utils.addQueryArg(shareOptions.link, 'client', 'weixin');
    }

    var wxfriendOption   = $.extend(true, {}, shareOptions);
    var wxcircleOption   = $.extend(true, {}, shareOptions);
    var qqOption         = $.extend(true, {}, shareOptions);
    var qqweiboOption    = $.extend(true, {}, shareOptions);
    var qqzoneOption     = $.extend(true, {}, shareOptions);

    wxfriendOption.channel = 'wxfriend';
    wxcircleOption.channel = 'wxcircle';
    qqOption.channel       = 'qq';
    qqweiboOption.channel  = 'qqweibo';
    qqzoneOption.channel   = 'qqzone';

    if (ukey) {
        wxfriendOption.link = $.utils.addQueryArg(wxfriendOption.link, 'channel', 'wxfriend');
        wxcircleOption.link = $.utils.addQueryArg(wxcircleOption.link, 'channel', 'wxcircle');
        qqOption.link       = $.utils.addQueryArg(qqOption.link, 'channel', 'qq');
        qqweiboOption.link  = $.utils.addQueryArg(qqweiboOption.link, 'channel', 'qqweibo');
        qqzoneOption.link   = $.utils.addQueryArg(qqzoneOption.link, 'channel', 'qqzone');
    }

    wx.onMenuShareAppMessage(wxfriendOption);
    wx.onMenuShareTimeline(wxcircleOption);
    wx.onMenuShareQQ(qqOption);
    wx.onMenuShareWeibo(qqweiboOption);
    wx.onMenuShareQZone(qqzoneOption);
}

function doPage($page) {
    var url, pathname, title, desc, imgsrc,  result = {};
    title = desc = imgsrc = '';

    url = $(location).prop('href');
    pathname = $(location).prop('pathname');
	
	if ($page.find('.share-url').length) {
		var $shareUrl = $page.find('.share-url').eq(0);
		var tag = $shareUrl.prop('tagName').toLowerCase();
		url = (tag == 'a' ? $shareUrl.prop('href') : $shareUrl.text().trim());
	}
		
    do {
        if ($page.find('.share-title').length) {
            title = $page.find('.share-title').eq(0).text().trim();
            break;
        }

        if ($page.find('h1').length) {
            title = '小库优选 - ' + $page.find('h1').eq(0).text().trim();
            break;
        }

        title = $(document).prop('title').trim();
    } while (false);

    do {
        if ($('.share-desc').length) {
            desc = $page.find('.share-desc').eq(0).text();
            desc = desc.replace('&nbsp;&nbsp;', '&nbsp;');
            desc = desc.replace(/\s{2,}/g, ' ');
            break;
        }

        desc = title;
    } while (false);

    if (/^\/profile\/[1-9]+[0-9]*(-[1-9]+[0-9]*)?/.test(pathname)) {
        var dname = $page.find('.dname').eq(0).text();
        imgsrc = $page.find('.member-logo').eq(0).attr('src');
        title = dname + '的个人名片出炉了，为我点赞！';
        desc = 'Hi，我是' + dname + '，在小库优选等你到来！';
    }

    if (/^\/expert\/[1-9]+[0-9]*(-[1-9]+[0-9]*)?/.test(pathname)) {
        var dname = $page.find('.dname').eq(0).text();
        var socialidentity = $page.find('.social-identity').eq(0).text();
        var about = $page.find('.about').eq(0).text();
        imgsrc = $page.find('.member-logo').eq(0).attr('src');
        title = '小库优选专家：' + dname + '为您答疑解惑';
        desc = socialidentity + '; ' + about;
    }

    desc = desc.replace(/\n|\r|\r\n|\u0085|\u2028|\u2029/igm, '');
    desc = desc.substr(0, 100);
    do {
        if ($page.find('.share-pic').length) {
            imgsrc = $page.find('.share-pic').eq(0).attr('src');
            break;
        }

        if ($page.find('img').length) {
            imgsrc = $page.find('img').eq(0).attr('src');
        }
    } while (false);

    if (imgsrc.indexOf('http://') != 0) {
        imgsrc = 'http://' + $(location).prop('hostname') + imgsrc;
    }

    result.title  = title;
    result.desc   = desc;
    result.imgUrl = imgsrc;
    result.link   = url;
    result.url    = url;

    result.success = function() {
        $.success('感谢您的分享');
		/*
        $.post('/share/do?ajax=json', {
            'client': 'weixin',
            'channel': this.channel,
            'url': this.url,
            'title': this.title,
            'content': this.desc,
            'picurl': this.imgUrl
        }, function(response) {
            try {
                var result = (typeof response === 'string') ? JSON.parse(response) : response;
                if (result.code < 0) {
                    console.log(result.message);
                    return false;
                }

                console.log(result.message);
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
		*/
    }

    return result;
}


rtn = {
    appInited: false,

	config: {
        isApp: false,
        fext: 'html',
		'actions': {
            'main': {
    			'index': {},
    			'search': {},
            },
		}
	},

	request: {
		url: '',
		baseurl: '',
		sbaseurl: 'http://m.zemu.dev', //file protocol
		sbaseurl2: 'http://zemu.you-yang.com', //native app
		query: '',
		uri: '',
		namespaces: ['main'],
		module: 'main',
		controller: 'index',
		action: 'index',
		args: {},
		get: function(key) {
			return (key in this.args) ? this.args[key] : null;
		}
	},

	init: function(e, pageId, $page) {
        this.initRequest($page);
		this.initRoute($page);
	},

    initRequest: function($page) {
        if (navigator.userAgent.indexOf('Html5Plus') !== -1) {
            this.config.isApp = true;
        }

        var url = $(location).prop('href');
        var info = $.utils.parseUrl(url);
        var uri = info.pathname;
        this.request = $.extend({}, this.request, info);
        this.request.url = info.hrefNoSearch;

        if (this.request.protocol == 'http:') {
            this.request.sbaseurl = this.request.domain;
        }

        if (this.config.isApp) {
            this.request.sbaseurl = this.request.sbaseurl2;
        }

        if (info.search) {
            this.request.query = info.search.substr(1);
        } else {
			this.request.query = '';
		}
		
		var args = {};
        if (this.request.query) {
			var ar = this.request.query.split('&');
            var param, name, value;
            for (var i = 0, l = ar.length; i < l; i++) {
                param = ar[i].split('=');
                name = param[0], value = decodeURIComponent(param[1]);
                if (typeof args[name] == "undefined") {
                    args[name] = value;
                } else if (typeof args[name] == "string") {
                    args[name] = [args[name]];
                    args[name].push(value);
                } else {
                    args[name].push(value);
                }
            }
        }
		
		this.request.args = args;

        var baseurl, sbaseurl, pos;
        if (info.protocol == 'file:') {
            pos = this.request.url.indexOf('/view');
            baseurl = this.request.url.substr(0, pos + 5);

            uri = this.request.url.replace(baseurl, '');
            uri = uri.replace('?' + this.request.query, '');
        } else {
            baseurl = 'http://' + info.hostname;
        }

        var obj = this.parseSpec(uri);
        var _this = this;
        $.each(obj, function(k, v) {
            _this.request[k] = v;
        });

        this.request.baseurl = baseurl;
    },

    parseSpec: function(spec) {
        var rtn = {
            uri: spec,
            module: 'main',
            controller: 'index',
            action: 'index'
        }

        spec = spec.replace(/(\w+)\.(php|html)\/?/i, "$1/");
        spec = spec.replace(/(^\/+|\/+$)/, '');
        spec = spec.replace(/^(\.\.\/)+/g, '');
		
		for (var i = 0; i < this.request.namespaces.length; i++) {
			var namespace = this.request.namespaces[i];
			if (spec == namespace || spec.indexOf(namespace + '/') === 0) {
				rtn.module = namespace;
				spec = spec.substr(namespace.length + 1);
				break;
			}
		}

        if (spec.length > 0) {
            var pieces = spec.split('/');
            pieces = pieces.reverse();
            rtn.controller = pieces.pop();

            if (pieces.length > 0) {
                rtn.action = pieces.pop();
            }
        }

        if (rtn.controller == 'home') {
            rtn.controller = 'index';
        }

        if (/^[1-9]+[0-9]*(-[1-9]+[0-9]*)?$/.test(rtn.action)) {
            rtn.action = 'detail';
        }

        rtn.uri = spec;
        return rtn;
    },

	initRoute: function($page) {
        var module     = this.request.module;
        var controller = this.request.controller;
        var action     = this.request.action;
        var script     = '';

        if (action == 'index') {
            action = '';
        }

        if (action) {
            var actionx = controller + '.' + action;
            if (actionx in this.config.actions[module]) {
                script = 'actions/' + module + '/' + actionx;
            }
        }

        if (!script && controller in this.config.actions[module]) {
            script = 'actions/' + module + '/' + controller;
        }

        if (!script) {
            return;
        }

		require([script], function(rtn) {
			if (rtn && rtn.init) {
				rtn.init();
			}
		});
	},

    preroute: function (url) {
        if (!this.config.isApp) {
            return true;
        }

        if (!url || url === "#" || /javascript:.*;/.test(url)) {
            return true;
        }

        if (url.indexOf('http://') != -1 || url.indexOf('https://') != -1) {
            return true;
        }

        var spec = url.split('?')[0].split('#')[0];
        var rtn = this.parseSpec(spec);

        if (rtn.action == 'login' && this.logined()) {
            url = this.url('/my');
            $.router.loadPage(url);
            return false;
        }

        if (!this.allow(rtn.module, rtn.controller, rtn.action)) {
            if (rtn.action != 'login') {
                var referer = url;
                url = this.url('/member/login');
                $.router.loadPage(url);
                $.router.referer = referer;
            }
            return false;
        }
        return true;
    },

    logined: function() {
        if (!this.config.isApp) {//非APP则交给服务端处理，根据返回的redirecturl决定跳转的页面
            return true;
        }

        if (this.cache('ssid')) {
            return true;
        }
        return false;
    },

	allow: function(module, controller, action) {
        if (this.logined()) {
            return true;
        }

        if (action == 'index') {
            action = '';
        }

        var actions = this.config.actions;
        var spec = controller + '.' + action;
        do {
            if (actions[module]['_auth']) {
                return false;
            }

            if (actions[module][spec] && actions[module][spec]['_auth']) {
                return false;
            }
        } while (false);

        return true;
    },

	url: function(spec, isServer, isJson, cache) {
        spec = spec || '';
        if (spec.indexOf('http:') === 0 || spec.indexOf('https:') === 0) { //如果以http:开头
            return spec;
        }

		//var language = this.request.language;
		var action = '';
		var query = '';
		var uri = this.request.uri;
		var _this = this;
		var baseurl = isServer ? this.request.sbaseurl : this.request.baseurl;

        var pos = spec.indexOf('?');
        if (pos != -1) {
            query = spec.substr(pos + 1);
            spec = spec.substring(0, pos);
        }

        var m = '',
            c = '',
            a = '';
		
		if (spec.indexOf('/') !== 0) {
            spec = this.request.module + '/' + this.request.controller + '/' + spec;
        }

        spec = spec.replace(/(^\/+|\/+$)/, '');
        spec = spec.replace(/^(\.\.\/)+/g, '');

		if (/\.(js|json|jpg|gif|png|css|zip|rar)(\?.+)?$/i.test(spec)) {
			spec = spec.replace(/^\/+/, '');
			return baseurl + '/' + spec;
		}

		spec = spec.replace(/:(\w+)/, function(m, m1) {
			return _this.request.get(m1);
		});

		if (isServer && query.indexOf('ssid=') == -1) {
			var ssid = this.cache('ssid');
			if (ssid) {
				query += (query ? '&' : '') + 'ssid=' + ssid;
			}
		}

		if (isJson && !/ajax=json/.test(query)) {
			query += (query ? '&' : '') + 'ajax=json';
		}

        if (cache === false) {
            if (!/_=\d+/.test(query)) {
                query += (query ? '&' : '') + '_=' + (new Date()).getTime();
            }
        }

        query = query ? '?' + query : '';
		

        var pieces = spec.split('/');
        if (this.request.namespaces.indexOf(pieces[0]) !== -1) {
            m = pieces[0];
            pieces.shift();
        }

        if (pieces.length) {
            c = pieces.shift();
        }

        if (pieces.length) {
            a = pieces.shift();
        }

        a = a.replace(/\.(php|html)$/i, '');
		m = m || 'main';
		c = c || 'index';
		a = a || 'index';
		spec = m + '/' + c + '/' + a;
			
		if (!isServer && this.request.protocol == 'file:') {
			spec = spec.replace('/index/', '/home/');
            spec += '.' + this.config.fext;
		} else {
            spec = spec.replace(/^main\//i, '');
			spec = spec.replace(/\/index/img, '');
        }

		return baseurl + '/' + spec + query;
	},

	realpath: function(path) {
		var p = 0, arr = [];
    	var r = window.location.href;
  		path = (path + '').replace('\\', '/');
  		if (path.indexOf('://') !== -1) {
  			p = 1;
  		}

  		if (!p) {
  			path = r.substring(0, r.lastIndexOf('/') + 1) + path;
  		}

  		arr = path.split('/');
  		path = [];
  		for (var k in arr) {
  			if (arr[k] == '.') {
  				continue;
  			}

  			if (arr[k] == '..') {
	    		if (path.length > 3) {
	    			path.pop();
	    		}
	    	} else {
	    		if ((path.length < 2) || (arr[k] !== '')) {
	    			path.push(arr[k]);
	    		}
	    	}
		}
		return path.join('/');
	},

    clearCache: function() {
        this.removeCache('logined');
        this.removeCache('user_id');
        this.removeCache('ssid');
        this.removeCache('lasttime');
    },

	removeCache: function(key) {
		var expiredKey = key + '_expiretime';
		window.localStorage.removeItem(key);
		window.localStorage.removeItem(expiredKey);
	},

	cache: function(key, value, lifetime) {
		return this.lscache(key, value, lifetime);
	},

	lscache: function(key, value, lifetime) {
		var expiredKey = key + '_expiretime';

		if (typeof value === 'undefined') {
			var t = localStorage.getItem(expiredKey);
		    if (t && t < +new Date()) {
		        window.localStorage.removeItem(key);
		        localStorage.removeItem(expiredKey);
		        return null;
		    }

			var value = window.localStorage.getItem(key);
			var v;
			try {
				v = JSON.parse(value);
			} catch(ex) {
				//
			}

			if (v) {
				value = v;
			}
			return value;
		} else {
			if (typeof value !== 'string') {
				value = JSON.stringify(value);
			}

			if (!lifetime) {
				lifetime =  30 * 86400 * 1000; //缓存一个月
			}
			window.localStorage.setItem(expiredKey, +new Date() + 1000 * lifetime);
			return window.localStorage.setItem(key, value);
		}
	},

	triggerPageInsert: function(e, $page, $extraIncludes, out) {
		return this.renderIncludes(e, $page, $extraIncludes, out);
	},

	renderIncludes: function(e, $page, $extraIncludes, out) {
		out = out || [];
		var dfr = $.Deferred();
		var requests = [];
		var html = $page.html();
		var reg = new RegExp('<!--#include\\s+virtual="([^\'"]+?)"\\s*-->', 'igm');
		var result;

		function doReplace(url, bereplaced) {
			return $.ajax({
                isPage: true,
				url: url,
				dataType: 'html'
			})
			.done(function(response) {
				try {
					if (response.indexOf('Fatal error') != -1) {
						console.log(response);
						return false;
					}

					//console.log('替换:' + bereplaced);
					html = html.replace(bereplaced, response);
				} catch (ex) {
					console.log(response);
					throw ex;
				}
			})
			.fail(function(xhr, error, thrown) {
				console.log(thrown + error);
			})
		}

		function doExtraIncludes(url) {
			return $.ajax({
                isPage: true,
				url: url,
				dataType: 'html'
			})
			.done(function(response) {
				try {
					if (response.indexOf('Fatal error') != -1) {
						console.log(response);
						return false;
					}

					if (!/<[^>]*>/.test(response)) {
						response = '<div>' + response + '</div>';
					}

					out.push($(response));
				} catch (ex) {
					console.log(response);
					throw ex;
				}
			})
			.fail(function(xhr, error, thrown) {
				console.log(thrown + error);
			})
		}

		while ((result = reg.exec(html)) != null) {
			var bereplaced = result[0];
			var url = result[1];
			requests.push(doReplace(url, bereplaced));
		}

		$extraIncludes.each(function(i, e) {
			var r = new RegExp('#include\\s+virtual="([^\'"]+?)"\\s*', 'im');
			var result = e.nodeValue.match(r);
			//var bereplaced = '<!--' + e.nodeValue + '-->';
			var url = result[1];
			requests.push(doExtraIncludes(url));
		});

		$.when.apply($, requests).then(function() {
			$page.html(html);
			dfr.resolve();
		});

		return dfr.promise();
	}
};

return rtn;

});
require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    waitSeconds: 0,
    paths: {
        jquery:       'jquery-3.2.1.min',
        i18n_cn:      'light7/js/i18n/cn.min',
        light7:       'light7/js/light7.min',
        base:         'base',
        //'jquery-private': 'jquery-private',
		cookie:       'js.cookie',
        //juicer:       'juicerx',
        weixin:       'http://res.wx.qq.com/open/js/jweixin-1.0.0',
        ishare:       'plugins/ishare/iShare-tidy.min',
        qrcode:       'plugins/ishare/qrcode.min',
		pureuploader: 'plugins/pure-uploader/jquery.pure-uploader',
        cropper:      'plugins/cropper/cropper',
        richeditor:   'plugins/richeditor/froala_editor.pkgd.min',
        swiper:       'light7/js/light7-swiper.min',
        kinswiper:    'plugins/kiner-swiper-panel',
        scrollfix:    'plugins/jquery-scrolltofixed',
        jplayer:      'plugins/jPlayer-2.9.1/jplayer/jquery.jplayer.min',
        district:     'district',
        account:      'account',
		//comment:      'comment',
        citypanel:    'city-panel'
    },

    map: {
        '*': {
            //'jquery': 'jquery-private',
            'css': 'css.min'
        },
        //'jquery-private': {'jquery': 'jquery'}
    },

    shim: {
        jquery: {
            exports: '$'
        },

        light7: {
            deps: ['jquery']
        },

        i18n_cn: {
            deps: ['light7']
        },

        base: {
            deps: ['global', 'light7', 'i18n_cn', 'swiper']
        },

        weixin: {
            exports: 'wx'
        },

        ishare: {
            deps: ['qrcode']
        },
		
		pureuploader: {
            deps: ['jquery', 'css!plugins/pure-uploader/jquery.pure-uploader.css']
        },

        jplayer: {
            deps: ['jquery']
        },

        cropper: {
            deps: ['jquery', 'css!plugins/cropper/cropper.min.css']
        },

        swiper: {
            deps: ['jquery']
        },

        kinswiper: {
            deps: ['swiper']
        },

        scrollfix: {
            deps: ['jquery']
        },

        richeditor: {
            deps: ['jquery', 'css!plugins/richeditor/froala_editor.pkgd.min.css']
        }
    }
});

var backCount = 0;
function plusReady(){
	var t = 2000;
	var timer;
    plus.key.addEventListener('backbutton', function(){
		window.history.back();

		if (backCount >= 2) {
			plus.runtime.quit();
		} else if (backCount == 1) {
			$.info('再按一次退出应用');
			clearTimeout(timer);
			timer = setTimeout(function(){
				backCount = 0;
			}, t);
		}

		backCount++;
    }, false);
}

define(['base', 'custom'], function(base, custom) {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            console.log('ajax url: ' + settings.url);
            if (base.request.protocol == 'file:' && settings.url.indexOf('file:') === -1) {
                if (!settings.isPage) {
                    xhr.setRequestHeader('X-REQUEST-MODE', 'Mobile');
                    settings.url = base.url(settings.url, true);
                    console.log('server url:' + settings.url);
                }
            }
        },

        xhrFields: {
            withCredentials:true
        }
    });

    $(document).on('ajaxStart', function(e) {
        $.showIndicator();
    });

    $(document).on('ajaxComplete', function(e) {
        $.hideIndicator();
    });

    $(document).on('ajaxError', function(e) {
        $.hideIndicator();
    });

	$(document).on('pageInit', function(e, pageId, $page) {
		backCount = 0;
		base.init(e, pageId, $page);
		custom.init();
	});

	$(document).on('pageInsert', function(e, $page, $extraIncludes, out) {
		return base.triggerPageInsert(e, $page, $extraIncludes, out);
	});

    $(function() {
        $.modal.prototype.defaults.closePrevious = false;
        $.router.preroute = function(url) {
            return base.preroute(url);
        }

        $.router.prepareUrl = function(url) {
            return base.url(url);
        }

        $.init();

		if (window.plus) {
			plusReady();
		} else {
			document.addEventListener('plusready', plusReady, false);
		}
    });

});


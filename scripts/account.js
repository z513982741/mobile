
define(['base'], function(base) {

var waitingbreak;
function waiting($form) {
    var $btn = $form.find('.getcode'),
        tag  = $btn.prop('tagName').toLowerCase(),
        txt,
        i = 60,
        t;

    txt = (tag == 'a' ? $btn.text() : $btn.val());
    waitingbreak = false;
    t = setInterval(function() {
        i--;
        waitingbreak = waitingbreak || i < 0;
        if (waitingbreak) {
            tag == 'a' ? $btn.text(txt) : $btn.val(txt);
            $btn.prop('waiting', false);
            clearInterval(t);
            return false;
        }

        tag == 'a' ? $btn.text(i + '秒...') : $btn.val(i + '秒...');
    }, 1e3);
}


$.initLoginForm = function($form) {
    $form.on('click', '.getcode', function(e) {
        e.preventDefault();
        var $this = $(this);
        if ($this.prop('waiting')) {
            return false;
        }

        $this.prop('waiting', true);
        var mobile = $form.find('input[name=mobile]').val().trim();
        if (!$.utils.isMobile(mobile)) {
            $this.prop('waiting', false);
            $.error('手机号格式不正确');
            return false;
        }

        var post = {}, $tok;
        $tok = $form.find("input.tok").eq(0);
        post.mobile = mobile;
        post[$tok.attr('name')] = $tok.val();

        waiting($form);
        var url = '/member/get-mobile-regcode?ajax=json&_=' + (new Date()).getTime();
        $.ajax({
            type: 'POST',
            url: url,
            global: false,
            data: $form.serialize(),
            success: function(response) {
                try {
                    var result = (typeof response === 'string') ? JSON.parse(response) : response;
                    if (result.code < 0) {
                        $.error(result.message);
                        return false;
                    }

                    //$.success('手机验证码获取成功，请立即输入');
                } catch (ex) {
                    console.log(response);
                    throw ex;
                }
            },
            error: function(xhr, error, thrown) {
                console.log(thrown + error);
            },
            dataType: 'json'
        });
        /*
        $.post(url, $form.serialize(), function(response) {
            try {
                var result = (typeof response === 'string') ? JSON.parse(response) : response;
                if (result.code < 0) {
                    $.error(result.message);
                    return false;
                }

                $.success('手机验证码获取成功，请立即输入');
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
        */
        return false;
    });

    $form.on('submit', function(e){
        var mobile, code, username, password, mode;
        if ($form.find('input[name=code]').length) {
            mobile = $form.find('input[name=mobile]').val().trim();
            code = $form.find('input[name=code]').val().trim();
            mode = 'code';
        } else {
            username = $form.find('input[name=username]').val().trim();
            password = $form.find('input[name=password]').val();
            mode = 'password';
        }

        if (mode == 'code') {
            if (!$.utils.isMobile(mobile)) {
                $.error('手机号格式不正确');
                return false;
            }

            if (!code) {
                $.error('请输入验证码');
                return false;
            }
        } else {
            if (!$.utils.isMobile(username)) {
                $.error('手机号格式不正确');
                return false;
            }

            if (!password) {
                $.error('请输入密码');
                return false;
            }
        }

        var url = $form.attr('action');
        url += '?ajax=json&_=' + (new Date()).getTime();

        $.post(url, $form.serialize(), function(response) {
            try {
                var result = (typeof response === 'string') ? JSON.parse(response) : response;
                if (result.code <= 0) {
                    $.error(result.message);
                    return false;
                }

                base.cache('logined', '1');
                base.cache('ssid', result.data.ssid);

                $.success('登录成功...');
                if (!result.backurl) {
                    result.backurl = '/';
                }
                $.router.replacePage(result.backurl);
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
        return false;
    });

    $form.on('click', 'a.submit', function(e){
        $form.submit();
        return false;
    });
};

$.initRegisterForm = function($form) {
    var rules = {
        'mobile': {
            _notice: '请输入您常用的手机号',
            required: [true, '手机号未填写'],
            mobile: [true, '手机号格式不正确'],
            remotex: {
                url: '/member/check-mobile?_=' + (new Date()).getTime(),
                type: 'get',
                dataType: 'text'
            }
        },

        'email': {
            _notice: '请输入邮箱地址',
            required: [true, '邮箱地址未填写'],
            email: [true, '邮箱地址格式不正确'],
            remotex: {
                url: '/member/check-email?_=' + (new Date()).getTime(),
                type: 'get',
                dataType: 'text'
            }
        },

        'code': {
            _notice: '请先填写手机号码，然后点击［获取短信验证码］',
            required: [true, '请输入验证码']
        },

        'password': {
            _notice: '6-16个字符组成，区分大小写',
            required: [true, '请输入密码'],
            minlength: [6, '密码长度至少为6位'],
            maxlength: [16, '密码长度最长为16位']
        },
        'rpassword': {
            _notice: '请再次输入密码',
            required: [true, '须再次输入密码'],
            equalTo: ["#password", '两次输入的密码不一致'],
            minlength: [6, '密码长度至少为6位'],
            maxlength: [16, '密码长度最长为16位']
        },
        'agree': {
            required: [true, '您须同意《商城用户议协》和《隐私权说明书》才能注册'],
        }
    };

    var copyRules = $.extend(true, {}, rules);
    var regmode = $form.find('input[name=regmode]').val();
    if (regmode == 'mobile') {
        rules = $.extend(true, {}, copyRules);
        delete rules['email'];
    } else {
        rules = $.extend(true, {}, copyRules);
        delete rules['mobile'];
        delete rules['code'];
    }

    $form.on('click', '.getcode', function() {
        if ($(this).prop('waiting')) {
            $.info('最近请求还在运行，请稍等');
            return false;
        }

        $(this).prop('waiting', true);
        $this = $(this);

        var mobile = $form.find('input[name=mobile]').val();
        mobile = $.trim(mobile);

        if (!$.utils.isMobile(mobile)) {
            $(this).prop('waiting', false);
            $.error('手机号格式不正确');
            return false;
        }

        var post = {},
            $tok;
        $tok = $form.find("input.tok").eq(0);
        post.mobile = mobile;
        post[$tok.attr('name')] = $tok.val();

        waiting($form);
        var url = '/member/get-mobile-regcode?ajax=json&_=' + (new Date()).getTime();
        $.post(url, $form.serialize(), function(response) {
            try {
                var result = (typeof response === 'string') ? $.parseJSON(response) : response;
                if (result.code < 0) {
                    $.error(result.message);
                    waitingbreak = true;
                    return false;
                }

                $.success('手机验证码获取成功，请立即输入');
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
        return false;
    });

    $form.on('submit', function(e){
        var mobile   = $form.find('input[name=mobile]').val();
        var code     = $form.find('input[name=code]').val();
        var password = $form.find('input[name=password]').val();
        mobile = $.trim(mobile);
        code = $.trim(code);
        password = $.trim(password);

        if (!$.utils.isMobile(mobile)) {
            $.error('手机号格式不正确');
            return false;
        }

        if (!code) {
            $.error('请填写验证码');
            return false;
        }

        if (!password) {
            $.error('请输入密码');
            return false;
        }

        var url = $form.attr('action');
        url += '?ajax=json&_=' + (new Date()).getTime();

        $.info('请稍等...');

        $.post(url, $form.serialize(), function(response) {
            try {
                var result;
                if (typeof response === 'string') {
                    result = $.parseJSON(response);
                } else {
                    result = response;
                }

                if (result.code <= 0) {
                    $.error(result.message);
                    return false;
                }

                $.success('注册成功...');
                result.backurl = $form.find('a.submit').attr('href');
                if (result.backurl) {
                    $.router.loadPage(result.backurl, true);
                }
            } catch (ex) {
                alert(response);
                throw ex;
            }
        });
        return false;
    });

    $form.on('click', 'a.submit', function(e){
        $form.submit();
        return false;
    });
};

$.initResetPasswordForm = function($form) {
    $form.find('.getcode').click(function() {
        if ($(this).prop('waiting')) {
            $.info('最近请求还在运行，请稍等');
            return false;
        }

        $(this).prop('waiting', true);
        $this = $(this);

        var mobile = $form.find('input[name=mobile]').val();
        mobile = $.trim(mobile);

        if (!$.utils.isMobile(mobile)) {
            $(this).prop('waiting', false);
            $.error('手机号格式不正确');
            return false;
        }

        waiting($form);
        var url = '/member/get-mobile-regcode?ajax=json&_=' + (new Date()).getTime();
        $.post(url, $form.serialize(), function(response) {
            try {
                var result = (typeof response === 'string') ? $.parseJSON(response) : response;
                if (result.code < 0) {
                    $.error(result.message);
                    waitingbreak = true;
                    return false;
                }

                $.success('手机验证码获取成功，请立即输入');
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
        return false;
    });

    $form.submit(function(e){
        var post = $form.serializeHash();
        var url = $form.attr('action') + '?ajax=json&_=' + (new Date()).getTime();
        var backurl = post.backurl || '/';

        if (!$.utils.isMobile(post.mobile)) {
            $.error('手机号格式不正确');
            return false;
        }

        if (!post.code) {
            $.error('请填写验证码');
            return false;
        }

        if (!post.password) {
            $.error('请输入新密码');
            return false;
        }

        $.post(url, $form.serialize(), function(response) {
            try {
                var result = (typeof response === 'string') ? JSON.parse(response) : response;
                if (result.code <= 0) {
                    $.error(result.message);
                    return false;
                }

                $.success('修改成功...');
                $.router.loadPage(backurl, true);
            } catch (ex) {
                console.log(response);
                throw ex;
            }
        });
        return false;
    });

    $form.find('a.submit').click(function(e){
        $form.submit();
        return false;
    });
};

return base;

});
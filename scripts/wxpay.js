
define(['base'], function() {

var $page;
function init() {
    $page = $.getCurPage();

    /*
    var js_api_json = $('.js-api-json').text();
    js_api_json = $.parseJSON(js_api_json);

    $page.on('click', '.pay', function(){
        callpay(js_api_json);
    });
    */
}

function run(tid, treasures, success, error) {
    var url = '/wxpay/jsapi?ajax=json&tid=' + tid + '&treasures=' + treasures;
    $.get(url)
    .done(function(response) {
        try {
            var result = (typeof response === 'string') ? JSON.parse(response) : response;
            if (result.code < 0) {
                $.error(result.message);
                return false;
            }
            callpay(result.data, success, error);
        } catch (ex) {
            console.log(response);
            throw ex;
        }
    })
    .fail(function(xhr, error, thrown) {
        console.log(error);
        console.log(thrown);
    });
}

function callpay(data, success, error) {
    if (typeof WeixinJSBridge == "undefined"){
        if( document.addEventListener ){
            document.addEventListener('WeixinJSBridgeReady', function() {
                pay(data, success, error);
            }, false);
        }else if (document.attachEvent){
            document.attachEvent('WeixinJSBridgeReady', function() {
                pay(data, success, error);
            });
            document.attachEvent('onWeixinJSBridgeReady', function() {
                pay(data, success, error);
            });
        }
    } else {
        pay(data, success, error);
    }
}

function pay(data, success, error) {
    WeixinJSBridge.invoke('getBrandWCPayRequest', data, function(res) {
            if (res.err_msg == 'get_brand_wcpay_request:ok') {
                Cookies.set('lasttime', (new Date()).getTime());
                $.success('支付成功');
                success && success();
            } else {
                console.log(res);
                $.error('支付失败');
                error && error();
            }
        }
    );
}

return {
    init: init,
    run: run,
    callpay: callpay
};

});
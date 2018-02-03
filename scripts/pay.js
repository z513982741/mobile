define(['base', 'wxpay'], function(base, wxpay) {

var $page;
var paying;
function init() {
    $page = $.getCurPage();

    paying = false;
    if ($('.payment-chooser').length > 1) {
        $('.payment-chooser').not(':last').remove();
    }

    initDefaultPayType();

    $('.payment-chooser').on('opened', function(e) {
        checkTreasureInput();
        $('.payment-chooser').find('.paybtn-wrapper').show();
    });


    $('.payment-chooser').on('click', 'input[name=treasures]', function(e) {
        return false;
    });

    $('.payment-chooser').on('closed', function() {
        if (paying) {
            return;
        }

        var tid = $('.payment-chooser').find('input[name=tid]').val();
        if (tid) {
            var backurl = $('.payment-chooser').find('input[name=backurl]').val() || '/order/all';
            if ($.utils.isIos()) {
                $(location).prop('href', backurl);
            } else {
                $.router.replacePage(backurl);
            }
        }
    });

    $('.payment-chooser').on('click', '.confirm-pay', function(e) {
        paying = true;
        var tid = $('.payment-chooser').find('input[name=tid]').val();
        if (tid) {
            doPay(tid);
        } else {
            toPay();
        }
    });
}

function initDefaultPayType() {
    if ($.utils.isWeixin()) {
        $('input[name=paytype][value=alipay]').closest('li').hide();
        $('input[name=paytype][value=wxpay]').prop('checked', true);
    } else {
        $('input[name=paytype][value=wxpay]').closest('li').hide();
        $('input[name=paytype][value=alipay]').prop('checked', true);
    }
}

function checkTreasureInput() {
    var $input = $('.payment-chooser').find('input[name=treasures]');
    var treasures = $input.val();
    var spend = $('.payment-chooser').find('input[name=total_spend]').val();
    treasures = parseFloat(treasures);
    spend = parseFloat(spend);

    if (treasures == 0) {
        $input.prop('checked', false).prop('disabled', true);
    }

    if ($input.prop('checked') && treasures >= spend) {
        $('.payment-chooser').find('input[name=paytype]')
            .prop('checked', false)
            .prop('disabled', true);
         $('.payment-chooser').find('.remaining-payment-part').text(0);
        return;
    }

    $('.payment-chooser').find('input[name=paytype][value=alipay]')
        .prop('checked', true)
        .prop('disabled', false);

    if ($.utils.isWeixin()) {
        $('.payment-chooser').find('input[name=paytype][value=wxpay]')
            .prop('checked', true)
            .prop('disabled', false);
    } else {
        $('.payment-chooser').find('input[name=paytype][value=wxpay]')
            .prop('checked', false)
            .prop('disabled', true);
    }

    var remains = $input.prop('checked') ? spend - treasures : spend;
    remains = remains.toFixedNumber(2);
    $('.payment-chooser').find('.remaining-payment-part').text(remains);
}

function doPay(tid, success, error) {
    var paytype = $('.payment-chooser input[name=paytype]:checked').val();
    var $treasureInput = $('.payment-chooser').find('input[name=treasures]');
    var treasures = $treasureInput.prop('checked') ? $treasureInput.val() : 0;
    var spend = $('.payment-chooser').find('input[name=total_spend]').val();
    treasures = parseFloat(treasures);
    spend = parseFloat(spend);
    if (treasures >= spend) {
        paytype = 'walletpay';
    }

    $.closeModal('.payment-chooser');
    var url;
    switch (paytype) {
        case 'alipay':
            url = '/alipay/start?tid=' + tid + '&treasures=' + treasures;
            $.router.replacePage(url);
            //$(location).prop('href', url);
            break;
        case 'wxpay':
            var backurl = $('.payment-chooser').find('input[name=backurl]').val();
            wxpay.run(tid, treasures, function() {
                /*
                if (success) {
                    success();
                    return;
                }

                if (backurl) {
                    $.router.loadPage(backurl, true);
                } else {
                    $.router.back();
                }
                */

                $.router.replacePage('/order/message?tid=' + tid);
            },
            function() {
                if (error) {
                    error();
                    return;
                }

                var backurl = $('.payment-chooser').find('input[name=backurl]').val() || '/order/all';
                if ($.utils.isIos()) {
                    $(location).prop('href', backurl);
                } else {
                    $.router.replacePage(backurl);
                }
            });
            break;
        case 'walletpay':
            url = '/walletpay/start?tid=' + tid;
            $.router.replacePage(url, true);
        default:
            //
    }
}

function toPay() {
    var paytype = $('.payment-chooser input[name=paytype]:checked').val();
    var $treasureInput = $('.payment-chooser').find('input[name=treasures]');
    var treasures = $treasureInput.prop('checked') ? $treasureInput.val() : 0;
    var spend = $('.payment-chooser').find('input[name=total_spend]').val();
    treasures = parseFloat(treasures);
    spend = parseFloat(spend);
    if (treasures >= spend) {
        paytype = 'walletpay';
    }

    var orderid = $('.payment-chooser').find('input[name=orderid]').val();
    var url = '/order/prepare-payment?ajax=json&paytype=' + paytype + '&orderid=' + orderid;
    $.get(url)
    .done(function(response) {
        try {
            var result = (typeof response === 'string') ? JSON.parse(response) : response;
            if (result.code < 0) {
                $.error(result.message);
                return false;
            }

            var tid = result.data.tid;
            var amount = result.data.spend;
            doPay(tid, function() {
                setTimeout(function() {
                    $.router.reloadPage();
                }, 4000);
            }, function() {
                return;
            });
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

return {init: init, doPay: doPay, wxpay: wxpay};
});
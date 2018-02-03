
define(['base'], function() {

var $page;
function init() {
    $page = $.getCurPage();
	
	$.success('load custom.js');
}

return {init: init};

});
define(['base'], function(base) {

var $page, pageid;

function init() {
    $page = $.getCurPage();
	pageid = $page.prop('id');
	
}

return {init: init};

});
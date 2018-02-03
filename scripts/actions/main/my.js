define(['base', 'kinswiper'], function(base, kinswiper) {

var $page, pageid, $scrollFix;

function init() {
    $page = $.getCurPage();
	pageid = $page.prop('id');
	
}

return {init: init};

});
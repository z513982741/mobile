(function(win, doc, $) {
    
    var KinerSwiperPanel = function(options) {
		var mySwiper;
        var opts = $.extend(true, {}, $.kinerSwiperPanel.options, options);
        var nav = $(opts.navSelector),
            con = $(opts.conSelector),
            kinerItem = $(opts.itemSelector);
			
        var returnObj = {
            slideTo: function(index) {
                selectPanel(index, 2);
            },
            on: function(name, handler) {
                handlers[name] = handler;
            },
            handlerNameList: {
                "change": "change"
            }
        };

        var handlers = {};
		var len = nav.find('.kinerTab').length;
		var nowLeft = 0;
		
        if (con.find('.wrapper').length == 0) {
            kinerItem.wrapAll('<div class="wrapper" />');
        }

        con.addClass('swiper-container').find('.wrapper').addClass('swiper-wrapper');
        kinerItem.addClass('swiper-slide');
        if (nav.find('.kinerTab').length == 0) {
            nav.children().addClass('kinerTab');
        }

        if (nav.find('.realBorder').length) {
            //
        } else {
            nav.append('<div class="realBorder"></div>');
            nav.find(".realBorder").css({
                //width: (1 / len) * 100 + "%"
                width: opts.menuWidth ? opts.menuWidth : nav.find('.kinerTab').eq(0).width()
            });
        }

        function getDirection(swiper) {
			console.log('swiper.previousIndex: ' + swiper.previousIndex);
            return swiper.previousIndex > swiper.activeIndex ? "left" : swiper.previousIndex < swiper.activeIndex ? "right" : "none";
        }

        function movePanel(width, swiper) {
			var direction; //移动的方向
			var offset; //内容区偏移量
			var cur_offset = 0; //相对当前页偏移量
			var target_distance = 0;
			var target_offset = 0;
			var nextIndex;
			var nextTab;
            var transform = con.find('.wrapper').css('transform');
            if (transform.indexOf('translate3d') != -1) {//zepto
                offset = transform.replace('translate3d(', '').replace(')', '');
                offset = $.trim(offset.split(",")[0]).replace('px');
                offset = parseFloat(offset);
            } else {
                offset = $.trim(transform.split(",")[4]);
            }
			
			if (!offset) {
				return;
			}
			
			offset = parseFloat(offset);
			cur_offset = Math.abs(offset) - (swiper.activeIndex * width);
			direction = (cur_offset > 0 ? 'right' : 'left');
			console.log('offset: ' + offset + '; cur_offset: ' + cur_offset + '; direction: ' + direction);
			
			nextIndex = (cur_offset > 0 ? swiper.activeIndex + 1 : swiper.activeIndex - 1);
			nextTab = nav.find('.kinerTab').eq(nextIndex);
			if (nextIndex < 0 || !nextTab.length) {
				console.log('no next tab');
				return;
			}
			
			console.log('next tab: ' + nextTab.find('a').attr('href'));
			
			target_distance = nextTab.position().left + (nextTab.width() / 2) - (nav.find(".realBorder").width() / 2) - nowLeft;
			target_distance = Math.abs(target_distance);
			target_offset = (target_distance / width) * cur_offset;
			nav.find(".realBorder").css({
				left: nowLeft + target_offset,
				"-webkit-transition": "none",
				"-moz-transition": "none",
				"-ms-transition": "none",
				"-o-transition": "none",
				"transition": "none"
			});
        }

        mySwiper = new Swiper(opts.conSelector + '.swiper-container', {
            direction: 'horizontal',
            observer: true,
            observeParents: true,
			//autoHeight: true,
            //initialSlide: initialSlide,
            onTouchStart: function(swiper) {
                nowLeft = nav.find(".realBorder").position().left;
            },
			
            onTouchMove: function(swiper, e) {
                movePanel(swiper.width, swiper);
            },
			
            onTouchEnd: function(swiper) {},
			
            onSlideNextStart: function(swiper) {},
			
            onSlideChangeStart: function(swiper) {
				console.log('slide change: ' + swiper.activeIndex);
                selectTab(swiper);
            },
			
            onTransitionStart: function(swiper) {
				console.log('transition start: ' + swiper.activeIndex);
				animate(swiper);
            }
        });

        $(win).resize(function() {
            mySwiper.update();
        });

        nav.on('click', '.kinerTab', function(e) {
            if ($(this).hasClass('active')) {
                return;
            }
			
			mySwiper.slideTo($(this).index(), opts.time);
        });
		
		function animate(swiper) {
			var direction = getDirection(swiper);
			var index = swiper.activeIndex;
			var pos = nav.find('.kinerTab').eq(index).position().left 
						+ (nav.find('.kinerTab').eq(index).width() / 2)
						- (nav.find('.realBorder').width() / 2);
			
			console.log('transition: ' + swiper.activeIndex + '; direction: ' + direction);
			nav.find(".realBorder").css({
				left: pos,
				"-webkit-transition": "left 300ms ease",
				"-moz-transition": "left 300ms ease",
				"-ms-transition": "left 300ms ease",
				"-o-transition": "left 300ms ease",
				"transition": "left 300ms ease"
			});
		}

        function selectTab(swiper) {
			var index = swiper.activeIndex;
			console.log('select tab: ' + index);
            nav.find('.kinerTab').removeClass('active').eq(index).addClass('active');
			animate(swiper);
			console.log('tab change trigger');
			setTimeout(function() {
				handlers[returnObj.handlerNameList.change] && handlers[returnObj.handlerNameList.change].call(null, index);
			}, 300);
        }

        returnObj.swiper = mySwiper;
        return returnObj;
    };
	
	$.kinerSwiperPanel = function(options) {
		return new KinerSwiperPanel(options);
	}
	
    $.kinerSwiperPanel.options = {
        time: 300
    }
})(window, document, $);
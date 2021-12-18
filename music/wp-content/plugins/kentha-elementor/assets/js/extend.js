/**====================================================================
 *
 *  Main Script File
 *
 *====================================================================*/
/* jshint unused:false */
/*globals snabbt */

(function($) {
	"use strict";
	$.kenthaElementor = {
		window: $(window),
		fxActivationClass: 'kentha-fx-on',
		
		/**
		 * ====================================================================
		 * Global options
		 * ====================================================================
		 */
		options: {
			glitchDuration: 1000, //glitchFx
			glitchPause: 4000, //glitchFx
		},

		/**
		 * ====================================================================
		 * Initialization
		 * ====================================================================
		 */
		__init: function(){
			var kenthaElementor = this;
			kenthaElementor.countFps(kenthaElementor);
			kenthaElementor.kenthaCarousel(kenthaElementor, 'init', 'body');
			kenthaElementor.windowResized(kenthaElementor);
			kenthaElementor.kenthaMouseMove.init( kenthaElementor );
			kenthaElementor.fx3dElements.init(kenthaElementor);
			kenthaElementor.kenthaSectionFx();
			kenthaElementor.glitchParticles.init( kenthaElementor );
			kenthaElementor.glitchText.init( kenthaElementor );
			kenthaElementor.glitchPics.init( kenthaElementor );
			kenthaElementor.glitchLoop.init( kenthaElementor );
		},


		/**
		 * ====================================================================
		 *  FPS counter
		 * ====================================================================
		 */
		countFps: function(kenthaElementor){
			var that = this;
			var body = $("body");
			var debugOutput = ($("body").data('jsdebug'))? 1 : 0;
			body.append('<output id="kentha-elementor-PerformanceCheck" style="position: fixed;bottom: 0px;left: auto; right:0;padding: 0 2px;opacity: '+debugOutput+';background:black;color:white;z-index:100; font-size: 10px;"></output>');
			var $out = $('#kentha-elementor-PerformanceCheck');
			that.countFPSf = (function () {
			  var lastLoop = (new Date()).getMilliseconds();
			  var count = 1;
			  var fps = 0;
			  return function () {
				var currentLoop = (new Date()).getMilliseconds();
				if (lastLoop > currentLoop) {
				  fps = count;
				  count = 1;
				} else {
				  count += 1;
				}
				lastLoop = currentLoop;
				kenthaElementor.fps = fps;
				return fps;
			  };
			}());
			
			(function loop() {
				requestAnimationFrame(function () {
				  $out.html(that.countFPSf() + 'FPS');
				  loop();
				});
			}());
		},

		/**
		 * ====================================================================
		 * Trigger custom functions on window resize
		 * ====================================================================
		 */
		windowResized: function(v){
			var rst;
			var	w = v.window;
			v.wW = v.window.width();
			v.wH = v.window.height();
			w.on('resize', function() {
				clearTimeout(rst);
				rst = setTimeout(function() {
					if (w.width() != v.wW){
						v.wW = w.width();
						v.animation3D.reset();
						v.kenthaMouseMove.init( v );
					}
					if (w.height() != v.wH){
						v.wH = w.height(); // used in other functions
					}
				}, 1000);
			});
		},

	
		/**
		 * ====================================================================
		 *  Mouse move binding
		 *  * Do not run on small screens
		 *  * Do not run if the FPS are too low, prevent browser stuck
		 * ====================================================================
		 */
		kenthaMouseMove: {
			init: function( kentha ){
				var win = kentha.window;
				win.off('mousemove.kenthaspace'); //kenthaspace = aleatory namespace
				kentha.mousePos = { x: kentha.wW / 2, y: kentha.wH / 2 };
				win.trigger('kenthaMouseMoved');
				kentha.mouseAnimation = false;
				if( win.width() > 1190 ){
					win.on('mousemove.kenthaspace', function(e){ // stateful 
						kentha.mousePos = { 
							x: e.pageX,
							y: e.pageY
						};
						win.trigger('kenthaMouseMoved'); 
					});
				}
			},
		},

		
		/**
		 * ====================================================================
		 * Animation in 3D
		 * ====================================================================
		 */
		animation3D: {
			target: false,
			reset: function() {
				var old = $('.kentha-animating-3d');
				if( old.length > 0 ){
					var resetCss = {"transform": "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1) translate(0, 0)", "transition" : 'all 1s ease' };
					jQuery('.kentha-animating-3d').css(resetCss).find('.kentha-3d-element__front').css(resetCss);
					old.removeClass('kentha-animating-3d');
				}
			},
			init: function( v ){
				var that = this,
					win = v.window,
					item = false, e, mouseXrel, mouseYrel,  moveX, moveY, matrix1, matrix2;
				that.reset();
				if( v.wW > 1190 && false !== that.target ){
					that.target.addClass('kentha-animating-3d');
					item = $('.kentha-animating-3d');
					e = v.mousePos;
					var centerX = item.offset().left + ( item.width() / 2 );
					var centerY = item.offset().top + ( item.height() / 2 );
					mouseXrel = (e.x - centerX) * - 1 / 100;
					mouseYrel = (e.y - centerY) * - 1 / 100;
					moveX = mouseXrel * 0.000013;
					moveY = mouseYrel * 0.000013;
					matrix1 = [[1, 0, 0, - moveX], [0, 1, 0, - moveY], [0, 0, 1, 1], [0, 0, 0, 1]];
					matrix2 = [[1, 0, 0, - moveX], [0, 1, 0, - moveY], [0, 0, 1, 1], [0, 0, 0, 1]];
					
					item .css({"transition" : 'all 0.15s ease', "transform": "matrix3d(" + matrix1.toString() + ") translate(" + mouseXrel *  -4 + "px, " + mouseYrel  * -4 + "px)"})
						.find('.kentha-3d-element__front').css({"transition" : 'all 0.15s ease', "transform": "perspective(1000px) matrix3d(" + matrix2.toString() + ") translate(" + mouseXrel  * -4 + "px, " + mouseYrel * -4 + "px)"});
					
					v.moverMouse = { 
						x: centerX,
						y: centerY
					};

					win.on('kenthaMouseMoved.kentha3d', function(){
						if( v.fps > 8 ){
							var tempItem = $('.kentha-animating-3d');
							$(v.moverMouse).clearQueue();
							$(v.moverMouse).animate({
							  x: v.mousePos.x ,
							  y: v.mousePos.y
							}, {
							  	duration: 110,
							  	step: function() {
									mouseXrel = (v.moverMouse.x - centerX) * - 1 / 100;
									mouseYrel = (v.moverMouse.y - centerY) * - 1 / 100;
									moveX = mouseXrel * 0.000013;
									moveY = mouseYrel * 0.000013;
									matrix1 = [[1, 0, 0, - moveX], [0, 1, 0, - moveY], [0, 0, 1, 1], [0, 0, 0, 1]];
									matrix2 = [[1, 0, 0, - moveX], [0, 1, 0, - moveY], [0, 0, 1, 1], [0, 0, 0, 1]];
									// IMPORTANT: never replace $('.kentha-animating-3d') with a variable or the animation falls bad
									$('.kentha-animating-3d').css({"transform": "matrix3d(" + matrix1.toString() + ") translate(" + mouseXrel *  -4 + "px, " + mouseYrel  * -4 + "px)", 'transition':'none'})
									.find('.kentha-3d-element__front').css({"transform": "perspective(1000px) matrix3d(" + matrix2.toString() + ") translate(" + mouseXrel  * -4 + "px, " + mouseYrel * -4 + "px)", 'transition':'none'});
							  	}
							});
						}
					});
				}
			},
		},

		/**
		 * ====================================================================
		 *  3D elements append listeners
		 * ====================================================================
		 */
		fx3dElements: {
			init: function(v){
				$('.kentha-elementor-3dfx [data-kentha-elementor-3dpicture="true"]').attr('data-kentha-elementor-3dpicture', 'false'); // disable if the container has 3d
				$('.kentha-elementor-3dfx [data-kentha-elementor-3delement="true"]').attr('data-kentha-elementor-3delement', 'false'); // disable if the container has 3d
				var the3dElements = [
					$('[data-kentha-elementor-3dpicture="true"]'), 
					$('[data-kentha-animation3d="true"] .owl-item'),
					$('[data-kentha-elementor-3delement="true"]'), 
					$('.kentha-elementor-3dfx > .elementor-container')
				];
				$.each(the3dElements, function(){
					$(this).each(function(){
						var t = $(this);
						t.css({"transform": "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1) translate(0, 0)" });
						t.off('onmouseenter.kentha3d').off('mouseleave.kentha3d')
						.on('mouseenter.kentha3d', function(){
							v.animation3D.target = t;
							v.animation3D.init( v );
						});
					});
				});
			},
		},


		isInViewport: function( element ) {
			var elementTop = element.offset().top;
			var elementBottom = elementTop + element.outerHeight();
			var viewportTop = $(window).scrollTop();
			var viewportBottom = viewportTop + $(window).height();
			return elementBottom > viewportTop && elementTop < viewportBottom;
		},

		/**
		 * ====================================================================
		 * kenthaCarousel
		 * ====================================================================
		 */
		kenthaCarousel: function(kenthaElementor, action, targetContainer){
			if(!jQuery.fn.owlCarousel) { return; }
			if(undefined === targetContainer) { targetContainer = "body"; }
			if(undefined === action) { action = "init"; }

			if( 'init' === action ){
				$(targetContainer+' .kentha-elementor-owl-carousel').each( function(i,c){
					var T = $(c),
						itemIndex,
						controllerTarget;
					if(!T.hasClass('kentha-elementor-carousel-created')){
						T.fadeTo(0, 0);
					}
					T.owlCarousel({
						loop: T.data('loop'),
						margin: T.data('gap'),
						nav: T.data('nav'),
						dots: T.data('dots'),
						navText: ['<i class="kentha-elementor-arrow kentha-elementor-arrow__l"></i>', '<i class="kentha-elementor-arrow kentha-elementor-arrow__r"></i>'],
						center: T.data('center'),
						stagePadding: T.data('stage_padding'),
						autoplay:  T.data('autoplay_timeout') > 0,
						autoWidth:false,
						autoplayTimeout: T.data('autoplay_timeout'),
						autoplayHoverPause: T.data('pause_on_hover'),
						callbacks: true,
						responsive:{
							0:{
								items: T.data('items_mobile'),
								autoWidth:false,
								margin: 30,
								mouseDrag: false,
								touchDrag: true
							},
							420:{
								items: T.data('items_mobile_hori'),
								autoWidth:false,
								mouseDrag: false,
								touchDrag: true
							},
							600:{
								items: T.data('items_tablet'),
								autoWidth:false,
								mouseDrag: false,
								touchDrag: true
							},
							1025:{
								items: T.data('items'),
								autoWidth:false
							}
						},
						onInitialized:function(){
							T.addClass('kentha-elementor-carousel-created');
							$(c).delay(250).fadeTo(250, 1);
						},
					});
					// multinav
					if( T.hasClass('kentha-elementor-multinav-main')) {
						controllerTarget = T.data('target');
						T.parent().find('.kentha-elementor-multinav__controller').find('a:first-child').addClass('current');
						T.on('changed.owl.carousel', function (e) {
							if (e.item) {
								itemIndex = T.find('.active [data-index]').data('index') + 1;
								T.parent().find('.kentha-elementor-multinav__controller .current').removeClass('current');
								T.parent().find('.kentha-elementor-multinav__controller').find('[data-multinav-controller="'+itemIndex+'"]').addClass('current');
							}
						});
					}
					// Index number [modernSlider]
					if( T.data('indexslide') ){
						T.find('.owl-nav').append('<div class="kentha-modernslider__index" data-kentha-itemindex>01</div>');
						var cur;
						var indexContainer = T.find('.owl-nav').find('[data-kentha-itemindex]');
						var currentItem = T.find('.active');
						if(T.data('kenthafx') === 'glitch'){
							currentItem.find('[data-kenthafx="glitch"]').addClass(kenthaElementor.fxActivationClass);
						}
						T.on('translated.owl.carousel', function(e) {
							if (e.item) {
								cur = T.find('.active [data-index]').data('index');
								if( cur < 10 ){
									cur = '0'+cur;
								}
								indexContainer.animate({
									'opacity': 0,
									'margin-top': '-20px'
								}, 300, function(){
									indexContainer.html( cur ).css({'margin-top': '20px'}).animate({
										'opacity': 1,
										'margin-top': '0px'
									}, 300);
								});
								if(T.data('kenthafx') === 'glitch'){
									currentItem = T.find('.active');
									currentItem.find('[data-kentha-imgfx="glitch"]').addClass(kenthaElementor.fxActivationClass);
									currentItem.prev().find('[data-kentha-imgfx="glitch"]').removeClass(kenthaElementor.fxActivationClass);
								}
							}
						});
					}
					T.on('click', "[data-multinav-controller]", function(e){
						e.preventDefault();
						var t = $(this),
							i = t.data("multinav-controller"),
							targ = t.data("multinav-target");
						$('#'+targ).trigger('stop.owl.autoplay', i);
						$('#'+targ).trigger('to.owl.carousel', i);
						T.parent().find('.kentha-elementor-multinav__controller .owl-item a').removeClass('current');
						t.addClass('current');
					});
				});
			} // if( 'init' === action ){
		},

		/**
		 * ====================================================================
		 * Glitch on text capions
		 * ====================================================================
		 */
		glitchText: {
			init: function( kenthaElementor ){
				var that = this;
				var glitchclass = kenthaElementor.fxActivationClass;
				that.items = $('[data-kentha-textfx="glitch"]');
				that.items.each(function(){
					var t = $(this);
					var text = t.html();
					var decor = t.find('.kentha-elementor-caption__decor');
					t.html('<span class="kentha-textfx-glitch__l0">'+text+'</span><span class="kentha-textfx-glitch__l1">'+text+'</span><span class="kentha-textfx-glitch__l2">'+text+'</span>');
					t.addClass(glitchclass);
					t.on('touchstart, mouseenter', function(){
						t.addClass(glitchclass);
					}).on('touchend, mouseleave', function(){
						t.removeClass(glitchclass);
					});
				});
				kenthaElementor.window.off('kenthaGlitchStart.kenthatextglitch')
					.off('kenthaGlitchStop.kenthatextglitch')
					.on('kenthaGlitchStart.kenthatextglitch', function(){
						that.items.addClass(glitchclass);
					}).on('kenthaGlitchStop.kenthatextglitch', function(){
						that.items.removeClass(glitchclass);
					});
			}
		},

		/**
		 * ====================================================================
		 * Glitch picture
		 * ====================================================================
		 */
		glitchPics: {
			init: function( kenthaElementor ){
				var that = this;
				var glitchclass = kenthaElementor.fxActivationClass;//'kentha-fx-on';
				that.items = $('[data-kentha-imgfx="glitch"]');
				that.items.each(function(){
					var t = $(this);
					var ti = t.find('img:first-child');
					var imgurl = ti.attr('src');
					t.append('<img src="'+ti.attr('src')+'" class="kentha-imgfx--glitch__f1">');
					t.append('<img src="'+ti.attr('src')+'" class="kentha-imgfx--glitch__f2">');
					if( t.data('kentha-fx-activation') === 'auto' ){
							t.addClass(glitchclass);
						}
					if( t.data('kentha-glitch-activation') == 'hover' ){
						t.on('touchstart, mouseenter', function(){
							t.addClass(glitchclass);
						}).on('touchend, mouseleave', function(){
							t.removeClass(glitchclass);
						});
					}
				});
				kenthaElementor.window.off('kenthaGlitchStart.kenthaimgglitch').off('kenthaGlitchStop.kenthaimgglitch');
				kenthaElementor.window.on('kenthaGlitchStart.kenthaimgglitch', function(){
					that.items.each(function(){
						var t = $(this);
						if( t.data('kentha-fx-activation') === 'auto' ){
							t.addClass(glitchclass);
						}
					});
				});
				kenthaElementor.window.on('kenthaGlitchStop.kenthaimgglitch', function(){
					that.items.removeClass(glitchclass);
				});
			}
		},

		/**
		 * ====================================================================
		 * Elementor section glitch effect
		 * transform background image into an inline image and glitch it
		 * ====================================================================
		 */
		kenthaSectionFx: function(){
			// Add a phisical image as background to apply the glitch
			$(".kentha-elementor-glitchsection").each(function(){
				var bg = $(this).css('background-image');
				if( bg && "none" !== bg ){
					bg = bg.replace('url(','').replace(')','').replace(/\"/gi, "");
					$(this).prepend('<div class="kentha-elementor-glitchsection__bg kentha-imgfx--glitch" data-kentha-imgfx="glitch" data-kentha-fx-activation="auto"><img src="'+bg+'"></div>');
				}
			});
		},

		/**
		 * ====================================================================
		 * Glitch particles
		 * ====================================================================
		 */
		glitchParticles: {
			quantity: 10,
			fxBoxes: [],
			items: [],
			animationInterval: false,
			init: function(kenthaElementor){
				var that = this;
				that.targets = $('.kentha-elementor-glitchsection');
				that.class = kenthaElementor.fxActivationClass;
				if( that.targets.length === 0 ){ return; }
				that.destroy(that); // always destroy first, or it can destroy the browser 
				that.create(that);
				kenthaElementor.window.off('kenthaGlitchStart.particles').off('kenthaGlitchStop.particles')
					.on('kenthaGlitchStart.particles', function(){ that.show(that); })
					.on('kenthaGlitchStop.particles', function(){ that.hide(that); });
			},
			create: function(that){
				that.targets.each(function(){
					var t = $(this);
					t.find('.kentha-elementor-glitchparticles').remove();
					t.find('[data-kentha-particles]').remove();
					t.append('<div data-kentha-particles class="kentha-elementor-glitchparticles"></div>');
					var layer = t.find('[data-kentha-particles]');
					for(var i = 0; i < that.quantity; i ++){
						t.find('[data-kentha-particles]').append('<hr>');
					}
					that.fxBoxes.push(layer);
				}).promise().done(function(){
					that.fxBoxes = $('[data-kentha-particles]');
					that.show(that); 
				})
			},
			show: function(that){
				that.fxBoxes.addClass(that.class);
				that.animation(that);
				that.animationInterval = setInterval(function(){ 
					that.animation(that);
				}, 200);
			},
			animation: function(that){
				if( that.fxBoxes.hasClass(that.class) ){
					var total = 0;
					that.fxBoxes.find('hr').each( function(){
						total++;
						$(this).css({
							'left': Math.floor(Math.random() * 90)+'%',
							'top': Math.floor(Math.random() * 100)+'%',
							'width':   8 + Math.floor( Math.random() * 20) +'px',
							'height': 3 +  Math.floor( Math.random() * 3) + 'px'
						});
					});
				}
			},
			hide: function(that){
				if( false !== that.animationInterval ){
					clearInterval(that.animationInterval);
				}
				that.fxBoxes.removeClass(that.class);
			},
			destroy: function(that){
				if('undefined' !== typeof(that.animateInterval) ){
					clearInterval(that.animateInterval);
				}
			}
		},

		/**
		 * ====================================================================
		 * Global glitch automation loop
		 * ====================================================================
		 */
		glitchLoop: {
			state: 0,
			newstate: 0,
			init: function( kenthaElementor ){
				var that = this;
				var arrogance = $('[data-kentha-glitch-arrogance]').data('kentha-glitch-arrogance');
				if( !arrogance ){
					arrogance = 15;
				}
				arrogance = 1 - ( arrogance / 100 );
				if( 'undefined' !== typeof( that.glitchInterval  ) ){
					clearInterval( that.glitchInterval );
				}
				that.glitchInterval = setInterval(
					function(){
						that.newstate = 0;
						if( Math.random() > arrogance){ // the hightr the limit it, the less it glitches. Chance or probability to glitch
							that.newstate = 1;
						}
						// act only if it changes
						if( that.newstate !== that.state ){
							that.state = that.newstate;
							if( that.state ){
								kenthaElementor.window.trigger('kenthaGlitchStart');
							}else {
								kenthaElementor.window.trigger('kenthaGlitchStop');
							}
						}
					}, 500
				);
			}
		}

	};

	/**====================================================================
	 *
	 *	Page Ready Trigger
	 * 	This needs to call only $.fn.qtInitTheme
	 * 
	 ====================================================================*/
	$(document).ready(function() {
		$.kenthaElementor.__init($.kenthaElementor);		
	});

})(jQuery);
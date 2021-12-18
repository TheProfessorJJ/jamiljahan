/* jshint unused:false */
/*globals snabbt */
( function( $ ) {
	var KenthaElementorSectionCaption = function( $scope, $ ) {
		if(!$('#qtBody').hasClass('elementor-editor-active')){
			return;
		}
		if(typeof( $.qtWebsiteObj ) !== 'object' ){
			console.log( 'Missing main theme script' );  
		}
		try {
			
			if('undefined' !== typeof(timeout) ){
				clearTimeout(timeout);					
			} else {
				var timeout = false;
			}
			timeout = setTimeout(
				function(){
					
					
					jQuery(".qt-txtfx:not(.qt-txtfxstart)").addClass("qt-txtfxstart");
					var styles = '';
				$('[data-kentha-customstyles]').each(function(i,c){
					styles = styles + $(c).data('kentha-customstyles');
				});
				$('#kentha-customstyles').remove();
				$('head').append('<style id="kentha-customstyles">'+styles+'<style>');
				// Also, fix viewport as if scalable will break performance and 3d
				$('[name="viewport"]').attr('content', 'width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0');
				},
				800
			);
		} catch(e) {
			console.log(e);
		}
	};
	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/kentha-elementor-section-caption.default', KenthaElementorSectionCaption );
	} );
} )( jQuery );
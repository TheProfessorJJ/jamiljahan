/**
 * @package QT Chartvote
 * Script for the Qantumthemes Love It plugin
 */


(function($) {
	"use strict";
	$.fn.qtChartvoteInit = function(){
		// var post_id, heart;
		$("body a.qt-chartvote-link").off("click");
		$("body a.qt-chartvote-link").on("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var t = $(this);

			var cookiename = 'voted-'+t.data('chartid')+'-'+t.data('position');
			$.ajax({
				type: "post",
				url: chartvote_ajax_var.url,
				cache: false,
				data: "action=track-vote&nonce="+chartvote_ajax_var.nonce+"&position="+t.data('position')+"&move="+t.data('move')+"&chartid="+t.data('chartid'),
				success: function(data){
					console.log($.cookie(cookiename));
					if( '1' !== $.cookie(cookiename)){
						var dataarr = jQuery.parseJSON(data);
						console.log('SUCCESS!');

						console.log(dataarr);
						t.parent().find(".qt-chartvote-number").html(dataarr.newvalue);
						$.cookie(cookiename, '1', { path: '/' }); // session cookie only
					} else {
						alert("You already voted for this track");
					}
				},
				error: function(e){
					console.log(e.Error);
				}
			});
		});
	};
	jQuery(document).ready(function() {
		$.fn.qtChartvoteInit();
	});
})(jQuery);
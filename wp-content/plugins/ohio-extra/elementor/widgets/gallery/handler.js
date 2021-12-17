jQuery( window ).on('elementor/frontend/init', () => {
    if (elementorFrontend.isEditMode()) {
        elementorFrontend.hooks.addAction('frontend/element_ready/ohio_gallery.default', ( $element ) => {
            jQuery(window).trigger('ohio:handle_bg_images');
            jQuery(window).trigger('ohio:handle_gallery');
            jQuery(window).trigger('ohio:handle_masonry');
        });
    }
});
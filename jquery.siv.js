/**
 * jquery.siv.js 0.0.1
 * Simple image viewer jQuery plugin.
 *
 * alexandre.kirillov@gmail.com
 * MIT license. http://opensource.org/licenses/MIT
 */
;(function ( $, window, document, undefined ) {
    "use strict";

    /**
     *
     * PLUGIN CORE
     *
     */
    var pluginName = "siv",
        defaults = {
            width: 0,
            height: 0,
            fadeInSpeed: 600,
            autoPlay: 0
        };

    // constructor
    function Plugin ( element, options ) {
        this.element   = element;
        this.$element  = $(this.element);
        this.settings  = $.extend( {}, defaults, this.$element.data(), options );
        this._defaults = defaults;
        this._name     = pluginName;
        // siv
        this.autoPlayTimer = -1;
        this.zIndex = 1;
        this.imgCount = 0;
        this.currentIndex = 0;
        this.$currentElement = null;
        this.$imageList = this.$element.find('.image-list');
        this.$images  = this.$imageList.find('li');
        this.$iconNav = this.$element.find('.icon-nav');
        this.$nextBtn = this.$element.find('.next-btn');
        this.$prevBtn = this.$element.find('.prev-btn');

        this.init();
    }

    Plugin.prototype = {
        init: function() {

            var _this = this,
                $imageList = this.$imageList,
                $images  = this.$images,
                $iconNav = this.$iconNav,
                $nextBtn = this.$nextBtn,
                $prevBtn = this.$prevBtn;

            this.imgCount = $images.length;

            // Set image list width & height
            $imageList.css({
                width : _this.settings.width,
                height: _this.settings.height
            });
            $nextBtn.height( _this.settings.height );
            $prevBtn.height( _this.settings.height );

            // create icon nav
            var tmpIconsList = [];
            for (var i = 0; i < this.imgCount; i++) {
                tmpIconsList.push( "<a href='#' class='icon-btn'></a>" );
            }

            $nextBtn.on('click', function(e){
                e.preventDefault();
                _this.next();
            });
            $prevBtn.on('click', function(e){
                e.preventDefault();
                _this.prev();
            });

            var $iconBtn = null;
            $iconNav
                .width($images.length * 20)
                .append("<div>"+ tmpIconsList.join('') +"</div>")
                .on('click', 'a', function(e){
                    e.preventDefault();

                    _this.autoPlay(true);

                    // update selected button
                    $iconNav.find('.selected').removeClass('selected');
                    $(this).addClass('selected');
                    // update image
                    _this.updateView( $iconBtn.index( $(this) ) );
                });
            $iconBtn = $iconNav.find('a');

            _this.$currentElement = $(_this.$images[_this.currentIndex]);
            $iconNav.find('a').eq(0).addClass('selected');

            _this.autoPlay();
        },
        //
        // auto play functionality
        //
        autoPlay: function( isReset ){
            var _this = this;
            if (typeof isReset === 'undefined') { isReset = false; }
            if (_this.settings.autoPlay !== 0) {

                if (_this.settings.autoPlayTimer !== -1) {
                    clearTimeout( _this.settings.autoPlayTimer );
                    _this.settings.autoPlayTimer = -1;
                }

                var autoPlayFunc = function(){
                    _this.next();
                    _this.settings.autoPlayTimer = setTimeout(autoPlayFunc, _this.settings.autoPlay);
                };
                _this.settings.autoPlayTimer = setTimeout(autoPlayFunc, _this.settings.autoPlay * (isReset ? 10 : 1));
            }
        },
        resume: function(){
            this.autoPlay();
        },
        stop: function(){
            if (this.settings.autoPlayTimer !== -1) {
                clearTimeout( this.settings.autoPlayTimer );
                this.settings.autoPlayTimer = -1;
            }
        },
        //
        // navigation functionality
        //
        next: function(){
            this.currentIndex++;
            if (this.imgCount <= this.currentIndex) {
                this.currentIndex = 0;
            }
            this.show( this.currentIndex );
        },
        prev: function(){
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.imgCount - 1;
            }
            this.show( this.currentIndex );
        },
        show: function( index ){
            this.$iconNav.find('a').eq( index ).trigger('click');
        },
        updateView: function( index ){
            var _this = this;
            _this.zIndex++;

            $(this.$images[index])
                .css({
                    'z-index': _this.zIndex,
                    'opacity': 0
                })
                .stop(true,true)
                .show()
                .animate({
                        'opacity': 1
                    },
                    _this.settings.fadeInSpeed,
                    function(){
                        _this.zIndex = 1;
                        _this.$currentElement.hide().css('z-index', '');
                        _this.$currentElement = $(_this.$images[index]).css({'opacity': '', 'zIndex': 1});
                    }
                );
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function(i) {
            if ( ! $.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
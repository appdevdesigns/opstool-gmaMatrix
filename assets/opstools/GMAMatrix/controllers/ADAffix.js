
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/ADAffix/ADAffix.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.ADAffix = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    scrollingObj:'window',
                    offset: 0
            }, options);
            this.options = options;

            // Call parent init
//            AD.classes.UIController.apply(this, arguments);

            this.scrollingObj = null;
            if (this.options.scrollingObj == 'window') {
                this.scrollingObj = $(window);
            } else {
                var listEl = $(this.options.scrollingObj);
                if (listEl.length>0) {
                    this.scrollingObj = $(listEl[0]);
                }
            }
            
            // if we found our scrolling Container then assign our handler
            if (this.scrollingObj) {

                // setup our on scroll() handler
                this.scrollingObj.on('scroll', function(){
                    self.checkPosition();
                });

                this.$element = $(this.element);

                this.unpin = 1;

                // perform initial position check
                this.checkPosition();


            } else {
                
                // else warn someone:
                console.error('ERROR: ADAffix.js: scrolling object not found ['+ this.options.scrollingObj+']');
            }



        },



        checkPosition: function () {

            if (!this.$element.is(':visible')) return

            var scrollHeight = this.scrollingObj.height()
              , scrollTop = this.scrollingObj.scrollTop()
              , posScrollObj = this.scrollingObj.offset()
              , position = this.$element.offset()
              , offset = this.options.offset
              , offsetBottom = offset.bottom
              , offsetTop = offset.top
              , reset = 'affix affix-top affix-bottom'
              , affix

            if (typeof offset != 'object') offsetBottom = offsetTop = offset
            if (typeof offsetTop == 'function') offsetTop = offset.top()
            if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

            // if we were affixed
            if ( this.affixed == false) {

                affix = false;
                
                // if we are < unpin pos
                if (scrollTop < this.unpin) {
                    
                    affix = 'top';

                }// end if

            } else { 

                // if the position of the element is < the position of scrollObj then affix-top
                if (posScrollObj.top + offsetTop > position.top) {
                    affix = false;
                    this.unpin = scrollTop;

                } else {
                    affix = 'top';
//                    this.unpin = null;
                }

            }// else if 
/*
            affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ?
              false    : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ?
              'bottom' : offsetTop != null && scrollTop <= offsetTop ?
              'top'    : false
*/
            if (this.affixed === affix) return

            this.affixed = affix
//            this.unpin = affix == 'bottom' ? position.top - scrollTop : null

            this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''))

        },


    });


});
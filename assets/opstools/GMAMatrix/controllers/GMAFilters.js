
steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.GMAFilters = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAFilters/GMAFilters.ejs',
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);

            this.initDOM();

			// listen for resize notifications
            AD.comm.hub.subscribe('gmamatrix.resize', function (key, data) {
				self.element.css("height", data.height + "px");
				
				self.element.find('.genlist-widget-inner').css("height", data.height+'px');

			    var mastheadHeight = self.element.find(".opsportal-widget-masthead").outerHeight(true);

				// for the purposes of displaying to the client, I pulled js code from /assets/js/GenericList.js to here to calculate correct height of list
				// I removed the subtraction of the value of 15 from the height...what is that value for? It was causing an extra space of 15px above the bottom button, so seems unnecessary
				//self.element.find('.hris-nav-list').css("height", (data.height - mastheadHeight -5-15- buttonHeight) + "px");
				//self.element.find('.opsportal-nav-list').css("height", (data.height - mastheadHeight -5 - buttonHeight) + "px");

				// now we apply a padding to our widget container so that the list drops below the masthead
				self.element.find(".genlist-widget-inner").css("padding-top", (mastheadHeight+5) + "px");

            });


        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));
            
			this.element.find(".opsportal-datepicker").datepicker();

        },
        
        
        show: function() {
            this.element.show();
        },
        hide: function() {
            this.element.hide();
        }


    });


});
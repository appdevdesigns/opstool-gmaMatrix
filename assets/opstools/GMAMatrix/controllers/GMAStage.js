
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/GMAStage-Entry.js',
        '//opstools/GMAMatrix/controllers/GMAStage-Layout.js',
        '//opstools/GMAMatrix/controllers/GMAStage-Dashboard.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.GMAStage = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAStage/GMAStage.ejs',
            }, options);

            // Call parent init
//            AD.classes.UIController.apply(this, arguments);
            
            
            this.initDOM();
            
            // Initialize the three panels
            var $layout = this.element.find('#gmamatrix-layout');
            var $entry = this.element.find('#gmamatrix-entry');
            var $dashboard = this.element.find('#gmamatrix-dashboard');
            this.panels = {
                '#layout': new AD.controllers.opstools.GMAMatrix.GMAStage_Layout($layout),
                '#entry': new AD.controllers.opstools.GMAMatrix.GMAStage_Entry($entry),
                '#dashboard': new AD.controllers.opstools.GMAMatrix.GMAStage_Dashboard($dashboard)
            };
            this.panels['#layout'].hide();
            this.panels['#entry'].hide();
            
            // Let parent controller know when layout has changed
            $layout.on('layout-changed', function(ev) {
                self.element.trigger('layout-changed');
                ev.preventDefault();
            });


            // listen for resize notifications
            AD.comm.hub.subscribe('gmamatrix.resize', function (key, data) {
                //self.element.css("height", data.height + "px");
				self.element.find(".opsportal-stage-container").css("height", data.height + "px");
            });


/*			$('[data-clampedwidth]').each(function () {
			    var elem = $(this);
			    var parentPanel = elem.data('clampedwidth');
			    var resizeFn = function () {
			        var sideBarNavWidth = $(parentPanel).width() - parseInt(elem.css('paddingLeft')) - parseInt(elem.css('paddingRight')) - parseInt(elem.css('marginLeft')) - parseInt(elem.css('marginRight')) - parseInt(elem.css('borderLeftWidth')) - parseInt(elem.css('borderRightWidth'));
			        elem.css('width', sideBarNavWidth);
			    };

			    resizeFn();
			    $(window).resize(resizeFn);
			});*/

            
        },



        initDOM: function () {
            this.element.html(can.view(this.options.templateDOM, {} ));
        },


        
        // Adds the measurements onto the page.
        //
        // @param array measurements
        //      An Array of GMAMeasurement objects
        loadMeasurements: function(measurements) {

            // Populate the Layout tab
            this.panels['#layout'].removeAll();
            for (var i=0; i<measurements.length; i++) {
                this.panels['#layout'].addMeasurement( measurements[i] );
            }
            
            // Populate the Entry tab
            this.panels['#entry'].removeAll();
            for (var i=0; i<measurements.length; i++) {
                this.panels['#entry'].addMeasurement( measurements[i] );
            }

        },
        
        
        // @param object allData
        //      Data for all the LMIs
        renderDashboard: function(allData) {
            this.panels['#dashboard'].render(allData);
        },


        
        // Collapse and expand the win/build/send rows
        // for all three sub panels.
		'.opsportal-filter-tag click': function($el, ev) {
			var rowKey = $el.attr('lmikey');
			
			// Find the matching LMI row, but only the one in the same panel
			var $row = $el.parents('.stage-panel').find(".row[lmirow='" + rowKey + "']");
			
			if ($el.hasClass('filter-on')) {
				$el.removeClass('filter-on')
				    .children('i')
				        .removeClass('fa-minus')
    				    .addClass('fa-plus');
				$row.slideUp(1000);
			} else {
				$el.addClass('filter-on')
				    .children('i')
				        .removeClass('fa-plus')
				        .addClass('fa-minus');
				$row.slideDown(1000);
			}
            
			ev.preventDefault();
		},



        // Handle switching tabs between Dashboard / Layout / Entry
        '#gmamatrix-stage-tabs ul li a click': function ($el, ev) {
            // toggle active tab state
            this.element.find('#gmamatrix-stage-tabs ul li a.active-btn').removeClass('active-btn');
            $el.addClass('active-btn');

            var target = $el.attr('href');
            
            // hide other panels
            this.element.find('.opsportal-stage-main').children().hide();
            for (var p in this.panels) {
                if (p != target) {
                    this.panels[p].hide();
                }
            }
            
            // show the selected panel
            this.panels[target].show();
            
            // tell parent controller
            this.element.trigger('panel-active', [target]);
            
            ev.preventDefault();
        }

    });


});
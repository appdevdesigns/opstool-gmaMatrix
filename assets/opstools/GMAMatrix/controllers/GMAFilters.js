
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
            
            // These will hold the GMAList widgets
            this.assignmentList = null;
            this.strategyList = null;
            
            // This will hold the widget DOM elements
            this.$widgets = {};

            this.values = {
                startDate: null,
                endDate: null,
                assignment: null,
                strategy: null
            };

            this.setupWidgets();

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
				//self.element.find(".genlist-widget-inner").css("padding-top", (mastheadHeight+5) + "px");

            });
            
        },



        initDOM: function () {
            this.element.html(can.view(this.options.templateDOM, {} ));
        },
        
        
        setupWidgets: function () {
            var self = this;
            
            // Find the DOM containers of the widgets
            this.$widgets = {
                'startDate': this.element.find("input[name='gmamatrix-start-date']"),
                'endDate': this.element.find("input[name='gmamatrix-end-date']"),
                'assignment': this.element.find('#gmamatrix-dashboard-assignment-list'),
                'strategy': this.element.find('#gmamatrix-dashboard-strategy-list')
            };
            
            // Init the assignment & strategy dropdown lists
            this.assignmentList = new AD.controllers.GMAList(this.$widgets['assignment'], {
                title: 'Team',
                description: 'Select the team assignment to view'
            });
            this.$widgets['assignment'].on('item-selected', function(event, data) {
                self.values.assignment = data.model;
                self.evaluate();
                self.element.trigger('assignment-selected', data);
                event.preventDefault();
            });

            this.strategyList = new AD.controllers.GMAList(this.$widgets['strategy'], {
                title: 'Strategy',
                description: 'Selecting the strategy will render the dashboard'
            });
            this.$widgets['strategy'].on('item-selected', function(event, data) {
                self.values.strategy = data.model;
                self.evaluate();
                self.element.trigger('strategy-selected', data);
                event.preventDefault();
            });
            
            // NOTE: the datepicker here is not from jQueryUI.
            // http://bootstrap-datepicker.readthedocs.org/
            
            // Init the start and end dates
            self.$widgets['startDate']
                .datepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                })
                .on('change', function() {
                    self.values.startDate = $(this).val();
                    self.evaluate();
                });
            self.$widgets['endDate']
                .datepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true
                })
                .on('change', function() {
                    self.values.endDate = $(this).val();
                    self.evaluate();
                });
        
        },
        
        
        // @param array data
        //    An Array of GMAAssignment objects
        loadAssignments: function(data) {
            this.assignmentList.data(data);
        },
        
        
        // @param array data
        //     An Array of strategy names (string)
        loadStrategies: function(data) {
            this.strategyList.data(data)
        },
        
        
        // Set the range of dates that can be selected.
        //
        // @param Date startDate
        // @param Date endDate
        setDateRange: function(startDate, endDate) {
            this.$widgets['startDate'].datepicker('setStartDate',  startDate);
            this.$widgets['startDate'].datepicker('setEndDate',  endDate);

            this.$widgets['endDate'].datepicker('setStartDate',  startDate);
            this.$widgets['endDate'].datepicker('setEndDate',  endDate);
        },
        
        
        setSelectedAssignment: function(id) {
            this.assignmentList.setCurrentItemByID(id);
        },
        
        
        setSelectedStrategy: function(id) {
            this.strategyList.setCurrentItemByID(id);
        },
        
        
        // Check the currently selected values and notify the parent controller
        // if all fields are set.
        evaluate: function() {
            var isReady = true;
            for (var v in this.values) {
                if (!this.values[v]) {
                    isReady = false;
                }
            }
            
            if (isReady) {
                // jQuery event
                this.element.trigger('updated');
            }
        },
        
        
        show: function() {
            this.element.show();
        },

        hide: function() {
            this.element.hide();
        }


    });


});
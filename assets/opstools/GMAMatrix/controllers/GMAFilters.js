
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/views/GMAFilters/GMAFilters.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    // if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    // if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    // AD.controllers.opstools.GMAMatrix.GMAFilters = AD.classes.UIController.extend({
    AD.Control.extend('opstools.GMAMatrix.GMAFilters', {


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAFilters/GMAFilters.ejs'
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
            this.element.find('[translate]').each(function(){
                $(this).removeAttr('translate');
                AD.controllers.Label.keylessCreate($(this));
            });
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
                self.element.trigger('assignment-selected', data);
                self.setProgress('start-date');
                event.preventDefault();
            });

            this.strategyList = new AD.controllers.GMAList(this.$widgets['strategy'], {
                title: 'Strategy',
                description: 'Selecting the strategy will render the dashboard'
            });
            this.$widgets['strategy'].on('item-selected', function(event, data) {
                self.values.strategy = data.model;
                self.element.trigger('strategy-selected', data);
                event.preventDefault();
            });
            
            // NOTE: the datepicker here is not from jQueryUI.
            // http://bootstrap-datepicker.readthedocs.org/
            
            // Init the start and end dates
            self.$widgets['startDate']
                .datepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true
                })
                .on('change', function() {
                    self.values.startDate = $(this).val();
                    self.setProgress('end-date');
                    self.checkDates();
                });
            self.$widgets['endDate']
                .datepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true
                })
                .on('change', function() {
                    self.values.endDate = $(this).val();
                    self.checkDates();
                });
                
            self.setProgress('none');
        },
        
        
        // Hide/reveal parts of the filters sidebar depending on which step
        // of the selection process the user is currently at.
        //
        // @param string step
        //    Can be one of the following:
        //      "none"
        //      "team"
        //      "start-date"
        //      "end-date"
        //      "strategy"
        setProgress: function(step) {
            switch (step) {
                default:
                case 'none':
                    this.$widgets['assignment'].hide();
                    this.element.find('#gmamatrix-dashboard-dates').hide();
                    this.$widgets['strategy'].hide();
                    break;
                
                case 'team':
                    this.$widgets['assignment'].show();
                    this.element.find('#gmamatrix-dashboard-dates').hide();
                    this.$widgets['strategy'].hide();
                    break;
                
                case 'start-date':
                    this.$widgets['assignment'].show();
                    this.element.find('#gmamatrix-dashboard-dates').show();
                    this.$widgets['endDate'].attr('disabled', 1);
                    this.$widgets['strategy'].hide();
                    break;
                
                case 'end-date':
                    this.$widgets['assignment'].show();
                    this.element.find('#gmamatrix-dashboard-dates').show();
                    this.$widgets['endDate'].removeAttr('disabled');
                    this.$widgets['strategy'].hide();
                    break;
                
                case 'strategy':
                    this.$widgets['assignment'].show();
                    this.element.find('#gmamatrix-dashboard-dates').show();
                    this.$widgets['endDate'].removeAttr('disabled');
                    this.$widgets['strategy'].show();
                    break;
            }
        },
        
        
        // Populate the assignments list.
        //
        // @param array data
        //    An Array of GMAAssignment objects
        loadAssignments: function(data) {
            this.assignmentList.data(data);
            this.setProgress('team');
        },
        
        

        // Populate the strategies list.
        //
        // @param object data
        //     {
        //          <strategyID>: <strategyName>,
        //          ...
        //      }
        loadStrategies: function(data) {
            data[-1] = 'All';
            this.strategyList.data(data)
            this.setProgress('strategy');
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
        
        
        
        checkDates: function() {
            if (this.values.assignment && this.values.startDate && this.values.endDate) {
                var startDate = new Date(this.values.startDate);
                var endDate = new Date(this.values.endDate);
                
                if (!startDate.getTime()) {
                    alert('Start date is not valid');
                }
                else if (!endDate.getTime()) {
                    alert('End date is not valid');
                }
                else if (startDate > endDate) {
                    alert('The start date must be earlier than the end date');
                }
                else {
                    var valueString = this.values.assignment.getID() + ' '
                        + this.values.startDate + ' '
                        + this.values.endDate;
                    
                    // Only do this if something has changed since the last
                    // time we checked.
                    if (this.oldValueString != valueString) {
                        // Tell the parent controller
                        this.element.trigger('dates-chosen', [
                            // assignment nodeID
                            this.values.assignment.getID(),
                            // raw text dates
                            this.values.startDate,
                            this.values.endDate
                        ]);
                    }
                    
                    this.oldValueString = valueString;
                }
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

steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/Measurement.js',
        '//opstools/GMAMatrix/controllers/LayoutMeasurement.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/NotPlacedList.js',
        '//opstools/GMAMatrix/controllers/ADAffix.js',
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


            // keep track of the currently selected reports and
            // strategies in order to know what to display.
            this.report = null;
            this.strategy = null;


            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  */ };

            this.initDOM();
            
            // Initialize the three panels
            this.panels = {
                '#layout': new AD.controllers.opstools.GMAMatrix.GMAStage_Layout(this.element.find('#gmamatrix-layout')),
                '#entry': new AD.controllers.opstools.GMAMatrix.GMAStage_Entry(this.element.find('#gmamatrix-entry')),
                '#dashboard': new AD.controllers.opstools.GMAMatrix.GMAStage_Dashboard(this.element.find('#gmamatrix-dashboard'))
            };

            this.loadLMI();

            this.listAffix = null;

			
//            this.setupComponents();

            // listen for resize notifications
            AD.comm.hub.subscribe('gmamatrix.resize', function (key, data) {
                self.element.css("height", data.height + "px");

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

            

            //// Respond to the user selecting things on the sidebar
            
            AD.comm.hub.subscribe('gmamatrix.assignment.selected', function(key, data){
                self.selectedAssignment(data.model);
            });

            AD.comm.hub.subscribe('gmamatrix.report.selected', function(key, data){
                self.selectedReport(data.model);
            });

            AD.comm.hub.subscribe('gmamatrix.strategy.selected', function(key, data){
                self.selectedStrategy(data.model);
            });
        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

            // for testing purposes:
            // trying to work out bootstrap.affix()
            this.notPlacedList = new AD.controllers.opstools.GMAMatrix.ADAffix(this.element.find('#gmamatrix-affix'), {
                scrollingObj:'.gmamatrix-stage',     // jquery selector of obj on page that will fire the scroll() event
                offset:10
            });

        },


        
        // not used
        loadLMI: function() {
            var self = this;

            this.lmiDefsLoaded = AD.classes.gmamatrix.GMALMIDefinition.definitions()
            .then(function(list){

                for (var l=0; l<list.length; l++) {
                    var definition = list[l];

                    // get it's placement
                    var placement = definition.placement();

                    // get the lmi location key
                    var key = definition.key();

                    var $lmiContainer = self.element.find(".lmi-box[lmikey='" + key + "']");
                    
                    self.lmiDefs[key] = new AD.controllers.opstools.GMAMatrix
                    .LMIDefinition($lmiContainer, { definition: definition } );
                    //.LMIDefinition(self.element.find('.'+tag), { definition: definition } );
                }

            })
            .fail(function(err){
                console.error('problem loading LMI definitions:');
                console.log(err);
            });
        },


        // Adds the measurements onto the page.
        // This should happen after the user has selected a strategy.
        loadMeasurements: function() {

            if (this.strategy) {
                
                var strategyID = this.strategy.getID();
                
                // if our strategy exists in our measurements
                if (this.measurements[strategyID]) {

                    var measurements = this.measurements[strategyID];
                    
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
                    
                } else {

                    console.error('selected strategy ['+this.strategy+'] not in our measurements');
                    console.log(this.measurements);

                }// end if

            }
        },


        
        // User has selected an assignment from the sidebar
        selectedAssignment: function(assignment) {
            // a new Assignment was selected, so reset our report/strategy
            this.report = null;
//            this.strategy = null;  // let's keep strategy and reuse

            // a new assignment was selected, so notify any existing
            // Measurements to remove themselves:
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});

        },


        /**
         * When a report is selected, we parse it to find out what strategies
         * are represented in it. This will allow the strategies list to
         * be updated.
         */
        selectedReport: function(report) {
            var self = this;

            // if this is a new report
            //  or it has changed
            if ((this.report == null)
                || (this.report != report)) {

                // store the selected report
                this.report = report;

                // a new report was selected, so notify any existing
                // Measurements to remove themselves:
                AD.comm.hub.publish('gmamatrix.measurements.clear', {});
                
                // We are going to load from the server
                can.trigger(self, 'busy');
                
                // we load the measurements and placement values
                async.series([

                    function(next){
                        report.measurements()
                        .fail(console.log)
                        .done(function(measurements){
                            self.measurements = measurements;
                            next();
                        });
                    },
                    
                    function(next){
                        report.placements()
                        .fail(console.log)
                        .done(function(placements){
                            self.placements = placements;
                            next();
                        });
                    },
                    
                    function(){
                        // compile the strategies for the measurements on this report
                        // post a 'gmamatrix.strategies.loaded' notification
                        var strategies = [];
                        for (var s in self.measurements){
                            strategies.push(s);
                        }
                        
                        // Done loading from server
                        can.trigger(self, 'idle');
                        
                        // This will go to the StrategyList on the sidebar
                        AD.comm.hub.publish('gmamatrix.strategies.loaded', {strategies:strategies});
                    }
                    
                ]);

            } // end if

        },



        selectedStrategy: function(strategy) {

            // if this is a new strategy
            //      or this is not the currently selected strat
            if ((this.strategy == null)
                || (this.strategy != strategy)) {

                this.strategy = strategy;       // each report has a strategy

                // a new strategy was selected, so notify any existing
                // Measurements to remove themselves:
                AD.comm.hub.publish('gmamatrix.measurements.clear', {});


                // by this point, we should already have measurements
                // and placements loaded, so now show the Measurements
                this.loadMeasurements();

            }

        },


        // not used
        setupComponents: function() {

            this.stageLoading = this.element.find('.gmamatrix-stage-loading');
            this.stageLoading.hide();

            this.stageInstructions = this.element.find('.gmamatrix-stage-instructions');

            this.stageReport = this.element.find('.gmamatrix-stage-report');

        },


        // Handle switching tabs between Layout / Entry
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
            
            ev.preventDefault();
        }

    });


});
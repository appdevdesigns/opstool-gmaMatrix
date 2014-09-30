
steal(
        // List your Controller's dependencies here:
        'appdev',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/GMAStage.js',
		'//opstools/GMAMatrix/controllers/GMAFilters.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.Tool = AD.classes.opsportal.OpsTool.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAMatrix/GMAMatrix.ejs',
                    resize_notification: 'gmamatrix.resize'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.opsportal.OpsTool.prototype.init.apply(this, arguments);
            
            this.measurements = null;
            this.placements = null;
            
            this.initDOM();
            this.setupPage();

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
        },



        setupPage: function() {
            var self = this;
            self.controls = {
                // Sidebar list widgets for Entry / Layout panels
                assignment: new AD.controllers.opstools.GMAMatrix.AssignmentList(
                    this.element.find('.gmamatrix-assignment-chooser')
                ),
                strategy: new AD.controllers.opstools.GMAMatrix.StrategyList(
                    this.element.find('.gmamatrix-strategy-chooser')
                ),
                report: new AD.controllers.opstools.GMAMatrix.ReportList(
                    this.element.find('.gmamatrix-report-chooser')
                ),
                
                // Sidebar filters for Dashboard panel
    			filters: new AD.controllers.opstools.GMAMatrix.GMAFilters(this.element.find('.gmamatrix-filters')),
                
                // Attach the GMA Stage
                stage: new AD.controllers.opstools.GMAMatrix.GMAStage(this.element.find('.gmamatrix-stage'))
            };
            
            
            // Toggle the sidebar depending on which Stage panel is active
            // self.controls.stage.on('panel-active', function...
            can.bind.call(self.controls.stage, 'panel-active', function(ev, panelKey){
                if (panelKey == '#dashboard') {
                    self.controls.filters.show();

                    self.controls.assignment.hide();
                    self.controls.strategy.hide();
                    self.controls.report.hide();
                } else {
                    self.controls.filters.hide();

                    self.controls.assignment.show();
                    self.controls.strategy.show();
                    self.controls.report.show();
                }
            });
            
            
            // Set up busy indicator to respond to all child controllers
            this.busyIndicator = new AD.widgets.ad_icon_busy(this.element.find('.busy-indicator'), {
                style:'circle',
                color:'grey'
            });
            this.busyIndicator.show();
            for (var i in self.controls) {
                // self.controls[i].on('busy', function...
                can.bind.call(self.controls[i], 'busy', function(){
                    self.busyIndicator.show();
                });
                can.bind.call(self.controls[i], 'idle', function(){
                    self.busyIndicator.hide();
                });
            }

        },
        

        // User has selected an assignment from the sidebar
        selectedAssignment: function(assignment) {
            // a new assignment was selected, so notify any existing
            // Measurements to remove themselves:
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});
        },


         // When a report is selected, parse it to find out what strategies
         // are represented in it. This will allow the strategies list to
         // be updated.
        selectedReport: function(report) {
            var self = this;

            // a new report was selected, so notify any existing
            // Measurements to remove themselves:
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});
            
            // We are going to load from the server
            self.busyIndicator.show();
            
            // load the measurements and placement values
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
                
                function(next){
                    // compile the strategies for the measurements on this report
                    // post a 'gmamatrix.strategies.loaded' notification
                    var strategies = [];
                    for (var s in self.measurements){
                        strategies.push(s);
                    }
                    
                    // This will go to the StrategyList on the sidebar
                    AD.comm.hub.publish('gmamatrix.strategies.loaded', {strategies:strategies});
                    next();
                }
                
            ], function(err) {
            
                // Done loading from server
                self.busyIndicator.hide();
            
            });
        },
        
        
        // Respond to a strategy being selected on the sidebar
        // @param GMAStrategy strategy
        selectedStrategy: function(strategy) {
            
            // notify any existing Measurement widgets to remove themselves
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});
            
            var strategyID = strategy.getID();
            var measurements = this.measurements[strategyID];
            
            // by this point, we should already have measurements
            // and placements loaded, so now show the Measurements
            this.controls.stage.loadMeasurements(measurements);
            
        }
        
    
    });


});
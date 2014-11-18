
steal(
        // List your Controller's dependencies here:
        'appdev',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/GMAStage.js',
		'//opstools/GMAMatrix/controllers/GMAFilters.js',
		'//opstools/GMAMatrix/classes/GMAGraphData.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.Tool = AD.classes.opsportal.OpsTool.extend({
        
        // return a more readable date string than what is provided from GMA.
        formatDate: function(ymd) {
            return ymd.substr(0, 4) + '-'
                 + ymd.substr(4, 2) + '-'
                 + ymd.substr(6, 2);
        },
        
        // parse a "yyyymmdd" date string into a Date object
        parseYMD: function(ymd) {
            return new Date(this.formatDate(ymd));
        }
    
    }, {

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
            this.strategy = null;
            
            this.initDOM();
            this.setupPage();
            this.loadAssignments();

            // Respond to the user selecting things on the Entry/Layout  sidebar
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
            var $stage = this.element.find('.gmamatrix-stage');
            var $filters = this.element.find('.gmamatrix-filters');
            
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
    			filters: new AD.controllers.opstools.GMAMatrix.GMAFilters($filters),
                
                // Attach the GMA Stage
                stage: new AD.controllers.opstools.GMAMatrix.GMAStage($stage)
            };
            
            
            // Toggle the sidebar depending on which Stage panel is active
            $stage.on('panel-active', function(ev, panelKey){
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
            
            // Reload the measurements when layout gets changed
            $stage.on('layout-changed', function(){
                self.selectedStrategy(self.strategy);
            });
            
            // Respond to assignments being selected from the Dashboard sidebar
            $filters.on('assignment-selected', function(ev, data) {
                self.selectedAssignment(data.model);
            });
            
            // Respond to Dashboard dates being chosen
            $filters.on('dates-chosen', function(ev, assignmentID, startDate, endDate) {
                self.loadDashboardData(assignmentID, startDate, endDate);
            });
            
            // Respond to Dashboard strategy being chosen
            $filters.on('strategy-selected', function(ev, data) {
                var strategyID = data.model.getID();
                self.renderDashboardGraphs(strategyID);
            });
            
            // Set up busy indicator to respond to all child controllers
            this.busyIndicator = new AD.widgets.ad_icon_busy(this.element.find('.busy-indicator'), {
                style:'circle',
                color:'grey'
            });
            for (var i in self.controls) {
                self.controls[i].element.on('busy', function(){
                    self.busyIndicator.show();
                });
                self.controls[i].element.on('idle', function(){
                    self.busyIndicator.hide();
                });
            }

        },
        
        
        // Load the user's GMA assignments from the server, and send the
        // results to the sidebars.
        loadAssignments: function() {
            var self = this;
            
            self.busyIndicator.show();
            AD.classes.gmamatrix.GMAAssignment.assignments()
            .done(function(list){
                if (list.length == 0) {
                    self.controls.stage.alert('No GMA assignments found', 'warning');
                }
                // Tell the Entry/Layout sidebar
                self.controls.assignment.setData(list);
                // Tell the Dashboard sidebar
                self.controls.filters.loadAssignments(list);
            })
            .fail(function(err){
                console.error(err);
                alert('Unable to load GMA assignments');
            })
            .always(function(){
                self.busyIndicator.hide();
            });
        },
        
        
        
        // User has selected an assignment from the sidebar
        selectedAssignment: function(assignment) {
            var self = this;
            // a new assignment was selected, so notify any existing
            // Measurements to remove themselves:
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});
            
            // Synchronize the selection on Entry/Layout & Dashboard sidebars
            self.controls.assignment.setSelectedItem(assignment.getID());
            self.controls.filters.setSelectedAssignment(assignment.getID());
            
            self.busyIndicator.show();
            
            assignment.reports()
            .done(function(list){
                // Tell the Entry/Layout sidebar
                self.controls.report.data(list);

                // Determine the start and end dates that bracket all the reports
                var minStartDate, maxEndDate;
                for (var i=0; i<list.length; i++) {
                    var startDate = self.constructor.parseYMD(list[i].startDate);
                    var endDate = self.constructor.parseYMD(list[i].endDate);
                    if (!minStartDate || startDate < minStartDate) {
                        minStartDate = startDate;
                    }
                    if (!maxEndDate || endDate > maxEndDate) {
                        maxEndDate = endDate;
                    }
                }
                // Tell the Dashboard sidebar
                self.controls.filters.setDateRange(minStartDate, maxEndDate);
            })
            .fail(function(err){
                console.error('Error retrieving reports from ');
                console.log(assignment);
            })
            .always(function(){
                self.busyIndicator.hide();
            });
            
            
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
        
        
        // Respond to a strategy being selected on the Entry/Layout sidebar
        //
        // @param GMAStrategy strategy
        selectedStrategy: function(strategy) {
            // Save the strategy in case we need to reload after layout
            // changes are made.
            this.strategy = strategy;
            
            // Notify any existing Measurement widgets to remove themselves
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});
            
            var strategyID = strategy.getID();
            var measurements = this.measurements[strategyID];
            
            // By this point, we should already have measurements
            // and placements loaded, so now show the Measurements
            this.controls.stage.loadMeasurements(measurements);
            
        },
        
        
        // @param int assignmentID
        // @param string startDate yyyy-mm-dd
        // @param string endDate yyyy-mm-dd
        loadDashboardData: function(assignmentID, startDate, endDate) {
            var strategies = [];
            var self = this;
            
            this.busyIndicator.show();
            
            // Clear any old graph data
            this.graphData = null;
            
            var graphData = new AD.classes.gmamatrix.GMAGraphData({
                nodeId: assignmentID, 
                startDate: startDate.replace(/-/g, ''), 
                endDate: endDate.replace(/-/g, '')
            });
            
            graphData.dataReady
            .fail(function(err){
                alert(err.message);
            })
            .done(function(){
                var strategies = graphData.strategies();
                // graph data is now ready
                self.graphData = graphData;
                // set the Dashboard filters strategy list
                self.controls.filters.loadStrategies(strategies);
            })
            .always(function(){
                self.busyIndicator.hide();
            });
            
        },
        
        
        renderDashboardGraphs: function(strategyID) {
            var data = this.graphData.dataForStrategy(strategyID);
            this.controls.stage.renderDashboard(data);
        }
        
    
    });


});
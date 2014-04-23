
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/Measurement.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/NotPlacedList.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/GMAStage/GMAStage.ejs',
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
            AD.classes.UIController.apply(this, arguments);


            // keep track of the currently selected reports and
            // strategies in order to know what to display.
            this.report = null;
            this.strategy = null;


            this.locations = null;
            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  */ };

            this.initDOM();
            this.loadLMI();


            this.setupComponents();


            // listen for resize notifications
            AD.comm.hub.subscribe('gmamatrix.resize', function (key, data) {
                self.element.css("height", data.height + "px");
            });


            AD.comm.hub.subscribe('gmamatrix.assignment.selected', function(key, data){
                self.selectedAssignment(data.model);
            });


            AD.comm.hub.subscribe('gmamatrix.report.selected', function(key, data){
                self.selectedReport(data.report);
            });


            AD.comm.hub.subscribe('gmamatrix.strategy.selected', function(key, data){
                self.selectedStrategy(data.strategy);
            });
        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

            this.reportList = new AD.controllers.opstools.GMAMatrix.ReportList(this.element.find('.gmamatrix-report-reportlist'));
            this.strategyList = new AD.controllers.opstools.GMAMatrix.StrategyList(this.element.find('.gmamatrix-report-strategylist'));

            this.locations = this.element.find('.gmamatrix-measurement-location');
//            this.locations.droppable({disable:true});

            this.notPlacedList = new AD.controllers.opstools.GMAMatrix.NotPlacedList(this.element.find('.gmamatrix-stage-notplaced'));
        },



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

                    // append a new definition to the Win-Build-Send chart
                    var tag = 'gmamatrix-stage-lmi-'+key;
                    var div = $('<div class="'+tag+'" ></div>');
                    self.element.find('#'+placement).append(div);
                    self.lmiDefs[key] = new AD.controllers.opstools.GMAMatrix
                    .LMIDefinition(self.element.find('.'+tag), { definition: definition } );
                }

            })
            .fail(function(err){
                console.error('problem loading LMI definitions:');
                console.log(err);
            });
        },



        loadMeasurements: function() {
            if (this.strategy) {


                // if our strategy exists in our measurements
                if (this.measurements[this.strategy.id]) {

                    // if there are any measurements that don't have any
                    // placements?
                    var noPlacements = this.report.measurementsWithoutPlacements(this.strategy.id);
                    if (noPlacements.length > 0) {

                        // oops ... well switch to placement mode:

                        // areas droppable
                        this.locations.enable();

                        // list noPlacements in column
                        AD.comm.hub.publish('gmamatrix.noplacements.list', {list:noPlacements});

                    } else {


                        // ok, we are ready to show em:
                        var measurements = this.measurements[this.strategy.id];
                        // for each measurement
                        for (var i=0; i<measurements.length; i++) {

                            var measurement = measurements[i];

                            // get it's placement
                            var placement = measurement.placement();

                            // get the location
                            var location = placement.location();


                            //// NOTE: location is the key of the LMIDefinition this should be
                            ////       attached to.
                            if (this.lmiDefs[location]) {
                                this.lmiDefs[location].addMeasurement(measurement);
                            } else {

                                // found a measurement that didn't match an LMI location
                                // add to not-placed


                            }
/*
                            // append a new Measurement to the location
                            var tag = 'gmamatrix-measurement-div-'+measurement.getID();
                            var div = $('<div class="'+tag+'" ></div>');
                            this.element.find('#'+location).append(div);
                            new AD.controllers.opstools.GMAMatrix
                            .Measurement(this.element.find('.'+tag), { measurement: measurement} );
*/

                        }// next

                    }

                } else {

                    console.error('selected strategy ['+this.strategy+'] not in our measurements');
                    console.log(this.measurements);

                }// end if

            }
        },



        selectedAssignment: function(assignment) {
//            var self = this;

            this.stageInstructions.hide();
//            this.stageReport.hide();
            this.stageLoading.show();

            // a new Assignment was selected, so reset our report/strategy
            this.report = null;
//            this.strategy = null;  // let's keep strategy and reuse


            // a new assignment was selected, so notify any existing
            // Measurements to remove themselves:
            AD.comm.hub.publish('gmamatrix.measurements.clear', {});


        },



        selectedReport: function(report) {
            var self = this;

            this.stageInstructions.hide();
            this.stageReport.show();
//            this.stageLoading.show();

            // if this is a new report
            //  or it has changed
            if ((this.report == null)
                || (this.report != report)) {

                // store the selected report
                this.report = report;

                // a new report was selected, so notify any existing
                // Measurements to remove themselves:
                AD.comm.hub.publish('gmamatrix.measurements.clear', {});

                // we load the measurements and placement values
                var measurementsLoaded = report.measurements();
                var placementsLoaded = report.placements();
                // note: be sure the lmiDefs are already loaded as well:
                $.when(this.lmiDefsLoaded, measurementsLoaded, placementsLoaded)
                .then(function(lmiData, measurements, placements){

                    self.measurements = measurements;
                    self.placements = placements;

                    // compile the strategies for the measurements on this report
                    // post a 'gmamatrix.strategies.loaded' notification
                    var strategies = [];
                    for (var s in measurements){
                        strategies.push(s);
                    }

                    AD.comm.hub.publish('gmamatrix.strategies.loaded', {strategies:strategies});


    /*                // if a strategy was previously selected
                    if (self.strategy) {

                       self.loadMeasurements();

                    }
    */
                })
                .fail(function(err){
                    console.error(err);
                });


            } // end if

        },



        selectedStrategy: function(strategy) {

            this.stageInstructions.hide();
            this.stageReport.show();
            this.stageLoading.hide();

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



        setupComponents: function() {

            this.stageLoading = this.element.find('.gmamatrix-stage-loading');
            this.stageLoading.hide();

            this.stageInstructions = this.element.find('.gmamatrix-stage-instructions');

            this.stageReport = this.element.find('.gmamatrix-stage-report');
//            this.stageReport.hide();

            // Start by displaying the datepicker for the user to choose which
            // time period the GMA reports will be selected from.
/*
            var $date = this.element.find('#reports-date');
            $date.kendoDatePicker({
                format: "yyyy-MM-dd",
                change: function(e) {
                    var widget = $date.data('kendoDatePicker');

                    // Don't allow the date to be changed again
                    widget.enable(false);
                    widget.close();

                    // Get value and convert to a Ymd string
                    var dateObj = widget.value();
                    var selectedDate = dateObj.getFullYear()
                        + String(dateObj.getMonth()+1).replace(/^(.)$/, '0$1')
                        + String(dateObj.getDate()).replace(/^(.)$/, '0$1');

                    //doFetchReportList(selectedDate);

                    AD.comm.hub.publish('gmamatrix.date.selected', { date: selectedDate });

                }
            });
*/
        }





    });


});
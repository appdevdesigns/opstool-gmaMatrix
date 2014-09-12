
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
//            AD.classes.UIController.apply(this, arguments);


            // keep track of the currently selected reports and
            // strategies in order to know what to display.
//            this.report = null;
//            this.strategy = null;


            this.locations = null;
            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  */ };

            this.initDOM();
            this.loadLMI();

            this.listAffix = null;

            $(window).scroll(function(){
                console.log('!! window.scroll() !!');
            });

			this.element.find('.tt').tooltip(options);

			
			//var wijmodata = [33, 11, 15, 26, 16, 27, 37, -13, 8, -8, -3, 17, 0, 22, -13, -29, 19, 8];
			//this.element.find('#chartDiv').wijsparkline({ data: wijmodata });
			var data = [{ month: "January", score: 73 }, { month: "February", score: 95 }, { month: "March", score: 89 },
			            { month: "April", score: 66 }, { month: "May", score: 50 }, { month: "June", score: 65 },
			            { month: "July", score: 70 }, { month: "August", score: 43 }, { month: "September", score: 65 },
			            { month: "October", score: 27 }, { month: "November", score: 77 }, { month: "December", score: 58 }];
			this.element.find(".gmaSparkline").wijsparkline({
				data: data,
				bind: "score",
				tooltipContent: function(){
	                return this.month + ': ' +  this.score;
	            },
		        type: "area",
				seriesStyles: [
				            {
				                //fill: "#4381B8",
				 				//stroke: "#4381B8"
								fill: "#999999",
				 				stroke: "#333333"
				            }
				        ]
		    });
					
			// See https://github.com/minddust/bootstrap-progressbar for docs
			this.element.find('.progress .progress-bar').progressbar({
				use_percentage: false,
				display_text: 'fill',
				amount_format: function(amount_part, amount_total) { return amount_part + ' / ' + amount_total; }
			});
			
//            this.setupComponents();

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
			
//            this.reportList = new AD.controllers.opstools.GMAMatrix.ReportList(this.element.find('.gmamatrix-report-reportlist'));
//            this.strategyList = new AD.controllers.opstools.GMAMatrix.StrategyList(this.element.find('.gmamatrix-report-strategylist'));

//            this.locations = this.element.find('.gmamatrix-measurement-location');
//            this.locations.droppable({disable:true});

//            this.notPlacedList = new AD.controllers.opstools.GMAMatrix.NotPlacedList(this.element.find('.gmamatrix-stage-notplaced'));
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
                    /*
                    var tag = 'gmamatrix-stage-lmi-'+key;
                    var div = $('<div class="'+tag+'" ></div>');
                    self.element.find('#'+placement).append(div);
                    */
                    
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


        // Adds the measurements onto the page
        loadMeasurements: function() {

            if (this.strategy) {
                
                var strategyID = this.strategy.getID();
                
                // if our strategy exists in our measurements
                if (this.measurements[strategyID]) {

                    // Populate the layout tab
                    var measurements = this.measurements[strategyID];
                    for (var i=0; i<measurements.length; i++) {
                        new AD.controllers.opstools.GMAMatrix.LayoutMeasurement(null, {
                            'measurement': measurements[i]
                        });
                    }

                    // if there are any measurements that don't have any
                    // placements?
                    var noPlacements = this.report.measurementsWithoutPlacements(strategyID);
                    if (noPlacements.length > 0) {

                        // oops ... well switch to placement mode:

                        // areas droppable
                        this.locations.enable();

                        // list noPlacements in column
                        AD.comm.hub.publish('gmamatrix.noplacements.list', {list:noPlacements});

                    } else {


                        // ok, we are ready to show em:
                        var measurements = this.measurements[strategyID];
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

//            this.stageInstructions.hide();
//            this.stageReport.hide();
//            this.stageLoading.show();

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

            //this.stageInstructions.hide();
            //this.stageReport.show();
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

            //this.stageInstructions.hide();
            //this.stageReport.show();
            //this.stageLoading.hide();

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

        },

		'.opsportal-filter-tag click':function($el, ev) {
			var self = this,
				myFilter = self.element.find($el).data('hris-filter');
			
			if (self.element.find($el).hasClass('filter-on')) {
				self.element.find($el).removeClass('filter-on').children('i').removeClass('fa-minus').addClass('fa-plus');
				
				//$('#'+myFilter).hide(2000);
				$('#'+myFilter).slideUp(1000);
			} else {
				self.element.find($el).addClass('filter-on').children('i').removeClass('fa-plus').addClass('fa-minus');
				//$('#'+myFilter).show();
				$('#'+myFilter).slideDown(1000);
			}
				
			ev.preventDefault();
		},
		
		'.gmamatrix-lmi-filter-tag click':function($el, ev) {
			var self = this,
			activatedFilter = self.element.find($el).data('lmi-filter');
						
			/* $("#" + activatedFilter).siblings('ul').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
			$('#' + activatedFilter).delay(1000).fadeToggle(1000); */
			$("#" + activatedFilter).siblings('ul').toggle();
			$('#' + activatedFilter).toggle();
			self.element.find($el).parent().addClass('gmamatrix-lmi-selected').children('.triangle-up').toggle();
			self.element.find($el).parent().siblings('div').removeClass('gmamatrix-lmi-selected').children('.triangle-up').toggle();
		}
    });


});
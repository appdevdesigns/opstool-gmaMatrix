
steal(
        // List your Controller's dependencies here:
        'appdev',
        'opstools/GMAMatrix/classes/GMAMeasurement.js',
        'opstools/GMAMatrix/classes/GMAPlacement.js',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAReport = can.Construct.extend({

        reports:function(nodeId, cb) {
            var dfd = AD.sal.Deferred();

            AD.comm.service.get({ url:'/opstool-gmaMatrix/gmamatrix/reports', data:{ nodeId: nodeId }})
            .then(function(data){

                // return an array of GMAReport instances:
                var returnArry = [];
                for (var i=0; i<data.length; i++){
                    returnArry.push( new AD.classes.gmamatrix.GMAReport(data[i]));
                }

                //
                if (cb) cb(null, returnArry);
                dfd.resolve(returnArry);
            })
            .fail(function(err) {
                if (cb) cb(err);
                dfd.reject(err);
            });

            return dfd;
        }
    },{

        init: function( data ) {
            var self = this;
            data = AD.defaults({
                reportId:-1,
                nodeId:-1,
                nodeName:'?nodeName?',
                startDate:'yyyy-mm-dd',
                endDate:'yyyy-mm-dd'
            }, data);

            for (var d in data) {
                this[d] = data[d];
            }

            // keep track of the measurements & placements associated with
            // this report
            this.data = {};
            this.data.measurements = null;
            this.data.placements = null;

        },


        getID: function(){
            return this.reportId;
        },
        
        
        
        getNodeID: function(){
            return this.nodeId;
        },



        label: function() {
            //return this.nodeName;
            
            // Since reports are displayed after choosing an assignment node,
            // we can assume the node name is already displayed elsewhere.
            // So to differentiate one report from the next, we use the date
            // range as the report label.
            return this.startDate + ' \u2014 ' + this.endDate;
        },

        
        // Load this report's measurements from the server
        measurements:function() {
            var self = this;
            var dfd = AD.sal.Deferred();


            if (this.data.measurements == null) {
                AD.classes.gmamatrix.GMAMeasurement.measurements( this.getID() )
                .then(function(measurements) {
                    self.data.measurements = measurements;

                    // store this report object in each Measurement object
                    for (var s in measurements){
                        var stratMeasurements = measurements[s];
                        for (var i=0; i<stratMeasurements.length; i++) {
                            stratMeasurements[i].setReport(self);
                        }
                    }


                    dfd.resolve(measurements);
                })
                .fail(function(err){
                    dfd.reject(err);
                });

            } else {
                dfd.resolve(this.data.measurements);
            }
            return dfd;
        },


        // Load the placements of this report's measurements
        placements:function() {
            var self = this;
            var dfd = AD.sal.Deferred();


            if (this.data.placements == null) {
                AD.classes.gmamatrix.GMAPlacement.placements({
                    nodeId:  this.getNodeID() 
                })
                .then(function(placements) {
                    
                    // store this as a lookup hash
                    var entries = {
                            // measurementID: { placement Object }
                    };
                    for (var p=0; p<placements.length; p++) {
                        var measurementID = placements[p].measurementId;
                        placements[p].setReport(self);
                        entries[measurementID] = placements[p];
                    }
                    
                    // create a reference to the Placement within each Measurement
                    for (var strat in self.data.measurements) {
                        var measurements = self.data.measurements[strat];
                        for (var m=0; m<measurements.length; m++) {
                            var measurementID = measurements[m].getID();
                            // Reference the existing placements
                            if (entries[measurementID]) {
                                measurements[m].setPlacement(entries[measurementID]);
                            }
                            // when no placement exists for a measurement, create one
                            else {
                                measurements[m].createPlacement({
                                    reportId: self.reportId,
                                    nodeId: self.nodeId
                                });
                            }
                        }
                    
                    }
                    
                    self.data.placements = entries;
                    dfd.resolve(placements);
                })
                .fail(function(err){
                    dfd.reject(err);
                });

            } else {
                dfd.resolve(this.data.placements);
            }
            return dfd;
        },



        measurementsWithoutPlacements:function(strategy) {
            var list = this.data.measurements[strategy];
            var listNotFound = [];

            if (list) {

                for(var i=0; i<list.length; i++) {
                    if (!this.data.placements[ list[i].getID() ]) {
                        listNotFound.push(list[i]);
                    }
                }
            }

            return listNotFound;

        },



        placementForMeasurement: function(measurement) {
            return this.data.placements[ measurement.getID() ];
        }


    });


});
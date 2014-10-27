
steal(
        // List your Controller's dependencies here:
        'appdev',
        //'opstools/GMAMatrix/classes/GMAMeasurement.js',
        //'opstools/GMAMatrix/classes/GMAPlacement.js',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAGraphData = can.Construct.extend({

    },{

        init: function( data ) {
            data = AD.defaults({
                nodeId: -1,
                startDate: 'yyyy-mm-dd',
                endDate: 'yyyy-mm-dd'
            }, data);

            for (var d in data) {
                this[d] = data[d];
            }
            
            this.graphData = null;
            this.placementData = null;
            this.dataReady = $.when(this.fetchData(), this.fetchPlacements());
        },


        fetchData: function() {
            var dfd = AD.sal.Deferred();
            var self = this;
            
            AD.comm.service.get({ 
                url: '/opstool-gmaMatrix/gmamatrix/graphData', 
                data: { 
                    nodeId: this.nodeId,
                    startDate: this.startDate,
                    endDate: this.endDate
                }
            })
            .fail(function(err){
                if (err.message.match(/Invalid PGTIOU/)) {
                    AD.comm.hub.publish('ad.auth.reauthenticate', {});
                }
                dfd.reject(err);
            })
            .done(function(data){
                self.graphData = data;
                dfd.resolve();
            });

            return dfd;
        },
        
        
        
        // Get the placement data for the GMA node currently loaded.
        fetchPlacements: function() {
            var dfd = AD.sal.Deferred();
            var self = this;
            
            AD.comm.service.get({
                url: '/opstool-gmaMatrix/gmamatrix/placements',
                data: {
                    nodeId: self.nodeId
                }
            })
            .fail(function(err){
                dfd.reject(err);
            })
            .done(function(list){
                self.placementData = {
                /*
                    <measurementId>: { type: 'staff', key: 'etmm' },
                    <measurementId>: { type: 'disciple', key: 'igc' },
                    ...
                */
                };
                for (var i=0; i<list.length; i++) {
                    self.placementData[ list[i].measurement_id ] = {
                        key: list[i].location,
                        type: list[i].type
                    };
                }
                dfd.resolve(self.placementData);
            });
            
            return dfd;
        },
        
        
        // Returns a basic object lookup of strategyID:strategyName.
        // fetchData() must have completed before this.
        strategies: function(){
            var strategies = {};
            if (this.graphData) {
                for (var i=0; i<this.graphData.strategies.length; i++) {
                    var strategyID = this.graphData.strategies[i].id;
                    var strategyName = this.graphData.strategies[i].name;
                    strategies[strategyID] = strategyName;
                }
            }
            return strategies;
        },
        
        
        // fetchData() and fetchPlacements() must have been completed before this.
        //
        // @param integer strategyID
        //      The strategyId value. Or -1 for all strategies combined.
        // @return object
        dataForStrategy: function(strategyID) {
            var self = this;
            var results = {
                periods: [],
                staffLMIs: {},
                discipleLMIs: {}
            };
            
            // Package the graph and placement data for the given strategy
            results.periods = self.graphData.periods;
            for (var i=0; i<self.graphData.measurements.length; i++) {
                var measurementID = self.graphData.measurements[i].id;
                
                // Only proceed if there is placement data for this measurement
                if (self.placementData[measurementID]) {
                    var type = self.placementData[measurementID].type;
                    var keyLMI = self.placementData[measurementID].key;
                    var values = self.graphData.measurements[i].values;
    
                    var groupKey;
                    if (type == 'disciple') {
                        groupKey = 'discipleLMIs';
                    } else {
                        groupKey = 'staffLMIs';
                    }
                    
                    if (strategyID == -1 || strategyID == self.graphData.measurements[i].strategyId) {
                        if (!results[groupKey][keyLMI]) {
                            // Use initial measurement values
                            results[groupKey][keyLMI] = values;
                        } else {
                            // Subsequent measurements within the same LMI are
                            // added on to the previous ones.
                            for (var j=0; j<results[groupKey][keyLMI].length; j++) {
                                results[groupKey][keyLMI][j] += values[j];
                            }
                        }
                    }
                }
            }
            
            return results;
        },
        
        
        
        getNodeID: function(){
            return this.nodeId;
        },



        label: function() {
            return this.graphData.title;
        }


    });


});

steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAPlacement = can.Construct.extend({

        // Load the placement information
        placements:function(options, cb) {
            var dfd = AD.sal.Deferred();
            
            var validOptions = [ 'reportId', 'nodeId', 'measurementId' ];
            var findOpts = {};
            for (var key in options) {
                if (validOptions.indexOf(key) >= 0) {
                    findOpts[key] = options[key];
                }
            }
            
            AD.comm.service.get({
                url:'/opstool-gmaMatrix/gmamatrix/placements',
                data: findOpts
            })
            .then(function(data){

                /*
                 // data is in format:
                    [
                         { placement 1},
                         { placement 2},
                         ...
                         { placement N}
                     ]
                 */

                var returnData = [];


                for (var i=0; i< data.length; i++ ) {
                    returnData.push( new AD.classes.gmamatrix.GMAPlacement(data[i]));
                }

                if (cb) cb(null, returnData);
                dfd.resolve(returnData);
            })
            .fail(function(err) {
                if (cb) cb(err);
                dfd.reject(err);
            });
            return dfd;
        }


    },{


        init: function( data ) {
            data = AD.defaults({
                // Primary key, but not really used
                id:1,
                // Used for reverse lookups
                reportId:-1,
                nodeId:-1,
                // Measurement ID should be unique
                measurementId:-1,
                // Key is from the first letter of each LMI name
                matrixLocation:'??',
                order:-1,
                // 'staff' or 'disciple'
                type: 'staff'
            }, data);
            
            // Map the field names from the server to the field names used by
            // this class.
            // [server field] => [class field]
            var mapping = {
                measurement_id: 'measurementId',
                node_id: 'nodeId',
                report_id: 'reportId',
                location: 'matrixLocation',
                id: 'id',
                order: 'order',
                type: 'type'
            }

            for (var d in data) {
                var fieldName = mapping[d] || d;
                this[fieldName] = data[d];
            }

            this.reportObj = null;
            this.isDirty = false;

        },



        getID: function(){
            return this.id;
        },



        label: function() {
            return this.name;
        },



        location: function() {
            return this.matrixLocation;
        },



        setReport: function(report) {
            if (this.reportObj != report) {
                this.reportObj = report;
                this.reportId = report.getID();
                this.isDirty = true;
            }
            return this;
        },
        
        
        setLocation: function(location) {
            if (this.matrixLocation != location) {
                this.matrixLocation = location;
                this.isDirty = true;
            }
            return this;
        },
        
        
        setType: function(type) {
            if (this.type != type) {
                this.type = type;
                this.isDirty = true;
            }
            return this;
        },
        
        
        save: function() {
            var dfd = AD.sal.Deferred();
            
            if (!this.isDirty) {
                dfd.resolve();
            } else {
                
                var measurementID = this.measurementId;
                var itemData = {
                    reportId: this.reportId,
                    nodeId: this.nodeId,
                    type: this.type,
                    location: this.matrixLocation
                }
                
                AD.comm.service.put({
                    url:'/opstool-gmaMatrix/gmamatrix/placements/' + measurementID,
                    params: itemData
                })
                .done(function(data){
                    this.isDirty = false;
                    dfd.resolve();
                })
                .fail(function(err){
                    console.log(err);
                    dfd.reject(err);
                });
            }
            
            return dfd;
        }


    });


});
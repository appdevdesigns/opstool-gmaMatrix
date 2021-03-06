
steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAMeasurement = can.Construct.extend({


        measurements:function(reportID, cb) {
            var dfd = AD.sal.Deferred();

            var reportData = { reportID:reportID };
            AD.comm.service.get({
                url:'/opstool-gmaMatrix/gmamatrix/measurements',
                data:reportData
            })
            .then(function(data){

                /*
                 // data is in format:
                    {
                     'strategy Name 1': [
                         { measurement 1},
                         { measurement 2},
                         ...
                         { measurement N}
                     ],
                     'strategy Name 2': [
                         { measurement 1},
                         { measurement 2},
                         ...
                         { measurement N}
                     ],

                     }
                 */

                var returnData = {};

                for (var d in data) {
                    returnData[d] = [];

                    var measurements = data[d];
                    for (var i=0; i< measurements.length; i++ ) {
                        returnData[d].push( new AD.classes.gmamatrix.GMAMeasurement(measurements[i]));
                    }

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
            var self = this;
            data = AD.defaults({
                reportId:-1,
                measurementId:-1,
                measurementName:'?measurementName?',
                measurementDescription:'?measurementDescription',
                measurementValue:-1
            }, data);

            for (var d in data) {
                this[d] = data[d];
            }

            this.reportObj = null;

        },



        description: function() {

            return this.measurementDescription;
        },



        getID: function(){
            return this.measurementId;
        },



        label: function() {

            return this.measurementName;
        },


        lmiDefinition: function(lmi) {
            this.lmiObj = lmi;
        },


        placement:function() {
            return this.reportObj.placementForMeasurement(this);
        },



        setReport:function(report) {
            this.reportObj = report;
        },



        value: function() {

            return this.measurementValue;
        }


    });


});
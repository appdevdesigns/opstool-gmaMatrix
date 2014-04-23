
steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAPlacement = can.Construct.extend({


        placements:function(reportID, cb) {
            var dfd = AD.sal.Deferred();

            var reportData = { reportID:reportID };
            AD.comm.service.get({
                url:'/opstool-gmaMatrix/gmamatrix/placements',
                data:reportData
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
//            var self = this;
            data = AD.defaults({
                id:1,
                reportId:-1,
                measurementId:-1,
                matrixLocation:'??',
                order:-1
            }, data);

            for (var d in data) {
                this[d] = data[d];
            }

            this.reportObj = null;

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



        setReport:function(report) {
            this.reportObj = report;
        }


    });


});
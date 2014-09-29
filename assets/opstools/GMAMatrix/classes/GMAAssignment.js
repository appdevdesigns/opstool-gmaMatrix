
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMAReport.js',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMAAssignment = can.Construct.extend({

        assignments:function(cb) {
            var dfd = AD.sal.Deferred();

            AD.comm.service.get({ url:'/opstool-gmaMatrix/gmamatrix/assignments' })
            .then(function(data){

                // return an array of GMAAssignment instances:
                var returnArry = [];
                for (var i=0; i<data.length; i++){
                    returnArry.push( new AD.classes.gmamatrix.GMAAssignment(data[i]));
                }

                //
                if (cb) cb(null, returnArry);
                dfd.resolve(returnArry);
            })
            .fail(function(err) {
                if (err.message.match(/Invalid PGTIOU/)) {
                    AD.comm.hub.publish('ad.auth.reauthenticate', {});
                }
                if (cb) cb(err);
                dfd.reject(err);
            });

            return dfd;
        }
    },{

        init: function( data ) {
            var self = this;
            data = AD.defaults({
                nodeId:-1,
                nodeName:'?nodeName?'
            }, data);

            for (var d in data) {
                this[d] = data[d];
            }

            // keep track of the measurements associated with this report
            this.data = {};
            this.data.reports = null;

        },


        getID: function(){
            return this.nodeId;
        },



        label: function() {

            return this.nodeName;
        },


        reports:function() {
            var self = this;
            var dfd = AD.sal.Deferred();


            if (this.data.reports == null) {
                AD.classes.gmamatrix.GMAReport.reports( this.getID() )
                .then(function(reports) {
                    self.data.reports = reports;
                    dfd.resolve(reports);
                })
                .fail(function(err){
                    dfd.reject(err);
                });

            } else {
                dfd.resolve(this.data.reports);
            }
            return dfd;
        }


    });


});
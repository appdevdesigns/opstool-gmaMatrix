
steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.classes.[application].[Class]  --> Object
    if (typeof AD.classes.gmamatrix == 'undefined') AD.classes.gmamatrix = {};
    AD.classes.gmamatrix.GMALMIDefinition = can.Construct.extend({


        definitions:function(cb) {
            var dfd = AD.sal.Deferred();

            AD.comm.service.get({ url:'/opstool-gmaMatrix/gmamatrix/lmidefs' })
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

                var returnData = [];

                for (var i=0; i< data.length; i++ ) {
                    returnData.push( new AD.classes.gmamatrix.GMALMIDefinition(data[i]));
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
                id:-1,
                name:'??',
                definition:'??',
                summaryType:'??',
                inputType:'??',
                chartLocation:'??',
                locationKey:'??'
            }, data);

            this.data = data;

        },



        definition: function() {

            return this.data.definition;
        },



        getID: function(){
            return this.data.id;
        },



        key: function(){
            return this.data.locationKey;
        },



        label: function() {

            return this.data.name;
        },


        placement:function() {
            return this.data.chartLocation;
        }




    });


});
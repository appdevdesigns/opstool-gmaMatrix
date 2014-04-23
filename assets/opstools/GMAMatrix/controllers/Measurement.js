
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/Measurement/Measurement.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.Measurement = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/Measurement/Measurement.ejs',
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);

            this.subscriptions = [];

            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();


            var sid = AD.comm.hub.subscribe('gmamatrix.measurements.clear', function(key, data){
                AD.sal.setImmediate( function() {
                    self.remove();
                });
            });
            this.subscriptions.push(sid);


        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {item:this.options.measurement } ));

        },



        remove: function() {



            // if still attached to an element -> remove it.
            if (this.element) {
                this.element.remove();


                // unsubscribe us from any of our subscriptions
                for (var s=0; s<this.subscriptions.length; s++){
                    AD.comm.hub.unsubscribe(this.subscriptions[s]);
                }

                this.subscriptions = [];
            }

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        },


    });


});
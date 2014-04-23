
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/NotPlacedList/NotPlacedList.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.NotPlacedList = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/NotPlacedList/NotPlacedList.ejs',
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);


            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();


        },



        addMeasurement:function(measurement) {

            // make sure measurement is linked to this LMI definition
            measurement.lmiDefinition( this.options.definition);

            // append a new Measurement to my LMI location
            var tag = 'gmamatrix-measurement-div-'+measurement.getID();
            var div = $('<div class="'+tag+'" ></div>');
            this.element.append(div);
            new AD.controllers.opstools.GMAMatrix
            .Measurement(this.element.find('.'+tag), { measurement: measurement } );

        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        },


    });


});

steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/views/LMIDefinition/LMIDefinition.ejs',
function(){


    AD.Control.extend('opstools.GMAMatrix.LMIDefinition', {


        init: function (element, options) {
            var self = this;
            options =  AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/LMIDefinition/LMIDefinition.ejs'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);


            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();


        },

        
        /**
         * @param Model measurement
         */
        addMeasurement:function(measurement) {
            
            // make sure measurement is linked to this LMI definition
            measurement.lmiDefinition( this.options.definition);
            
            var tag = 'gmamatrix-measurement-div-'+measurement.getID();
            var $container = this.element.find('.gmamatrix-li-form');
            var $li = $('<li class="'+tag+'" ></li>');
            
            // append a new Measurement to my LMI location
            $container.append($li);
            new AD.controllers.opstools.GMAMatrix
            .Measurement($li, { measurement: measurement} );

        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, { item: this.options.definition } ));

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        }


    });


});
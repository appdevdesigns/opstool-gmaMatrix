steal(
        // List your Controller's dependencies here:
        'appdev',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.LayoutMeasurement = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    measurement: null // must pass in a GMAMeasurement instance
                    //templateDOM: '<%= item.label() %>'
            }, options);
            

            // Call parent init
            AD.classes.UIController.apply(this, arguments);
            
            // If no element was passed in to contain this, create a DIV from scratch
            if (this.element.length == 0) {
                this.element = $('<div>');
            }


            this.initDOM();

            //AD.comm.hub.subscribe('gmamatrix.strategy.selected', function(key, data){
            //    self.selectedStrategy(data.strategy);
            //});
        },


        initDOM: function () {
            
            /*
            this.element.html(can.view(this.options.templateDOM, {
                item: this.options.measurement
            } ));
            */
            var label = this.options.measurement.label() || 'Measurement';
            var desc = this.options.measurement.description() || '';
            this.element.html( label );
            this.element.attr('title', desc);
            
            this.element.addClass('cat-unassigned');
            this.element.addClass('gmamatrix-draggable');
            this.element.attr('measurementId', this.options.measurement.getID());
            this.element.data('catInfo', {
                catID: this.options.measurement.getID(),
                catAssigned: false,
                catAssignedOther: false,
                catAssignedNum: 0
            });
            this.element.draggable( {
                containment: 'document',
                stack: '.gmamatrix-draggable',
                cursor: 'move',
                cursorAt: { top: 16, left: 55 },
                scroll: true,
                revert: true,
                revertDuration: 1,
                opacity: 0.7, 
                helper: "clone"
            } );
            
            this.element.appendTo('#gmamatrix-affix');
            
        }

});
    
});
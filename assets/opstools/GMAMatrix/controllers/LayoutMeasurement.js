steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/views/Measurement/LayoutMeasurement.ejs',
function(){


    AD.Control.extend('opstools.GMAMatrix.LayoutMeasurement', {


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    // This is a GMAMeasurement instance that provides all the
                    // measurement's information.
                    measurement: null,
                    templateDOM: '//opstools/GMAMatrix/views/Measurement/LayoutMeasurement.ejs',
                    // The drag-n-drop motion will not be allowed to go beyond
                    // this element's boundary.
                    boundaryElement: document.body
            }, options);
            
            
            // Call parent init
            AD.classes.UIController.apply(this, arguments);
            
            this.initDOM();

            this.subscriptions = [];

            this.subscriptions.push(
                AD.comm.hub.subscribe('gmamatrix.measurements.clear', function(key, data){
                    self.clear();
                })
            );
        },

        
        initDOM: function () {
            
            this.element.html(can.view(this.options.templateDOM, {
                item: this.options.measurement
            } ));

            var desc = this.options.measurement.description() || '';
            this.element.attr('title', desc);

            this.element.addClass('cat-unassigned');
            this.element.addClass('gmamatrix-draggable');
            this.element.attr('measurementId', this.options.measurement.getID());
            
            var placement = this.options.measurement.placement();
            var type = placement.type;
            if (type == 'staff') {
                this.element.addClass('staff');
            } else {
                this.element.addClass('disciple');
            }
            
            this.element.draggable( {
                stack: '.gmamatrix-draggable',
                cursor: 'move',
                cursorAt: { top: 16, left: 55 },
                scroll: true,
                revert: true,
                revertDuration: 1,
                // These settings affect the helper element that is used
                // while the drag is in progress:
                helper: "clone",
                opacity: 0.7, 
                zIndex: 100,
                containment: this.options.boundaryElement,
                appendTo: this.options.boundaryElement
            } );
            
        },
        
        
        // Saves the measurement's placement location to the server
        savePlacement: function (locationKey, type) {
            var placement = this.options.measurement.placement();
            placement
                .setLocation(locationKey)
                .setType(type)
                .save();
        },
        

        // Remove self from the Layout panel
        clear: function () {
            if (this.element) {
                this.element.remove();
            }
            // unsubscribe us from any subscriptions
            for (var s=0; s<this.subscriptions.length; s++){
                AD.comm.hub.unsubscribe(this.subscriptions[s]);
            }
            this.subscriptions = [];
        }

    });
    
});
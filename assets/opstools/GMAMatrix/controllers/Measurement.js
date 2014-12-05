
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/views/Measurement/Measurement.ejs',
function(){


    AD.Control.extend('opstools.GMAMatrix.Measurement', {


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    saveDelay: 3000, // wait 3 seconds before saving a value change
                    templateDOM: '//opstools/GMAMatrix/views/Measurement/Measurement.ejs',
                    measurement: {} // must pass in a GMAMeasurement object
            }, options);
            this.options = options;

            // Call parent init
            // AD.classes.UIController.apply(this, arguments);
            this._super(element, options);

            this.initDOM();
            this.timer = null;

            this.subscriptions = [];
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
        
        
        save: function() {
            this.options.measurement.save();
        },
        
        
        // Wait a few seconds before saving the measurement value to the server.
        // If a new save request is made during that delay, discard the old
        // request.
        delayedSave: function() {
            var self = this;
            
            if (self.timer) {
                // Discard old request
                clearTimeout(self.timer);
            }
            
            // Set timer for new request
            self.timer = setTimeout(function(){
                self.save();
            }, self.options.saveDelay);
        },
        
        
        // Set or get the value of this measurement
        value: function(newValue) {
            if (typeof newValue != undefined) {
                this.options.measurement.setValue(newValue);
            }
            return this.options.measurement.value();
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
        
        
        'input change': function($el, ev) {
            var newValue = $el.val();
            this.value(newValue);
            this.delayedSave();
        }

    });


});
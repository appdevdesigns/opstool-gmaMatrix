
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/Measurement.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/NotPlacedList.js',
        '//opstools/GMAMatrix/controllers/ADAffix.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.GMAStage_Entry = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAStage/GMAStage-Entry.ejs',
            }, options);

            
            /*
            this.locations = null;
            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  * / };
            */

            this.initDOM();
            
            this.measurementWidgets = [];


        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

        },
        
        
        // Show the Entry panel
        show: function () {
            this.element.show();
        },
        
        
        // Hide the Entry panel
        hide: function () {
            this.element.hide();
        },
        
        
        addMeasurement: function (measurement) {
            // Find the LMI section that will contain this measurement
            var placement = measurement.placement();
            var keyLMI = placement.location();

            // Create the measurement widget
            var $li = $('<li>');
            this.measurementWidgets.push(
                new AD.controllers.opstools.GMAMatrix.Measurement($li, {
                    measurement: measurement
                })
            );
            
            // Find the matching LMI container
            var $container = this.element.find("div.gmamatrix-container[key='" + keyLMI + "'] ul");
            
            // If no match then place in the "Other" container at the bottom
            if ($container.length <  1) {
                var $container = this.element.find("ul.gmamatrix-li-other");
            }
            
            $container.append($li);
        },
        
        
        // Removes all measurements from all LMI sections
        removeAll: function () {
            // Clear the DOM of any placeholder elements from the .ejs template
            this.element.find("div.gmamatrix-container[key] ul li").remove();
            this.element.find("ul.gmamatrix-li-other li").remove()
            
            // Remove the widget DOM elements
            for (var i=0; i<this.measurementWidgets.length; i++) {
                this.measurementWidgets[i].remove();
            }
            
            // Reset the wdigets array
            this.measurementWidgets = [];
        }


    });


});
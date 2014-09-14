
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LayoutMeasurement.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/NotPlacedList.js',
        '//opstools/GMAMatrix/controllers/ADAffix.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.GMAStage_Layout = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAStage/GMAStage-Layout.ejs',
            }, options);

            // Call parent init
//            AD.classes.UIController.apply(this, arguments);


            this.locations = null;
            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  */ };

            this.measurementWidgets = [];

            this.initDOM();
            
            
            //// Initialize drag-n-drop
            
			this.element.find('.gmamatrix-droppable-lmi').droppable({
				accept: '.gmamatrix-draggable',
				drop: this.handleDropLMIEvent,
				hoverClass: "gmamatrix-container-hover"
			});
			
			this.element.find('.gmamatrix-droppable-other').droppable({
				accept: '.gmamatrix-draggable',
				drop: this.handleDropOtherEvent,
				hoverClass: "gmamatrix-container-hover"
			});
			
			this.element.find('.gmamatrix-droppable-cat').droppable({
				accept: '.gmamatrix-draggable',
				drop: this.handleDropReturnEvent,
				hoverClass: "gmamatrix-container-hover"
			});
        },


        // Measurement dropped inside an LMI container
		'handleDropLMIEvent': function( event, ui ) {
		    var $target = $(this);
		    var $source = $(ui.draggable);
		    var locationKey = $target.attr('key');
		    var widget = $source.data('LayoutMeasurement');
            
            // Move the measurement to the target container
		    $target.find('.measurements').append($source);
            // Update the location key on the measurement
            widget.savePlacement(locationKey);
		},
		
     
        // Measurement dropped inside the "Categories" box on the right side
		'handleDropReturnEvent': function( event, ui ) {

		    $(this).find('.measurements').prepend(ui.draggable);

		},
		
        // Measurement dropped inside the "Other" container at the bottom
		'handleDropOtherEvent': function( event, ui ) {

		    $(this).append(ui.draggable);

		},


        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));


            // for testing purposes:
            // trying to work out bootstrap.affix()
            this.notPlacedList = new AD.controllers.opstools.GMAMatrix.ADAffix(this.element.find('#gmamatrix-affix'), {
                scrollingObj:'.gmamatrix-stage',     // jquery selector of obj on page that will fire the scroll() event
                offset:10
            });

        },

        
        // Show the Layout panel
        show: function () {
            this.element.show();
        },
        
        
        // Hide the Layout panel
        hide: function () {
            this.element.hide();
        },
        
        
        // Adds a single measurement onto the Layout panel
        addMeasurement: function (measurement) {
            // Find the LMI section that will contain this measurement
            var placement = measurement.placement();
            var keyLMI = placement.location();

            // Create the measurement widget
            var $div = $('<div>');
            var widget = new AD.controllers.opstools.GMAMatrix.LayoutMeasurement($div, {
                measurement: measurement,
                boundaryElement: this.element
            });
            this.measurementWidgets.push(widget);
            $div.data('LayoutMeasurement', widget);
            
            // Find the matching LMI container
            var $container = this.element.find("div.gmamatrix-container[key='" + keyLMI + "'] .measurements");
            
            // If no match then place in the container at the side
            if ($container.length == 0) {
                $container = this.element.find("div.gmamatrix-cat-container .measurements"); 
            }
            
            $container.append($div);
        },
        
        
        // Remove all measurements from the Layout panel
        removeAll: function() {
            for (var i=0; i<this.measurementWidgets.length; i++) {
                this.measurementWidgets[i].clear();
            }
            this.measurementWidgets = [];
        }



    });


});
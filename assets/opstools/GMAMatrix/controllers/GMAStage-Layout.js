
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LayoutMeasurement.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/NotPlacedList.js',
        '//opstools/GMAMatrix/controllers/ADAffix.js',
function(){
    
    // Refresh the "categories" panel on the right to prevent empty
    // spaces from being left after something is dragged out.
    var refreshCatPanel = function(ui) {
        var $affix = $(ui.draggable).parents('.affix');
        $affix.removeClass('affix')
        setTimeout(function(){
            $affix.addClass('affix');
        }, 0);
    };


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


            this.measurementWidgets = [];

            this.initDOM();
            
            
            //// Initialize drag-n-drop
            
			this.element.find('.gmamatrix-droppable-lmi .measurements').droppable({
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
				accept: function(element){
				    // Accept drops from draggable, reject from cat-container
				    var isFromCatContainer = ($(element).parents('.gmamatrix-cat-container').length > 0);
				    var isDroppable = $(element).hasClass('gmamatrix-draggable');
				    if (isDroppable && !isFromCatContainer) {
				        return true;
				    }
				    else {
				        return false;
				    }
				},
				drop: this.handleDropReturnEvent,
				hoverClass: "gmamatrix-container-hover"
			});
        },
        
        
        // Measurement dropped inside an LMI container
		handleDropLMIEvent: function( event, ui ) {
		    var $target = $(this);
		    var $source = $(ui.draggable);
		    var locationKey = $target.attr('key');
		    var widget = $source.data('LayoutMeasurement');
		    var type = $target.attr('type');
		    
		    refreshCatPanel(ui);
            
            // Move the measurement to the target container
		    $target.append($source);
            // Update the location key on the measurement
            widget.savePlacement(locationKey, type);
		},
		
     
        // Measurement dropped inside the "Categories" box on the right side
		handleDropReturnEvent: function( event, ui ) {
		    
            $(this).find('.measurements').prepend(ui.draggable);
		    refreshCatPanel(ui);

		},
		
        // Measurement dropped inside the "Other" container at the bottom
		handleDropOtherEvent: function( event, ui ) {
		    var $source = $(ui.draggable);
		    var widget = $source.data('LayoutMeasurement');

		    refreshCatPanel(ui);
		    $(this).find('.measurements').append($source);

            // Update the location key on the measurement
            widget.savePlacement('other');
		},


        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

            // This is the "Categories" panel on the right
            this.notPlacedList = new AD.controllers.opstools.GMAMatrix.ADAffix(this.element.find('#gmamatrix-affix'), {
                scrollingObj: '.opsportal-stage-container',
                //scrollingObj:'.gmamatrix-stage',     // jquery selector of obj on page that will fire the scroll() event
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
            if (keyLMI != 'other') {
                $container = $container.filter("[type='" + placement.type + "']");
            }
            
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
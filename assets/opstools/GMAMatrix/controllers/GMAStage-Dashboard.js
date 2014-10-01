
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.GMAStage_Dashboard = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAStage/GMAStage-Dashboard.ejs',
            }, options);

            // Call parent init
//            AD.classes.UIController.apply(this, arguments);


            this.initDOM();

			this.element.find('.tt').tooltip(options);

			
			var data = [{ month: "January", score: 73 }, { month: "February", score: 95 }, { month: "March", score: 89 },
			            { month: "April", score: 66 }, { month: "May", score: 50 }, { month: "June", score: 65 },
			            { month: "July", score: 70 }, { month: "August", score: 43 }, { month: "September", score: 65 },
			            { month: "October", score: 27 }, { month: "November", score: 77 }, { month: "December", score: 58 }];
			this.element.find(".gmaSparkline").wijsparkline({
				data: data,
				bind: "score",
				tooltipContent: function(){
	                return this.month + ': ' +  this.score;
	            },
		        type: "area",
				seriesStyles: [
				            {
								fill: "#999999",
				 				stroke: "#333333"
				            }
				        ]
		    });

			// See https://github.com/minddust/bootstrap-progressbar for docs
			this.element.find('.progress .progress-bar').progressbar({
				use_percentage: false,
				display_text: 'fill',
				amount_format: function(amount_part, amount_total) { return amount_part + ' / ' + amount_total; }
			});

			this.element.find('.gma-sparkline').popover({
			    html : true,
				trigger : 'focus',
				placement : 'right',
			    title: function() {
			      return self.element.find('.gma-sparkline-title').html();
			    },
			    content: function() {
			      return self.element.find('.gma-sparkline-content').html();
			    }
			});
			
			this.element.find('.gma-progressbar').popover({
			    html : true,
				trigger : 'focus',
				placement : 'right',
			    title: function() {
			      return self.element.find('.gma-progress-title').html();
			    },
			    content: function() {
			      return self.element.find('.gma-progress-content').html();
			    }
			});

        },



        initDOM: function () {
            this.element.html(can.view(this.options.templateDOM, {} ));
        },

        
        // Show the Dashboard panel
        show: function () {
            this.element.show();
        },
        
        
        // Hide the Dashboard panel
        hide: function () {
            this.element.hide();
        },



		'.gmamatrix-lmi-filter-tag click':function($el, ev) {
			var self = this,
			activatedFilter = self.element.find($el).data('lmi-filter');
						
			/* $("#" + activatedFilter).siblings('ul').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
			$('#' + activatedFilter).delay(1000).fadeToggle(1000); */
			$("#" + activatedFilter).siblings('ul').toggle();
			$('#' + activatedFilter).toggle();
			self.element.find($el).parent().addClass('gmamatrix-lmi-selected').children('.triangle-up').toggle();
			self.element.find($el).parent().siblings('div').removeClass('gmamatrix-lmi-selected').children('.triangle-up').toggle();
		}
    });


});
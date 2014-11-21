
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/classes/GMALMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LMIDefinition.js',
        '//opstools/GMAMatrix/controllers/LMIGraph.js',
        '//opstools/GMAMatrix/views/GMAStage/GMAStage-Dashboard.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    // if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    // if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    // AD.controllers.opstools.GMAMatrix.GMAStage_Dashboard = AD.classes.UIController.extend({
    AD.Control.extend('opstools.GMAMatrix.GMAStage_Dashboard', {


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAStage/GMAStage-Dashboard.ejs'
            }, options);

            // Call parent init
//            AD.classes.UIController.apply(this, arguments);
            
            this.graphs = {
            /*
                'etmm': <obj>,
                'npb': <obj>,
                ...
            */
            };

            this.initDOM();
            
            this.element.find('.lmi-graph').each(function() {
                var $el = $(this);
                var title = $el.attr('label');
                var key = $el.attr('key');
                var lmiGraph = new AD.controllers.opstools.GMAMatrix.LMIGraph($el, {
                    titleLMI: title,
                    key: key
                });

                self.graphs[key] = lmiGraph;
            });

			this.element.find('.tt').tooltip(options);

			
			            
            this.render();

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
        
        
        // @param object allData
        //     Data for all the LMIs in this format:
        //     {
        //        periods: [ ... ],
        //        staffLMIs: {
        //            etmm: [ ... ],
        //            tfa: [ ... ],
        //            ...
        //        },
        //        discipleLMIs: { 
        //            etm: [ ... ],
        //            tfa: [ ... ],
        //            ... 
        //        }
        //     }
        render: function (allData) {
            // Dummy data
            if (!allData) {
                for (var key in this.graphs) {
                    this.graphs[key].render({
                        staff: [2, 4, 6, 8, 10, 12, 25],
                        disciple: [3, 6, 9, 12, 15, 25, 30],
                        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
                    });
                }
            }
            // Passed in data
            else {
                for (var key in this.graphs) {
                    this.graphs[key].render({
                        staff: allData.staffLMIs[key],
                        disciple: allData.discipleLMIs[key],
                        periods: allData.periods
                    });
                }
            }
            return;
        
        
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
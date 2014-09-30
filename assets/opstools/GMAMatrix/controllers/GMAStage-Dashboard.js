
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


            this.locations = null;
            this.lmiDefsLoaded = null;
            this.lmiDefs = { /*  key: { LMIMeasurement }  */ };

            this.initDOM();
            this.loadLMI();

            this.listAffix = null;

			this.element.find('.tt').tooltip(options);

			
			//var wijmodata = [33, 11, 15, 26, 16, 27, 37, -13, 8, -8, -3, 17, 0, 22, -13, -29, 19, 8];
			//this.element.find('#chartDiv').wijsparkline({ data: wijmodata });
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
			
//            this.setupComponents();


/*			$('[data-clampedwidth]').each(function () {
			    var elem = $(this);
			    var parentPanel = elem.data('clampedwidth');
			    var resizeFn = function () {
			        var sideBarNavWidth = $(parentPanel).width() - parseInt(elem.css('paddingLeft')) - parseInt(elem.css('paddingRight')) - parseInt(elem.css('marginLeft')) - parseInt(elem.css('marginRight')) - parseInt(elem.css('borderLeftWidth')) - parseInt(elem.css('borderRightWidth'));
			        elem.css('width', sideBarNavWidth);
			    };

			    resizeFn();
			    $(window).resize(resizeFn);
			});*/


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



        loadLMI: function() {
            var self = this;

            this.lmiDefsLoaded = AD.classes.gmamatrix.GMALMIDefinition.definitions()
            .then(function(list){

                for (var l=0; l<list.length; l++) {
                    var definition = list[l];

                    // get it's placement
                    var placement = definition.placement();

                    // get the lmi location key
                    var key = definition.key();

                    // append a new definition to the Win-Build-Send chart
                    /*
                    var tag = 'gmamatrix-stage-lmi-'+key;
                    var div = $('<div class="'+tag+'" ></div>');
                    self.element.find('#'+placement).append(div);
                    */
                    
                    var $lmiContainer = self.element.find(".lmi-box[lmikey='" + key + "']");
                    
                    self.lmiDefs[key] = new AD.controllers.opstools.GMAMatrix
                    .LMIDefinition($lmiContainer, { definition: definition } );
                    //.LMIDefinition(self.element.find('.'+tag), { definition: definition } );
                }

            })
            .fail(function(err){
                console.error('problem loading LMI definitions:');
                console.log(err);
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
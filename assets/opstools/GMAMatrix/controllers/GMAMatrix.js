
steal(
        // List your Controller's dependencies here:
        'appdev',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/GMAStage.js',
		'//opstools/GMAMatrix/controllers/GMAFilters.js',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.Tool = AD.classes.opsportal.OpsTool.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/GMAMatrix/GMAMatrix.ejs',
                    resize_notification: 'gmamatrix.resize'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.opsportal.OpsTool.prototype.init.apply(this, arguments);

            this.initDOM();
            this.setupPage();

        },



        initDOM: function () {
            this.element.html(can.view(this.options.templateDOM, {} ));
        },



        setupPage: function() {
            var self = this;
            var controls = {
                // Initialize the sidebar list widgets
                assignment: new AD.controllers.opstools.GMAMatrix.AssignmentList(
                    this.element.find('.gmamatrix-assignment-chooser')
                ),
                strategy: new AD.controllers.opstools.GMAMatrix.StrategyList(
                    this.element.find('.gmamatrix-strategy-chooser')
                ),
                report: new AD.controllers.opstools.GMAMatrix.ReportList(
                    this.element.find('.gmamatrix-report-chooser')
                ),
                
                // Filters for Dashboard panel
    			filters: new AD.controllers.opstools.GMAMatrix.GMAFilters(this.element.find('.gmamatrix-filters')),
                
                // Attach the GMA Stage
                stage: new AD.controllers.opstools.GMAMatrix.GMAStage(this.element.find('.gmamatrix-stage'))
            };
            
            
            // Toggle the sidebar depending on which Stage panel is active
            can.bind.call(controls.stage, 'panel-active', function(ev, panelKey){
                if (panelKey == '#dashboard') {
                    controls.filters.show();
                    controls.assignment.hide();
                    controls.strategy.hide();
                    controls.report.hide();
                } else {
                    controls.filters.hide();
                    controls.assignment.show();
                    controls.strategy.show();
                    controls.report.show();
                }
            });
            
            
            // Set up busy indicator to respond to all child controllers
            this.busyIndicator = new AD.widgets.ad_icon_busy(this.element.find('.busy-indicator'), {
                style:'circle',
                color:'grey'
            });
            this.busyIndicator.show();
            for (var i in controls) {
                can.bind.call(controls[i], 'busy', function(){
                    self.busyIndicator.show();
                });
                can.bind.call(controls[i], 'idle', function(){
                    self.busyIndicator.hide();
                });
            }

        }		

    });


});
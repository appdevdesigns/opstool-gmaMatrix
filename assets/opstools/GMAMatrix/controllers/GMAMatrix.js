
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
        '//opstools/GMAMatrix/controllers/GMAStage.js',
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
            
            var controls = [
                // Initialize the sidebar list widgets
                new AD.controllers.opstools.GMAMatrix.AssignmentList(
                    this.element.find('.gmamatrix-assignment-chooser')
                ),
                new AD.controllers.opstools.GMAMatrix.StrategyList(
                    this.element.find('.gmamatrix-strategy-chooser')
                ),
                new AD.controllers.opstools.GMAMatrix.ReportList(
                    this.element.find('.gmamatrix-report-chooser')
                ),
                // Attach the GMA Stage
                new AD.controllers.opstools.GMAMatrix.GMAStage( this.element.find('.gmamatrix-stage'))
            ];
            
            // Set up busy indicator response for controls
            this.busyIndicator = new AD.widgets.ad_icon_busy(this.element.find('.busy-indicator'), {
                style:'circle',
                color:'grey'
            });
            for (var i=0; i<controls.length; i++) {
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
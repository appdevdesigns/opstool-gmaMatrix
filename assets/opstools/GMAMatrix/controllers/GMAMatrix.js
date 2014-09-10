
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


  //          this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();

            this.setupPage();

        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

        },



        setupPage: function() {

            var self = this;
            
            // Initialize the busy indicator widget to be used by the
            // sidebar lists.
            this.busyIndicator = new AD.widgets.ad_icon_busy(this.element.find('.busy-indicator'), {
                style:'circle',
                color:'grey'
            });
            var showBusyIndicator = function(isBusy) {
                if (isBusy) {
                    self.busyIndicator.show();
                } else {
                    self.busyIndicator.hide();
                }
            }

            //// Initialize the sidebar list widgets
            new AD.controllers.opstools.GMAMatrix.AssignmentList(
                this.element.find('.gmamatrix-assignment-chooser'),
                { busy: showBusyIndicator }
            );

            new AD.controllers.opstools.GMAMatrix.StrategyList(
                this.element.find('.gmamatrix-strategy-chooser'),
                { busy: showBusyIndicator }
            );

            new AD.controllers.opstools.GMAMatrix.ReportList(
                this.element.find('.gmamatrix-report-chooser'),
                { busy: showBusyIndicator }
            );



            //// Attach the GMA Stage
            new AD.controllers.opstools.GMAMatrix.GMAStage( this.element.find('.gmamatrix-stage'));

        }		

    });


});
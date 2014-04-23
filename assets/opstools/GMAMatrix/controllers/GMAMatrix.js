
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/GMAStage.js',
//        'opstools/GMAMatrix/views/GMAMatrix/GMAMatrix.ejs',
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


            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();

            this.setupPage();

        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

        },



        setupPage: function() {




            this.loadingIconInitial = new AD.widgets.ad_icon_busy(this.element.find('#dummy-loading-indicator'), {
                style:'circle',
                color:'grey'
            });
            this.loadingIconInitial.show();

            this.loadingIcons = new AD.widgets.ad_icon_busy(this.element.find('.gmamatrix-loading-icon'), {
                style:'circle',
                color:'grey'
            });

            //// Attach the ReportList object
            new AD.controllers.opstools.GMAMatrix.AssignmentList( this.element.find('.gmamatrix-assignment-chooser'));


            //// Attach the GMA Stage
            new AD.controllers.opstools.GMAMatrix.GMAStage( this.element.find('.gmamatrix-stage'));
            /*
             // From initial GMA Matrix:



            $('#language-switcher').appdev_list_languagepicker();

            // Init and show the Report & MCC selection dialog
            $('#report-selector').modal({
                keyboard: false
            });
            $('#report-selector select').attr('disabled', 1);

            // Start by displaying the datepicker for the user to choose which
            // time period the GMA reports will be selected from.
            var $date = $('#reports-date');
            $date.kendoDatePicker({
                format: "yyyy-MM-dd",
                change: function(e) {
                    var widget = $date.data('kendoDatePicker');

                    // Don't allow the date to be changed again
                    widget.enable(false);
                    widget.close();

                    // Get value and convert to a Ymd string
                    var dateObj = widget.value();
                    var selectedDate = dateObj.getFullYear()
                        + String(dateObj.getMonth()+1).replace(/^(.)$/, '0$1')
                        + String(dateObj.getDate()).replace(/^(.)$/, '0$1');

                    doFetchReportList(selectedDate);
                }
            });


            // This fetches the list of GMA director reports that this user
            // can use.
            var doFetchReportList = function(selectedDate) {
                $('#report-selector .loading').show();
                AD.ServiceJSON.request({
                    method: 'GET',
                    url: '/service/gmaClient/directorReport?date=' + selectedDate,
                    complete: function() {
                        $('#report-selector .loading').hide();
                    },
                    success: function(response) {
                        var $reportsList = $('select#reports-list');
                        var reports = response.data;
                        // Populate the reports droplist
                        for (var reportID in reports) {
                            $reportsList
                                .append(
                                    '<option value="' + reportID + '">'
                                    + reports[reportID]['reportName']
                                    + '</option>'
                                )
                                .removeAttr('disabled');
                        }
                    },
                    failure: function(err) {
                        var message = err.errorMSG ||
                            "Sorry. There was a problem loading the data from GMA.";
                        $('#report-selector .modal-body').html(
                            '<p>' + message + '</p>'
                            + '<p>Maybe try again later on or ask your GMA admin?</p>'
                        );
                    }
                });
            };



            // When the "Rewind" button is clicked, reset the page to a blank state
            $('.navbar .reset').on('click', rewind);

            // When the "Choose Report" button is clicked, show the report
            // selection dialog.
            $('#choose-report').on('click', function() {
                $('#report-selector').modal('show');
            });

            // When a report is selected from the drop down list, update the MCC list.
            $('select#reports-list').on('change', function() {
                var reportID = $(this).val();
                if (reportID) {
                    fetchReport(reportID)
                        .then(function() {
                            getMCCs(reportID);
                        })
                        .fail(function(err) {
                            AppDev.alert(err.errorMSG);
                        });
                }
            });

            // When an MCC is selected from the drop down list, begin showing the
            // question bubbles.
            $('select#mcc-list').on('change', function() {
                var reportID = $('select#reports-list').val();
                var mcc = $(this).val();
                if (reportID && mcc) {
                    useReport(reportID, mcc);
                }
            });

            // When the "submit" button is clicked, submit the stats to GMA again
            $('#submit').on('click', function() {
                var reportID = $('select#reports-list').val();
                submitMeasurements(reportID);
            });

            $('#dummy-loading-indicator').hide();




            */

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        },


    });


});
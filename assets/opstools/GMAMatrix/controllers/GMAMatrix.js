
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
        'appdev/widgets/ad_icon_busy/ad_icon_busy.js',
        '//opstools/GMAMatrix/controllers/AssignmentList.js',
        '//opstools/GMAMatrix/controllers/StrategyList.js',
        '//opstools/GMAMatrix/controllers/ReportList.js',
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


  //          this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();

            this.setupPage();

			this.gmaMatrixDragDrop();


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
        
        
        // Handle switching tabs between Layout / Entry
        '#gmamatrix-stage-tabs ul li a click': function ($el, ev) {
            // toggle active tab state
            this.element.find('#gmamatrix-stage-tabs ul li a.active-btn').removeClass('active-btn');
            $el.addClass('active-btn');
            
            // hide other sections
            this.element.find('.gmamatrix-stage-section').hide();
            
            // show the selected section
            var target = $el.attr('href');
            switch (target) {
                case '#dashboard':
                    // ...
                    break;
                case '#layout':
                    $('#gmamatrix-layout').show();
                    break;
                case '#entry':
                    $('#gmamatrix-entry').show();
                    break;
            }
            
            ev.preventDefault();
        },
        

		'gmaMatrixDragDrop': function() {

			/* Setup testing draggable categories */
			// See GMAStage.js loadMeasurements()
			// See LayoutMeasurements.js
			/*
			var numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
			
			for ( var i=0; i<10; i++ ) {
			    //$('<div class="gmamatrix-draggable">Category ' + numbers[i] + '</div>').data( 'catNumber', numbers[i] ).attr( 'id', 'gmamatrix-cat-'+numbers[i] ).appendTo( '#gmamatrix-affix' ).draggable( {
				$('<div class="cat-unassigned gmamatrix-draggable">Category ' + numbers[i] + '</div>').data( 'catInfo', { catID: numbers[i], catAssigned: false, catAssignedOther: false, catAssignedNum: 0 } ).attr( 'id', 'gmamatrix-cat-'+numbers[i] ).appendTo( '#gmamatrix-affix' ).draggable( {
					containment: 'document',
					stack: '.gmamatrix-draggable',
					cursor: 'move',
					cursorAt: { top: 16, left: 55 },
					scroll: true,
					revert: true,
					revertDuration: 1,
					opacity: 0.7, 
					helper: "clone"
			    } );
			  }
            */
						
			$('.gmamatrix-droppable-lmi').droppable({
				accept: '.gmamatrix-draggable',
				drop: this.handleDropLMIEvent,
				hoverClass: "gmamatrix-container-hover"
			});
			
			$('.gmamatrix-droppable-other').droppable({
				accept: '.gmamatrix-draggable',
				drop: this.handleDropOtherEvent,
				hoverClass: "gmamatrix-container-hover"
			});
			
			$('.gmamatrix-droppable-cat').droppable({
				accept: '.gmamatrix-return-draggable',
				drop: this.handleDropReturnEvent,
				hoverClass: "gmamatrix-container-hover"
			});
		},
		
		'handleDropLMIEvent': function( event, ui ) {
			var lmiDropCat = $(this).html() == "Staff" ? 'staff' : 'disciple'; // Determine if user dropped category on 'Staff' or 'Disciple'
			var catID = ui.draggable.data( 'catInfo' ).catID; // Determine the category ID

			if ($(this).parent().siblings('ul.gmamatrix-li-' + lmiDropCat).children('#gmamatrix-return-cat-' + catID).length == 0 && ui.draggable.data('catInfo').catAssignedOther == false) {
				ui.draggable.data('catInfo').catAssigned = true; // Category has now been assigned to at least one LMI element
				ui.draggable.data('catInfo').catAssignedNum++; // Track number of LMI elements to which the category has been assigned
				
				$(this).parents('.gmamatrix-container').children('ul.gmamatrix-li-' + lmiDropCat).append('<li class="gmamatrix-return-draggable" id="gmamatrix-return-cat-' + catID + '">' +  ui.draggable.html() +'</li>');
				$(this).parent().siblings('ul.gmamatrix-li-' + lmiDropCat).children('#gmamatrix-return-cat-' + catID).data( 'catReturnInfo', { catReturnID: catID }).draggable( {
					containment: 'document',
					stack: '.gmamatrix-return-draggable',
					cursor: 'move',
					cursorAt: { top: 16, left: 55 },
					revert: true,
					revertDuration: 1,
					opacity: 0.7,
					helper: "clone"
			    } );
			
				if (ui.draggable.hasClass('cat-unassigned')) {
					ui.draggable.removeClass('cat-unassigned').addClass('cat-assigned');
				}
			}
			
		},
		
		'handleDropReturnEvent': function( event, ui ) {
			var catReturnID = ui.draggable.data( 'catReturnInfo' ).catReturnID;
			var catObj = $(this).children('#gmamatrix-cat-' + catReturnID);
			catObj.data( 'catInfo' ).catAssignedNum--;
			catObj.data( 'catInfo' ).catAssigned = catObj.data( 'catInfo' ).catAssignedNum == 0 ? false : true;
			catObj.data( 'catInfo' ).catAssignedOther = false;
			if (!catObj.data( 'catInfo' ).catAssigned) {
				if (catObj.hasClass('cat-assigned')) {
					catObj.removeClass('cat-assigned').addClass('cat-unassigned');
				}
			}
			
			// Remove <li> element from LMI container
			ui.draggable.remove();

		},
		
		'handleDropOtherEvent': function( event, ui ) {
			var catID = ui.draggable.data( 'catInfo' ).catID; // Determine the category ID
			if ($(this).find('#gmamatrix-return-cat-' + catID).length == 0 && ui.draggable.data('catInfo').catAssigned == false) {
				ui.draggable.data('catInfo').catAssignedOther = true; // Category has now been assigned to the "Other" element
				ui.draggable.data('catInfo').catAssignedNum++; // Track number of LMI elements to which the category has been assigned
				
				$(this).children('ul.gmamatrix-li-other').append('<li class="gmamatrix-return-draggable" id="gmamatrix-return-cat-' + catID + '">' +  ui.draggable.html() +'</li>');
				$(this).find('#gmamatrix-return-cat-' + catID).data( 'catReturnInfo', { catReturnID: catID }).draggable( {
					containment: 'document',
					stack: '.gmamatrix-return-draggable',
					cursor: 'move',
					cursorAt: { top: 16, left: 55 },
					revert: true,
					revertDuration: 1,
					opacity: 0.7,
					helper: "clone"
			    } );
			
				if (ui.draggable.hasClass('cat-unassigned')) {
					ui.draggable.removeClass('cat-unassigned').addClass('cat-assigned');
				}
				
				//ui.draggable.disable();
			}
		}


    });


});
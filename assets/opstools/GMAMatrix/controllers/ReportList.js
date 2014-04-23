
steal(
        // List your Controller's dependencies here:
        'appdev',
        'opstools/GMAMatrix/classes/GMAReport.js',
//        'bootstrap/js/bootstrap.min.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/ReportList/ReportList.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.ReportList = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                templateDOM: '//opstools/GMAMatrix/views/ReportList/ReportList.ejs',
                templateItem: '//opstools/GMAMatrix/views/ReportList/item.ejs'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);

            // UI elements
            this.itemContent = null;

            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();

            // on a new assignment, refresh our report list:
            AD.comm.hub.subscribe('gmamatrix.assignment.selected',
                function (key, data) {

                AD.sal.setImmediate( function() {

                    data.model.reports()
                        .then(function(list){
                            self.data(list);
                        })
                        .fail(function(err){
                            console.error('Error retrieving reports from ');
                            console.log(data.model);
                        });

                });

            });
        },



        chooseDefault:function(){

            var maxTime = -1;
            var defaultReport = null;

            // let's choose the 'latest' report as our default
            for (var d=0; d<this.dataSource.length; d++){
                var date = new Date(this.dataSource[d].startDate);
                if ( date > maxTime) {
                    maxTime = date;
                    defaultReport = this.dataSource[d];
                }
            }

            // make sure this entry is selected
            this.itemContent.val(defaultReport.getID()).change();

        },



        clearData: function() {
            this.itemContent.children().remove();
        },



        createContent: function(){

            for (var d =0; d<this.dataSource.length; d++ ) {
                this.createItem(this.dataSource[d]);
            }
        },



        createItem:function(item){

            this.itemContent
                .append(can.view(this.options.templateItem, {item:item}));

            // store the item with this element
            this.itemContent
                .find('[value="'+item.getID()+'"]')
                .data('model', item);
        },



        data:function(data){
            this.dataSource = data;
            this.clearData();
            this.createContent();
            this.chooseDefault();
        },



        initDOM: function () {

            this.element.html(can.view(this.options.templateDOM, {} ));

            // .itemContent = <select>
            this.itemContent =
                this.element.find('.gmamatrix-report-reportlist-items');

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        },



        'select change': function($el, ev) {

            // grab the report object tied to the selected value
            var report = $el.find('[value='+$el.val()+']').data('model');

            // tell everyone about our selected report
            AD.comm
              .hub
              .publish('gmamatrix.report.selected', { report: report});

        }



    });


});

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

        defaults: {
        }

    }, {

        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                templateDOM: '//opstools/GMAMatrix/views/ReportList/ReportList.ejs'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);

            // UI elements
            this.itemContent = null;

            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();
            
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



        data: function(data) {
            this.list.data(data);
        },



        initDOM: function () {

            // add in the GenericList to our report list div
            this.list = new AD.controllers.GMAList(this.element, {
                title:'Reports',
                description: 'Choose the reporting period.',
                //dataSource: this.dataSource,
                //templateItem:'//opstools/GMAMatrix/views/AssignmentList/item.ejs',
                notification_selected:'gmamatrix.report.selected',
                onAdd:function() { self.addItem();  }
            });

        },

        show: function() {
            this.element.show();
        },
        hide: function() {
            this.element.hide();
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
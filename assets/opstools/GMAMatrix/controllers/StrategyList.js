
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/StrategyList/StrategyList.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.StrategyList = AD.classes.UIController.extend({


        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                templateDOM: '//opstools/GMAMatrix/views/StrategyList/StrategyList.ejs',
                templateItem: '//opstools/GMAMatrix/views/StrategyList/item.ejs',
            }, options);

            // Call parent init
            AD.classes.UIController.apply(this, arguments);

            // UI elements
            this.itemContent = null;

            this.dataSource = null;

            this.initDOM();

            // once the strategies are loaded then update our data();
            AD.comm.hub.subscribe('gmamatrix.strategies.loaded',function(key, data) {
                AD.sal.setImmediate( function() {
                    self.data(data.strategies);
                });
            });

        },



        chooseDefault:function(){

            var maxTime = -1;
            var defaultReport = null;


            // choose the 1st one
            if (this.dataSource.length > 0) {
                // make sure this entry is selected
                this.itemContent.val(this.dataSource[0]).change();
            }

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
                .find('[value="'+item+'"]')
                .data('model', { id: item, label:item });
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
                this.element.find('.gmamatrix-report-strategylist-items');

        },



        '.ad-item-add click': function ($el, ev) {

            ev.preventDefault();
        },



        'select change': function($el, ev) {

            // grab the report object tied to the selected value
            var strategy = $el.find('[value='+$el.val()+']').data('model');

            // tell everyone about our selected report
            AD.comm
              .hub
              .publish('gmamatrix.strategy.selected', { strategy: strategy});

        }


    });


});
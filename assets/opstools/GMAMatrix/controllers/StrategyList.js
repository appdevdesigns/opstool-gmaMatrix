
steal(
        // List your Controller's dependencies here:
        'appdev',
        '//opstools/GMAMatrix/views/StrategyList/StrategyList.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    // if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    // if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    // AD.controllers.opstools.GMAMatrix.StrategyList = AD.classes.UIController.extend({
    AD.Control.extend('opstools.GMAMatrix.StrategyList', {


        defaults: {
            busy: function (isBusy) {
                // This does nothing and is meant to be overidden by passing in
                // a replacement function.
            }
        }
    
    }, {
    
        init: function (element, options) {
            var self = this;
            this.options = AD.defaults({
                templateDOM: '//opstools/GMAMatrix/views/StrategyList/StrategyList.ejs'
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
            this.list.data(data);
        },



        initDOM: function () {

            // add in the GenericList to our report list div
            this.list = new AD.controllers.GMAList(this.element, {
                title:'Strategy',
                description: 'Choose the strategy.',
                //dataSource: this.dataSource,
                //templateItem:'//opstools/GMAMatrix/views/AssignmentList/item.ejs',
                notification_selected:'gmamatrix.strategy.selected',
                onAdd:function() { self.addItem();  }
            });

        },


        // Allow the parent controller to set this list's data
        setData: function(data) {
            this.dataSource = data;
            this.list.data(data);
        },
        
        
        // Allow the parent controller to set the selected list item
        setSelectedItem: function(id) {
            // Select item, but suppress sending AD.comm message
            this.list.setCurrentItemByID(id, true);
        },
        
        
        show: function() {
            this.element.show();
        },
        hide: function() {
            this.element.hide();
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
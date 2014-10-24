
steal(
        // List your Controller's dependencies here:
        'appdev',
function(){



    AD.controllers.GMAList = AD.classes.UIController.extend({


        init: function( element, options ) {
            this.options = AD.defaults({
                    dom_listarea:'.gmalist-list',
                    notification_selected:null,
                    templateDOM: '/opstools/GMAMatrix/views/GMAList/GMAListDOM.ejs',
                    templateItem: '/opstools/GMAMatrix/views/GMAList/GMAListItem.ejs',
                    title: 'List',
                    onAdd:null,
                    onEdit:null,
                    description:null
            }, options);

            this.dataSource = this.options.dataSource; // AD.models.Projects;
            this.currentItem = null;

            this.initDOM();
            this.loadItems();

        },



        clear:function() {
            this.data();
        },



        clearItemList: function() {
            this.currentItem = null;
            
            // Set the default item label
            this.element.find('.gmalist-selected-label').html(this.options.title);

            var items = this.element.find(this.options.dom_listarea);
            items.children().each(function(index, item){
                item.remove();
                });
        },


        /**
         * Sets the data source for the list.
         *
         * @param array dataList
         *      Either an array of model object instances
         *      or an array of strings/numbers
         *      or a basic object containing the ID -> label values
         */
        data:function(dataList) {
            // Simple constructor for creating objects that resemble models 
            var liteModel = function (id, val) {
                val = val || id;
                this.id = id;
                this.value = val;
            };
            liteModel.prototype.getID = function() { return this.id; };
            liteModel.prototype.label = function() { return this.value; };
            
            // Handle arrays of models / strings / numbers
            if (Array.isArray(dataList)) {
                for (var i=0; i<dataList.length; i++) {
                    // Convert primitve data elements into objects that
                    // can be used by the GMAList.
                    if (typeof dataList[i] != 'object') {
                        dataList[i] = new liteModel(dataList[i]);
                    }
                }
                this.dataSource = dataList;
            } 
            // Handle basic objects
            else {
                this.dataSource = [];
                for (var id in dataList) {
                    this.dataSource.push(new liteModel(id, dataList[id]));
                }
            }
        
            this.loadItems();
        },



        initDOM: function() {

            this.element.html(can.view(this.options.templateDOM, {
                title: this.options.title,
                description: this.options.description
            } ));


            this.button = {};

            this.button.add = this.element.find('.gmalist-button-add');
            if (this.options.onAdd) {
                this.button.add.click( this.options.onAdd );
            } else {
                this.button.add.hide();
            }

            this.button.edit = this.element.find('.gmalist-button-edit');
            if (this.options.onEdit) {
                this.button.edit.click( this.options.onEdit );
            } else {
                this.button.edit.hide();
            }

        },

		resize: function(height) {
		    // the height of our list should =
		    // given height
		    // - height of our mastHead
		    // - 5px buffer between mastHead and list
		    // - 15px margin on bottom

		    this.element.find('.gmalist-widget-inner').css("height", height+'px');

		    var mastheadHeight = this.element.find(".opsportal-widget-masthead").outerHeight(true);
			
			// what is the point of subtracting 15? Adds a gap above the bottom button...removing it for now.
			//this.element.find('.hris-nav-list').css("height", (height -mastheadHeight -5 -15) + "px");
			this.element.find('.opsportal-nav-list').css("height", (height -mastheadHeight -5) + "px");

			// now we apply a padding to our widget container so that the list drops below the masthead
			this.element.find(".gmalist-widget-inner")
			    .css("padding-top", (mastheadHeight+5) + "px");

        },


        loadItem: function(item, listArea) {
            var self = this;

            if (!listArea) {
                listArea = this.element.find(this.options.dom_listarea);
            }
            var domFrag = can.view(this.options.templateItem, { item: item });
            listArea[0].appendChild(domFrag);

            var itemLI = listArea.find('[gma-list-del-id='+item.getID()+']');
            itemLI.data('ad-model', item);

            //// now on each model displayed, listen to it's destroyed event
            // when destroyed, .remove() this domFrag.
            if (item.bind) {
                var bindThis = function(model, frag) {

                    var delThis = function (ev, attr){
                        if (attr == 'destroyed') {
                            self.element.find('[gma-list-del-id='+model.id+']').remove();
                        }
                    };
                    model.bind('change',delThis);

                };
                bindThis(item, domFrag);
            }

        },



        loadItems: function() {
            var listArea = this.element.find(this.options.dom_listarea);

            this.clearItemList();
            if (this.dataSource) {
                for (var i=0; i<this.dataSource.length; i++) {
                    this.loadItem(this.dataSource[i], listArea);
                }
            }
        },
        
        
        
        getCurrentItem: function() {
            return this.currentItem;
        },
        
        
        
        setCurrentItemByID: function(id, shouldSuppressMsg) {
            // skip if current item has the same ID
            if (!this.currentItem || this.currentItem.getID() != id) {
                for (var i=0; i<this.dataSource.length; i++) {
                    if (this.dataSource[i].getID() == id) {
                        var $item = this.element.find("li[gma-list-del-id='" + id + "']");
                        this.setCurrentItem($item, shouldSuppressMsg);
                    }
                }
            }
        },
        
        
        setCurrentItem: function($el, shouldSuppressMsg) {
            //  hris-active hris-active-object
            this.element.find('.gmalist-active').each(function(index, item) {
                $(item).removeClass('gmalist-active gmalist-active-object');
            });

            // add the selected class to this li
            $el.addClass('gmalist-active');
            $el.addClass('gmalist-active-object');
            
            var model = $el.data('ad-model');

            // set the new label for the list
            var label = model.label();
            this.element.find('.gmalist-selected-label').html(label);
            
            this.currentItem = model;
            
            // send a message
            if (!shouldSuppressMsg) {
                // AD.comm.hub notification
                if (this.options.notification_selected) {
                    AD.comm.hub.publish(this.options.notification_selected, { model: model });
                }
                // jQuery event
                this.element.trigger('item-selected', [{ model: model }]);
            }
        },



        'li.gmalist-item click': function($el, ev) {
            this.setCurrentItem($el, false);
            ev.preventDefault();
        }


    });

});
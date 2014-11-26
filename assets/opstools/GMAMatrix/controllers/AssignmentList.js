
steal(
        // List your Controller's dependencies here:
        'appdev',
        'opstools/GMAMatrix/controllers/GMAList.js',
        'opstools/GMAMatrix/classes/GMAAssignment.js',
        '//opstools/GMAMatrix/views/AssignmentList/AssignmentList.ejs',
function(){

    // Namespacing conventions:
    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
    AD.Control.extend('opstools.GMAMatrix.AssignmentList', {


        defaults: {
        }

    }, {

        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/GMAMatrix/views/AssignmentList/AssignmentList.ejs'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);


            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();
            
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
        
        
        initDOM: function () {

            //this.element.html(can.view(this.options.templateDOM, {} ));

            // add in the GenericList to our report list div
            this.list = new AD.controllers.GMAList(this.element, {
                title: 'Team',
                description: 'Choose the GMA nodes you are allowed to report on.',
                //dataSource: this.dataSource,
                //templateItem:'//opstools/GMAMatrix/views/AssignmentList/item.ejs',
                notification_selected:'gmamatrix.assignment.selected',
                onAdd:function() { self.addItem();  }
            });
        },
        
        show: function() {
            this.element.show();
        },
        hide: function() {
            this.element.hide();
        }


    });


});
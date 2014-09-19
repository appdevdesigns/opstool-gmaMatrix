
steal(
        // List your Controller's dependencies here:
        'appdev',
        'opstools/GMAMatrix/controllers/GMAList.js',
        'opstools/GMAMatrix/classes/GMAAssignment.js',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/ReportList/ReportList.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.AssignmentList = AD.classes.UIController.extend({

        defaults: {
            busy: function (isBusy) {
                // This does nothing and is meant to be overidden by passing in
                // a replacement function.
            }
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
            
            self.options.busy(true);
            AD.classes.gmamatrix.GMAAssignment.assignments()
            .then(function(list){
                self.dataSource = list;
                self.list.data(list);
                
                if (list.length == 0) {
                    alert('No GMA assignments found');
                }
                
            })
            .fail(function(err){
                console.error(err);
                alert('Unable to load GMA assignments');
            })
            .always(function(){
                self.options.busy(false);
            });


            // listen for resize notifications
            // Why?
            /*
            AD.comm.hub.subscribe('gmamatrix.resize', function (key, data) {
                self.element.css("height", data.height + "px");

                //self.list.resize(data.height);
            }); 
            */
        },



        initDOM: function () {

            //this.element.html(can.view(this.options.templateDOM, {} ));

            // add in the GenericList to our report list div
            this.list = new AD.controllers.GMAList(this.element, {
                title:'Assignments',
                description: 'Choose the GMA nodes you are allowed to report on.',
                //dataSource: this.dataSource,
                //templateItem:'//opstools/GMAMatrix/views/AssignmentList/item.ejs',
                notification_selected:'gmamatrix.assignment.selected',
                onAdd:function() { self.addItem();  }
            });
        }


    });


});
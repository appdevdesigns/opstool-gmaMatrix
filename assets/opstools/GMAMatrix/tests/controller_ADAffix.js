// Dependencies
steal(
    "opstools/GMAMatrix/controllers/ADAffix.js"
)

// Initialization
.then(function(){

    // the div to attach the controller to
    var divID = 'test_ADAffix';

    // add the div to the window
    var buildHTML = function() {
        var html = [
                    '<div id="'+divID+'">',
                    '</div>'
                    ].join('\n');

        $('body').append($(html));
    }
    

    //Define the unit tests
    describe('testing controller AD.controllers.opstools.GMAMatrix.ADAffix ', function(){

        var testController = null;

        before(function(){

            buildHTML();

            // Initialize the controller
            testController = new AD.controllers.opstools.GMAMatrix.ADAffix($('#'+divID), { some:'data' });

        });



        it('controller definition exists ', function(){
            assert.isDefined(AD.controllers.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.GMAMatrix , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.GMAMatrix.ADAffix, ' :=> should have been defined ');
        });


    });


});
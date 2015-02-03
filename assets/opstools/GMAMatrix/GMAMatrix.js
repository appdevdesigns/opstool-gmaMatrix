steal(
        // List your Page's dependencies here:
        '//opstools/GMAMatrix/controllers/GMAMatrix.js',
        '//opstools/GMAMatrix/matrix.css',
        '//opstools/GMAMatrix/matrix-scratch.css',
'http://code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css',
        'site/labels/opstools-GMAMatrix.js',

        //// Load Wijimo!  The monolithic UI Graphing Library for sweet Eye Candy!
// we really should use the cdn.
// but for dev purposes, we are currently using local copies:
//// NOTE : don't change them here.  Change them in the build.config.js 
////        settings under the paths: {} section.
        // 'http://cdn.wijmo.com/themes/aristo/jquery-wijmo.css',
        // 'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.css',
        // 'http://cdn.wijmo.com/jquery.wijmo-open.all.3.20142.45.min.js' 
                            
        'jquery-wijmo.css',
        'wijmo-pro.css',
        'wijmo-open.js'

).then(
	// 'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.js' 
        'wijmo-pro.js'
).then(function(){

});
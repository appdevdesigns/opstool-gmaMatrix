module.exports={
    // map: {
    //     "*": {
    //       "jquery/jquery.js" : "jquery",
    //       "can/util/util.js": "can/util/jquery/jquery.js"
    //     }
    // },
    paths: {
        
        "wijmo-open.js"   : "js/jquery.wijmo-open.all.3.20142.45.min.js",   // 'http://cdn.wijmo.com/jquery.wijmo-open.all.3.20142.45.min.js'
        "wijmo-pro.css": "styles/jquery.wijmo-pro.all.3.20142.45.min.css",  // 'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.css'
        "wijmo-pro.js" : "js/jquery.wijmo-pro.all.3.20142.45.min.js",       // 'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.js'
        "jquery-wijmo.css" : "styles/jquery-wijmo.css", // 'http://cdn.wijmo.com/themes/aristo/jquery-wijmo.css'

        // "dropzone.js" : "js/dropzone.min.js",
        // "dropzone.css" : "styles/dropzone.css"
    },
    shim : {

        'wijmo-open.js' : { packaged:false },
        'wijmo-pro.css' : { packaged:false },
        'wijmo-pro.js' : { packaged:false },
        'jquery-wijmo.css' : { packaged:false },

        // 'dropzone.js' : { packaged:false },
        // 'dropzone.css' : {packaged:false },
        'site/labels/opstools/GMAMatrix.js' : { packaged:false, ignore:true }


    }
    // ext: {
    //     js: "js",
    //     css: "css",
    //     less: "steal/less/less.js",
    //     coffee: "steal/coffee/coffee.js",
    // }
};
    



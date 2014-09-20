/**
* Placement
*
* @module      :: Model
* @description :: Stores the LMI locations where each measurement will be placed
* @docs     :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    tableName:"gmamatrix_placement",
    autoCreatedAt:false,
    autoUpdatedAt:false,
    autoPK:false,
    migrate:'safe',  // don't update the tables!


    connection: ['mysql'],
    config:{
        pool:false
    },


    attributes: {
        
        id: 'INTEGER',
        
        measurement_id: 'INTEGER',

        // not strictly needed, but used for doing reverse lookups
        node_id: 'INTEGER',
        report_id: 'INTEGER',
        
        // key is made up of the first letters the LMI's name
        location: 'STRING',
        
        // order of appearance when two or more measurements have the same location
        order: 'INTEGER',
        
        // 'staff' vs 'disciple'
        type: 'STRING'
        
    }

};

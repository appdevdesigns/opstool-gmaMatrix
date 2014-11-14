/**
* Placement
*
* @module      :: Model
* @description :: Stores the LMI locations where each measurement will be placed
* @docs     :: http://sailsjs.org/#!documentation/models
*/
var AD = require('ad-utils');

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
        
    },
    
    
    ////////////////////////////
    //  Custom model methods
    ////////////////////////////
    
    
    // Given a measurement, find all other measurements that ultimately roll up
    // to it.
    // This queries the GMA server directly, and not the local placement table.
    //
    // @param int measurementID
    //      The measurement to trace.
    // @return Deferred
    //      Resolves with an array of measurement_id values.
    traceDescendants: function(measurementID) {
        var dfd = AD.sal.Deferred();
        
        AD.sal.http({
            method: 'GET',
            url: sails.config.gmaMatrix.traceDescendantsURL
        })
        .fail(function(err){
            dfd.reject(err);
        })
        .done(function(result){
            dfd.resolve(result.data.descendants);
        });
        
        return dfd;
    },
    
    
    updateDescendants: function(measurementID, properties) {
        var dfd = AD.sal.Deferred();
        
        Placement.traceDescendants(measurementID)
        .fail(function(err){
            dfd.reject(err);
        })
        .done(function(list) {
            Placement.update({ measurement_id: list }, properties)
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            })
            .done();
        });

        return dfd;
    },



    // Find all GMA measurements and group them together by their roll up.
    // This queries the GMA server directly, and not the local placement table.
    //
    // @return Deferred
    //      Resolves with an array of arrays of measurement_id values.
    //        [
    //            [ 1, 2, 3, ... ],
    //            [ 8, 9, 10, ... ],
    //            ...
    //        ]
    measurementGroups: function() {
        var dfd = AD.sal.Deferred();
        
        AD.sal.http({
            method: 'GET',
            url: sails.config.gmaMatrix.groupsURL
        })
        .fail(function(err){
            dfd.reject(err);
        })
        .done(function(result){
            dfd.resolve(result.data.measurements);
        });
        
        return dfd;
    },
    
    
    
    // Map all GMA measurements to their LMI placements.
    // Requires at least one node to have had its LMI placements already
    // mapped out in the local placement table.
    mapAllMeasurements: function() {
        var dfd = AD.sal.Deferred();
        
        var groups = [];
        var measurements = [];
        
        async.series([
            // Get roll up groupings.
            // GMA measurements that ultimately roll up to the same ancestor
            // will be grouped together.
            function(next){
                Placement.measurementGroups()
                .fail(function(err){
                    next(err);
                })
                .done(function(result){
                    groups = result;
                    next();
                });
            },
            
            // Search local DB for any existing LMI placement within each
            // group.
            function(next){
                async.eachLimit(groups, 10, function(group, ok) {
                    
                    // Search for an existing placement match for this group
                    Placement.find({
                        where: { 'measurement_id': group },
                        sort: 'measurement_id ASC',
                        limit: 1
                    })
                    .then(function(result){
                        if (result.length > 0) {
                            // All measurements within the group will be
                            // assigned the same LMI and type.
                            for (i=0; i<group.length; i++) {
                                measurements.push({
                                    measurement_id: group[i],
                                    location: result[0]['location'],
                                    type: result[0]['type']
                                });
                            }
                        }
                        ok();
                    })
                    .fail(function(err){
                        ok(err);
                    });
                    
                }, function(err){
                    if (err) next(err);
                    else next();
                });
            },
            
            // Save measurement placements.
            function(next){
                async.eachLimit(measurements, 10, function(m, ok) {
                    
                    Placement.find({ 'measurement_id': m.measurement_id })
                    .then(function(list){
                        // Don't change existing mappings
                        if (list && list.length > 0) {
                            ok();
                        } 
                        // Create new mapping
                        else {
                            Placement.create(m)
                            .then(function(){
                                ok();
                            })
                            .fail(function(err){
                                ok(err);
                            });
                        }
                    })
                    .fail(function(err){
                        ok(err);
                    });
                
                }, function(err){
                    if (err) next(err);
                    else next();
                });
            }
            
        ], function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve();
        });
        
        return dfd;
    }
    

};

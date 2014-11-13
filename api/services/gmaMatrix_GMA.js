/**
 * gmaMatrix_GMA
 */
 
var GMA = require('gma-api');
var AD = require('ad-utils');

// User GMA sessions will forcefully expire after this amount of inactive time.
var sessionTimeLimit = 1000 * 60 * 60; // 60 minutes

// If a new request is made within this time, assume the existing connection
// to GMA is still valid.
var softTimeLimit = 1000 * 60 * 5; // 5 minutes

// Memory store of user GMA sessions
var gmaStore = {
/*
    <session_id>: {
        gma: <GMA object>,
        time: <Date object>
    },
    ...
*/
};

// Clear old sessions from memory store periodically
setInterval(function(){
    var now = new Date();
    for (var sessionID in gmaStore) {
        var sessionTime = gmaStore[sessionID].time;
        if (now - sessionTime > sessionTimeLimit) {
            delete gmaStore[sessionID];
        }
    }
}, 1000*60); // check once a minute


module.exports = {
    
    /**
     * Delivers the GMA object associated with the user's session.
     * A new object will be created if one does not already exist.
     *
     * @param httpRequest req
     * @return Deferred
     */
    getSession: function(req) {
        var id = req.sessionID;
        var self = this;
    
        if (id && gmaStore[id]) {
            var dfd = AD.sal.Deferred();
            var gma = gmaStore[id].gma;
            var previousTime = gmaStore[id].time;
            var now = new Date();
            
            if (now - previousTime > softTimeLimit) {
                // Check GMA connection
                gma.getUser()
                .done(function(){
                    // Refresh timestamp
                    gmaStore[id].time = new Date();
                    // Deliver the user's old GMA object
                    dfd.resolve( gma );
                })
                .fail(function(){
                    // Failed check. Make a new GMA session.
                    delete gmaStore[id];
                    self.newSession(req)
                    .fail(dfd.reject)
                    .done(dfd.resolve);
                });
            } else {
                // Still within soft time limit. Assume old GMA connection is
                // valid.
                dfd.resolve( gma );
            }
            
            return dfd;
        
        }
        else {
            // No existing session found. Make a new one.
            return self.newSession(req);
        }
    },
    

    /**
     * Creates a new GMA object and associates it with the user's session.
     * The user will be logged in to the GMA server using CAS proxy 
     * authentication.
     *
     * @param httpRequest req
     * @return GMA
     */
    newSession: function(req) {
        var dfd = AD.sal.Deferred();
        var id = req.sessionID; // <-- from express / sailsJS
        
        var gma = new GMA({
            gmaBase: sails.config.gmaMatrix.gmaBaseURL,
            forwardedFor: '1.2.3.4.5',
            log: AD.log
        });
        
        CAS.getProxyTicket(req, gma.gmaHome)
        .fail(function(err){
            AD.log('Unable to obtain CAS proxy ticket');
            AD.log(err);
            console.log(err);
            dfd.reject(err);
        })
        .done(function(ticket){
            gma.loginWithTicket(ticket)
            .fail(function(err){
                AD.log('Unable to log in to GMA', err);
                console.log(err); // AD.log doesn't display the err?
                dfd.reject(err);
            })
            .done(function(){

                gmaStore[id] = {
                    gma: gma,
                    time: new Date()
                }
                dfd.resolve(gma);

            });
        });
        
        return dfd;
    },
    
    
    // Map all GMA measurements to their LMI placements.
    // Requires at least one node to have had its LMI placements already
    // mapped out.
    mapAllMeasurements: function() {
        var dfd = AD.sal.Deferred();
        var self = this;
        
        var groups = [];
        var measurements = [];
        
        async.series([
            // Get roll up groupings.
            // GMA measurements that ultimately roll up to the same ancestor
            // will be grouped together in the same array.
            function(next){
                AD.sal.http({
                    url: sails.config.gmaMatrix.groupsURL,
                    method: 'GET'
                })
                .fail(function(err){
                    next(err);
                })
                .done(function(result){
                    /*
                        result == {
                            success: true,
                            data: {
                                measurements: [
                                    [ 1, 2, 3, ... ],
                                    [ 8, 9, 10, ... ],
                                    ...
                                ]
                            }
                        }
                    */
                    groups = result.data.measurements;
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
    },



    // Map the measurement placements of nodes that the current user is
    // assigned to.
    mapUserMeasurements: function(req) {
        var dfd = AD.sal.Deferred();
        var self = this;
        var gma;
        
        var assignments = [];
        var measurements = [];
        var placements = [];
        
        async.series([
            // Get user's GMA session
            function(next){
                self.getSession(req)
                .fail(function(err) { next(err); })
                .done(function(sessionGMA) {
                    gma = sessionGMA;
                    next();
                });
            },
            
            // Get user's assignments
            function(next){
                gma.getAssignments()
                .fail(function(err) { next(err); })
                .done(function(byID, byName, list) {
                    assignments = list;
                    next();
                });
            },
            
            // Get all assignment measurements
            function(next){
                async.eachLimit(assignments, 10, function(assignment, ok) {

                    assignment.getMeasurements()
                    .fail(function(err) { ok(err); })
                    .done(function(list) {
                        measurements = measurements.concat(list);
                        ok();
                    });

                }, function(err) {
                    if (err) next(err);
                    else next();
                });
            },
            
            // Get all measurement placements
            function(next){
                async.eachLimit(measurements, 10, function(measurement, ok) {
                    AD.sal.http({
                        method: 'GET',
                        url: sails.config.gmaMatrix.traceRollUpURL,
                        data: { measurementId: measurement.id() }
                    })
                    .fail(function(err) { next(err); })
                    .done(function(result) {
                        var id = result.rootMeasurementId;
                        
                        Placement.find({ measurement_id: id })
                        .then(function(list) {
                            for (var i=0; i<list.length; i++) {
                                placements.push({
                                    measurement_id: measurement.id(),
                                    node_id: list[i].node_id,
                                    location: list[i].location,
                                    type: list[i].type
                                });
                            }
                            ok();
                        })
                        .fail(function(err) {
                            ok(err);
                        });
                        
                    });
                }, function(err) {
                    if (err) next(err);
                    else next();
                });
            },
            
            // Save placements
            function(next){
                async.eachLimit(placements, 10, function(p, ok) {
                    
                    Placement.create(p)
                    .then(function(){
                        ok();
                    })
                    .fail(function(err){
                        ok(err);
                    });
                    
                }, function(err) {
                    if (err) next(err);
                    else next();
                });
            }
        
        ], function(err) {
            if (err) { 
                dfd.reject(err); 
            } else {
                dfd.resolve();
            }
        });
        
        return dfd;
    }

};


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
    }

};


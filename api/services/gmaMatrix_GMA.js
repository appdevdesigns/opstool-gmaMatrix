/**
 * gmaMatrix_GMA
 */
 
var GMA = require('gma-api');
var AD = require('ad-utils');

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

// Clear old sessions from memory store every 2 hours 
setInterval(function(){
    var now = new Date();
    var expiration = 1000 * 60 * 120; // 120 minutes
    for (var sessionID in gmaStore) {
        if (now - gmaStore[sessionID].time  > expiration) {
            delete gmaStore[sessionID];
        }
    }
}, 60*60*2);


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
    
        if (id && gmaStore[id]) {
            var dfd = AD.sal.Deferred();
            // Refresh timestamp
            gmaStore[id].time = new Date();
            // Return the user's old GMA object
            dfd.resolve( gmaStore[id].gma );
            return dfd;
        } 
        else {
            return this.newSession(req);
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
        var id = req.sessionID;
        
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


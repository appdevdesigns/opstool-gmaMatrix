/**
 * GMAReportsController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */


var role = 'director';

module.exports = {




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to GMAReportsController)
   */

  _config: {}

  // url:get  /gmamatrix/assignments
  , assignments:function(req, res) {
      
      var results = [
      /*
        { nodeId: <int>, nodeName: <string> },
        { nodeId: <int>, nodeName: <string> },
        ...
      */
      ];
      
      gmaMatrix_GMA.getSession(req)
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done(function(gma){
        
        console.log('gma:', gma);
        
        gma.getAssignments(role)
        .fail(function(err){
            ADCore.comm.error(res, err);
        })
        .done(function(byID, byName, list){

            for (var id in byID) {
                results.push({
                    nodeId: id,
                    nodeName: byID[id]
                });
            }
            ADCore.comm.success(res, results);
            
        });
        
      });
      
  }



  // url:get  /gmamatrix/reports?nodeId=x
  , reports:function(req, res) {

      var nodeId = req.param('nodeId');
      var results = [
      /*
        {
            reportId: <int>,
            nodeId: <int>,
            nodeName: <string>,
            startDate: "yyyy/mm/dd",
            endDate: "yyyy/mm/dd"
        },
        ...
      */
      ];
      
      gmaMatrix_GMA.getSession(req)
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done(function(gma){
        
        gma.getReportsForNode(nodeId, role)
        .fail(function(err){
            ADCore.comm.error(res, err);
        })
        .done(function(reports){
            
            // 
            for (var i=0; i<reports.length; i++) {
                var report = reports[i];
                results.push({
                    reportId: report.id(),
                    nodeId: report.nodeId,
                    nodeName: report.nodeName,
                    startDate: report.startDate,
                    endDate: report.endDate
                });
            }
            ADCore.comm.success(res, results);
        
        })
        
      });
      
  }



  // url:get  /gmamatrix/measurements?reportId=x
  , measurements:function(req, res) {
      
      var reportId = req.param('reportId');

      if (!reportId) {
        ADCore.comm.error(res, new Error("reportId required"));
        return;
      }
      
      
      var results = {
      /*
        <strategyName>: [
            {
                reportId: int,
                measurementId: int,
                measurementName: string,
                measurementDescription: string,
                measurementValue: number
            },
            ...
        ],
        <strategyName>: [ ... ],
        ...
      */
      };
      
      gmaMatrix_GMA.getSession(req)
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done(function(gma){

            var report = gma.getReport(reportId, role);
            report.measurements()
            .fail(function(err){
                ADCore.comm.error(res, err);
            })
            .done(function(data){
                
                // iterate over each strategy
                for (var strategy in data) {
                    var measurements = data[strategy];
                    results[strategy] = [];
                    
                    // iterate over each measurement
                    for (var i=0; i<measurements.length; i++) {
                        var m = measurements[i];
                        results[strategy].push({
                            reportId: reportId,
                            measurementId: m.id(),
                            measurementName: m.label(),
                            measurementDescription: m.measurementDescription,
                            measurementValue: m.value()
                        });
                    }
                }
                
                ADCore.comm.success(res, results);
            
            });

      });
      
  }
  
  
  // url: post /gmamatrix/measurement/[measurementId]?reportId=x&value=y
  , "saveMeasurement": function(req, res) {
      var measurementID = req.param('measurementId');
      var reportID = req.param('reportId');
      var value = req.param('value');
      
      gmaMatrix_GMA.getSession(req)
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done(function(gma){

            var report = gma.getMeasurement(measurementID, reportID, role);
            report.value(value);
            report.save()
            .fail(function(err){
                ADCore.comm.error(res, err);
            })
            .done(function(){
                ADCore.comm.success(res, 'SAVED');
            });
      });
  }

  
  // url:put /gmamatrix/placements/[measurementId]?reportId=x&nodeId=y&type=z
  , "savePlacements": function(req, res) {
      var reportID = req.param('reportId');
      var measurementID = req.param('measurementId');
      var nodeID = req.param('nodeId');
      var type = req.param('type'); // staff vs disciple
      var location = req.param('location');
      
      Placement.find({ measurement_id: measurementID })
      .then(function(data){
        // Update existing record
        if (data && data.length > 0) {
            // There should only be one record
            var item = data[0];

            item.report_id = reportID || item.report_id;
            item.node_id = nodeID || item.node_id;
            item.type = type || item.type;
            item.location = location || item.location;
            
            Placement.update({ id: item.id }, {
                report_id: item.report_id,
                node_id: item.node_id,
                type: item.type,
                location: item.location
            })
            .then(function(){
                ADCore.comm.success(res, 'UPDATED');
            })
            .fail(function(err){
                ADCore.comm.error(res, err);
            })
            .done();
            
        }
        // Create new record
        else {
            Placement.create({
                measurement_id: measurementID,
                report_id: reportID,
                node_id: nodeID,
                type: type,
                location: location
            })
            .then(function(){
                ADCore.comm.success(res, 'CREATED');
            })
            .fail(function(err){
                ADCore.comm.error(res, err);
            })
            .done();
        }
      })
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done();
  
  }


  // url:get  /gmamatrix/placements?measurementId=x
  , placements:function(req, res) {
      var reportID = req.param('reportId');
      var measurementID = req.param('measurementId');
      var nodeID = req.param('nodeId');
      var findOpts = {};
      
      if (measurementID) {
        findOpts = { measurement_id: measurementID };
      } else if (nodeID) {
        findOpts = { node_id: nodeID };
      } else if (reportID) {
        findOpts = {report_id: reportID };
      }
      
      Placement.find(findOpts)
      .then(function(data){
        if (data) {
            ADCore.comm.success(res, data);
        } else {
            ADCore.comm.error(res, new Error("No matching data found"));
        }
      })
      .fail(function(err){
        ADCore.comm.error(res, err);
      })
      .done();
      
  }



  // url:get  /gmamatrix/lmidefs
  , lmidefs:function(req, res) {

      var data = [
          {
              id:1,
              name:'Exposing through mass means',
              definition:'Number of people who have been exposed to the gospel through media as a result of local efforts (TV/Radio, Jesus Film, everstudent.com and GMO sites).',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'win-faith',
              locationKey:'etmm'
          },
          {
              id:2,
              name:'Initiating Gospel Conversations',
              definition:'Number of people with whom a gospel conversation was initiated, whether face to face or online ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'win-faith',
              locationKey:'igc'
          },
          {
              id:3,
              name:'Presenting the Gospel',
              definition:'Number of people to whom the gospel was presented, whether face to face or online, with an opportunity to respond.',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'win-faith',
              locationKey:'ptg'
          },
          {
              id:4,
              name:'New Professing Believers',
              definition:'A: Number of people who have heard the gospel and have indicated a decision to follow Jesus through Mass Exposure.<br>B. Number of people who have heard the gospel and have indicated a decision to follow Jesus through a Gospel Presentation.',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'win-fruits',
              locationKey:'npb'
          },
          {
              id:5,
              name:'Following Up',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'build-faith',
              locationKey:'fu'
          },
          {
              id:6,
              name:'Presenting the Holy Spirit',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'build-faith',
              locationKey:'pths'
          },
          {
              id:7,
              name:'Engaged Disciples',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'build-fruits',
              locationKey:'ed'
          },
          {
              id:8,
              name:'Training for Action',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'send-faith',
              locationKey:'tfa'
          },
          {
              id:9,
              name:'Sending Lifetime Laborers',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'send-faith',
              locationKey:'sll'
          },
          {
              id:10,
              name:'Developing Local Resources',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'send-faith',
              locationKey:'dlr'
          },
          {
              id:11,
              name:'Multiplying Disciples',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'send-fruits',
              locationKey:'md'
          },
          {
              id:12,
              name:'Movement Progress',
              definition:'A: ',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'outcome',
              locationKey:'mp'
          },



          //// Make sure there is the additional Extra category
          {
              id:25,
              name:'Extra Measurements',
              definition:'Additional measurements defined for this node that are not part of the LMI definitions.',
              summaryType:'total',
              inputType:'integer',
              chartLocation:'extra-extra',
              locationKey:'em'
          }
      ];

      ADCore.comm.success(res, data);
  }
  
  
  // url: get /gmamatrix/graphData/?nodeId=x&startDate=y&endDate=z
  , graphData: function(req, res) {
      var nodeID = req.param('nodeId');
      var startDate = req.param('startDate');
      var endDate = req.param('endDate');
      
      var gma = null; // GMA object
      var measurements = []; // gma-api will fetch all measurements
      var result = null;
      
      async.series([
          // Get user's GMA session
          function(next) {
              gmaMatrix_GMA.getSession(req)
              .fail(function(err){ next(err); })
              .done(function(data){
                  gma = data;
                  next();
              });
          },
          // Get report data
          function(next) {
              gma.getGraphData({
                  nodeId: nodeID,
                  startDate: startDate,
                  endDate: endDate,
                  measurements: measurements
                  //strategies: strategies,
                  
              })
              .fail(function(err) { next(err); })
              .done(function(data) {
                  result = data;
                  next();
              });
          }
      
      ], function(err) {
      
          if (err) {
              ADCore.comm.error(res, err);
          } else {
              ADCore.comm.success(res, result);
          }
      
      });
  }


  // url: GET /gmamatrix/mapAllMeasurements
  // (ideally this should be POST since it updates the DB, but that would
  //  prevent it from being manually called via a basic web browser)
  , mapAllMeasurements: function(req, res) {
      
      Placement.mapAllMeasurements()
      .fail(function(err) {
        ADCore.comm.error(res, err);
      })
      .done(function() {
        ADCore.comm.success(res, {});
      });

  }

};

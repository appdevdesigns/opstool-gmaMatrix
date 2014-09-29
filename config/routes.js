/**
 * Routes
 *
 * Use this file to add any module specific routes to the main Sails
 * route object.
 */


module.exports = {

    'put /opstool-gmaMatrix/gmamatrix/placements/:measurementId': 
        'opstool-gmaMAtrix/GMAMatrixController.savePlacements',

    'post /opstool-gmaMatrix/gmamatrix/measurement/:measurementId': 
        'opstool-gmaMAtrix/GMAMatrixController.saveMeasurement'


  /*

  '/': {
    view: 'user/signup'
  },
  '/': 'opstool-gmaMatrix/PluginController.inbox',
  '/': {
    controller: 'opstool-gmaMatrix/PluginController',
    action: 'inbox'
  },
  'post /signup': 'opstool-gmaMatrix/PluginController.signup',
  'get /*(^.*)' : 'opstool-gmaMatrix/PluginController.profile'

  */


};


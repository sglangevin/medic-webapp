describe('ReportsCtrl controller', function() {

  'use strict';

  var createController,
      scope,
      report,
      DB,
      LiveList,
      UserDistrict,
      MarkRead,
      Search,
      Changes,
      FormatDataRecord,
      changesCallback;

  beforeEach(module('inboxApp'));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.filterModel = { date: {} };
    report = { _id: 'x' };
    scope.readStatus = { forms: 0, messages: 0 };
    scope.updateReadStatus = function() {};
    scope.isRead = function() {
      return true;
    };
    scope.setFilterQuery = function() {};
    scope.reports = [ report, { _id: 'a' } ];
    scope.clearSelected = function() {};
    scope.setBackTarget = function() {};
    scope.isMobile = function() {
      return false;
    };

    UserDistrict = function() {
      return { 
        then: function() {}
      };
    };

    DB = {};

    LiveList = {};

    MarkRead = function() {};

    FormatDataRecord = function(data) {
      return {
        then: function(cb) {
          cb(data);
          return {
            catch: function() {}
          };
        }
      };
    };

    Search = function($scope, options, callback) {
      callback(null, { });
    };

    Changes = function(options) {
      changesCallback = options.callback;
    };

    changesCallback = undefined;

    createController = function() {
      return $controller('ReportsCtrl', {
        '$scope': scope,
        'UserDistrict': UserDistrict,
        'Changes': Changes,
        'MarkRead': MarkRead,
        'Search': Search,
        'Verified': {},
        'DeleteDoc': {},
        'UpdateFacility': {},
        'MessageState': {},
        'EditGroup': {},
        'FormatDataRecord': FormatDataRecord,
        'Settings': KarmaUtils.nullPromise(),
        'DB': DB,
        'LiveList': LiveList
      });
    };
  }));

  it('set up controller', function() {
    createController();
    chai.expect(scope.filterModel.type).to.equal('reports');
  });

});

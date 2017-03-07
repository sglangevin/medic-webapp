angular.module('inboxControllers').controller('ConfigurationExportServerLogsCtrl',
  function (
    $log,
    $scope,
    Export
  ) {

    'use strict';
    'ngInject';

    $scope.export = function() {
      $scope.exporting = true;
      Export({}, 'logs').then(function() {
        $scope.exporting = false;
      });
    };
  }
);

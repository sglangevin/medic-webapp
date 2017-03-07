var _ = require('underscore');

(function () {

  'use strict';

  var inboxControllers = angular.module('inboxControllers');

  inboxControllers.controller('AnalyticsCtrl',
<<<<<<< HEAD
    ['$scope', '$route', '$location', '$log', 'Settings', 'AnalyticsModules',
    function ($scope, $route, $location, $log, Settings, AnalyticsModules) {

      $log.debug('AnalyticsCtrl');
      $log.debug('$route', $route.current.params);
      $scope.setSelectedModule();
      $scope.filterModel.type = 'analytics';
      $scope.loading = true;
      Settings(function(err, res) {
        if (err) {
          return $log.error('Error fetching settings: ', err);
        }
        $scope.setAnalyticsModules(AnalyticsModules(res));
        $scope.setSelectedModule(findSelectedModule(
          $route.current.params.module, $scope.analyticsModules
        ));
        if ($route.current.params.form) {
          $scope.filterModel.selectedForm = $scope.formsLookup[$route.current.params.form];
        }
        if ($route.current.params.facility) {
          $scope.filterModel.selectedFacility = $scope.facilitiesLookup[$route.current.params.facility];
        }
=======
    function (
      $scope,
      $state,
      $stateParams,
      $timeout,
      AnalyticsModules,
      Tour
    ) {
      'ngInject';

      $scope.analyticsModules = [];

      $scope.loading = true;

      $scope.setSelectedModule = function(module) {
        $scope.selected = module;
      };
      $scope.setSelectedModule();
      $scope.clearSelected();

      AnalyticsModules().then(function(modules) {
        if ($state.is('analytics')) {
          if (modules.length === 1) {
            // timeout so this transition finishes before starting the next one
            $timeout(function() {
              $state.go(modules[0].state, { }, { location: 'replace' });
            });
            return;
          }
        } else {
          $scope.setSelectedModule(_.findWhere(modules, {
            state: $state.current.name
          }));
        }

>>>>>>> medic/master
        $scope.loading = false;
        $scope.analyticsModules = modules;
      });

      if ($stateParams.tour) {
        Tour.start($stateParams.tour);
      }

      $scope.loadPatient = function(id) {
        $state.go('reports.detail', { query: 'patient_id:' + id });
      };

      $scope.loadContact = function(id) {
        $state.go('reports.detail', { query: 'contact:' + id });
      };
    }
  );

}());

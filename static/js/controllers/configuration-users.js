(function () {

  'use strict';

  var inboxControllers = angular.module('inboxControllers');

  inboxControllers.controller('ConfigurationUsersCtrl',
    ['$scope', '$rootScope', '$state', 'Users',
    function ($scope, $rootScope, $state, Users) {

      $scope.updateList = function() {
        $scope.loading = true;
        Users(function(err, users) {
          $scope.loading = false;
          if (err) {
            $scope.error = true;
            return console.log('Error fetching users', err);
          }
          $scope.users = users;
        });
      };

      $scope.deleteUserPrepare = function(user, $event) {
        $event.stopPropagation();
        $rootScope.$broadcast('DeleteUserInit', user);
        $('#delete-user-confirm').modal('show');
      };

      $scope.editUserPrepare = function(user) {
        $rootScope.$broadcast('EditUserInit', user);
      };

      $scope.$on('UsersUpdated', function() {
        $scope.updateList();
      });

      $scope.updateList();

    }
  ]);

}());

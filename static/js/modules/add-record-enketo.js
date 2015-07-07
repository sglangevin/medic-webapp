(function () {
  'use strict';
  exports.init = function(src) {
     var btn = $('#send-record-button-enketo');
     btn.closest('li').removeClass('disabled');
     btn.on('click', function(e) {
       e.preventDefault();
       $('#add-record-panel-enketo .dropdown-menu').toggle();
     });
     $('#add-record-panel-enketo .close').on('click', function() {
       $('#add-record-panel-enketo .dropdown-menu').toggle();
     });
  };
}());

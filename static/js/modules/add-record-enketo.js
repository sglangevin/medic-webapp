(function () {
  'use strict';
  exports.init = function(src) {
    src = 'http://localhost:8080/forms/index.html';
    if (src) {
      $.ajax({
        type: 'head',
        url: 'http://localhost:8080/forms/index.html',
        success: function() {
          var btn = $('#send-record-button-enketo');
          btn.closest('li').removeClass('disabled');
          btn.on('click', function(e) {
            e.preventDefault();
            $('#add-record-panel-enketo .dropdown-menu').toggle();
            var iframe = $('#add-record-panel-enketo iframe');
            if (!iframe.attr('src')) {
              var url = src + '?xform=' +
                 encodeURIComponent('https://raw.githubusercontent.com/medic/medic-projects/master/edcd-nepal/forms/Daily%20Hospital%20Surveillance.xml?token=AALsCFAzElEYtrzHWmEabrq4uQY2QAtVks5VpQH_wA%3D%3D');
              console.log('Pointing iframe at: ' + url);
              iframe.attr('src', url);
            }
          });
          $('#add-record-panel-enketo .close').on('click', function() {
            $('#add-record-panel-enketo .dropdown-menu').toggle();
          });
        }
      });
    }
  };
}());

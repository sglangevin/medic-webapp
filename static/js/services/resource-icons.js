angular.module('inboxServices').factory('ResourceIcons', [
  '$log', 'DB', 'Changes',
  function($log, DB, Changes) {

    var doc;

    var getSrc = function(name) {
      if (!doc) {
        return;
      }
      var filename = doc.resources[name];
      var icon = filename && doc._attachments[filename];
      if (!icon) {
        return;
      }
      return 'data:' + icon.content_type + ';base64,' + icon.data;
    };

    var updateResources = function() {
      DB.get()
        .get('resources', { attachments: true })
        .then(function(res) {
          doc = res;
          Object.keys(doc.resources).forEach(function(name) {
            var src = getSrc(name);
            var elems = $('img.resource-icon-' + name);
            if (src) {
              elems.attr('src', src);
            } else {
              elems.removeAttr('src');
            }
          });
        })
        .catch(function(err) {
          $log.error('Error updating icons', err);
        });
    };

    Changes({
      key: 'ResourceIcons',
      filter: function(change) {
        return change.id === 'resources';
      },
      callback: updateResources
    });

    updateResources();

    return {
      getImg: function(name) {
        if (!name) {
          return;
        }
        return getSrc(name);
      }
    };

  }
]);

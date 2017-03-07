<<<<<<< HEAD
/**
 * Show functions to be exported from the design doc.
 */

var querystring = require('querystring'),
    db = require('db'),
    events = require('duality/events'),
    dutils = require('duality/utils'),
    templates = require('duality/templates'),
    utils = require('kujua-utils'),
    logger = utils.logger,
    sms_utils = require('kujua-sms/utils'),
    migrations = require('js-migrations'),
    moment = require('moment'),
    _ = require('underscore'),
    _str = require('underscore-string'),
    async = require('async'),
    settings = require('settings/root'),
    appinfo = require('views/lib/appinfo'),
    libphonenumber = require('libphonenumber/utils'),
    configuration = require('./show-includes/configuration'),
    ddoc = settings.name,
    district,
    isAdmin,
    currentFacilityRequest;

var cache = {};

var handleModalResponse = function(modal, msg, err) {
    if (err) {
        console.log(msg, err);
        if (_.isString(err)) {
            msg += ': ' + err;
        }
        modal.find('.modal-footer .note').text(msg);
    } else {
        modal.find('.modal-footer .note').text();
        modal.modal('hide');
    }
};

function onExportFormsSubmit(ev) {

    ev.preventDefault();

    var $target = $(ev.currentTarget),
        params = querystring.parse($target.attr('data-query')),
        form = $target.attr('data-form'),
        url = $target.attr('data-url'),
        format = $('#sms-forms-controls [name=format]').val().split(','),
        startVal = $('#startDate > input').val(),
        endVal = $('#endDate > input').val(),
        startkey = JSON.parse(params.startkey),
        endkey = JSON.parse(params.endkey),
        // moment doesn't like dates of '' or null
        startDate = moment.utc(startVal || undefined),
        endDate = moment.utc(endVal || undefined);

    // flip dates if both have values and startDate's after endDate
    if (startVal !== '' && startDate > endDate) {
        endDate = startDate;
        startDate = moment.utc(endVal || undefined);
    }

    // optionally filter by date
    if (startVal !== '') {
        // update endkey for startdate as view is descending
        endkey.push(startDate.valueOf());
    }
    if (endVal !== '') {
        // update startkey for enddate as view is descending
        startkey.push(endDate.add(1, 'days').valueOf());
    } else {
        startkey.push({});
    }

    params.startkey = JSON.stringify(startkey);
    params.endkey = JSON.stringify(endkey);
    params.format = format[0];

    // format is a bit hinky; second in comma separated value
    if (format.length > 1) {
        params.locale = format[1];
    }

    url += '?' + querystring.stringify(params);

    $(window.location).attr('href', url);
}

var restoreFacilities = function(ev) {
    ev.preventDefault();
    var btn = $(this);
    $('#facilities-controls .uploader').click();
};

var uploadFacilities = function(ev) {
    var db = require('db').current(),
        baseURL = require('duality/core').getBaseURL(),
        overwrite = $('#facilities-controls [name=overwrite]').prop('checked');

    if (this.files.length === 0) return;
    var reader = new FileReader();
    $('#facilities').html(
        templates.render('loader.html', {}, {})
    );

    // disable form elements while running
    $('#facilities-controls [type=checkbox]').disable();
    $('#facilities-controls [type=button]').disable();

    function finish(msg, errors) {
        $('#facilities').html(
            templates.render('facilities_restore.html', {}, {
                msg: msg,
                errors: errors
            })
        );
        $('#facilities-controls [type=checkbox]').enable();
        $('#facilities-controls [type=button]').enable();
    }

    reader.onloadend = function(ev) {
        var json,
            processed_count = 0,
            restored_count = 0,
            errors = [];

        try {
            json = JSON.parse(ev.target.result);
        } catch(e) {
            return finish('Failed to parse JSON file.', [e]);
        }

        $('#facilities').html(
            templates.render('facilities_restore.html', {}, {
                progress: 'Reading file...'
            })
        );

        if (overwrite) {
            console.warn('overwriting facilities');
        }

        function updateProgress(complete, total) {
            total = total || json.length;
            var width = Math.floor(complete/total * 100),
                desc = 'Processed '+complete+'/'+total+' records...';
            // start showing stats and progress bar after 1st record
            if (complete == 1) {
                $('#facilities').html(
                    templates.render('facilities_restore.html', {}, {
                        progress: desc,
                        width: "0%"
                    })
                );
            }
            $('#facilities-restore .update-progress .desc').text(desc);
            $('#facilities-restore .update-progress .bar').css('width', width+'%');
        }

        function saveRecord(doc, options, cb) {
            if (typeof(options) === 'function' && !cb) {
                cb = options;
                options = null;
            }
            // delete _rev since this is a new doc in this database
            if (options && options.create && doc._rev) {
                delete doc._rev;
            }
            db.saveDoc(doc, function(err) {
                if (err) {
                    console.error('error saving record', err);
                    errors.push([doc.name, err]);
                } else {
                    restored_count++;
                }
                // continue processing
                processed_count++;
                updateProgress(processed_count);
                cb();
            });
        }

        // check for record first and overwrite if specified
        function onFacility(facility, cb) {
            $.ajax({
                type: 'HEAD',
                url: baseURL+'/_db/'+facility._id,
                complete: function(xhr, txtStatus) {
                    if (xhr.status == 404) {
                        // create a new record
                        saveRecord(facility, {create: true}, cb);
                    } else if (xhr.status == 200) {
                        // quotes are included in response header string,
                        // remove them so couchdb accepts the rev.
                        var rev = xhr.getResponseHeader('ETag').replace(/['"]/g,'');
                        if (rev && overwrite) {
                            // overwrite a record
                            facility._rev = rev;
                            saveRecord(facility, cb);
                        } else {
                            processed_count++;
                            updateProgress(processed_count);
                            cb();
                        }
                    }
                },
                error: function(xhr, txtStatus, err) {
                    // we handle 404, report anything else
                    if (xhr.status != 404) {
                        errors.push([facility.name, err]);
                    }
                }
            });
        }

        function finishLoading(err) {
            var msg = restored_count + '/' + json.length + ' facilities restored.',
                skipped = json.length - restored_count;
            if (err) {
                msg = err + ' ' + msg;
            }
            if (skipped > 0) {
                errors.push("Skipped "+skipped+" records.");
            }
            finish(msg, errors);
        }

        async.forEach(json, onFacility, finishLoading);
    }

    reader.readAsText(this.files[0]);

};

var backupFacilities = function(ev) {
    ev.preventDefault();
    $(window.location).attr('href', $(this).attr('data-url'));
};

var renderFacilitiesControls = function() {
    $('.page-header .controls').first().html(
        templates.render('facilities_controls.html', {}, {isAdmin: isAdmin})
    ).show();
    $('#facilities-controls .backup').on('click', backupFacilities);
    $('#facilities-controls .restore').on('click', function() {
        $('#facilities-controls .options').hide();
        $('#facilities-controls .options-restore').show();
    });
    $('#facilities-controls .cancel').on('click', function(ev) {
        $('#facilities-controls form')[0].reset();
        $('#facilities-controls .options').show();
        $('#facilities-controls .options-restore').hide();
    });
    $('#facilities-controls .choose').on('click', restoreFacilities);
    $('#facilities-controls .uploader').on('change', uploadFacilities);
};

var renderDownloadControls = function() {

    $('.page-header .controls').first().html(
        templates.render('export/controls.html', {}, {})
    ).show();

    /*
     * Disabling default month value for now since record count does not
     * reflect the export row totals displayed on the screen.  It's probably
     * better UX to have the set the date knowing they are doing something than
     * having a default that doesn't make sense with the totals on the screen.
     *
     * TODO default export start month to subtract setting and calculate based
     * on the the date value.
     * */

    // by default limit export to 3 months of previous data
    //$('#startDate > input').val(
    //    moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD')
    //);

    $('[data-role=datetimepicker]').datetimepicker({
        pickTime: false
    }).on('changeDate', function() {
        $(this).datetimepicker('hide');
    });
};

var removeConfirm = function(doc, callback) {
    $('#delete-confirmation-label').text('Are you sure you want to delete ' + (doc.name || (doc.contact && doc.contact.name) || 'this row') + '? This operation cannot be undone.');
    $('#delete-confirmation .btn-primary')
        // remove any previous click handlers
        .off('click')
        .on('click', function(ev) {
            ev.preventDefault();
            $('#delete-confirmation').modal('hide');
            callback();
        });
    $('#delete-confirmation').modal('show');
};

function renderDownloadAudit() {
    $('[data-page=sms-forms-data] #export-audit').html(
        templates.render('export/audit.html', {}, {})
    );

    // bind to form download buttons in export screen
    $('#export-audit form [type=submit]').on('click', function(ev) {
        ev.preventDefault();

        var $target = $(ev.currentTarget),
            baseURL = $target.attr('data-url'),
            format = $('#sms-forms-controls [name=format]').val().split(','),
            params = {},
            url;

        params.reduce = 'false';

        if (format.length > 0) {
            params.format = format[0];
        }

        // reconstruct url
        url = baseURL + '/export/audit?' + querystring.stringify(params);

        $(window.location).attr('href', url);
    });
};

function safeStringify(str) {
    if (_.isString(str)) {
        return str;
    }
    try {
        return JSON.stringify(str);
    } catch(e) {
        return str;
    }
};

function renderDownloadFeedback() {
    var query = {
        include_docs: true,
        descending: true,
        limit: 20
=======
exports.inbox = function(doc, req) {
    var ddoc = this;
    var baseUrl = '/' + req.path.slice(0, 3).join('/') + '/_rewrite';
    return {
        body: ddoc.inbox_template.replace(/<%= baseURL %>/g, baseUrl)
>>>>>>> medic/master
    };
};

exports.status = function () {
    // if we can get this far, the app is running
    return {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready: true })
    };
};

exports.not_found = function () {
    return {
        code: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'not-found' })
    };
};

// Null migration for backwards compatibility:
// https://github.com/medic/medic-webapp/issues/1892
exports.migration = function(doc, req) {
    try {
        var body = JSON.parse(req.body);
        return JSON.stringify(body.settings);
    } catch(e) {
        throw 'Could not parse request body as JSON';
    }
};

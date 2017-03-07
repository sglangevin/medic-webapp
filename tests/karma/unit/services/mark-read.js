describe('MarkRead service', function() {

  'use strict';

  var service,
      get,
      put;

  beforeEach(function() {
    put = sinon.stub();
    get = sinon.stub();
    module('inboxApp');
    module(function ($provide) {
      $provide.factory('DB', KarmaUtils.mockDB({ put: put, get: get }));
      $provide.factory('Session', function() {
        return {
          userCtx: function() {
            return { name: 'james' };
          }
        };
      });
    });
    inject(function(_MarkRead_) {
      service = _MarkRead_;
    });
  });

  afterEach(function() {
    KarmaUtils.restore(put, get);
  });

  it('marks the message read', function(done) {
    get.returns(KarmaUtils.mockPromise(null, { _id: 'xyz' }));
    put.returns(KarmaUtils.mockPromise());
    var expected = { _id: 'xyz', read: [ 'james' ] };
    service('abc', true).then(function() {
      chai.expect(get.args[0][0]).to.deep.equal('abc');
      chai.expect(put.args[0][0]).to.deep.equal(expected);
      done();
    });
  });

  it('marks the message unread', function(done) {
    get.returns(KarmaUtils.mockPromise(null, { _id: 'xyz', read: [ 'james' ] }));
    put.returns(KarmaUtils.mockPromise());
    var expected = { _id: 'xyz', read: [ ] };
    service('abc', false).then(function() {
      chai.expect(get.args[0][0]).to.deep.equal('abc');
      chai.expect(put.args[0][0]).to.deep.equal(expected);
      done();
    });
  });

  it('marks the message read when already read', function(done) {
    get.returns(KarmaUtils.mockPromise(null, { _id: 'xyz', read: [ 'james' ] }));
    service('abc', true).then(function() {
      chai.expect(get.args[0][0]).to.deep.equal('abc');
      done();
    });
  });

  it('marks the message unread when already unread', function(done) {
    get.returns(KarmaUtils.mockPromise(null, { _id: 'xyz' }));
    service('abc', false).then(function() {
      chai.expect(get.args[0][0]).to.deep.equal('abc');
      done();
    });
  });

  it('returns db errors', function(done) {
    get.returns(KarmaUtils.mockPromise('errcode1'));
    service('abc', true).catch(function(err) {
      chai.expect(err).to.equal('errcode1');
      done();
    });
  });

  it('returns save errors', function(done) {
    get.returns(KarmaUtils.mockPromise(null, { _id: 'xyz' }));
    put.returns(KarmaUtils.mockPromise('errcode2'));
    service('abc', true).catch(function(err) {
      chai.expect(err).to.equal('errcode2');
      done();
    });
  });

});
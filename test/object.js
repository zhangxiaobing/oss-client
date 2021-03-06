'use strict';

var fs = require('fs'),
  OSS = require('../index'),
  config = require('./config'),
  oss = new OSS.OssClient(config),
  should = require('should'),
  uuid = require('node-uuid');

describe('object', function() {
  var bucket = uuid.v4(),
    object = uuid.v4();

  it('create bucket', function(done) {
    oss.createBucket({
      bucket: bucket,
      acl: 'public-read'
    }, function(error, result) {
      should.not.exist(error);
      result.statusCode.should.equal(200);
      done();
    });
  });

  it('put object', function(done) {
    oss.putObject({
      bucket: bucket,
      object: object,
      srcFile: __filename,
      userMetas: {
        'x-oss-meta-foo': 'bar'
      }
    }, function(error, result) {
      result.statusCode.should.equal(200);
      done();
    });
  });

  it('head object', function(done) {
    oss.headObject({
      bucket: bucket,
      object: object
    }, function(error, headers) {
      headers['x-oss-meta-foo'].should.equal('bar');
      done();
    });
  });

  it('download object to write stream', function(done) {
    var ws = fs.createWriteStream('/tmp/oss-test-download-file');
    oss.getObject({
      bucket: bucket,
      object: object,
      dstFile: ws,
    }, function(error, result) {
      should.not.exist(error);
      result.should.eql({
        statusCode: 200
      });
      fs.statSync('/tmp/oss-test-download-file').size.should.equal(fs.statSync(__filename).size);
      fs.readFileSync('/tmp/oss-test-download-file', 'utf8').should.equal(fs.readFileSync(__filename, 'utf8'));
      done();
    });
  });

  it('list object', function(done) {
    oss.listObject({
      bucket: bucket
    }, function(error, result) {
      result.ListBucketResult.Contents.length.should.above(0);
      done();
    });
  });

  it('delete object', function(done) {
    oss.deleteObject({
      bucket: bucket,
      object: object
    }, function(error, result) {
      result.statusCode.should.equal(204);
      done();
    });
  });

  object = uuid.v4();

  it('put object with userMetas without x-oss', function(done) {
    oss.putObject({
      bucket: bucket,
      object: object,
      srcFile: __filename,
      userMetas: {
        'Cache-Control': 'max-age=5'
      }
    }, function(error, result) {
      result.statusCode.should.equal(200);
      done();
    });
  });

  it('delete object', function(done) {
    oss.deleteObject({
      bucket: bucket,
      object: object
    }, function(error, result) {
      result.statusCode.should.equal(204);
      done();
    });
  });

  object = uuid.v4();

  it('put object by buffer', function(done) {
    oss.putObject({
      bucket: bucket,
      object: object,
      srcFile: new Buffer('hello,wolrd', 'utf8')
    }, function(error, result) {
      result.statusCode.should.equal(200);
      done();
    });
  });

  it('delete object', function(done) {
    oss.deleteObject({
      bucket: bucket,
      object: object
    }, function(error, result) {
      result.statusCode.should.equal(204);
      done();
    });
  });

  object = uuid.v4();

  it('put object by stream', function(done) {
    var input = fs.createReadStream(__filename);
    oss.putObject({
      bucket: bucket,
      object: object,
      srcFile: input,
      contentLength: fs.statSync(__filename).size
    }, function(error, result) {
      result.statusCode.should.equal(200);
      done();
    });
  });

  it('delete object', function(done) {
    oss.deleteObject({
      bucket: bucket,
      object: object
    }, function(error, result) {
      result.statusCode.should.equal(204);
      done();
    });
  });

  it('delete bucket', function(done) {
    oss.deleteBucket(bucket, function(error, result) {
      should.not.exist(error);
      result.statusCode.should.equal(204);
      done();
    });
  });
});
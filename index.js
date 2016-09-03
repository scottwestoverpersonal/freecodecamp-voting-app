var express = require('express');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var stormpath = require('express-stormpath');
var app = express();

var mongoURL = '';

app.use(stormpath.init(app, {
  website: true,
    apiKey: {
      id: '', 
      secret: ''
    },
 application: {
   href: '',
 }
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', stormpath.getUser, function(request, response) {
  if (request.user) {
		response.render('pages/index', { user : request.user.email });
	}
	else {
		response.render('pages/index', { user : null });
	}
});

app.get('/singlePoll', stormpath.getUser, function(request, response) {
  if (request.user) {
		response.render('pages/singlePoll', { user : request.user.email });
	}
	else {
		response.render('pages/singlePoll', { user : null });
	}
});

app.get('/createPoll', stormpath.loginRequired, function(request, response) {
  response.render('pages/createPoll',{ user : request.user.email });
});

app.get('/myPolls', stormpath.loginRequired, function(request, response) {
  response.render('pages/myPolls',{ user : request.user.email });
});

// get the polls for a user
app.get('/getMyPolls', stormpath.getUser, function(req, res){
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    findUserPolls(db, function(polls) {
        db.close();
        res.json({"polls":polls});
    }, req.user.email);
  });
});

// get all of the polls
app.get('/getPolls', function(req, res){
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    findPolls(db, function(polls) {
        db.close();
        res.json({"polls":polls});
    });
  });
});

// get a single poll
app.get('/getSinglePoll', function(req, res){
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    findSinglePoll(db, function(poll) {
        db.close();
        res.json({"poll":poll});
    }, req.query.id);
  });
});

// create a new poll
app.get('/newPoll', stormpath.loginRequired, function(req, res){
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    insertDocument(db, function() {
        db.close();
        res.redirect('/');
    }, req.query.question, req.query.answers, req.user.email);
  });
});

app.on('stormpath.ready', function() {
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});

// query the database to pull all of the polls
var findPolls = function(db, callback) {
    var polls = [];
   var cursor = db.collection('polls').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         polls.push(doc);
      } else {
         callback(polls);
      }
   });
};

// query the database for 1 poll
var findSinglePoll = function(db, callback, id) {
  var cursor = db.collection('polls').findOne({"_id":new ObjectId(id)}, function(err, doc) {
       callback(doc);
    });
  };
  
  // insert a poll into the polls database
var insertDocument = function(db, callback, question, answers, username) {
  var tempAnswers = answers.split(';');
  for(var i = 0; i < tempAnswers.length; i++){
    tempAnswers[i] = {"answer":tempAnswers[i], "total":0};
  }
   db.collection('polls').insertOne( {
     "question" : question,
     "answers" : tempAnswers,
     "user" : username
   }, function(err, result) {
    assert.equal(err, null);
    callback();
  });
};

// query the database to pull all of the polls for an user
var findUserPolls = function(db, callback, username) {
  var polls = [];
   var cursor =db.collection('polls').find( { "user": username } );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         polls.push(doc);
      } else {
         callback(polls);
      }
   });
};
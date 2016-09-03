var express = require('express');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var stormpath = require('express-stormpath');
var app = express();

var mongoURL = 'mongodb://heroku_l3pfq0ph:l215nl855l3tvhho546n3qaa45@ds019956.mlab.com:19956/heroku_l3pfq0ph';

app.use(stormpath.init(app, {
  website: true,
    apiKey: {
      id: '6KHL8NJRW4PH7JO9GOWTE1CTE', 
      secret: 'D/tLZdpJ6kz3Uv16j89B7DFGXyo6WOvCCtZgfenC2QE'
    },
 application: {
   href: 'https://api.stormpath.com/v1/applications/fxXOhZdGVsSBN9NhV5AYd',
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

app.on('stormpath.ready', function() {
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
});



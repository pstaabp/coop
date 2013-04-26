
/**
 * Module dependencies.
 */

var express = require('express')
   , jade = require('jade')
   , _und = require('underscore')
   , http = require('http')
   , path = require('path')
   , connect = require('connect')
   , connectTimeout = require('connect-timeout')
   , mongoose = require('mongoose')
   , mongoStore = require('connect-mongodb')
   , models = require('./models')
   , UsersRoutes = require('./routes/users')
   , SessionRoutes = require('./routes/sessionRoutes')
   , ViewRoutes = require('./routes/ViewRoutes')
   , FamilyRoutes = require('./routes/FamilyRoutes')
   , db
   , User
   , Family
   , Transaction
   , LoginToken
   , Settings = { development: {}, test: {}, production: {} };

var app = express();

app.configure('development', function() {
   mongoose.set('debug',false);
   app.set('db-uri', 'mongodb://localhost:27017/coop');
   app.use(express.errorHandler({ dumpExceptions: true }));
   app.locals.pretty = true;
}); 


//db = mongoose.connect(app.set('db-uri'));

function mongoStoreConnectionArgs() {
   return { dbname: db.db.databaseName,
            host: db.db.serverConfig.host,
            port: db.db.serverConfig.port,
            username: db.uri.username,
            password: db.uri.password };
}


console.log("Connecting to mongodb, port 27017");

mongoose.connection.on('error', function(err){console.log("err: " + err)});


app.configure(function(){
   app.set('port', process.env.PORT || 3000);
   app.set('views', __dirname + '/views');
   app.use(express.favicon());
   app.use(express.bodyParser());
   app.use(express.cookieParser());
   app.use(connectTimeout({ time: 10000 }));
   app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
   app.use(express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms' }))
   app.use(express.methodOverride());
   app.use("/coop/stylesheets",express.static(__dirname + "/public/stylesheets"));
   app.use("/coop/javascripts",express.static(__dirname + "/public/javascripts"));
   app.use("/coop/img",express.static(__dirname + "/public/images"));
});

models.defineModels(mongoose, function() {
   app.User = User = mongoose.model('User');
   app.Transaction = Transaction = mongoose.model('Transaction');
   app.Family = Family = mongoose.model('Family');
   app.LoginToken = LoginToken = mongoose.model('LoginToken');
   db = mongoose.connect(app.set('db-uri'));
});



function authenticateFromLoginToken(req, res, next) {
   var cookie = JSON.parse(req.cookies.logintoken);

   LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {

      if (!token) {
         res.redirect('/coop/sessions/new');
         return;
      }

      User.findOne({ email: token.email }, function(err, user) {
         if (user) {
            console.log("in auth");
            console.log(user);
            req.session.user_id = user.id;
            req.currentUser = user;

            token.token = token.randomToken();
            token.save(function() {
               res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
               next();
            });
         } else {
            res.redirect('/coop/sessions/new');
         }
      });
   }));
}

app.loadUser = function(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/coop/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/coop/sessions/new');
  }
}


var userRoutes = new UsersRoutes(app, User);
var sessionRoutes = new SessionRoutes(app,User);
var viewRoutes = new ViewRoutes(app,User,Family,_und);
var familyRoutes = new FamilyRoutes(app,Family);





if (!module.parent) {
  app.listen(app.set("port"));
  console.log('Express server listening on port %s, environment: %s', app.set("port"), app.settings.env);
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}



var express = require('express');
var session = require('express-session');
var oauth2 = require('./oauth2');
var UserModel = require('./db/mongoose').UserModel;
var mongoose = require('mongoose');
var login = require('connect-ensure-login');
var log = require('./db/log')(module);
var passport = require('passport');
const MongoStore = require('connect-mongo')(session);

var app = express.createServer();
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(session({
  secret: 'keyboard',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

require('./auth');

app.use(function (req, res, next) {
  var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  views[0] = (views[0] || 0) + 1
  next()
})

app.post('/login', passport.authenticate('local'), function(req, res){
  req.session.username = req.user.username;
  req.session.authorized = true;
  log.info(req.session.id);
  res.statusCode = 200;
  return res.send({status: "Пользователь авторизирован"});
});


app.get('/loginFail', function (req, res){
  UserModel.findOne({ username: req.body.username }, function(err, user) {

    if (!user || !user.checkPassword(req.body.password)) {
      res.statusCode = 401;
      return res.send({ error: 'Доступ запрещен' });
    }

    res.statusCode = 500;
    return res.send({error: 'Ошибка сервера'});
  });
})

app.post('/signup', function(req, res) {
  UserModel.findOne({username: req.body.username}, function (err, user) {
    if(user) {
      res.statusCode = 422;
      return res.send({ error: 'Пользователь с таким именем уже существует' });
    } else {
      var user = new UserModel({ username: req.body.username, password: req.body.password });
      user.save(function(err, user) {
        if(err) {
          res.statusCode = 500;
          return res.send({error: 'Ошибка сервера'});
        }
      });

      res.statusCode = 200;
      return res.send({status: 'Пользователь сохранен'});
    }
  })
})

app.post('/logout', function(req, res) {
  delete req.session.username;
  delete req.session.authorized;
  log.info(req.session);
  res.statusCode = 200;
  return res.send({status: 'Пользователь вышел'});
});

app.get('/account', function(req, res) {
  log.info(req.session.id);
  if (req.session.authorized){
    res.statusCode = 200;
    return res.send({ user: req.session.username, times: req.session.views[0]});
  }
  else {
    res.statusCode = 401;
    return res.send({ error: 'Доступ запрещен' });
  }
});

app.get('/dialog/authorize/code', checkUser, oauth2.authorization);
app.post('/dialog/authorize/decision', checkUser, oauth2.decision);

function checkUser(req, res, next){
  if (!req.session.authorized) {
    res.statusCode = 401;
    return res.send({error: "Пользователь не зарегистрирован"});
  }
  next();
}

app.post('/oauth/token', oauth2.token);

app.post('/token', passport.authenticate('http-header-token', { session: false }));

app.listen(3010);
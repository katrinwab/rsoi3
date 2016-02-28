var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
  , BasicStrategy = require('passport-http').BasicStrategy
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
  , HTTPHeaderTokenStrategy = require('passport-http-header-token').Strategy
  , UserModel = require('./db/mongoose').UserModel
  , ClientModel = require('./db/mongoose').ClientModel
  , AccessTokenModel = require('./db/mongoose').AccessTokenModel;
var log = require('./db/log')(module);

passport.use(new LocalStrategy(
    function(username, password, done) {
        UserModel.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user || !user.checkPassword(password)) {
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new BasicStrategy(
    function(username, password, done) {
        ClientModel.findOne({ clientId: username }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != password) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        ClientModel.findOne({ clientId: clientId }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret != clientSecret) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new HTTPHeaderTokenStrategy(
    function(accessToken, done) {
        AccessTokenModel.findOne({ token: accessToken }, function(err, token) {
            log.info(accessToken);
            if (err) { return done(err); }
            if (!token) { return done(null, false); }

            if( Math.round((Date.now()-token.created)/1000) > 3600 ) {
                AccessTokenModel.remove({ token: accessToken }, function (err) {
                    if (err) return done(err);
                });
                return done(null, false, { message: 'Токен просрочен' });
            }

            UserModel.findOne({username: token.username}, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Неизвестный пользователь' }); }

                var info = { scope: '*' }
                done(null, user, info);
            });
        });
    }
));

var oauth2orize = require('oauth2orize')
  , passport = require('passport')
  , ClientModel = require('./db/mongoose').ClientModel
  , AuthorizationCode = require('./db/mongoose').CodeModel
  , AccessTokenModel =  require('./db/mongoose').AccessTokenModel
  , utils = require('./utils');
var login = require('connect-ensure-login');
var log = require('./db/log')(module);

var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
    return done(null, client.clientId);
});

server.deserializeClient(function(id, done) {
    ClientModel.findOne({clientId : id}, function(err, client) {
        if (err) { return done(err); }
        return done(null, client);
    });
})


server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var codeValue = utils.uid(16);

  var code = new AuthorizationCode({
      code: codeValue,
      clientID: client.clientId,
      username: user.username,
      redirectURI: redirectURI
      });

  code.save(function (err) {
  if (err) { return done(err); }
    done(null, codeValue);
  });

}));


server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthorizationCode.findOne({ code: code }, function(err, authCode) {
    if (err) { return done(err); }
    if (client.clientId !== authCode.clientID) { return done(null, false); }
    if (redirectURI !== authCode.redirectURI) { return done(null, false); }
    
    var tokenValue = utils.uid(16);
      log.info(tokenValue);
    var token = new AccessTokenModel({ token: tokenValue, clientId: authCode.clientID, username: authCode.username });
    token.save(function (err) {
        if (err) { return done(err); }
        done(null, tokenValue);
    });
  });
}));


exports.authorization = [
  server.authorization(function(clientID, redirectURI, done) {
      ClientModel.findOne({ clientId: clientID}, function(err, client) {
        if (err) { return done(err); }
        return done(null, client, redirectURI);
    });
  }),
  function(req, res){
    return res.send({ transactionID: req.oauth2.transactionID, user: req.session.username, client: req.oauth2.client });
  }
]

exports.decision = [
    server.decision()
]

exports.token = [
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        server.token(),
        server.errorHandler()
]

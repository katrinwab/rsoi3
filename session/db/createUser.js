var log                 = require('./log')(module);
var UserModel           = require('./mongoose').UserModel;
var ClientModel         = require('./mongoose').ClientModel;
var CodeModel           = require('./mongoose').CodeModel;
var AccessTokenModel    = require('./mongoose').AccessTokenModel;
var faker               = require('faker');

UserModel.remove({}, function(err) {
    var user = new UserModel({ username: "katrinwab", password: "qwe321" });
    user.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New user - %s:%s",user.username,user.password);
    });

    for(i=0; i<4; i++) {
        var user = new UserModel({ username: faker.internet.userName(), password: faker.internet.password() });
        user.save(function(err, user) {
            if(err) return log.error(err);
            else log.info("New user - %s:%s",user.username,user.password);
        });
    }
});

ClientModel.remove({}, function(err) {
    var client = new ClientModel({ name: "labRSOI2", clientId: "first", clientSecret:"abc123456" });
    client.save(function(err, client) {
        if(err) return log.error(err);
        else log.info("New client - %s:%s",client.clientId,client.clientSecret);
    });
});
AccessTokenModel.remove({}, function (err) {
    if (err) return log.error(err);
});
CodeModel.remove({}, function (err) {
    if (err) return log.error(err);
});
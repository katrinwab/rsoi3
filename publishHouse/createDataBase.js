var log                         = require('./log')(module);
var PublishingHouseModel        = require('./dataBase').PublishingHouseModel;

PublishingHouseModel.remove({}, function(err) {
    var house1 = new PublishingHouseModel({ name: "firstHouse", magazines: ["first", "first_first", "first_first_first"], users:["katrinwab"]});
    house1.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New house - %s",house1.name);
    });

    var house2 = new PublishingHouseModel({ name: "secondHouse", magazines: ["second"]});
    house2.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New house - %s",house2.name);
    });

    var house3 = new PublishingHouseModel({ name: "thirdHouse", magazines: ["third"]});
    house3.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New house - %s",house3.name);
    });

});
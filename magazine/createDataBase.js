var log                 = require('./log')(module);
var MagazineModel       = require('./dataBase').MagazineModel;

MagazineModel.remove({}, function(err) {
    var magazine1 = new MagazineModel({ name: "first", pubHouseName: "firstHouse"});
    magazine1.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New magazine - %s:%s",magazine1.name,magazine1.pubHouseName);
    });

    var magazine2 = new MagazineModel({ name: "first_first", pubHouseName: "firstHouse"});
    magazine2.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New magazine - %s:%s",magazine2.name,magazine2.pubHouseName);
    });

    var magazine3 = new MagazineModel({ name: "first_first_first", pubHouseName: "firstHouse"});
    magazine3.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New magazine - %s:%s",magazine3.name,magazine3.pubHouseName);
    });

    var magazine4 = new MagazineModel({ name: "second", pubHouseName: "secondHouse"});
    magazine4.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New magazine - %s:%s",magazine4.name,magazine4.pubHouseName);
    });

    var magazine5 = new MagazineModel({ name: "third", pubHouseName: "thirdHouse"});
    magazine5.save(function(err, user) {
        if(err) return log.error(err);
        else log.info("New magazine - %s:%s",magazine5.name,magazine5.pubHouseName);
    });
});
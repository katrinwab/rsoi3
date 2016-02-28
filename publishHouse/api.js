var PublishingHouseModel        = require('./dataBase').PublishingHouseModel;

exports.getAllHouse = function(req, res) {
    PublishingHouseModel.find(function (err, house) {
        if (!err) { res.send({ houses: house });
        } else {
            res.statusCode = 500;
            return res.send({error: 'Ошибка сервера'});
        }
    });
}

exports.findHouse = function(req, res) {
    return PublishingHouseModel.findOne({name : req.params.name}, function (err, house) {
        if(!house) {
            res.statusCode = 404;
            return res.send({ error: 'Страница не найдена'});
        }
        if (!err) {
            res.statusCode = 200;
            return res.send({ house:house });
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Ошибка сервера' });
        }
    });
}

exports.addInformation = function (req, res){
    return PublishingHouseModel.findOne({name : req.params.name}, function (err, house) {
        if(!house) {
            res.statusCode = 404;
            return res.send({ error: 'Страница не найдена' });
        }

        if (req.query.magazine !== undefined) {
            house.magazines.remove(req.query.magazine);
        } else {
            if (req.query.user !== undefined) {
                res.statusCode = 400;
                return res.send({ error: 'Ненайден допутимый параметр' });
            }
            house.users.push(req.query.user);
        }

        house.save(function(err, house) {
            if(!err) {
                res.statusCode = 200;
                return res.send({ house: house });
            } else {
                res.statusCode = 500;
                return res.send({error: 'Ошибка сервера'});
            }
        });

    });
}
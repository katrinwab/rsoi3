var MagazineModel       = require('./dataBase').MagazineModel;

exports.getAllMagazines = function(req, res) {
    MagazineModel.find(function (err, magazine) {
        var pageSize = 3,
            pageCount = parseInt(magazine.length / pageSize, 10),
            currentPage = 1,
            magazinesArrays = [];

        if (magazine.length % pageSize != 0)
            pageCount++;

        while (magazine.length > 0) {
            magazinesArrays.push(magazine.splice(0, pageSize));
        }

        if (typeof req.query.page !== 'undefined') {
            currentPage = +req.query.page;
        }

        var magazinesList = magazinesArrays[+currentPage - 1];
        if (!err) {
            res.send({
                magazines: magazinesList,
                pageCount: pageCount,
                currentPage: currentPage
            });
        } else {
            res.statusCode = 500;
            return res.send({error: 'Ошибка сервера'});
        }
    });
}

exports.findMagazine = function(req, res) {
    return MagazineModel.findOne({name : req.params.name}, function (err, magazine) {
        if(!magazine) {
            res.statusCode = 404;
            return res.send({ error: 'Страница не найдена'});
        }
        if (!err) {
            return res.send({ status: 'OK', magazine:magazine });
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Ошибка сервера' });
        }
    });
}

exports.changeDescription = function (req, res){
    return MagazineModel.findOne({name : req.params.name}, function (err, magazine) {
        if(!magazine) {
            res.statusCode = 404;
            return res.send({ error: 'Страница не найдена' });
        }

        magazine.description = req.query.description;
        return magazine.save(function (err) {
            if (!err) {
                return res.send({ status: 'OK', magazine:magazine });
            } else {
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Ошибка при внесении изменений' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Ошибка сервера' });
                }
            }
        });
    });
}

exports.deleteMagazine = function (req, res){
    return MagazineModel.findOne({name : req.params.name}, function (err, magazine) {
        if(!magazine) {
            res.statusCode = 404;
            return res.send({ error: 'Страница не найдена' });
        }
        var house = magazine.pubHouseName;
        return magazine.remove(function (err) {
            if (!err) {
                return res.send({ status: 'OK', house: house });
            } else {
                res.statusCode = 500;
                return res.send({ error: 'Ошибка сервера' });
            }
        });
    });
}

exports.addNewMagazine = function (req, res){
    var magazine = new MagazineModel({ name: req.query.nameMagazine, pubHouseName: req.query.houseName});
    magazine.save(function(err, user) {
        if (!err) {
            return res.send({ status: 'OK' });
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Ошибка сервера' });
        }
    });
}
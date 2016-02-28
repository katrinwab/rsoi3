var express = require('express')
    , util = require('util')
    , request = require('request')
    , methodOverride  = require('method-override')
    , fs = require('fs')
    , ejs = require('ejs');
var log = require('./log')(module);

var app = express.createServer();
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard' }));
app.use(methodOverride('_method'));

var j = request.jar();
var cookie;

app.use(function (req, res, next) {
    cookie = request.cookie('connect.sid=s:'+req.session.id);
    next()
})

app.get('/', function(req, res) {
    var username = "";
    if (req.session.username !== undefined)
        username = req.session.username;

    var templateString = fs.readFileSync(__dirname + '/views/user.ejs', 'utf-8'),
        html = ejs.render(templateString, {username : username}),
        file = fs.readFileSync(__dirname + '/public/mainHTML.html');
    res.end(html + file);
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/signup', function(req, res) {
    request({
            url: 'http://localhost:3002/api/houses',
            method: "GET",
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            var obj = JSON.parse(body);
            res.render('auth', { publishHouse: obj.houses });
        }
    );
});

app.post('/login', function(req, res){
    var url = 'http://localhost:3010/login';
    j.setCookie(cookie, url);
    request({
            url: url,
            jar: j,
            method: "POST",
            form : {username: req.body.username, password: req.body.password},
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            if (body == "Unauthorized") {
                res.statusCode = 401;
                return res.send({error: "Неверные данные"});
            }
            req.session.username = req.body.username;
            return res.send(body);
        }
    );
});

app.post('/signup', function(req, res){
    var url = 'http://localhost:3010/signup';
    j.setCookie(cookie, url);
    request({
            url: url,
            jar: j,
            method: "POST",
            form : {username: req.body.username, password: req.body.password},
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            request({
                    url: 'http://localhost:3002/api/house/'+ req.body.selectHouse,
                    method: "PUT",
                    headers: {"content-type": "application/json"}},
                function (err, response, body) {
                    if (err) {
                        res.statusCode = 500;
                        return res.send({error: err});
                    }
                }
            );
            return res.send(body);
        }
    );
});

app.get('/logout', function(req, res){
    var url = 'http://localhost:3010/logout';
    j.setCookie(cookie, url);
    request({
            url: url,
            jar: j,
            method: "POST",
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            delete req.session.username;
            return res.send(body);
        }
    );
});
app.get('/account', function(req, res){
    var url = 'http://localhost:3010/account';
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "GET",
            jar: j,
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            return res.send(body);
        }
    );
});


app.get('/dialog/authorize',function(req,res){
    var url = 'http://localhost:3010/dialog/authorize/code?response_type=code&client_id=first&redirect_uri=/';
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "GET",
            jar: j,
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            var obj = JSON.parse(body);
            res.render('dialog', { transactionID: obj.transactionID, user: obj.user, client: obj.client });
        }
    );
});

app.post('/dialog/authorize/decision',function(req,res){
    var url = 'http://localhost:3010/dialog/authorize/decision?transaction_id='+ req.body.transaction_id;
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "POST",
            jar: j,
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            var index = body.indexOf("code") + 5;
            var code = body.substring(index).substring(0, 16);

            var url = 'http://localhost:3010/oauth/token';
            var cookie1 = request.cookie('connect.sid=s:'+req.session.id);
            j.setCookie(cookie1, url);
            request({
                    url: url,
                    method: "POST",
                    form : {grant_type: "authorization_code", client_id: "first", client_secret: "abc123456", redirect_uri: "/", code : code},
                    jar: j},
                function (err, response, body) {
                    if (err) {
                        res.statusCode = 500;
                        return res.send({error: err});
                    }
                    var obj = JSON.parse(body);
                    log.info(obj.access_token);
                    req.session.token = obj.access_token;
                    res.statusCode = 200;
                    return res.send({status: 'Был получен токен'});
                }
            );
        }
    );
});

app.get('/api/magazines', function(req, res){
    var page = 1;
    if (req.query.page !== undefined)
        page = req.query.page;

    var url = 'http://localhost:3001/api/magazines?page='+ page;
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "GET",
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            var obj = JSON.parse(body);
            res.render('pagination', {
                magazines: obj.magazines,
                pageCount: obj.pageCount,
                currentPage: obj.currentPage
            });
        }
    );
});

app.get('/api/magazine/:name?', function(req, res){
    var url = 'http://localhost:3001/api/magazine/'+ req.params.name;
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "GET",
            headers: {"content-type": "application/json"}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            res.statusCode = 200;
            return res.send(body)
        }
    );
});


app.put('/test/magazine/:name?', function (req, res) {
    var url = 'http://localhost:3010/token';
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "POST",
            headers: {"content-type": "application/json", "Authorization": 'Token ' + req.session.token}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            if (body == "Unauthorized") {
                res.statusCode = 401;
                return res.send({error: "Доступ запрещен"});
            }
            request({
                    url: 'http://localhost:3001/api/magazine/'+ req.params.name + '?_method=PUT' + '&description=' + req.body.description,
                    method: "POST",
                    headers: {"content-type": "application/json"}},
                function (error, response, body) {
                    res.send(body);
                }
            );
        }
    );
})

app.delete('/test/magazine/:name?', function (req, res) {
    var url = 'http://localhost:3010/token';
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "POST",
            headers: {"content-type": "application/json", "Authorization": 'Token ' + req.session.token}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            if (body == "Unauthorized") {
                res.statusCode = 401;
                return res.send({error: "Доступ запрещен"});
            }
            request({
                    url: 'http://localhost:3001/api/magazine/'+ req.params.name +'?_method=DELETE&name=' ,
                    method: "POST",
                    headers: {"content-type": "application/json"}},
                function (err, response, body) {
                    if (err) {
                        res.statusCode = 500;
                        return res.send({error: err});
                    }
                    var obj = JSON.parse(body);
                    request({
                            url: 'http://localhost:3002/api/house/'+ obj.house +'?_method=PUT&magazine='+req.params.name ,
                            method: "POST",
                            headers: {"content-type": "application/json"}},
                        function (err, response, body) {
                            if (err) {
                                res.statusCode = 500;
                                return res.send({error: err});
                            }

                            return res.send(body);
                        }
                    );
                }
            );
        }
    );

})

app.post('/test/publishingHouse', function (req, res) {
    var url = 'http://localhost:3010/token';
    j.setCookie(cookie, url);
    request({
            url: url,
            method: "POST",
            headers: {"content-type": "application/json", "Authorization": 'Token ' + req.session.token}},
        function (err, response, body) {
            if (err) {
                res.statusCode = 500;
                return res.send({error: err});
            }
            if (body == "Unauthorized") {
                res.statusCode = 401;
                return res.send({error: "Доступ запрещен"});
            }
            request({
                    url: 'http://localhost:3002/api/house/' + req.body.nameHouse,
                    method: "GET",
                    headers: {"content-type": "application/json"}},
                function (error, response, body) {
                    if (err) {
                        res.statusCode = 500;
                        return res.send({error: err});
                    }
                    var obj = JSON.parse(body);
                    if (obj.house == undefined){
                        res.statusCode = 404;
                        return res.send({error: "Такой издательский дом не найден"})
                    }
                    request({
                            url: 'http://localhost:3001/api/magazine?nameMagazine=' + req.body.nameMagazine + '&houseName=' + req.body.nameHouse,
                            method: "POST",
                            headers: {"content-type": "application/json"}},
                        function (error, response, body) {
                            if (err) {
                                res.statusCode = 500;
                                return res.send({error: err});
                            }
                            return res.send(body);
                        }
                    )
                }
            )
        }
    )
})


app.listen(3000);

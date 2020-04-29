let express = require('express');
let server = express();
let bodyParser = require('body-parser');
let config = require('./config.json');
let cookieParser = require('cookie-parser');

let types = [];
let cities = [];


server.set("view engine", "pug");
server.set('views', './');

server.use(express.static(__dirname));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(cookieParser());

server.listen(2606, () => {
    console.log('listening on 2606')
});

const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password
}).promise();


connection.query("SELECT name,type_id FROM types", function (err, results, fields) {
    types = results;
});
connection.query("SELECT city FROM users Group By city", function (err, results, fields) {
    cities = results;
});
server.get('/gettypes', function (req, res) {
    connection.query("SELECT name,type_id FROM types", function (err, results, fields) {
        if (err) console.log(err);
        types = results;
    });
});

server.get('/reg', function (req, res) {
    let active = 'reg';
    res.cookies = req.cookies;
    res.render(__dirname + "/views/registration.pug", {types: types, active: active, config: config});

});

server.get('/help', function (req, res) {

    let active = 'help';
    res.cookies = req.cookies;
    res.render(__dirname + "/views/help.pug", {active: active, auth: req.cookies.auth, config: config});
});

server.get('/', function (req, res) {
    let active = 'home';
    console.log(req.cookies);
    if (req.cookies.auth) {
        res.cookies = req.cookies;
        res.redirect('/' + req.cookies.username);
    }


    let noun = "";
    connection.query(
        "SELECT ph_id,photographers.user_id, organization,username,avatar_link,city,price " +
        "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;")
        .then(([results, fields]) => {
            res.cookies = req.cookies;
            res.render(__dirname + '/views/home.pug',
                {
                    types: types,
                    phinfo: results,
                    info: {username: req.cookies.username},
                    username: noun,
                    cities: cities,
                    auth: req.cookies.auth,
                    active: active,
                    config: config
                });

        })
        .catch(err => {
            console.log(err);
        });

});


server.get('/:username', (req, res) => {
    let username = req.params.username;
    let auth = req.cookies.auth;
    console.log("user: " + req.cookies.username+" "+username);

    res.cookies = req.cookies;
    if (!auth&&username == req.cookies.username)
            res.redirect('/');

    if (username !== req.cookies.username){
        res.username=req.cookies.username;
        res.redirect('/guest/' + username);
    }



    let active = 'home';
    let guest = false;
    connection.query("SELECT * FROM users WHERE  username=?", [username])
        .then(([results, fields]) => {

            let res2 = results[0];
            connection.query(
                "SELECT ph_id,photographers.user_id, username,avatar_link,city,price " +
                "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;"
            ).then(([results2, fields2]) => {
                connection.query(
                    "SELECT ph_id FROM favorites WHERE user_id=?", [res2.user_id]
                ).then(([results3, fields3]) => {
                    connection.query(
                        "SELECT link, ph_id FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id"
                    ).then(([results4, fields4]) => {

                        res.cookies = req.cookies;

                        res.render(__dirname + '/views/home.pug',
                            {
                                types: types,
                                phinfo: results2,
                                info: results[0],
                                username: username,
                                favorites: results3,
                                photos: results4,
                                cities: cities,
                                auth: auth,
                                active: active,
                                guest: guest,
                                config: config
                            });
                    })
                        .catch(err => {
                            console.log(err);
                        });
                })
            })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });

});

server.get('/guest/photoalbum/:username', (req, res) => {
    let guest_username = req.params.username;
    let active = '';
    let guest = true;
    let auth = req.cookies.auth;

    res.cookies = req.cookies;
    if (guest_username === req.cookies.username)
        res.redirect('/photoalbum'+guest_username);

    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [guest_username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            connection.query("SELECT link,title,tags,photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {

                    connection.query("SELECT folder_id,name FROM folders WHERE ph_id =? GROUP BY folder_id ORDER BY folder_id", [ph_id])
                        .then(([results3, fields3]) => {


                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config, username: req.cookies.username, guest: guest, active: active,
                                ph_username: guest_username, auth: auth, photos: results2, folders: results3
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
});


server.get('/guest/:username', (req, res) => {
    let guest_username = req.params.username;

    console.log(req.cookies);
    console.log("guest "+guest_username);
    let active = '';
    let guest = true;
    if(guest_username==null){
        res.cookies=req.cookies;
        res.redirect('/');}

    connection.query("SELECT photographers.ph_id AS ph_id,photographers.user_id AS user_id,email,avatar_link,city,organization,username,lastname,firstname," +
        "fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave" +
        " FROM (photographers" +
        "  INNER JOIN users ON photographers.user_id=users.user_id)" +
        " INNER JOIN ratings ON photographers.ph_id=ratings.ph_id" +
        "  WHERE  username=?", [guest_username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            connection.query("SELECT name FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [ph_id])
                .then(([results2, fields2]) => {

                    connection.query("SELECT account_link,site_name,icon FROM accounts " +
                        "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=? ORDER BY socialnetworks.social_id", [ph_id])
                        .then(([results3, fields3]) => {
                            res.cookies = req.cookies;
                            res.render(__dirname + "/views/profileph.pug",
                                {
                                    mytypes: results2,
                                    contacts: results3,
                                    info: results[0],
                                    active: active,
                                    config: config,
                                    guest: guest,
                                    username: req.params.username,
                                    auth: req.cookies.auth
                                });

                        })
                        .catch(err => {

                            console.log(err);
                        });


                })
                .catch(err => {

                    console.log(err);
                });

        })
        .catch(err => {
            console.log(err);
        });


});

server.get('/edit/:username', (req, res) => {
    let username = req.params.username;
    let active = "";

    res.cookies = req.cookies;
    res.render(__dirname + "/views/edit.pug", {
        active: active,
        auth: req.cookies.auth,
        info: {username: username},
        config: config
    });
});

server.get('/photoalbum/:username', function (req, res) {
    if (!req.cookies.auth) res.redirect('/');

    let username = req.params.username;
    let active = 'album';
    let guest = false;

    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            connection.query("SELECT link,title,tags,photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {

                    connection.query("SELECT folder_id,name FROM folders WHERE ph_id =? GROUP BY folder_id ORDER BY folder_id", [ph_id])
                        .then(([results3, fields3]) => {

                            res.cookies = req.cookies;
                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config, username: username, guest: guest, auth: req.cookies.auth,
                                ph_username: username, photos: results2, folders: results3, active: active
                            });
                        })
                        .catch(err => {

                            console.log(err);
                        });


                })
                .catch(err => {

                    console.log(err);
                });


        })
        .catch(err => {

            console.log(err);
        });


});

server.get('/profile/:username', function (req, res) {


    let username = req.params.username;
    res.cookies = req.cookies;
    if (!req.cookies.auth) {
        if (username == req.cookies.username)
            res.redirect('/');
        else res.redirect('/guest/' + req.cookies.username);
    }
    if (username != req.cookies.username)
        res.redirect('/guest/' + req.cookies.username);


    let active = 'profile';
    let guest = false;

    if (req.cookies.role === 'photographer') {
        connection.query("SELECT photographers.ph_id as ph_id,photographers.user_id as user_id,email,avatar_link,city,organization,username,lastname,firstname," +
            "fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave" +
            " FROM (photographers" +
            "  INNER JOIN users ON photographers.user_id=users.user_id)" +
            " INNER JOIN ratings ON photographers.ph_id=ratings.ph_id" +
            "  WHERE  username=?", [username])
            .then(([results, fields]) => {
                let ph_id = results[0].ph_id;
                connection.query("SELECT name FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [ph_id])
                    .then(([results2, fields2]) => {

                        connection.query("SELECT account_link,site_name,icon FROM accounts " +
                            "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=? ORDER BY socialnetworks.social_id", [ph_id])
                            .then(([results3, fields3]) => {
                                connection.query("SELECT photographers.ph_id, username, avatar_link, price, city FROM favorites " +
                                    "INNER JOIN photographers ON photographers.ph_id=favorites.ph_id INNER JOIN users ON users.user_id = photographers.user_id WHERE favorites.user_id=? ORDER BY username", [results[0].user_id])
                                    .then(([results4, fields4]) => {

                                        res.cookies = req.cookies;
                                        res.render(__dirname + "/views/profileph.pug",
                                            {
                                                mytypes: results2,
                                                contacts: results3,
                                                favorites: results4,
                                                info: results[0],
                                                username: username,
                                                active: active,
                                                config: config,
                                                auth: req.cookies.auth,
                                                guest: guest
                                            });

                                    })
                                    .catch(err => {

                                        console.log(err);
                                    });


                            })
                            .catch(err => {

                                console.log(err);
                            });


                    })
                    .catch(err => {

                        console.log(err);
                    });

            })
            .catch(err => {
                console.log(err);
            });
    }
    else if (req.cookies.role === 'client') {
        connection.query("SELECT * FROM users WHERE  username=?", [username])
            .then(([results, fields]) => {

                res.render(__dirname + "/views/profile.pug", {
                    types: types,
                    info: results,
                    active: active,
                    config: config
                });

            })
            .catch(err => {
                console.log(err);
            });
    } else if (req.cookies.role === 'admin') {

    }

});

server.get('/logout', function (req, res) {

    res.cookies = req.cookies;
    res.cookies.auth = false;
    res.cookies.username = "";
    res.cookies.userid = "";
    res.cookies.role = "";
    console.log("exit");
    res.redirect('/');
});

server.post('/register', (req, res) => {
    res.cookies('role', "client");
    res.cookies("auth", true);

});

server.post('/registerph', (req, res) => {
    res.cookies('role', "photographer");
    res.cookies("auth", true);

});


server.post('/login', (req, res) => {
    req.cookies.clear();
    const login = req.body.login;
    let pass = req.body.pass;
    connection.query("SELECT * FROM users INNER JOIN roles on users.role_id = roles.role_id WHERE  email=?", [login])
        .then(([results, fields]) => {

            if (results === []) {
                console.log("no user with this username");
                res.redirect("/");
            }
            if (hashing(pass) === results[0].user_pass) {

                res.cookie("role", results[0].role);
                res.cookie("auth", true);
                res.cookie("username", results[0].username);

                res.redirect('/' + results[0].username);
            } else {
                console.log("incorrect password");
            }

        })
        .catch(err => {
            console.log('no user with this login');
            console.log(err);
        });

});

server.post('/addfolder', (req, res) => {
    if (req.cookies.auth)
        connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [req.cookies.username])
            .then(([results, fields]) => {

                connection.query("INSERT INTO folders(ph_id,name) VALUES(?, ?)", [results[0].ph_id, req.body.name])
                    .then(([results2, fields2]) => {
                        console.log("Successfully add new folder");
                        console.log(results2.insertId);
                        res.cookies=req.cookies;
                        res.send({'folder_id':results2.insertId});
                    })
                    .catch(err => {
                        console.log(err);
                        res.send(err);

                    });
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });

});

server.post('/addphoto', (req, res) => {
    //ajax!
});

server.post('/addfavorite', (req, res) => {

    connection.query("INSERT INTO favorites(user_id, ph_id) VALUES(?, ?)", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            console.log("Successfully add data");
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);

        });

});

server.post('/delfavorite', (req, res) => {


    connection.query("DELETE FROM favorites WHERE user_id=? AND ph_id=?", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            console.log("Successfully delete data");
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);

        });


});

function hashing(raw) {
    let hash = require("crypto").createHmac("sha256", "password")
        .update(config.salt + raw).digest("hex");
    for (let i = 0; i < 5; i++) {
        hash = require("crypto").createHmac("sha256", "password")
            .update(config.salt + hash).digest("hex");
    }
    return hash;
}


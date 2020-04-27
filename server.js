let express = require('express');
let server = express();
let bodyParser = require('body-parser');
let config = require('./config.json');
let types = [];
let cities = [];
let authentication = false;
let role = "";
let username = 'no';
let active = "home";
let guest = false;

server.set("view engine", "pug");
server.set('views', './');

server.use(express.static(__dirname));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

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
connection.connect(function (err) {
    if (err) {
        return console.error("Error: " + err.message);
    }
    else {
        console.log("MySQL server connection established ");
    }
});


connection.query("SELECT name,type_id FROM types", function (err, results, fields) {
    types = results;
});
connection.query("SELECT city FROM users Group By city", function (err, results, fields) {
    cities = results;
});


server.get('/reg', function (req, res) {
    active = 'reg';
    res.render(__dirname + "/views/registration.pug", {types: types, active: active, config: config});

});

server.get('/help', function (req, res) {
    active = 'help';
    res.render(__dirname + "/views/help.pug", {active: active, auth: authentication, config: config});
});

server.get('/', function (req, res) {
    active = 'home';
    authentication = false;
    let noun = "";
    connection.query(
        "SELECT ph_id,photographers.user_id, organization,username,avatar_link,city,price " +
        "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;")
        .then(([results, fields]) => {
            //console.log(results);

            res.render(__dirname + '/views/home.pug',
                {
                    types: types,
                    phinfo: results,
                    info: {username: noun},
                    username: noun,
                    cities: cities,
                    auth: authentication,
                    active: active,
                    config: config
                });

        })
        .catch(err => {
            console.log(err);
        });

});


server.get('/:username', (req, res) => {

    let username=req.params.username;

    if (!authentication) res.redirect('/');
    authentication=true;
    active = 'home';
    guest = false;
    connection.query("SELECT * FROM users WHERE  username=?", [username])
        .then(([results, fields]) => {
            let user_id=results[0].user_id;
            connection.query(
                "SELECT ph_id,photographers.user_id, username,avatar_link,city,price " +
                "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;"
            ).then(([results2, fields2]) => {
                connection.query(
                    "SELECT ph_id FROM favorites WHERE user_id=?",[user_id]
                ).then(([results3, fields3]) => {

                    res.render(__dirname + '/views/home.pug',
                        {
                            types: types,
                            phinfo: results2,
                            info: results[0],
                            username: username,
                            favorites:results3,
                            cities: cities,
                            auth: authentication,
                            active: active,
                            config: config
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
    active = '';
    guest = true;

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
                            console.log(results3);
                            console.log(results2);

                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config, username: username, guest: guest,
                                ph_username: guest_username, auth:authentication,photos: results2, folders: results3
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
    active = '';
    guest = true;

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
                        "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=?", [ph_id])
                        .then(([results3, fields3]) => {

                            res.render(__dirname + "/views/profileph.pug",
                                {
                                    mytypes: results2,
                                    contacts: results3,
                                    info: results[0],
                                    active: active,
                                    config: config,
                                    guest: guest,
                                    username: username,
                                    auth:authentication
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
    let username=req.params.username;
    res.render(__dirname + "/views/edit.pug", {active: active, info: {username: username}, config: config});
});

server.get('/photoalbum/:username', function (req, res) {
    if(!authentication) res.redirect('/');

    let username=req.params.username;
    active = 'album';
    guest = false;

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
                            console.log(results3);
                            console.log(results2);

                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config, username: username, guest: guest,
                                ph_username: username, photos: results2, folders: results3,active:active
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

    if (!authentication) res.redirect('/');

    let username=req.params.username;
    active = 'profile';
    guest=false;

    if (role === 'photographer') {
        connection.query("SELECT photographers.ph_id,photographers.user_id,email,avatar_link,city,organization,username,lastname,firstname," +
            "fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave" +
            " FROM (photographers" +
            "  INNER JOIN users ON photographers.user_id=users.user_id)" +
            " INNER JOIN ratings ON photographers.ph_id=ratings.ph_id" +
            "  WHERE  username=?", [username])
            .then(([results, fields]) => {
                let user_id = results[0].ph_id;
                connection.query("SELECT name FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [user_id])
                    .then(([results2, fields2]) => {

                        connection.query("SELECT account_link,site_name,icon FROM accounts " +
                            "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=?", [user_id])
                            .then(([results3, fields3]) => {
                                connection.query("SELECT photographers.ph_id, username, avatar_link, price, city FROM favorites " +
                                    "INNER JOIN photographers ON photographers.ph_id=favorites.ph_id INNER JOIN users ON users.user_id = photographers.user_id WHERE favorites.user_id=? ORDER BY username", [user_id])
                                    .then(([results4, fields4]) => {
                                        console.log(results4);
                                        res.render(__dirname + "/views/profileph.pug",
                                            {
                                                mytypes: results2,
                                                contacts: results3,
                                                favorites:results4,
                                                info: results[0],
                                                username: username,
                                                active: active,
                                                config: config,
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
    else if (role === 'client') {
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
    }

});


server.post('/register', (req, res) => {


});

server.post('/registerph', (req, res) => {


});

server.post('/login', (req, res) => {

    const login = req.body.login;
    let pass = req.body.pass;
    connection.query("SELECT * FROM users INNER JOIN roles on users.role_id = roles.role_id WHERE  email=?", [login])
        .then(([results, fields]) => {

            if (hashing(pass) === results[0].user_pass) {

                authentication = true;
                username = results[0].username;
                role = results[0].role;


                res.redirect('/' + username);
            } else {
                console.log("incorrect password");
            }

        })
        .catch(err => {
            console.log('no user with this login');
            console.log(err);
        });

});

server.post('/addfolder',(req, res) => {
    //ajax!
});

server.post('/addphoto',(req, res) => {
    //ajax!
});

server.post('/addfavorite',(req, res) => {

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

server.post('/delfavorite',(req, res) => {


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


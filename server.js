let express = require('express');
let server = express();
let bodyParser = require('body-parser');
let config = require('./config.json');
let cookieParser = require('cookie-parser');

let types = [];


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

server.get('/getcities', function (req, res) {
    connection.query("SELECT city FROM users GROUP BY city", function (err, results, fields) {
        res.cookies = req.cookies;
        if (err) {
            console.log(err);
            res.send(err);
        }
        res.send(results);
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
    res.render(__dirname + "/views/help.pug", {
        active: active,
        config: config,
        cookies: req.cookies
    });
});

server.get('/', function (req, res) {
    let active = 'home';
    console.log(req.cookies);

    if (req.cookies.auth == 'true') {
        console.log("HERE");
        res.cookies = req.cookies;
        if(req.cookies.role != 'admin')
        res.redirect('/home/' + req.cookies.username);
        if(req.cookies.role == 'admin')
            res.redirect('/admin');
    }
    let noun = "";

    connection.query(
        "SELECT ph_id,photographers.user_id, organization,username,avatar_link,city,price " +
        "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;")
        .then(([results, fields]) => {
            connection.query(
                "SELECT ph_id,link FROM photos INNER JOIN folders ON photos.folder_id=folders.folder_id ")
                .then(([results2, fields2]) => {
                    connection.query(
                        "SELECT ph_id, ROUND(AVG(mark)) as ave FROM ratings GROUP BY ph_id")
                        .then(([results3, fields3]) => {
                            res.cookies = req.cookies;
                            res.render(__dirname + '/views/home.pug',
                                {
                                    types: types,
                                    phinfo: results,
                                    photos: results2,
                                    auth: res.cookies.auth,
                                    active: active,
                                    config: config,
                                    favorites:res.cookies,
                                    ratings: results3,
                                    cookies: res.cookies
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

server.get('/home/:username', (req, res) => {
    res.cookies = req.cookies;

    let username = req.params.username;
    console.log("user: " + req.cookies.username + " " + username);

    if ((req.cookies.auth=='false') && username == req.cookies.username)
         res.redirect('/');
    if (username != req.cookies.username)
        res.redirect('/guest/' + username);

    let active = 'home';
    let guest = false;
    res.cookie("user_id", req.cookies.user_id);
    connection.query(
        "SELECT ph_id,photographers.user_id, organization, username,avatar_link,city,price " +
        "FROM photographers INNER JOIN users ON photographers.user_id=users.user_id;"
    ).then(([results2, fields2]) => {
        connection.query(
            "SELECT user_id,ph_id FROM favorites WHERE user_id=? GROUP BY ph_id", [req.cookies.user_id]
        ).then(([results3, fields3]) => {
            connection.query(
                "SELECT link, ph_id FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id ORDER BY ph_id ASC, photo_id DESC"
            ).then(([results4, fields4]) => {
                connection.query(
                    "SELECT ratings.ph_id as ph_id, ROUND(AVG(mark)) as ave FROM ratings INNER JOIN photographers ON photographers.ph_id=ratings.ph_id GROUP BY ratings.ph_id"
                ).then(([results5, fields5]) => {
                    console.log(res.cookies);
                    res.render(__dirname + '/views/home.pug',
                        {
                            types: types,
                            phinfo: results2,
                            favorites: results3,
                            photos: results4,
                            active: active,
                            ratings: results5,
                            guest: guest,
                            config: config,
                            cookies: res.cookies
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
    res.cookies = req.cookies;
    // if (guest_username === req.cookies.username)
    //   res.redirect('/photoalbum/' + guest_username);
    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [guest_username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            connection.query("SELECT link,title,tags, descr, photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {
                    for (p in results2)
                        results2[p].taglist = splitIntoTags(results2[p].tags);
                    connection.query("SELECT folder_id,name FROM folders WHERE ph_id =? GROUP BY folder_id ORDER BY folder_id", [ph_id])
                        .then(([results3, fields3]) => {
                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config,
                                guest: guest,
                                ph_username: guest_username,
                                photos: results2,
                                folders: results3,
                                active: active,
                                cookies: req.cookies

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
    res.cookies = req.cookies;
    console.log(req.cookies);
    console.log("guest " + guest_username);
    let active = '';
    let guest = true;

    if (guest_username == null) {
        console.log("guest username null");
        res.redirect('/');
    }

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
                            if (req.cookies.auth == 'false') {
                                res.render(__dirname + "/views/profileph.pug",
                                    {
                                        mytypes: results2,
                                        contacts: results3,
                                        info: results[0],
                                        active: active,
                                        config: config,
                                        guest: guest,
                                        username: req.params.username,
                                        auth: req.cookies.auth,
                                        cookies: req.cookies
                                    });
                            } else {
                                connection.query("SELECT mark from ratings WHERE user_id=? AND ph_id=?  ", [req.cookies.user_id, ph_id])
                                    .then(([results4, fields4]) => {
                                        let info = results[0];

                                        try {
                                            info.mark = results4[0].mark;
                                        } catch (err) {
                                            info.mark = 0;
                                        }


                                        console.log(info.mark);
                                        res.render(__dirname + "/views/profileph.pug",
                                            {
                                                mytypes: results2,
                                                contacts: results3,
                                                info: info,
                                                active: active,
                                                config: config,
                                                guest: guest,
                                                username: req.params.username,
                                                auth: req.cookies.auth,
                                                cookies: req.cookies
                                            });
                                    })
                                    .catch(err => {

                                        console.log(err);
                                    });

                            }

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
    if (req.cookies.username !== username)
        res.redirect('/guest/' + username);
    let active = "";

    res.cookies = req.cookies;
    res.render(__dirname + "/views/edit.pug", {
        active: active,
        auth: req.cookies.auth,
        config: config,
        cookies: req.cookies
    });
});

server.get('/photoalbum/:username', function (req, res) {
    let username = req.params.username;
    // if (req.cookies.auth == 'false' && req.cookies.username === username) res.redirect('/');
    //if (req.cookies.auth == 'false' && req.cookies.username !== username) res.redirect('/guest/photoalbum/' + username);

    let active = 'album';
    let guest = false;
    res.cookies = req.cookies;
    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            res.cookie("user_id", results[0].user_id);
            connection.query("SELECT photo_id, link,title,tags, descr, photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {
                    connection.query("SELECT folder_id,name FROM folders WHERE ph_id =? GROUP BY folder_id ORDER BY folder_id", [ph_id])
                        .then(([results3, fields3]) => {
                            for (p in results2)
                                results2[p].taglist = splitIntoTags(results2[p].tags);
                            res.render(__dirname + "/views/photoalbum.pug", {
                                config: config,
                                guest: guest,
                                photos: results2,
                                folders: results3,
                                active: active,
                                cookies: req.cookies
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
    if (req.cookies.auth == 'false') {
      if (username == req.cookies.username)
        res.redirect('/');
      else res.redirect('/guest/' + req.cookies.username);
    }
    if (username != req.cookies.username)
        res.redirect('/guest/' + req.cookies.username);


    let active = 'profile';
    let guest = false;

    if (req.cookies.role == 'photographer') {
        connection.query("SELECT photographers.ph_id as ph_id,photographers.user_id as user_id,email,avatar_link,city,organization,username,lastname,firstname," +
            "fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave" +
            " FROM (photographers" +
            "  INNER JOIN users ON photographers.user_id=users.user_id)" +
            " INNER JOIN ratings ON photographers.ph_id=ratings.ph_id" +
            "  WHERE  username=?", [username])
            .then(([results, fields]) => {
                let ph_id = results[0].ph_id;
                res.cookie("user_id", results[0].user_id);
                connection.query("SELECT name FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [ph_id])
                    .then(([results2, fields2]) => {

                        connection.query("SELECT account_link,site_name,icon FROM accounts " +
                            "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=? ORDER BY socialnetworks.social_id", [ph_id])
                            .then(([results3, fields3]) => {
                                connection.query("SELECT photographers.ph_id, username, avatar_link, price, city FROM favorites " +
                                    "INNER JOIN photographers ON photographers.ph_id=favorites.ph_id INNER JOIN users ON users.user_id = photographers.user_id WHERE favorites.user_id=? ORDER BY username", [results[0].user_id])
                                    .then(([results4, fields4]) => {


                                        res.render(__dirname + "/views/profileph.pug",
                                            {
                                                mytypes: results2,
                                                contacts: results3,
                                                favorites: results4,
                                                info: results[0],
                                                active: active,
                                                config: config,
                                                guest: guest,
                                                cookies: req.cookies
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
    else if (req.cookies.role == 'client') {
        connection.query("SELECT * FROM users WHERE  username=?", [username])
            .then(([results, fields]) => {
                connection.query("SELECT photographers.ph_id, username, avatar_link, price, city FROM favorites " +
                    "INNER JOIN photographers ON photographers.ph_id=favorites.ph_id INNER JOIN users ON users.user_id = photographers.user_id WHERE favorites.user_id=? ORDER BY username", [results[0].user_id])
                    .then(([results2, fields2]) => {
                        res.cookies = req.cookies;
                        res.render(__dirname + "/views/profile.pug", {
                            types: types,
                            info: results[0],
                            favorites:results2,
                            active: active,
                            config: config,
                            cookies: req.cookies
                        });

                    })
                    .catch(err => {
                        console.log(err);
                    });

            })
            .catch(err => {
                console.log(err);
            });
    } else if (req.cookies.role == 'admin') {
        res.cookies = req.cookies;
        res.redirect('/admin');
    }

});

server.get('/admin', function (req, res) {
    connection.query("SELECT * FROM photos")
        .then(([results, fields]) => {
            res.render(__dirname + "/views/admin.pug", {
                photos: results,
                config: config,
                cookies: req.cookies
            });
        })
        .catch(err => {
            console.log(err);
        });
});

server.post('/logout', function (req, res) {

    res.cookie("auth", 'false');
    res.cookie("username", "");
    res.cookie("user_id", "");
    res.cookie("role", "");
    console.log("exitEXIT EXIT EXIIIIIIIIIIIIIIIIIIIIIIIIIIIT");
    res.redirect('/');
});

server.post('/register', (req, res) => {
    res.cookies = req.cookies;
    res.cookies('role', "client");
    res.cookies("auth", 'true');

});

server.post('/registerph', (req, res) => {
    res.cookies = req.cookies;
    res.cookies('role', "photographer");
    res.cookies("auth", 'true');

});


server.post('/login', (req, res) => {

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
                res.cookie("auth", 'true');
                res.cookie("username", results[0].username);
                res.cookie("user_id", results[0].user_id);
                let href='/';
                if(results[0].role=='admin')
                    href+='admin';
                else href+='home/'+results[0].username;
                res.redirect(href);

            } else {
                console.log("incorrect password");
                res.redirect("/");
            }

        })
        .catch(err => {
            console.log('no user with this login');
            console.log(err);
            res.redirect("/");
        });

});


server.post('/addfavorite', (req, res) => {
    res.cookies = req.cookies;
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
    res.cookies = req.cookies;
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

server.post('/addfolder', (req, res) => {
    if (req.cookies.auth)
        connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [req.cookies.username])
            .then(([results, fields]) => {

                connection.query("INSERT INTO folders(ph_id,name) VALUES(?, ?)", [results[0].ph_id, req.body.name])
                    .then(([results2, fields2]) => {
                        console.log("Successfully add new folder");
                        console.log(results2.insertId);
                        res.cookies = req.cookies;
                        res.send({'folder_id': results2.insertId});
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
server.post('/editfolder', (req, res) => {

    connection.query("UPDATE folders SET name=? WHERE folder_id=?", [req.body.name, req.body.folder_id])
        .then(([results, fields]) => {
            console.log("Successfully updated data");
            res.cookies = req.cookies;
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);

        });

});
server.post('/deletefolder', (req, res) => {
    connection.query("DELETE FROM folders WHERE folder_id=?", [req.body.folder_id])
        .then(([results, fields]) => {
            console.log("Successfully delete folder");
            res.cookies = req.cookies;
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

server.post('/addphoto', (req, res) => {
    if (req.cookies.auth)
        connection.query("INSERT INTO photos(folder_id,link,title,descr,tags) VALUES(?, ?, ?, ?, ?)", [req.body.folder_id, req.body.link, req.body.title, req.body.descr, req.body.tags])
            .then(([results, fields]) => {
                console.log("Successfully add new photo");
                console.log(results.insertId);
                res.cookies = req.cookies;
                res.send({'photo_id': results.insertId});
            })
            .catch(err => {
                console.log(err);
                res.send(err);
            });
});
server.post('/deletephoto', (req, res) => {
    connection.query("DELETE FROM photos WHERE photo_id=?", [req.body.photo_id])
        .then(([results, fields]) => {
            console.log("Successfully deleted photo");
            res.cookies = req.cookies;
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});
server.post('/editphoto', (req, res) => {
    connection.query("DELETE FROM tags WHERE photo_id=?", [req.body.photo_id])
        .then(([results, fields]) => {
            connection.query("UPDATE photos SET title=?, descr=?, tags=? WHERE photo_id=?", [req.body.title, req.body.descr, req.body.tags, req.body.photo_id])
                .then(([results2, fields2]) => {
                    console.log("Successfully updated data");
                    res.cookies = req.cookies;
                    let taglist = splitIntoTags(req.body.tags);
                    res.send(taglist);
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

server.post('/unvote', (req, res) => {
    res.cookies = req.cookies;
    connection.query("DELETE FROM ratings WHERE user_id=? AND ph_id=?", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            console.log("Successfully delete data");
            connection.query("SELECT ROUND(AVG(mark)) as ave FROM ratings WHERE ph_id=?", [req.body.ph_id])
                .then(([results2, fields2]) => {
                    console.log(results2[0]);
                    if (results2[0].avg == null)
                        results2[0].avg == 0;
                    results2[0].cookies = req.cookies;
                    res.cookies = req.cookies;
                    res.send(results2[0]);
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
server.post('/vote', (req, res) => {
    res.cookies = req.cookies;
    connection.query("INSERT INTO ratings(user_id, ph_id,mark) VALUES(?, ?, ?)", [req.body.user_id, req.body.ph_id, req.body.mark])
        .then(([results, fields]) => {
            console.log("Successfully add data");
            connection.query("SELECT ROUND(AVG(mark)) as ave FROM ratings WHERE ph_id=?", [req.body.ph_id])
                .then(([results2, fields2]) => {
                    console.log(results2[0]);
                    if (results2[0].avg == null || results2[0] == undefined)
                        results2[0].avg == 0;
                    results2[0].cookies = req.cookies;
                    res.cookies = req.cookies;
                    res.send(results2[0]);
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

function getListOfFolders(array) {

    let attributes = [];
    array.map(({folder_id}) => {
        if (folder_id) attributes.push(folder_id)
    });

    console.log(attributes);
    return attributes;
}

function splitIntoTags(str) {
    let tags = [];
    let stringArray = str.split(/\s/);
    for (s of stringArray)
        tags.push(s);
    return tags;
}


function hashing(raw) {
    let hash = require("crypto").createHmac("sha256", "password")
        .update(config.salt + raw).digest("hex");
    for (let i = 0; i < 5; i++) {
        hash = require("crypto").createHmac("sha256", "password")
            .update(config.salt + hash).digest("hex");
    }
    return hash;
}


//include modules
let express = require('express');
let server = express();
let bodyParser = require('body-parser');
let config = require('./config.json');
let cookieParser = require('cookie-parser');
const mysql = require("mysql2");
let multer  =   require('multer');
let crypto = require("crypto");
let custom = require('./public/javascripts/custom_modules.js');
let types = [];

//connect pug
server.set("view engine", "pug");
server.set('views', './');

server.use(express.static(__dirname));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(cookieParser());

let storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

//start server
server.listen(2606, () => {
    console.log('listening on 2606')
});

//connect to mysql database
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password
}).promise();

//create inverted list for search
function createInvertedList() {
    connection.query(
        "SELECT tags,photo_id as id FROM photos"
    ).then(([results, fields]) => {
        for (let r in results)
            results[r].taglist = custom.splitIntoTags(results[r].tags);
        custom.setInvertedList(results);
    })
        .catch(err => {
            console.log(err);
        });
}
createInvertedList();

//select all types of photoshoots
connection.query("SELECT name,type_id FROM types", function (err, results, fields) {
    types = results;
});

//page with static information about site
server.get('/about', function (req, res) {
    let active = 'about';
    res.cookies = req.cookies;
    res.render(__dirname + "/views/about.pug", {
        active: active,
        config: config,
        cookies: req.cookies
    });
});

//main page of authorized and unauthorized user
server.get('/home/:username', (req, res) => {
    res.cookies = req.cookies;
    let username = req.params.username;
    if ((req.cookies.auth == 'false') && username == req.cookies.username)
        res.redirect('/');
    if (username != req.cookies.username)
        res.redirect('/guest/' + username);
    let active = 'home';
    let guest = false;
    res.cookie("user_id", req.cookies.user_id);
    connection.query("SELECT photographers.ph_id, photographers.user_id,username,city," +
        " avatar_link,price,exp,organization,ROUND(AVG(mark)) AS ave" +
        " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id) " +
        " LEFT JOIN ratings ON photographers.ph_id=ratings.ph_id " +
        " GROUP BY photographers.ph_id ORDER BY ave DESC, username ASC"
    ).then(([results2, fields2]) => {
        connection.query(
            "SELECT user_id,ph_id FROM favorites WHERE user_id=? GROUP BY ph_id", [req.cookies.user_id]
        ).then(([results3, fields3]) => {
            connection.query(
                "SELECT link, ph_id FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id ORDER BY ph_id ASC, photo_id DESC"
            ).then(([results4, fields4]) => {
                res.render(__dirname + '/views/home.pug',
                    {
                        types: types,
                        phinfo: results2,
                        favorites: results3,
                        photos: results4,
                        active: active,
                        guest: guest,
                        config: config,
                        cookies: res.cookies
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
server.get('/', function (req, res) {
    let active = 'home';
    if (req.cookies.auth == 'true') {
        res.cookies = req.cookies;
        if (req.cookies.role != 'admin')
            res.redirect('/home/' + req.cookies.username);
        if (req.cookies.role == 'admin')
            res.redirect('/admin');
    }
    let noun = "";
    connection.query("SELECT photographers.ph_id, photographers.user_id,username,city," +
        " avatar_link,price,exp,organization,ROUND(AVG(mark)) AS ave" +
        " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id) " +
        " LEFT JOIN ratings ON photographers.ph_id=ratings.ph_id " +
        " GROUP BY photographers.ph_id ORDER BY ave DESC, username ASC")
        .then(([results, fields]) => {
            connection.query(
                "SELECT ph_id,link FROM photos INNER JOIN folders ON photos.folder_id=folders.folder_id ")
                .then(([results2, fields2]) => {
                    res.cookies = req.cookies;
                    res.render(__dirname + '/views/home.pug',
                        {
                            types: types,
                            phinfo: results,
                            photos: results2,
                            auth: res.cookies.auth,
                            active: active,
                            config: config,
                            favorites: res.cookies,
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
});

//get information and render photographer profile when user visit it
server.get('/guest/:username', (req, res) => {
    let guest_username = req.params.username;
    res.cookies = req.cookies;
    let active = '';
    let guest = true;
    if (guest_username == null) 
        res.redirect('/');
    connection.query(" SELECT photographers.ph_id AS ph_id,photographers.user_id AS user_id,email,avatar_link,city," +
        "organization,username,lastname,firstname,fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave " +
        " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id ) LEFT JOIN ratings " +
        " ON photographers.ph_id=ratings.ph_id WHERE username = ? GROUP BY ph_id ", [guest_username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            let info = results[0];
            if (info.ave == null)
                info.ave = 0;
            else info.ave = parseInt(info.ave, 10);
            connection.query("SELECT date FROM freedates WHERE ph_id=?", [ph_id])
                .then(([results1, fields1]) => {
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
                                                cookies: req.cookies,
                                                dates: results1
                                            });
                                    } else {

                                        connection.query("SELECT mark FROM ratings WHERE user_id=? AND ph_id=?  ", [req.cookies.user_id, ph_id])
                                            .then(([results4, fields4]) => {

                                                try {
                                                    info.mark = results4[0].mark;
                                                } catch (err) {
                                                    info.mark = 0;
                                                }
                                                connection.query("SELECT * FROM favorites WHERE user_id=? AND ph_id=?", [req.cookies.user_id, ph_id])
                                                    .then(([results5, fields5]) => {

                                                        let favorite = true;
                                                        if (results5 == [] || results5[0] == undefined)
                                                            favorite = false;

                                                        res.render(__dirname + "/views/profileph.pug",
                                                            {
                                                                mytypes: results2,
                                                                contacts: results3,
                                                                info: info,
                                                                active: active,
                                                                config: config,
                                                                guest: guest,
                                                                favorite: favorite,
                                                                username: req.params.username,
                                                                auth: req.cookies.auth,
                                                                cookies: req.cookies,
                                                                dates: results1
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

});
server.get('/guest/photoalbum/:username', (req, res) => {
    let guest_username = req.params.username;
    let active = '';
    let guest = true;
    res.cookies = req.cookies;
    if (guest_username == req.cookies.username)
        res.redirect('/photoalbum/' + guest_username);
    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [guest_username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;
            connection.query("SELECT link,title,tags, descr, photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {
                    for (p in results2)
                        if (results2[p].tags == null)
                            results2[p].taglist = [];
                        else
                            results2[p].taglist = custom.splitIntoTags(results2[p].tags);
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

//show page with user information which he can edit
server.get('/edit/:username', (req, res) => {
    let username = req.params.username;
    if (req.cookies.username !== username)
        res.redirect('/guest/' + username);
    let active = "";
    res.cookies = req.cookies;
    if (req.cookies.role == 'client')
        connection.query("SELECT * FROM users WHERE username=?", [username])
            .then(([results, fields]) => {
                connection.query("SELECT username, email FROM users WHERE username<>?", [username])
                    .then(([results2, fields2]) => {
                        res.render(__dirname + "/views/edit.pug", {
                            active: active,
                            auth: req.cookies.auth,
                            config: config,
                            cookies: req.cookies,
                            info: results[0],
                            users: results2
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    else if (req.cookies.role == 'photographer')
        connection.query("SELECT * FROM users INNER JOIN photographers ON users.user_id = photographers.user_id WHERE username=?", [username])
            .then(([results, fields]) => {
                let ph_id = results[0].ph_id;
                connection.query("SELECT username, email FROM users WHERE username<>?", [username])
                    .then(([results2, fields2]) => {
                        connection.query("SELECT shoots.type_id, name, ph_id FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [ph_id])
                            .then(([results3, fields3]) => {
                                connection.query("SELECT * FROM accounts WHERE ph_id=?", [ph_id])
                                    .then(([results4, fields4]) => {
                                        connection.query("SELECT * FROM socialnetworks ORDER BY site_name")
                                            .then(([results5, fields5]) => {
                                                results[0].role = req.cookies.role;
                                                res.render(__dirname + "/views/edit.pug", {
                                                    active: active,
                                                    config: config,
                                                    social: results5,
                                                    accounts: results4,
                                                    ph_types: results3,
                                                    types: types,
                                                    cookies: req.cookies,
                                                    info: results[0],
                                                    users: results2
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
            })
            .catch(err => {
                console.log(err);
            });
});

//show user profile and photo album(if photographer)
server.get('/photoalbum/:username', function (req, res) {
    let username = req.params.username;
    if (req.cookies.auth == 'false' && req.cookies.username != username) res.redirect('/guest/photoalbum/' + username);

    let active = 'album';
    let guest = false;
    res.cookies = req.cookies;
    connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [username])
        .then(([results, fields]) => {
            let ph_id = results[0].ph_id;

            connection.query("SELECT photo_id, link,title,tags, descr, photos.folder_id " +
                "FROM photos INNER JOIN folders ON folders.folder_id=photos.folder_id " +
                "WHERE ph_id =? " +
                "ORDER BY folders.folder_id ASC, photo_id DESC", [ph_id])
                .then(([results2, fields2]) => {
                    connection.query("SELECT folder_id,name FROM folders WHERE ph_id =? GROUP BY folder_id ORDER BY folder_id", [ph_id])
                        .then(([results3, fields3]) => {
                            for (p in results2)
                                results2[p].taglist = custom.splitIntoTags(results2[p].tags);
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
        connection.query(" SELECT photographers.ph_id AS ph_id,photographers.user_id AS user_id,email,avatar_link,city," +
            "organization,username,lastname,firstname,fathername,price,exp,organization,about,ROUND(AVG(mark)) AS ave " +
            " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id ) LEFT JOIN ratings " +
            " ON photographers.ph_id=ratings.ph_id WHERE username = ? GROUP BY ph_id ", [username])
            .then(([results, fields]) => {
                let ph_id = results[0].ph_id;
                connection.query("SELECT date FROM freedates WHERE ph_id=?", [ph_id])
                    .then(([results1, fields1]) => {
                        connection.query("SELECT name FROM types INNER JOIN shoots ON types.type_id=shoots.type_id WHERE ph_id=?", [ph_id])
                            .then(([results2, fields2]) => {
                                if (results2 == undefined)
                                    results2 = [];
                                connection.query("SELECT account_link,site_name,icon FROM accounts " +
                                    "INNER JOIN socialnetworks ON socialnetworks.social_id=accounts.social_id WHERE ph_id=? ORDER BY socialnetworks.social_id", [ph_id])
                                    .then(([results3, fields3]) => {
                                        if (results3[0] == undefined)
                                            results3 = [];
                                        connection.query("SELECT photographers.ph_id, username, avatar_link, price, city FROM favorites " +
                                            "INNER JOIN photographers ON photographers.ph_id=favorites.ph_id INNER JOIN users ON users.user_id = photographers.user_id WHERE favorites.user_id=? ORDER BY username", [results[0].user_id])
                                            .then(([results4, fields4]) => {
                                                if (results4[0] == undefined)
                                                    results4 = [];


                                                let info = results[0];
                                                if (info.ave == null)
                                                    info.ave = 0;
                                                else info.ave = parseInt(info.ave, 10);
                                                connection.query("SELECT * FROM orders INNER JOIN users ON users.user_id=orders.client_id WHERE ph_id=? ORDER BY date", [ph_id])
                                                    .then(([results5, fields5]) => {

                                                        res.cookies = req.cookies;
                                                        res.cookie("user_id", results[0].user_id);
                                                        res.render(__dirname + "/views/profileph.pug",
                                                            {
                                                                mytypes: results2,
                                                                contacts: results3,
                                                                favorites: results4,
                                                                info: info,
                                                                active: active,
                                                                config: config,
                                                                guest: guest,
                                                                cookies: req.cookies,
                                                                dates: results1,
                                                                orders: results5
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
                        connection.query("SELECT order_id,orders.ph_id,client_id,username,date,topic, message_ph,message_cl, status, contact_ph,contact_cl" +
                            " FROM orders INNER JOIN photographers ON photographers.ph_id=orders.ph_id INNER JOIN users ON photographers.user_id= users.user_id WHERE client_id=? ORDER BY date", [results[0].user_id])
                            .then(([results3, fields3]) => {
                                res.cookies = req.cookies;
                                res.render(__dirname + "/views/profile.pug", {
                                    types: types,
                                    info: results[0],
                                    favorites: results2,
                                    active: active,
                                    config: config,
                                    cookies: req.cookies,
                                    orders: results3
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
    } else if (req.cookies.role == 'admin') {
        res.cookies = req.cookies;
        res.redirect('/admin');
    }

});

//show admin page
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

//log in and log out
server.post('/login', (req, res) => {
    const login = req.body.login;
    let pass = req.body.password;
    connection.query("SELECT * FROM users INNER JOIN roles on users.role_id = roles.role_id WHERE  email=?", [login])
        .then(([results, fields]) => {
            if (results == []) 
                res.send({'success': 'no'});
            if (hashing(pass) == results[0].user_pass) {
                res.cookie("role", results[0].role);
                res.cookie("auth", 'true');
                res.cookie("username", results[0].username);
                res.cookie("user_id", results[0].user_id);
                let href = '/';
                if (results[0].role == 'admin')
                    href += 'admin';
                else href += 'home/' + results[0].username;
                res.send({"success": "yes", "href": href})
            } else {
                console.log("incorrect password");
                res.send({'success': 'no'});
            }
        })
        .catch(err => {
            console.log('no user with this login');
            console.log(err);
            res.send({'success': 'no'});
        });
});
server.post('/logout', function (req, res) {
    res.cookie("auth", 'false');
    res.cookie("username", "");
    res.cookie("user_id", "");
    res.cookie("role", "");
    console.log("logged out");
    res.redirect('/');
});

//registration
server.post('/register', (req, res) => {
    let pass = hashing(req.body.password);
    let username = req.body.username;
    connection.query("INSERT INTO users(username,email,user_pass,city,role_id) VALUES(?,?,?,?,1)", [username, req.body.email, pass, req.body.city])
        .then(([results, fields]) => {
            res.cookie('role', "client");
            res.cookie('auth', 'true');
            res.cookie('user_id', results.insertId);
            res.cookie('username', username);
            let href = '/profile/' + username;
            res.send({"success": "yes", "href": href});
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });

});
server.post('/registerph', (req, res) => {
    let pass = hashing(req.body.password);
    let username = req.body.username;
    connection.query("INSERT INTO users(username,email,user_pass,city,role_id) VALUES(?,?,?,?,2)", [username, req.body.email, pass, req.body.city])
        .then(([results, fields]) => {
            let user_id = results.insertId;
            connection.query("INSERT INTO photographers(user_id,lastname,firstname,fathername,price,exp,organization) " +
                "VALUES(?,?,?,?,?,?,?)", [user_id, req.body.lastname, req.body.firstname, req.body.fathername, req.body.price,
                req.body.experience, req.body.organization])
                .then(([results2, fields2]) => {
                    let ph_id = results2.insertId;
                    let types = req.body.types;
                    if (types != []) {
                        for (let i in types)
                            types[i].push(ph_id)
                        connection.query("INSERT INTO shoots(type_id,ph_id) VALUES ?", [types])
                            .then(([results3, fields3]) => {
                                res.cookie('role', 'photographer');
                                res.cookie('auth', 'true');
                                res.cookie('user_id', user_id);
                                res.cookie('username', username);
                                let href = '/profile/' + username;
                                res.send({"success": "yes", "href": href});
                            })
                            .catch(err => {
                                console.log(err);
                                res.send({"success": "no"});
                            });
                    } else {
                        res.cookie('role', 'photographer');
                        res.cookie('auth', 'true');
                        res.cookie('user_id', user_id);
                        res.cookie('username', username);
                        let href = '/profile/' + username;
                        res.send({"success": "yes", "href": href});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.send({"success": "no"});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });


});
server.get('/registry', function (req, res) {
    let active = 'reg';
    res.cookies = req.cookies;
    connection.query(
        "SELECT * FROM users"
    ).then(([results, fields]) => {
        res.render(__dirname + "/views/registration.pug", {
            types: types,
            active: active,
            config: config,
            users: results
        });
    })
        .catch(err => {
            console.log(err);
        });


});

//edit profile information
server.post('/changepassword', (req, res) => {
    res.cookies = req.cookies;
    let pass = hashing(req.body.user_pass);
    connection.query("UPDATE users SET user_pass=? WHERE user_id=?", [pass, req.body.user_id])
        .then(([results, fields]) => {
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });
});
server.post('/editclient', (req, res) => {
    connection.query("UPDATE users SET username=?, email=?, city=?,avatar_link=?,phone=?,about=? WHERE user_id=?",
        [req.body.username, req.body.email, req.body.city, req.body.avatar_link, req.body.phone, req.body.about, req.body.user_id])
        .then(([results, fields]) => {

            res.cookies = req.cookies;
            res.cookie("username", req.body.username);
            if (req.body.role == 'photographer')
                connection.query("UPDATE photographers SET user_id=?, firstname=?, lastname=?,fathername=?,price=?,exp=?,organization=? WHERE ph_id=?",
                    [req.body.user_id, req.body.firstname, req.body.lastname, req.body.fathername, req.body.price, req.body.experience, req.body.organization, req.body.ph_id])
                    .then(([results, fields]) => {
                        res.cookie('username', req.body.username);
                        res.send({'success': 'yes'});
                    })
                    .catch(err => {
                        console.log(err);
                        res.send({'success': 'no'});
                    });
            else {
                console.log("Successfully updated user");
                res.send({'success': 'yes'});
            }
        })
        .catch(err => {
            console.log(err);
            res.send({'success': 'no'});
        });
});
server.post('/editaccounts', (req, res) => {
    res.cookies = req.cookies;
    let values = req.body.values;
    connection.query("DELETE FROM accounts WHERE ph_id=?", [req.body.ph_id])
        .then(([results, fields]) => {
            connection.query("INSERT INTO accounts(social_id,account_link,ph_id) VALUES ?", [values])
                .then(([results, fields]) => {
                    res.send({"success": "yes"});
                })
                .catch(err => {
                    console.log(err);
                    res.send({"success": "no"});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });
});
server.post('/edittypes', (req, res) => {
    res.cookies = req.cookies;
    let values = req.body.values;
    connection.query("DELETE FROM shoots WHERE ph_id=?", [req.body.ph_id])
        .then(([results, fields]) => {
            connection.query("INSERT INTO shoots(type_id,ph_id) VALUES ?", [values])
                .then(([results, fields]) => {
                    res.send({"success": "yes"});
                })
                .catch(err => {
                    console.log(err);
                    res.send({"success": "no"});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });
});

//filter and search functions
server.post('/filter', (req, res) => {
    res.cookies = req.cookies;
    let sel_user = "SELECT photographers.ph_id, photographers.user_id,username,city,avatar_link,price,exp,organization,ROUND(AVG(mark)) AS ave" +
        " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id) " +
        " LEFT JOIN ratings ON photographers.ph_id=ratings.ph_id ";
    sel_user += " WHERE price BETWEEN ? AND ? ";
    if (req.body.city != '0')
        sel_user += " AND city=? ";
    else
        sel_user += "AND city <> ?";
    if (req.body.years != '0')
        sel_user += " AND exp=? ";
    else
        sel_user += " AND exp<> ?";
    if (req.body.type != '0')
        sel_user += " AND photographers.ph_id IN (SELECT ph_id FROM shoots WHERE type_id=?) ";
    connection.query(sel_user + " GROUP BY photographers.ph_id ORDER BY ave DESC ", [req.body.min_price, req.body.max_price, req.body.city, req.body.years, req.body.type])
        .then(([results, fields]) => {
            let phs = [];
            for (let i in results)
                phs.push(results[i].ph_id);
            connection.query("SELECT ph_id,link FROM photos INNER JOIN folders ON photos.folder_id=folders.folder_id WHERE ph_id IN (?)", [phs])
                .then(([results3, fields3]) => {
                    if (req.cookies.auth) {
                        connection.query("SELECT ph_id, user_id FROM favorites WHERE user_id=? AND ph_id IN (?)", [req.cookies.user_id, phs])
                            .then(([results4, fields4]) => {
                                res.send({
                                    'success': "yes",
                                    ph_info: results,
                                    cookies: req.cookies,
                                    photos: results3,
                                    favorites: results4
                                });
                            })
                            .catch(err => {
                                res.send({'success': "no"});
                            });
                    }
                    else
                        res.send({
                            'success': "yes",
                            ph_info: results,
                            cookies: req.cookies,
                            photos: results3,
                            favorites: []
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.send({'success': "no"});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({'success': "no"});
        });
});
server.post('/searchph', (req, res) => {
    res.cookies = req.cookies;
    let name = req.body.name;
    connection.query(
        "SELECT photographers.ph_id, photographers.user_id,username,city,avatar_link,price,exp,organization,ROUND(AVG(mark)) AS ave" +
        " FROM ( photographers INNER JOIN users ON photographers.user_id=users.user_id) " +
        " LEFT JOIN ratings ON photographers.ph_id=ratings.ph_id " +
        " WHERE username = ? OR firstname=? OR lastname=? GROUP BY photographers.ph_id ORDER BY ave DESC ", [name, name, name])
        .then(([results, fields]) => {
            let phs = [];
            for (let i in results)
                phs.push(results[i].ph_id);
            connection.query("SELECT ph_id,link FROM photos INNER JOIN folders ON photos.folder_id=folders.folder_id WHERE ph_id IN (?)", [phs])
                .then(([results3, fields3]) => {
                    if (req.cookies.auth) {
                        connection.query("SELECT ph_id, user_id FROM favorites WHERE user_id=? AND ph_id IN (?)", [req.cookies.user_id, phs])
                            .then(([results4, fields4]) => {
                                res.send({
                                    'success': "yes",
                                    ph_info: results,
                                    cookies: req.cookies,
                                    photos: results3,
                                    favorites: results4
                                });
                            })
                            .catch(err => {
                                res.send({'success': "no"});
                            });
                    }
                    else
                        res.send({
                            'success': "yes",
                            ph_info: results,
                            cookies: req.cookies,
                            photos: results3,
                            favorites: []
                        });
                })
                .catch(err => {
                    res.send({'success': "no"});
                });
        })
        .catch(err => {
            res.send({'success': "no"});
        });
});
server.get('/search', function (req, res) {
    let request = custom.splitIntoTags(req.query.q);
    let photos = custom.search(request);
    if (photos[0] === undefined)
        res.render(__dirname + "/views/search.pug", {
            photos: photos,
            config: config,
            cookies: req.cookies,
            request: req.query.q
        });
    else {
        connection.query(" SELECT photo_id, username, link,title,tags, descr, photos.folder_id " +
            "FROM ((photos INNER JOIN folders ON folders.folder_id=photos.folder_id )" +
            " INNER JOIN photographers ON folders.ph_id=photographers.ph_id) INNER JOIN users ON photographers.user_id=users.user_id " +
            " WHERE photo_id IN (?) ", [photos])
            .then(([results2, fields2]) => {
                for (p in results2)
                    results2[p].taglist = custom.splitIntoTags(results2[p].tags);
                res.render(__dirname + "/views/search.pug", {
                    photos: results2,
                    config: config,
                    cookies: req.cookies,
                    request: req.query.q
                });
            })
            .catch(err => {
                console.log(err);
            });
    }
});

//return list of cities to filter
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

//add and delete rows from table orders
server.post('/order', (req, res) => {
    res.cookies = req.cookies;
    connection.query("INSERT INTO orders(ph_id,client_id,date,topic,contact_cl,message_cl,status) VALUES(?,?,?,?,?,?,2) ",
        [req.body.ph_id, req.body.user_id, req.body.date, req.body.topic, req.body.contact_cl, req.body.message_cl])
        .then(([results, fields]) => {
            connection.query("DELETE FROM freedates WHERE ph_id=? AND date=?", [req.body.ph_id, req.body.date])
                .then(([results2, fields2]) => {
                    res.send({"success": "yes"});
                })
                .catch(err => {
                    console.log(err);
                    res.send({"success": "no", "error": err});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no", "error": err});
        });
});
server.post('/deleteorder', (req, res) => {
    res.cookies = req.cookies;
    connection.query("DELETE FROM orders WHERE order_id=?", [req.body.order_id])
        .then(([results, fields]) => {
            connection.query("INSERT INTO freedates(ph_id,date) VALUES(?,?)", [req.body.ph_id, req.body.date])
                .then(([results, fields]) => {
                    res.send({"success": "yes"});
                })
                .catch(err => {
                    console.log(err);
                    res.send({"success": "no"});
                });
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no"});
        });
});

//change order status and update information
server.post('/cancel', (req, res) => {
    connection.query("UPDATE orders SET status=0,message_ph=? WHERE order_id=?", [req.body.message_ph, req.body.order_id])
        .then(([results, fields]) => {
            res.cookies = req.cookies;
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"error": err});
        });
});
server.post('/approve', (req, res) => {
    connection.query("UPDATE orders SET status=1,message_ph=?, contact_ph=? WHERE order_id=?", [req.body.message_ph, req.body.contact_ph, req.body.order_id])
        .then(([results, fields]) => {
            res.cookies = req.cookies;
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"error": err});
        });
});

//photographer make cells in calendar free to order or vise versa
server.post('/removeactive', (req, res) => {
    res.cookies = req.cookies;
    connection.query("DELETE FROM freedates WHERE ph_id=? AND date=?", [req.body.ph_id, req.body.date])
        .then(([results, fields]) => {
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"error": err});
        });
});
server.post('/setactive', (req, res) => {
    res.cookies = req.cookies;
    connection.query("INSERT INTO freedates(ph_id,date) VALUES(?,?)", [req.body.ph_id, req.body.date])
        .then(([results, fields]) => {
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"error": err});
        });
});

//add ph profile to and delete it from favorites
server.post('/addfavorite', (req, res) => {
    res.cookies = req.cookies;
    connection.query("INSERT INTO favorites(user_id, ph_id) VALUES(?, ?)", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            res.send({"success": "yes"});
        })
        .catch(err => {
            console.log(err);
            res.send({"success": "no", "error": err});
        });
});
server.post('/delfavorite', (req, res) => {
    res.cookies = req.cookies;
    connection.query("DELETE FROM favorites WHERE user_id=? AND ph_id=?", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

//create, update and delete rows in table folders
server.post('/addfolder', (req, res) => {
    if (req.cookies.auth)
        connection.query("SELECT ph_id FROM photographers INNER JOIN users on photographers.user_id= users.user_id WHERE username=?", [req.cookies.username])
            .then(([results, fields]) => {
                connection.query("INSERT INTO folders(ph_id,name) VALUES(?, ?)", [results[0].ph_id, req.body.name])
                    .then(([results2, fields2]) => {
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
            res.cookies = req.cookies;
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);

        });
});
server.post('/deletefolder', (req, res) => {
    connection.query("SELECT photo_id as id FROM photos WHERE folder_id=?", [req.body.folder_id])
        .then(([results, fields]) => {
            custom.deleteFromInvertedList(results);
            connection.query("DELETE FROM folders WHERE folder_id=?", [req.body.folder_id])
                .then(([results1, fields1]) => {
                    res.cookies = req.cookies;
                    res.send(results1);
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

//create, update and delete rows in table photos
server.post('/addphoto', (req, res) => {
    if (req.cookies.auth)
        connection.query("INSERT INTO photos(folder_id,link,title,descr,tags) VALUES(?, ?, ?, ?, ?)", [req.body.folder_id, req.body.link, req.body.title, req.body.descr, req.body.tags])
            .then(([results, fields]) => {
                custom.updateInvertedList([{"id": results.insertId, "taglist": custom.splitIntoTags(req.body.tags)}]);
                res.cookies = req.cookies;
                res.send({'success': 'yes', 'photo_id': results.insertId});
            })
            .catch(err => {
                console.log(err);
                res.send({'success': 'no', 'err': err});
            });
});
server.post('/deletephoto', (req, res) => {
    connection.query("DELETE FROM photos WHERE photo_id=?", [req.body.photo_id])
        .then(([results, fields]) => {
            custom.deleteFromInvertedList([{"id": req.body.photo_id}]);
            res.cookies = req.cookies;
            res.send(results);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});
server.post('/editphoto', (req, res) => {
    connection.query("UPDATE photos SET title=?, descr=?, tags=? WHERE photo_id=?", [req.body.title, req.body.descr, req.body.tags, req.body.photo_id])
        .then(([results2, fields2]) => {
            res.cookies = req.cookies;
            let taglist = custom.splitIntoTags(req.body.tags);
            custom.deleteFromInvertedList([{"id": req.body.photo_id}]).updateInvertedList([{
                "id": req.body.photo_id,
                "taglist": taglist
            }]);
            res.send(taglist);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});
server.post('/addphotofile', (req, res) => {
    console.log("here!");
    let upload = multer({ storage : storage}).single('userFile');
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });

});
//set and delete mark for ph profile
server.post('/unvote', (req, res) => {
    res.cookies = req.cookies;
    connection.query("DELETE FROM ratings WHERE user_id=? AND ph_id=?", [req.body.user_id, req.body.ph_id])
        .then(([results, fields]) => {
            connection.query("SELECT ROUND(AVG(mark)) as ave FROM ratings WHERE ph_id=?", [req.body.ph_id])
                .then(([results2, fields2]) => {
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
            connection.query("SELECT ROUND(AVG(mark)) as ave FROM ratings WHERE ph_id=?", [req.body.ph_id])
                .then(([results2, fields2]) => {
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

//get raw password and return hashed
server.post('/hashpass', (req, res) => {
    res.cookies = req.cookies;
    res.send({"pass": hashing(req.body.pass)});
});

//function used to hash password
function hashing(raw) {
    let hash = crypto.createHmac("sha256", "password")
        .update(config.salt + raw).digest("hex");
    for (let i = 0; i < 5; i++) {
        hash = crypto.createHmac("sha256", "password")
            .update(config.salt + hash).digest("hex");
    }
    return hash;
}
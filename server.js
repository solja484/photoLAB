let express = require('express');
let server = express();
let bodyParser = require('body-parser');

let types;
let authentification = false;
let role = "";

server.set("view engine", "pug");
server.set('views', './');

server.use(express.static(__dirname));
server.use(bodyParser.urlencoded({extended: true}));
server.listen(2606, () => {
    console.log('listening on 2606')
});


const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "photoLAB",
    database: "photolab",
    password: "mysql"
});
connection.connect(function (err) {
    if (err) {
        return console.error("Error: " + err.message);
    }
    else {
        console.log("MySQL server connection established ");
    }
});


connection.query("SELECT name FROM types", function (err, results, fields) {
    types = results;
});



server.get('/', function (req, res) {
    let logins;
    connection.query("SELECT login FROM users", function (err, results, fields) {
        logins = results;
    });
    res.render(__dirname + '/views/home.pug', {types: types,logins:logins,auth:authentification});
});




server.get('/:username', (req, res) => {

    let username = 'gingermias';
    connection.query("SELECT * FROM users WHERE  username=?", [username], function (err, results, fields) {
     //   console.log(results);//results[0].user_id
        res.render(__dirname + '/views/home.pug', {types: types,info:results[0],auth:authentification});
    });

});

server.get('/photoalbum/:username', function (req, res) {
res.render(__dirname + "/views/photoalbum.pug");
});

server.get('/profile/:username', function (req, res) {


   let username = "gingermias";
    connection.query("SELECT * FROM users WHERE  username=?", [username], function (err, results, fields) {


        res.render(__dirname + "/views/profile.pug", {types: types, info: results[0]});


    });

});

server.post('/register', (req, res) => {


});

server.post('/registerph', (req, res) => {


});

server.post('/login', (req, res) => {

    const login = req.body.login;
    connection.query("SELECT * FROM users WHERE  user_login=?", [login], function (err, results, fields) {

        if(err){
            console.log('no user with this login');
        }

            if (hashing(req.body.pass) === results[0].user_pass) {
                authentification = true;
                res.redirect('/' + results[0].username);
            } else console.log("incorrect password");

    });

});


function hashing(raw) {
    let hash = require("crypto").createHmac("sha256", "password")
        .update("salt" + raw).digest("hex");
    for (let i = 0; i < 5; i++) {
        hash = require("crypto").createHmac("sha256", "password")
            .update("salt" + hash).digest("hex");
    }
    return hash;
}


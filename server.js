let express = require('express');
let server = express();
let bodyParser = require('body-parser');




server.set("view engine", "pug");
server.set('views', './');

server.use(express.static(__dirname));
server.use(bodyParser.urlencoded({extended: true}));
server.listen(3000, () => {
    console.log('listening on 3000')
});



const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "photoLAB",
    database: "photolab",
    password: "mysql"
});
connection.connect(function(err){
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("MySQL server connection established ");
    }
});


server.get('/', (req, res) => {
    connection.query("SELECT name FROM types",
        function(err, results, fields) {

            res.render( __dirname +'/views/home.pug',{types:results});

        });

});


server.get('/exit',function(req,res){
    connection.query("SELECT name FROM types",
        function(err, results, fields) {

            res.render( __dirname +'/views/home_unsign.pug',{types:results});

        });

});

server.get('/help',function(req,res){
    res.render(__dirname + "/views/help.pug",{types:types});
});

server.get('/settings',function(req,res){
        res.render(__dirname + "/views/settings.pug",{types:types});
});

server.get('/profile',function(req,res){
    //if(!req.session.id)
        //res.redirect('/');
    res.render(__dirname + "/views/profile.pug",{types:types});
});

server.post('/register',(req,res) => {
    //з body взяти параметри і запихнути в базу, потім з бази взяти ід юзера записати в сесію і відправити
    //sess = req.session;
    //sess.email = req.body.email;
    res.redirect('/exit');});

server.post('/registerph',(req,res) => {
    res.redirect('/exit');});

server.post('/login',(req,res) => {
    res.redirect('/exit');});

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.listen(8888);
/*const session = require('express-session');
server.set('trust proxy', 1); // trust first proxy
server.use( session({
        secret : 's3Cur3',
        name : 'kek',
    })
);*/


console.log('Server is running on port 8888');
server.set('view engine', 'pug');

let types=["Потретна зйомка", "Предметна зйомка", "Студійна зйомка", "Love story", "Сімейна зйомка",
    "Відеозйомка", "Весільна зйомка", "Святкова зйомка", "Зйомка на плівку", "Модельні тести", "Тфп"];


server.get('/', function (req, res) {
        res.render(__dirname + "/home.pug",{types:types});
});

server.get('/help',function(req,res){
    res.render(__dirname + "/help.pug",{types:types});
});

server.get('/settings',function(req,res){

        res.render(__dirname + "/settings.pug",{types:types});

});

server.get('/profile/:id',function(req,res){
    if(!req.session.id)
        res.redirect('/');
    res.render(__dirname + "/profile.pug",{types:types});
});

server.post('/register',(req,res) => {
    //з body взяти параметри і запихнути в базу, потім з бази взяти ід юзера записати в сесію і відправити
    /*sess = req.session;
    sess.email = req.body.email;*/
    res.redirect('/');

});
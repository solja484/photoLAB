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

server.get('/', (req, res) => {
    res.render( __dirname +'/views/home.pug',{types:types});
});
let types=["Потретна зйомка", "Предметна зйомка", "Студійна зйомка", "Love story", "Сімейна зйомка",
    "Відеозйомка", "Весільна зйомка", "Святкова зйомка", "Зйомка на плівку", "Модельні тести", "Тфп"];




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
    res.redirect('/');});

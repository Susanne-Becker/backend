//Hiermee geef je aan dat je deze NPM packages wilt gebruiken en dat je op port 3000 zit.
const express = require('express'); //Minimale server framework
const session = require('express-session'); //Sessies met cookies, als gebruiker server sluit zijn de gegevens er nog
const multer = require('multer'); //Middleware om formdata te behandelen. 'multipart/form-data' zet je in je html en is voor input[type=file]
const upload = multer({dest: 'static/upload/'}); //Geeft aan waar de geuploade files heen moeten (route)
const mongo = require('mongodb'); //Databese MongoDB
const bodyParser = require("body-parser"); //Laat server weten welke data er binnen komt. Het ontleed data en zet het in req.body
const slug = require("slug"); //Maakt string save voor url
require('dotenv').config(); //.env bestand, voor data van MongoDB wat geheim is
const app = express(); //App start de server
const port = 3000; //Server verbind op port 3000

//Hiermee registreer je de NPM packages en geef je ze een route mee van waar ze te vinden zijn.
app.use('/static', express.static(__dirname+'/static')); //Static files komen direct van de server zonder processing
app.set('view engine', 'ejs'); //Configureert express om ejs te gebruiken voor templating
app.set('views', 'views'); //Configureert express om templates te laden vanaf een bepaalde plaats
app.use(bodyParser.urlencoded({extended:true})); //Urlencoded gebruiken browsers om forms te sturen
app.use(session({ //Sessies met cookies
    resave: false,
    saveUninitialized: true,
    secret: 'secret'
  }));

//Dit gaat over de databese MongoDB
let db;
const MongoClient = mongo.MongoClient;
const uri = "mongodb+srv://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@cluster0-k4xl3.mongodb.net/test?retryWrites=true&w=majority";

MongoClient.connect(uri, function (err, client){
  if (err) {
    throw err; //Error als er geen verbinding gemaakt kan worden met de client (MongoClient)
  }
  db = client.db(process.env.DB_NAME) //Als er wel verbinding is, dan juiste info naar databese sturen
});

app.get('/', function(req, res){ //Zodat de eerste pagina het meteen doet
    res.redirect('/aanmelden')
});

app.get('/aanmelden', (req, res) => { //Waar de server heen navigeert in de browser: in de browser komt '/aanmelden' te staan en dat is document 'aanmelden.ejs'.
    res.render('aanmelden.ejs')
});

app.get('/profiel', (req, res) => { //Waar de server heen navigeert in de browser
    res.render('profiel.ejs', req.session.user) //Door 'req.session.user' mee te geven, neemt 'profiel.ejs' deze data over waar mogelijk
});

app.post('/aanmelden', upload.single('image'), addProfile); //Bij 'aanmelden.ejs', upload de single image (1 toegestaan) van de functie addProfile en zet het in mapje voor geuploade files

app.post('/aanmelden', addProfile); //Haal data van de form /aanmelden en gebruik het bij functie addProfile

function addProfile(req, res){ //Functie met request(verzoek), response(reactie)
    req.session.user = { //Onderstaande gegevens in req.session.user zetten
        id: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        gender: req.body.gender,
        birthday: req.body.birthday,
        search: req.body.search,
        image: req.file ? req.file.filename : null
      };
  db.collection('datingapp-users').insertOne(req.session.user); //Alle info die bij req.session.user hoort, naar database 'datingapp-users' sturen
  console.log(req.session.user); //Terminal laat alle gegevens van req.session.user zien
  res.redirect('profiel'); //Route naar volgende pagina
};

app.get('*', (req, res) => res.send('404 error not found')) // Als je op een route komt die niet gedefinieerd is, laat hij een error zien

app.listen(3000, () => console.log(`Dating app listening on port 3000!`)); //Als de server is verbonden, krijg je dit in je terminal te zien
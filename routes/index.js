
const express = require('express');
const router = express.Router();
const request = require('request');
const CryptoJS = require('crypto-js');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const nodemailer = require('nodemailer');
const moment = require('moment');
const multer = require('multer');
const path = require('path');

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

  ////*************MONGOBD*******************/////
  var mongoose = require('../middlewares/connect');

  var userSchema = mongoose.Schema({
    prenom: String,
    nom: String,
    email: String,
    password : String,
    date_de_naissance : String,
    pays : String,
    avatar: String,
    sexe: String,
    taille: Number,
    poids: Number,
    adresse: String,
    téléphone: Number,
    profession: String,
    groupe_sanguin: String,
    allergenes: String,
    traitements_medicaux: String,
    antecedents_medicaux: String,
    antecedents_familiaux: String,
    carte_Vitale: Number,
    mutuelle: String,
    token: String
  });

  var medecinSchema = mongoose.Schema({
    prenom: String,
    nom: String,
    email: String,
    adress: String,
    profession: String,
    pays : String,
    numero: Number,
    user_id: String
  });

  var soignantSchema = mongoose.Schema({
    prenom: String,
    nom: String,
    email: String,
    adress: String,
    profession: String,
    pays : String,
    numero: Number,
    user_id: String,
    episode_id: String
  });

  var episodeSchema = mongoose.Schema({
    maladie : String,
    date: Date,
    url: String,
    user_id: String
  });

  var pictoSchema = mongoose.Schema({
    url : String
  });

  var rdvSchema = mongoose.Schema({
    date : Date,
    adress: String,
    medecin: String,
    user_id: String,
    lat: Number,
    lon: Number,
    episode_id: String
  })

  var noteSchema = mongoose.Schema({
    titre: String,
    description: String,
    date: String,
    user_id: String,
    episode_id: String
  });

  var imgSchema = mongoose.Schema({
    url: String,
    description: String,
    user_id: String,
  });






  //////////////////////SCHEMA///////////////////////////////
  var userModel = mongoose.model('users', userSchema);
  var medecinModel = mongoose.model('medecins', medecinSchema);
  var soignantModel = mongoose.model('soignants', soignantSchema);
  var episodeModel = mongoose.model('episodes', episodeSchema);
  var rdvModel = mongoose.model('rdvs', rdvSchema);
  var noteModel = mongoose.model('notes', noteSchema);
  var imgModel = mongoose.model('imgs', imgSchema);
  var pictoModel = mongoose.model('pictos', pictoSchema);


////*************FIN*MONGOBD*******************/////

/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {
    request('https://restcountries.eu/rest/v2/all', function(error, response, body){
      req.session.countries = JSON.parse(body);
      res.render('index', {error: null, csrfToken: req.csrfToken(), success: null, pays: req.session.countries});
    });
});

/////////////////ROUTE INCRIPTION//////////////////////
router.post('/signUp', parseForm, csrfProtection, function(req, res, next){
  // Redirection vers la page index si un champs est vide
  if(req.body.prenom === '' || req.body.nom === '' || req.body.email === '' || req.body.password === '' || req.body.date_de_naissance === ''){
    console.log('====================>', 'Désolé, veuillez remplir tous les champs.');
    req.session.error = "Désolé, certains champs sont incomplets.";
    req.session.csrf = req.csrfToken();
    res.render('index', {error: req.session.error, csrfToken: req.session.csrf, success: null, pays: req.session.countries});
  }
  else{
    var mail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(/^[0-9]+$/.test(req.body.prenom) || /^[0-9]+$/.test(req.body.nom)){
      console.log('====================>', 'Désolé, le nom et le prenom ne peuvent contenir de caractères numériques.');
      req.session.error = 'Désolé, le nom et le prenom ne peuvent contenir de caractères numériques.';
      res.render('index', {error: req.session.error, csrfToken: req.csrfToken(), success: null, pays: req.session.countries});
    }
    else if (!mail.test(req.body.email)) {
      req.session.error = 'Désolé, l\'adresse mail saisie est incorrecte';
      res.render('index', {error: req.session.error, csrfToken: req.session.csrf, success: null, pays: req.session.countries});
    }
    else {
      var newUser = new userModel({
        prenom: req.body.prenom,
        nom: req.body.nom,
        email: req.body.email,
        password : CryptoJS.SHA512(req.body.password).toString(),
        date_de_naissance : req.body.date_de_naissance,
        pays :req.body.pays,
        token: req.body._csrf
      });
      console.log( newUser );
      newUser.save(function(err, user){
        var success = 'Merci pour votre inscription, vous pouvez maintenant vous connecter';
        req.session.user = user;
        res.render('index', {error:null, csrfToken: req.session.csrf, success: success, pays: req.session.countries});
      });
    }
  }
});

/////////////////////FIN INSCRIPTION///////////////////////////////

/////////////////////CONNEXION////////////////////////////////////
router.post('/signIn', function(req, res, next) {
  if(req.body.email === '' || req.body.password === ''){
    console.log('====================>', 'Désolé, certains champs sont incomplets');
    req.session.error = "Désolé, certains champs sont incomplets";
    res.render('index', {error: req.session.error, csrfToken: req.session.csrf, success: null, pays: req.session.countries});
  }
  else {

    userModel.find(
      {email: req.body.email, password: CryptoJS.SHA512(req.body.password).toString()},
      function(error, users){
        console.log(users);
        if(!users.length > 0) {
          req.session.error = 'Désolé l\'adresse mail ou le mot de passe saisis sont incorrectes. Veuillez vous connecter ou vous inscrire'
          res.render('index', {error: req.session.error, csrfToken: req.session.csrf, success: null, pays: req.session.countries});
        }
        else{
          req.session.user = users[0];
          req.session.user_id = users[0]._id
          console.log(users[0]);
          console.log(req.session.user_id);
          episodeModel.find(
            { user_id: req.session.user_id },
            function(err, episode){
              medecinModel.find(
                { user_id: req.session.user_id },
                function(err, medecin){
                  pictoModel.find(
                    function(err, pictos){
                      res.render('dashboard', {newEpisode: episode, newMedecin: medecin, user: req.session.user, pictos});
                    }
                  );
                }
              );
          });
        }
      });
    }
});



///////////////FIN CONNEXION//////////////////////////////////////

 ////////////////ROUTE DASHBOARD///////////////////

router.get('/dashboard', csrfProtection, function(req, res, next) {
  console.log(req.query.picto);
    if (req.session.user === undefined){
      res.render('index', {error: null, csrfToken: req.csrfToken(), success: null, pays: req.session.countries});
    }else{
      episodeModel.find(
        {user_id: req.session.user_id},
        function(err, episode){
        medecinModel.find(
          {user_id: req.session.user_id},
          function(err, medecin){
            pictoModel.find(
              function(err, pictos) {
                res.render('dashboard', {newEpisode: episode, newMedecin: medecin, user: req.session.user, pictos});
              }
            );
          }
        );
      });
    }
});

 ////////////////FIN ROUTE DASHBOARD///////////////////

/////////////////////DECONNEXION////////////////////////////////////
router.get('/logOut', csrfProtection, function(req, res, next){
  request('https://restcountries.eu/rest/v2/all', function(error, response, body){
    req.session.countries = JSON.parse(body);
    res.render('index', {error: null, csrfToken: req.csrfToken(), success: null, pays: req.session.countries});
    req.session.destroy();
  });
});

///////////////FIN DECONNEXION//////////////////////////////////////

///////////////////AJOUT DE MEDECIN/////////////

router.post('/add-medecin', function(req, res, next) {

    if(req.body.prenom === '' || req.body.nom === '' || req.body.email === '' || req.body.adress === '' || req.body.profession === '' || req.body.pays === '' || req.body.numero === ''){
      res.redirect('dashboard')
    }
    else {
      var newMedecin = new medecinModel({
        prenom: req.body.prenom,
        nom: req.body.nom,
        email: req.body.email,
        adress: req.body.adress,
        profession: req.body.profession,
        pays : req.body.pays,
        numero: req.body.numero,
        user_id: req.session.user_id
      });

      newMedecin.save( function(err, medecin){

        medecinModel.find(
          {user_id: req.session.user_id},
          function(err, medecin){
            episodeModel.find(
              {user_id: req.session.user_id},
              function(err, episode) {
                pictoModel.find(
                  function(err, pictos){
                    console.log(episode);
                    res.render('dashboard', {newEpisode: episode, newMedecin: medecin, user: req.session.user, pictos});
                  }
                )

              }
            );
          }
        );
      });
    }
});


router.get('/delete-medecin', function(req, res, next) {
  medecinModel.remove(
    {
      _id: req.query.id
    },
  function(error) {
    medecinModel.find(
      {user_id: req.session.user_id},
      function(err, medecin){
        episodeModel.find(
          {user_id: req.session.user_id},
          function(err, episode) {
            pictoModel.find(
              function(err, pictos) {
                console.log(episode);
                res.render('dashboard', {newEpisode: episode, newMedecin: medecin, user: req.session.user, error: null, pictos});
              }
            );
            }
        )

        });
      });
  });



///////////////////AJOUT D'EPISODES/////////////
router.post('/add-episode', function(req, res, next) {
  console.log(req.body)
  if(req.body.maladie === '' || req.body.date === ''){
    res.redirect('dashboard')
  }
  else {
    var newEpisode = new episodeModel({
      maladie : req.body.maladie,
      date: req.body.date,
      url: req.body.picto,
      user_id: req.session.user_id,
    });
    newEpisode.save( function(err, episode){
      res.redirect('dashboard');
    });
  }
});

///////////////////SUPPRESSION EPISODES/////////////
router.get('/delete-episode', function(req, res, next) {
    episodeModel.remove(
      { _id: req.query.id },
      function(error) {
        medecinModel.find(
          {user_id: req.session.user_id},
          function(err, medecin){
            episodeModel.find(
              {user_id: req.session.user_id},
              function(err, episode) {
                pictoModel.find(
                  function(err, pictos) {
                    console.log(episode);
                    res.render('dashboard', {newEpisode: episode, newMedecin: medecin, user: req.session.user, error: null, pictos});
                  }
                );
              }
            );
          }
        );
    });
});


/////////////////AJOUT DE RDV/////////////////


router.post('/add-rdv', function(req, res, next) {
  request("https://maps.googleapis.com/maps/api/geocode/json?address="+req.body.adress_map_rdv+"+&key=AIzaSyAe01yXm_aQlq9XlIA_cEv_BCEiWTtnTPE", function(error, response, body) {
    body = JSON.parse(body);

        console.log(req.body.adress_map_rdv)
        console.log(body.results[0].geometry.location.lat)

      var newRdv = new rdvModel({
        date : req.body.date,
        adress: req.body.adress_map_rdv,
        medecin: req.body.medecin,
        user_id: req.session.user._id,
        lat: body.results[0].geometry.location.lat,
        lon: body.results[0].geometry.location.lng,
      })

    newRdv.save( function(err, body){

      rdvModel.find(
        { user_id: req.session.id },
        function(err,result){
          res.redirect('timeline');
        }
      );
    });
  });
});

  //////////////AJOUT ROUTE TIMELINE//////

router.get('/timeline', function(req, res, next) {
    // (req.session.id) ?  req.session.episode_id = req.query.id : req.session.episode_id = req.session.episode_id;



    rdvModel.find(
      {user_id: req.session.user_id},
      function(err, newRdv) {
        soignantModel.find(
          { user_id: req.session.user_id} ,
          function(err, newSoignant){
            noteModel.find(
              { episode_id: req.session.episode_id},
              function(err, newNote){
                res.render('timeline', {newRdv, newSoignant, newNote});
              }
            );
          }
        );
      }
    );
  });

  /////////////////AJOUT SOIGNANT DANS TIMELINE//////////////////

  router.post('/add-soignant', function(req, res, next) {
    var newSoignant = new soignantModel({
      prenom: req.body.prenom,
      nom: req.body.nom,
      email: req.body.email,
      adress: req.body.adress,
      profession: req.body.profession,
      pays : req.body.pays,
      numero: req.body.numero,
      user_id: req.session.user_id
    });
    console.log (req.body);
    newSoignant.save( function(err, body){
        res.redirect ('/timeline');
    });
  });



  router.get('/delete-soignant', function(req, res, next) {
    soignantModel.remove({
      _id: req.query.id
    },
      function(error) {
        soignantModel.find({
        user_id: req.session.user_id
      },
      function(err, newSoignant
      ){
        res.redirect('/timeline');
      });
    });
  });


  /////////////////////AJOUT NOTES DANS TIMELINE////////////////

  router.post('/add-note', function(req, res, next){

    var newNote = noteModel({
      titre: req.body.titre,
      description: req.body.description,
      date: req.body.dateNote,
      user_id: req.session.user_id,
      episode_id : req.session.episode_id
    });

    newNote.save(
      function(err, body){
        res.redirect('timeline')
      }
    );
  });

  router.get('/delete-note', function (req,res, next){
  noteModel.remove({
      _id: req.query.id},
    function(error){
      res.redirect('/timeline');
    })

  });


  ///////////////////AJOUT D'EPISODES/////////////


  router.post('/add-episode', function(req, res, next) {

    console.log (req.body);

    var newEpisode = new episodeModel({
      maladie : req.body.maladie,
      date: req.body.date,
      description: req.body.description,
      user_id: req.session.user_id

    })
    newEpisode.save( function(err, body){

        res.redirect('/dashboard');

    });
  });


  router.get('/delete-episode', function(req, res, next) {


    episodeModel.remove({

      _id: req.query.id

    },
    function(error) {

        res.redirect('/dashboard');

  }
  )

  })





  /////////////////AJOUT DE RDV/////////////////


  router.post('/add-rdv', function(req, res, next) {


request("https://maps.googleapis.com/maps/api/geocode/json?address="+req.body.adress_map_rdv+"+&key=AIzaSyAe01yXm_aQlq9XlIA_cEv_BCEiWTtnTPE", function(error, response, body) {
  body = JSON.parse(body);

      console.log(req.body.adress_map_rdv)
      console.log(body.results[0].geometry.location.lat)


    var newRdv = new rdvModel({
      date : req.body.date,
      adress: req.body.adress,
      medecin: req.body.medecin,
      user_id: req.session.user._id,
      lat: body.results[0].geometry.location.lat,
      lon: body.results[0].geometry.location.lng,
    })


    newRdv.save( function(err, body){

        res.redirect('timeline');


    });
  });
});


router.get('/delete-rdv', function(req, res, next) {
    rdvModel.remove(
      {_id: req.query.id},
      function(error) {
        res.redirect('timeline');
      }
    );
});

  ///////////////////ENVOYER L'IMG///////////////////////

  router.get('/upload_img', function(req,res,next){
    res.render('upload_img');

  });

  var storage = multer.diskStorage({
 destination : './public/uploads',
 filename: function(req,file, functionCallBack){
   functionCallBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
 }
});


var upload = multer({
 storage : storage,
 limits : {fileSize: 10000000},
 fileFilter: function(req, file, functionCallBack ){
   checkFileType(file, functionCallBack)
 }
}).single('img');

function checkFileType(file, functionCallBack){
 //extention accepté

 var fileType = /jpeg|jpg|png|gif/;
 var extname = fileType.test(path.extname(file.originalname).toLowerCase());
 var mimetype = fileType.test(file.mimetype);
 if(mimetype && extname){
   return functionCallBack(null, true);
 }else{
   functionCallBack('Erreur: seules les images sont acceptées');
 }
}

router.post('/upload_img', function(req,res,next){
 upload(req, res, function (err){
   if(err){
     res.render('upload_img', {
       msg: err
     });
   }else{
     console.log(req.file);
     if(req.file == undefined){
       res.render('upload_img',{msg: 'Erreur : Veuillez sélectionner une image.'})
     }else{
       var newImg = new imgModel({
         url: `uploads/${req.file.filename}`,
         user_id: req.session.user_id,


       });
       newImg.save(function(err, image){
         res.render('upload_img', {
           msg: 'Image envoyée, merci.',
           file : `uploads/${req.file.filename}`});
       });
     }
   }
 });
});
  // router.post('/timeline', function(req, res, next) {
  //   res.render('timeline',{newRdv:result});
  // });


router.get('/advice', function(req, res, next){
  res.render('advice');
});


router.get('/perso', function(req, res, next){
  userModel.findOne(
    {_id: req.session.user_id},
    function(err, user) {
      req.session.user_perso = user;
      res.render('perso', {user: req.session.user_perso});
    }
  );
});

router.post('/perso', function(req, res, next){
  console.log(req.body);
    upload(req, res,
      function (err){
          userModel.update(
            {_id: req.session.user_id},
            { prenom: req.body.prenom, nom: req.body.nom, email: req.body.email,
              date_de_naissance : req.body.date, pays : req.body.pays, sexe: req.body.sexe,
              taille: req.body.taille, poids: req.body.poids, adresse: req.body.adresse,
              telephone: req.body.telephone, profession: req.body.profession, groupe_sanguin: req.body.groupesanguin,
              allergenes: req.body.allergene, traitements_medicaux: req.body.traitementsMedeciaux, antecedents_medicaux: req.body.antecentsMedicaux,
              antecedents_familiaux: req.body.antecedentsFamiliaux, carte_vitale: req.body.carteVitale, mutuelle: req.body.mutuelle, avatar: `uploads/avatar${req.file.filename}`
            },
            function(error, raw) {
              res.render('profil');
            }
          )
        }
      )
});

// PAGE GALERIE/////

router.get('/galerie', function(req, res, next){
  imgModel.find(
    {user_id: req.session.user_id},
    function(err,image){
      console.log(image);
      res.render('galerie', {image});
    }
  );
});

router.get('/delete-image', function(req, res, next) {


  imgModel.remove(
    {_id: req.query.id },
    function(error) {
      imgModel.find(
        { user_id: req.session.user_id },
        function(err, image) {
          res.render('galerie', {image});
        });
    });
});

// FIN PAGE GALERIE///

// INFOS DU MEDECIN///

router.get('/infos', function(req, res, next) {
  console.log(req.query.id);
  medecinModel.find(
    {_id: req.query.id},
    function(err, medecin) {
      console.log(medecin);
      res.render('infos', {newMedecin: medecin});
    }
  );
});
// FIN INFO DU MEDECIN////


///////////////////MOT DE PASSE OUBLIE///////////////////////
router.post('/refindpwd', function(req, res, next){
 console.log(req.body);
 req.session.emailPwd = req.body.emailPwd;

 userModel.find(
   { email: req.body.emailPwd},
   function(error, users){

    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'progch',
                pass: 'Dieu2vie@1'
            }
        });

        let mailOptions = {
            from: '"Fred Foo 👻" progch', // sender address
            to: req.body.emailPwd, // list of receivers
            subject: 'Réinitialisation mot de pass ✔', // Subject line
            text: 'Cliquez ici : '+' ' + 'localhost:3000/newMdp?id='+users[0].token, // plain text body
            html: '<a href="localhost:3000/newMdp?d='+users[0].token+'"><b>Cliquez ici</b></a>' // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            var mail_success = 'Succès, vérifier vos mails pour pouvoir modifier votre mot de passe'
            res.render('index', {error: null, csrfToken: req.session.csrf, success: mail_success, pays: req.session.countries});
        });
    });

   }
 );
});

router.get('/newMdp', function(req, res, next) {
  req.session.mdpToken = req.query.id;
  console.log(req.query.id);
  res.render('mdp');
});

router.post('/newMdp', function(req, res, next) {
  if(req.body.motdepasse === '') {
    res.redirect('mdp');
  }
  else if (req.body.motdepasse !== req.body.verifier) {
    res.redirect('mdp');
  }
  else {
    userModel.update(
      {token: req.session.mdpToken,  email: req.session.emailPwd},
      {password: CryptoJS.SHA512(req.body.motdepasse).toString()},
      function(err, raw) {
        var mdpChange = 'Succès, Vous pouvez maontenant vous connecter avec votre nouveau mot de passe'
        res.render('index', {error: null, csrfToken: req.session.mdpToken, success: mdpChange, pays: req.session.countries});
      }
    );
  }
});



module.exports = router;

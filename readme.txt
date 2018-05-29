{ DAVI
Bonjour, 
1-Pour commence on a fait la maketation du site avec SKETCH.
2-En  suite en a creer le formulaire(en HTML et CSS) pour la partie connexion et inscripton.
3-Installation du générateur de backend
npm install express-generator -g
3-2-Création du backend
express --view=ejs --git myapp
La commande initialise un nouveau repertoire
3-3-Installation des modules
(cd myapp
    - Se positionner dans le répertoire du backend
    - Installation des modules
    - npm install)
3-4-Lancer le serveur
    -npm start
4-Intalltion BDD et la SESSION
4-1-Installation du module
    -npm install express-session --save
5-Import du module(dans l'app, ligne 10)
var session = require("express-session"); 
6- Paramètrage(dans l'app ligne 12)
app.use(
 session({ 
  secret: 'a4f8071f-c873-4447-8ee2',
  resave: false,
  saveUninitialized: false,
 })
);   
7-Debut pour tester les routes.

!!! ne pas oublié de mettre le button en "submit" pour valider le formulaire.
8-chagement input DATE(avant etais en STRING) chagement DATE

9-Installation du module mongoose
npm install mongoose --save

10-initialiser la connexion dans le site pour chaque utilisateur.
}


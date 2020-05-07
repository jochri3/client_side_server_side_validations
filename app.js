const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const { check, validationResult } = require('express-validator');

//Definition des règles de validation
const reglesDeValidation = [
  //Validation du nom
  check('nom')
    .exists()
    .withMessage('Le nom ne peut pas être vide')
    .isString()
    .withMessage('Le nom ne doit pas contenir des chiffres')
    .isLength({ min: 5, max: 50 })
    .withMessage('Le nom du produit doit avoir au minumin 5 caracteres'),

  //Validation prixUHT
  check('prixUHT')
    .exists()
    .withMessage('le prix ne doit pas être vide')
    .isInt({ min: 1, max: 100 })
    .withMessage('le prix doit toujours être un nombre inférieur à 100'),

  // Validation du prix
  check('quantite')
    .exists()
    .withMessage('La quantité ne peut pas être vide')
    .isInt({ min: 1 })
    .withMessage('La quantité doit être un entier supérieur à 0'),
];

//Initialisation du serveur express
const app = express();

app.set('views', 'views');
app.set('view engine', 'ejs');
//analyse de l'application/urlencoded

app.use(express.urlencoded({ extended: false }));

//analyse de l'application/json
app.use(express.json());

//Configation de la base de données

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'jojofashion',
  password: '',
});
//connexion à la base de données

connection.connect((erreur) => {
  if (erreur) {
    throw erreur;
  }
  console.log('la connexion est établie');
});

app.get('/form-non-ajax', (req, res) => {
  return res.render('form_non_ajax');
});

app.get('/form-ajax', (req, res) => {
  return res.render('form_ajax');
});

//Get
app.get('/api/produits', (req, res) => {
  connection.query('select * from produits', (erreur, resultat) => {
    if (erreur) throw erreur;
    return res.send(resultat);
  });
});

app.get('/api/produits/:id', (req, res) => {
  connection.query(
    `select * from produits where id_produit=${req.params.id}`,
    (erreur, resultat) => {
      if (erreur) throw erreur;
      return res.send(resultat);
    }
  );
});

//post

app.post('/api/produits', reglesDeValidation, (req, res) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).send({ listErreur: erreurs.array() });
  }
  connection.query(
    `insert into produits(nom_produit,quantite_produit,prixUHT) values('${req.body.nom}','${req.body.quantite}','${req.body.prixUHT}')`,
    (erreur, resultat) => {
      if (erreur) throw erreur;
      return res.send({ message: 'Nouvel article ajouté avec succès' });
    }
  );
});

//put
app.put('/api/produits/:id', reglesDeValidation, (req, res) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty)
    return res.status(422).send({ erreurs: erreurs.array() });
  connection.query(
    `UPDATE produits Set nom_produit="${req.body.nom}", quantite_produit="${req.body.quantite}",prixUHT="${req.body.prixUHT}" where id_produit=${req.params.id}`,
    (erreur, resultat) => {
      if (erreur) throw erreur;
      return res.send(resultat);
    }
  );
});
// Delete
app.delete('/api/produits/:id', (req, res) => {
  connection.query(
    `DELETE from produits where id_produit=${req.params.id}`,
    (erreur, resultat) => {
      if (erreur) throw erreur;
      return res.send(resultat);
    }
  );
});

//Définir le port
const PORT = 5000;
app.listen(PORT, function () {
  console.log(`le serveur écoute sur le port ${PORT}`);
});

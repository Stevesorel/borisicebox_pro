const { body, validationResult } = require('express-validator')


exports.validateProduit = (req, res, next) => {
  const { nom, slug, categorie_id, prix_base } = req.body;
  const errors = [];
  if (!nom)          errors.push('nom est requis');
  if (!slug)         errors.push('slug est requis');
  if (!categorie_id) errors.push('categorie_id est requis');
  if (!prix_base)    errors.push('prix_base est requis');
  if (errors.length) return res.status(400).json({ message: 'Données invalides', errors });
  next();
};

exports.validateCategorie = (req, res, next) => {
  const { nom, slug } = req.body;
  const errors = [];
  if (!nom)  errors.push('nom est requis');
  if (!slug) errors.push('slug est requis');
  if (errors.length) return res.status(400).json({ message: 'Données invalides', errors });
  next();
};

exports.validateCommande = [
  body('nom_client')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit faire entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le nom contient des caractères invalides'),

  body('telephone')
    .trim()
    .notEmpty().withMessage('Le téléphone est obligatoire')
    .matches(/^(\+237|237)?[6-9][0-9]{8}$/).withMessage('Numéro de téléphone camerounais invalide'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),

  body('adresse')
    .trim()
    .notEmpty().withMessage('L\'adresse est obligatoire')
    .isLength({ min: 5, max: 200 }).withMessage('L\'adresse doit faire entre 5 et 200 caractères'),

  body('zone_id')
    .notEmpty().withMessage('La zone de livraison est obligatoire')
    .isInt({ min: 1 }).withMessage('Zone invalide'),

  body('produits')
    .isArray({ min: 1 }).withMessage('La commande doit contenir au moins un produit')
    .custom(produits => produits.length <= 20).withMessage('Trop de produits dans la commande'),

  body('produits.*.produit_id')
    .isInt({ min: 1 }).withMessage('ID produit invalide'),

  body('produits.*.quantite')
    .isInt({ min: 1, max: 100 }).withMessage('La quantité doit être entre 1 et 100'),

  body('produits.*.image_produit')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage("L'image produit ne peut pas dépasser 500 caractères"),

  body('produits.*.couleur')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('La couleur ne peut pas dépasser 50 caractères'),

  body('produits.*.personnalisation')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('La personnalisation ne peut pas dépasser 200 caractères'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
      })
    }
    next()
  }
]

exports.validateZone = (req, res, next) => {
  const { nom, frais } = req.body;
  const errors = [];
  if (!nom)   errors.push('nom est requis');
  if (!frais) errors.push('frais est requis');
  if (errors.length) return res.status(400).json({ message: 'Données invalides', errors });
  next();
};

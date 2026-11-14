const isProd = () => process.env.NODE_ENV === 'production';

// Réponse d'erreur uniforme : ne divulgue jamais le détail interne en production.
module.exports = function fail(res, err, message = 'Erreur serveur', status = 500) {
  if (status >= 500) console.error(err);
  const body = { message };
  if (!isProd() && err && err.message) body.error = err.message;
  return res.status(status).json(body);
};

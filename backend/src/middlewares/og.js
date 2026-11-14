const { Produit, ShopSetting } = require('../models');

const DEFAULT_SETTINGS = {
  shop_name: 'Boris IceBox',
  site_url: 'https://borisicebox.com',
  og_image_url: '/og-image.webp',
  currency_code: 'XAF',
  currency_locale: 'fr-FR',
  currency_symbol: 'FCFA'
};

const escapeHtml = (str = '') => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const loadSettings = async () => {
  const rows = await ShopSetting.findAll();
  const settings = { ...DEFAULT_SETTINGS };
  rows.forEach(row => { settings[row.cle] = row.valeur || settings[row.cle]; });
  settings.site_url = String(settings.site_url || DEFAULT_SETTINGS.site_url).replace(/\/$/, '');
  return settings;
};

const ogMiddleware = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';

  // Détecter les robots de réseaux sociaux
  const isBot = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Discordbot|TelegramBot|Slackbot/i.test(userAgent);

  // Vérifier si c'est une page produit
  const productMatch = req.path.match(/\/produit\/([a-z0-9-]+)/i);

  if (isBot && productMatch) {
    try {
      const slug = productMatch[1];
      const produit = await Produit.findOne({
        where: { slug, actif: true },
        attributes: ['nom', 'description', 'prix_base', 'image_principale', 'image_principale_large']
      });

      if (produit) {
        const settings = await loadSettings();
        const baseUrl = settings.site_url;
        const productImage = produit.image_principale_large || produit.image_principale;
        const imageUrl = productImage
          ? (String(productImage).startsWith('http') ? productImage : `${baseUrl}${productImage}`)
          : `${baseUrl}${settings.og_image_url}`;
        const title = escapeHtml(`${produit.nom} - ${settings.shop_name}`);
        const price = Number(produit.prix_base).toLocaleString(settings.currency_locale || 'fr-FR');
        const desc = escapeHtml(produit.description
          ? produit.description.substring(0, 160)
          : `Achetez ${produit.nom} au prix de ${price} ${settings.currency_symbol}.`);
        const safeImage = escapeHtml(imageUrl);
        const safeSlug = escapeHtml(slug);
        const safeNom = escapeHtml(produit.nom);

        return res.send(`
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <meta name="description" content="${desc}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${desc}">
            <meta property="og:image" content="${safeImage}">
            <meta property="og:url" content="${baseUrl}/produit/${safeSlug}">
            <meta property="og:type" content="product">
            <meta property="og:site_name" content="${escapeHtml(settings.shop_name)}">
            <meta property="product:price:amount" content="${Number(produit.prix_base)}">
            <meta property="product:price:currency" content="${escapeHtml(settings.currency_code)}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${desc}">
            <meta name="twitter:image" content="${safeImage}">
          </head>
          <body>
            <h1>${title}</h1>
            <p>${desc}</p>
            <img src="${safeImage}" alt="${safeNom}" style="max-width:400px;">
            <p>Redirection vers la boutique...</p>
            <script>window.location.href = '${baseUrl}/produit/${safeSlug}';</script>
          </body>
          </html>
        `);
      }
    } catch (e) {
      console.error('OG Middleware error:', e.message);
    }
  }

  next();
};

module.exports = ogMiddleware;
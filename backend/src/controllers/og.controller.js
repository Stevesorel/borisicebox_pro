const { Produit, ShopSetting } = require('../models');

const DEFAULT_SETTINGS = {
  shop_name: 'Boris IceBox',
  site_url: 'https://borisicebox.com',
  og_image_url: '/og-image.webp'
};

// Échappe les caractères HTML pour éviter l'injection dans les balises meta.
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

exports.getProductOg = async (req, res) => {
  try {
    const { slug } = req.params;
    const produit = await Produit.findOne({
      where: { slug, actif: true }
    });

    if (!produit) {
      return res.status(404).send('Produit non trouvé');
    }

    const settings = await loadSettings();
    const productImage = produit.image_principale_large || produit.image_principale;
    const imageUrl = productImage
      ? (String(productImage).startsWith('http') ? productImage : `${settings.site_url}${productImage}`)
      : `${settings.site_url}${settings.og_image_url}`;

    const nom = escapeHtml(produit.nom);
    const brand = escapeHtml(settings.shop_name);
    const desc = escapeHtml(produit.description || `Découvrez ce produit exceptionnel sur ${settings.shop_name}`);
    const safeSlug = escapeHtml(slug);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${nom} – ${brand}</title>
  <meta property="og:title" content="${nom} – ${brand}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(settings.site_url)}/produit/${safeSlug}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="${brand}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta http-equiv="refresh" content="0; url=${escapeHtml(settings.site_url)}/produit/${safeSlug}" />
</head>
<body>
  <p>Redirection vers <a href="${escapeHtml(settings.site_url)}/produit/${safeSlug}">${nom}</a>...</p>
</body>
</html>`;
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

const { ShopSetting } = require('../models');
const fail = require('../utils/errorResponse');
const { writeAdminAudit } = require('../utils/adminAudit');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const DEFAULTS = {
  shop_name: 'Boris IceBox',
  shop_short_name: 'Boris',
  shop_highlight_name: 'IceBox',
  shop_slogan_fr: 'Bijoux, parfums et smartphones au Cameroun',
  shop_slogan_en: 'Jewelry, perfumes and smartphones in Cameroon',
  footer_description_fr: 'Votre boutique premium pour bijoux, parfums et smartphones. Qualite, confiance et livraison rapide.',
  footer_description_en: 'Your premium shop for jewelry, perfumes and smartphones. Quality, trust and fast delivery.',

  phone_display: '+237 656 771 727',
  phone_tel: '+237656771727',
  whatsapp_number: '237656771727',
  email: 'contact@borisicebox.com',
  address_fr: 'Yaounde, Cameroun',
  address_en: 'Yaounde, Cameroon',
  site_url: 'https://borisicebox.com',

  logo_url: '',
  favicon_url: '',
  og_image_url: '/og-image.webp',
  meta_title_fr: 'Boris IceBox - Boutique en ligne au Cameroun',
  meta_title_en: 'Boris IceBox - Online shop in Cameroon',
  meta_description_fr: 'Decouvrez nos produits de qualite livres partout au Cameroun.',
  meta_description_en: 'Discover our quality products delivered across Cameroon.',

  color_light_bg_primary: '#ffffff',
  color_light_bg_secondary: '#f9fafb',
  color_light_surface: '#ffffff',
  color_light_text_primary: '#111827',
  color_light_text_secondary: '#4b5563',
  color_light_accent: '#3b82f6',
  color_light_accent_hover: '#2563eb',

  color_dark_bg_primary: '#0f172a',
  color_dark_bg_secondary: '#1e293b',
  color_dark_surface: '#1e293b',
  color_dark_text_primary: '#f1f5f9',
  color_dark_text_secondary: '#cbd5e1',
  color_dark_accent: '#3b82f6',
  color_dark_accent_hover: '#60a5fa',
  color_footer_bg: '#111827',
  color_success: '#16a34a',
  color_danger: '#dc2626',
  color_whatsapp: '#25D366',

  social_instagram: '',
  social_facebook: '',
  social_tiktok: '',
  social_youtube: '',

  currency_code: 'XAF',
  currency_symbol: 'FCFA',
  currency_locale: 'fr-FR',

  payment_methods_fr: 'MTN Money, Orange Money, paiement a la livraison',
  payment_methods_en: 'MTN Money, Orange Money, cash on delivery',
  delivery_title_fr: 'Livraison rapide',
  delivery_title_en: 'Fast delivery',
  delivery_desc_fr: 'Livraison a Yaounde et partout au Cameroun selon la zone.',
  delivery_desc_en: 'Delivery in Yaounde and across Cameroon depending on the area.',

  whatsapp_order_template_fr: 'Bonjour, je souhaite commander chez {brand}.',
  whatsapp_order_template_en: 'Hello, I would like to order from {brand}.',
  chat_assistant_name: 'Ice',
  chat_welcome_fr: 'Bonjour, je suis {assistant}, votre assistant {brand}. Comment puis-je vous aider ?',
  chat_welcome_en: 'Hello, I am {assistant}, your {brand} assistant. How can I help?',
  chat_quick_questions_fr: 'Quels produits avez-vous ?|Quels sont les prix ?|Comment se passe la livraison ?',
  chat_quick_questions_en: 'What products do you have?|What are the prices?|How does delivery work?',

  legal_terms_fr: '',
  legal_terms_en: '',
  legal_privacy_fr: '',
  legal_privacy_en: '',
  legal_returns_fr: '',
  legal_returns_en: '',

  enable_chat: 'true',
  enable_whatsapp_fab: 'true',
  enable_dark_mode: 'true'
};

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS));
const MAX_VALUE_LENGTH = 10000;
const COLOR_KEYS = new Set(Object.keys(DEFAULTS).filter(key => key.startsWith('color_')));
const BOOLEAN_KEYS = new Set(['enable_chat', 'enable_whatsapp_fab', 'enable_dark_mode']);
const UPLOAD_TARGETS = {
  logo: { key: 'logo_url', prefix: 'shop-logo', width: 600, height: 240, fit: 'inside' },
  favicon: { key: 'favicon_url', prefix: 'shop-favicon', width: 128, height: 128, fit: 'cover' },
  og: { key: 'og_image_url', prefix: 'shop-og', width: 1200, height: 630, fit: 'cover' }
};

const normalizeBoolean = (value) =>
  value === true || value === 'true' || value === '1' || value === 1 ? 'true' : 'false';

const normalizeColor = (value, fallback) => {
  const text = String(value || '').trim();
  return /^#([0-9a-fA-F]{6})$/.test(text) ? text : fallback;
};

const normalizePayload = (settings) => {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    const err = new Error('Parametres boutique invalides');
    err.statusCode = 400;
    throw err;
  }

  const normalized = {};
  for (const [key, rawValue] of Object.entries(settings)) {
    if (!ALLOWED_KEYS.has(key)) {
      const err = new Error(`Parametre non autorise: ${key}`);
      err.statusCode = 400;
      throw err;
    }

    if (BOOLEAN_KEYS.has(key)) {
      normalized[key] = normalizeBoolean(rawValue);
      continue;
    }

    if (COLOR_KEYS.has(key)) {
      normalized[key] = normalizeColor(rawValue, DEFAULTS[key]);
      continue;
    }

    const value = rawValue === null || rawValue === undefined ? '' : String(rawValue).trim();
    if (value.length > MAX_VALUE_LENGTH) {
      const err = new Error(`Valeur trop longue pour ${key}`);
      err.statusCode = 400;
      throw err;
    }
    normalized[key] = value;
  }
  return normalized;
};

const loadSettings = async () => {
  const rows = await ShopSetting.findAll();
  const settings = { ...DEFAULTS };
  rows.forEach(row => {
    if (ALLOWED_KEYS.has(row.cle)) settings[row.cle] = row.valeur ?? '';
  });
  return settings;
};

exports.getPublic = async (req, res) => {
  try {
    res.json({ settings: await loadSettings() });
  } catch (err) {
    fail(res, err);
  }
};

exports.getAdmin = async (req, res) => {
  try {
    res.json({ settings: await loadSettings(), defaults: DEFAULTS });
  } catch (err) {
    fail(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const settings = normalizePayload(req.body?.settings);
    for (const [cle, valeur] of Object.entries(settings)) {
      await ShopSetting.upsert({ cle, valeur });
    }

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'shop_settings',
      entityId: 1,
      action: 'shop_settings_updated',
      meta: { changed_keys: Object.keys(settings) }
    });

    res.json({ message: 'Parametres boutique sauvegardes', settings: await loadSettings() });
  } catch (err) {
    fail(res, err, err.message || 'Erreur serveur', err.statusCode || 500);
  }
};

exports.uploadAsset = async (req, res) => {
  try {
    const target = UPLOAD_TARGETS[req.params.type];
    if (!target) return res.status(400).json({ message: 'Type de fichier invalide' });
    if (!req.file) return res.status(400).json({ message: 'Aucune image envoyee' });

    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${target.prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, filename);
    const buffer = await sharp(req.file.buffer)
      .resize(target.width, target.height, { fit: target.fit, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
    fs.writeFileSync(outputPath, buffer);

    const url = `/uploads/${filename}`;
    await ShopSetting.upsert({ cle: target.key, valeur: url });

    await writeAdminAudit({
      adminId: req.admin?.id || null,
      entityType: 'shop_settings',
      entityId: 1,
      action: 'shop_settings_asset_uploaded',
      meta: { target: req.params.type, key: target.key, url }
    });

    res.status(201).json({ key: target.key, url, settings: await loadSettings() });
  } catch (err) {
    fail(res, err);
  }
};

exports.DEFAULTS = DEFAULTS;

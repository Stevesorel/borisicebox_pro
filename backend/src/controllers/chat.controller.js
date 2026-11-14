

const fs = require('fs');
const path = require('path');

let productsDB;
try {
  productsDB = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'products.json'), 'utf-8')
  );
} catch (e) {
  console.warn('⚠️ products.json introuvable ou invalide, fallback minimal utilisé');
  productsDB = { categories: [], contact: {} };
}

const conversations = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of conversations) {
    if (now - val.timestamp > 3600000) conversations.delete(key);
  }
}, 1800000);

const loadProductsFromDB = async () => {
  try {
    const { Produit, Categorie } = require('../models');
    const produits = await Produit.findAll({
      include: [{ model: Categorie, attributes: ['nom'] }],
      where: { actif: true }
    });

    if (produits.length > 0) {
      const categories = {};
      produits.forEach(p => {
        const catName = p.Categorie?.nom || 'Autres';
        if (!categories[catName]) categories[catName] = [];
        categories[catName].push({
          name: p.nom,
          slug: p.slug,
          price: Number(p.prix_base) || 0,
          description: p.description || '',
          marque: p.marque || '',
          image: p.image_principale || null
        });
      });
      productsDB.categories = Object.entries(categories).map(([name, products]) => ({ name, products }));
    }
    console.log(`📦 Catalogue IA mis à jour : ${produits.length} produits`);
  } catch (e) {
    console.warn('⚠️ Produits chargés depuis products.json (fallback)');
  }
};

exports.loadProductsFromDB = loadProductsFromDB;

const generateProductContext = () => {
  let context = '';
  let totalProducts = 0;
  if (!productsDB.categories || productsDB.categories.length === 0) {
    return '\n📦 Notre catalogue est en cours de mise à jour.\n';
  }
  productsDB.categories.forEach(cat => {
    if (!cat.products || cat.products.length === 0) return;
    context += `\n📌 ${cat.name} (${cat.products.length} articles) :\n`;
    cat.products.slice(0, 8).forEach(p => {
      const price = (p.price && p.price > 0) ? Number(p.price).toLocaleString('fr-FR') : 'Prix sur demande';
      context += `   • ${p.name} - ${price} FCFA`;
      if (p.marque) context += ` | ${p.marque}`;
      context += '\n';
    });
    totalProducts += cat.products.length;
  });
  return totalProducts === 0 ? '\n📦 Notre catalogue est en cours de mise à jour.\n' : context;
};

// const buildSystemPrompt = () => {
//   const productContext = generateProductContext();
//   const phone = productsDB.contact?.phone || '+237 656 771 727';
//   const address = productsDB.contact?.address || 'Yaoundé, Cameroun';
//   return `Tu es "Ice", l'assistant virtuel officiel de BORIS ICE BOX au Cameroun. 🇨🇲

// 🏪 BORIS ICE BOX : Boutique physique et en ligne — smartphones, accessoires, bijoux, parfums. Livraison partout au Cameroun.

// 📦 CATALOGUE : ${productContext}

// 📋 INFOS : 📍 ${address} | 📞 ${phone} | 🕐 Lundi-Samedi 7h-20h | 🚚 Livraison 1-3 jours, offerte dès 50 000 FCFA | 💳 Paiement : Espèces, MTN MoMo, Orange Money

// 🎯 RÈGLES : Réponds en français, sois chaleureux, utilise des émojis. Tu es Ice, pas une IA. Mentionne les prix en FCFA. Termine par "Besoin d'autre chose ?". Ne négocie pas les prix.

// `;
// };



const loadShopSettings = async () => {
  try {
    const { ShopSetting } = require('../models');
    const rows = await ShopSetting.findAll();
    const settings = {};
    rows.forEach(row => { settings[row.cle] = row.valeur; });
    return settings;
  } catch {
    return {};
  }
};

const buildSystemPrompt = async () => {
  const productContext = generateProductContext();
  const settings = await loadShopSettings();
  const brand = settings.shop_name || 'Boris Ice Box';
  const assistant = settings.chat_assistant_name || 'Ice';
  const phone = settings.phone_display || productsDB.contact?.phone || '+237 656 771 727';
  const address = settings.address_fr || productsDB.contact?.address || 'Yaoundé, Cameroun';
  const email = settings.email || productsDB.contact?.email || 'contact@borisicebox.com';
  const payments = settings.payment_methods_fr || 'Espèces à la livraison, MTN Mobile Money, Orange Money';
  const delivery = settings.delivery_desc_fr || 'Livraison partout au Cameroun.';

  return `TU ES "${assistant}" — L'ASSISTANT OFFICIEL DE ${brand} 🇨🇲

═══════════════════════════════════════
IDENTITÉ
═══════════════════════════════════════
- Tu t'appelles ${assistant} ❄️
- Tu es un membre humain de l'équipe ${brand}
- Tu ne dis JAMAIS que tu es une IA, un robot, ou une intelligence artificielle
- Si on te demande qui tu es : "Je suis ${assistant}, conseiller chez ${brand} ! 😊"
- Tu travailles à Yaoundé, Cameroun
- Tu es chaleureux, professionnel et toujours souriant
- Ton but : aider les clients à trouver le produit parfait et les guider pour commander
- Tu es le visage de ${brand} dans chaque conversation, sois exceptionnel !
- Tu utilises des émojis pour rendre la conversation vivante, mais sans en abuser (2-3 max par message)
- Tu réponds en fonction de la langue  du client (majoritairement français, mais adapte-toi si le client parle anglais ou pidgin)

═══════════════════════════════════════
L'ENTREPRISE
═══════════════════════════════════════
${brand} est une boutique physique ET en ligne située à ${address}.
Nous vendons : smartphones, accessoires, bijoux, montres, parfums.
Notre mission : offrir des produits de qualité avec une livraison rapide partout au Cameroun.

═══════════════════════════════════════
CATALOGUE PRODUITS (PRIX EN FCFA)
═══════════════════════════════════════
${productContext}

═══════════════════════════════════════
INFORMATIONS ESSENTIELLES
═══════════════════════════════════════
📍 Adresse : ${address}
📞 Téléphone/WhatsApp : ${phone}
📧 Email : ${email}
🕐 Horaires : Lundi au Samedi, 7h00 - 20h00 (fermé le dimanche)
🚚 Livraison : ${delivery}
💰 Frais de livraison : OFFERTS dès 50 000 FCFA d'achat, sinon 3 000 FCFA
💳 Paiements acceptés : ${payments}
🔄 Retour : Sous 7 jours après réception (produit intact)
📦 Suivi : Envoyé par SMS/WhatsApp après expédition
🎨 Personnalisation : Disponible pour bijoux (gravure, texte, couleur)

═══════════════════════════════════════
RÈGLES ABSOLUES (À RESPECTER IMPÉRATIVEMENT)
═══════════════════════════════════════

🔴 INTERDICTIONS FORMELLES :
1. ❌ Ne JAMAIS dire "je suis une IA", "je suis un assistant virtuel", "je suis un robot"
2. ❌ Ne JAMAIS dire "je ne peux pas..." sauf si c'est vraiment impossible
3. ❌ Ne JAMAIS inventer de produits qui n'existent pas
4. ❌ Ne JAMAIS donner de faux prix
5. ❌ Ne JAMAIS promettre un stock si tu n'es pas sûr
6. ❌ Ne JAMAIS négocier les prix (ils sont fixes)
7. ❌ Ne JAMAIS parler politique, religion ou sujets polémiques
8. ❌ Ne JAMAIS donner de conseils médicaux ou juridiques
9. ❌ Ne JAMAIS être impoli ou sarcastique
10. ❌ Ne JAMAIS dire "je ne sais pas" sans proposer une solution
11. ❌ Ne JAMAIS propose des produits qui ne sont pas dans le catalogue . 
12. ❌ Ne jamais repondre au question hors sujet ! ( sante , code , politique ,etc )

🟢 OBLIGATIONS :
1. ✅ Toujours répondre en fonction de la langue du client (français, anglais, pidgin)
2. ✅ Toujours être chaleureux et accueillant
3. ✅ Utiliser des émojis pour rendre la conversation vivante (📱💍⚡🎉🛒📦💎🕰️)
4. ✅ TOUJOURS mentionner le prix exact en FCFA quand tu parles d'un produit
5. ✅ Proposer systématiquement la livraison partout au Cameroun
6. ✅ Terminer CHAQUE réponse par "Besoin d'autre chose ?" ou "Puis-je vous aider ?"
7. ✅ Si le client veut commander : guide-le étape par étape
8. ✅ Si le client est mécontent : excuse-toi et propose le support au ${phone}
9. ✅ Si le client veut visiter : donne l'adresse et les horaires
10. ✅ Si le client cherche un produit qu'on n'a pas : propose une alternative similaire
11. ✅ Si le client demande une recommendation : demande d'abord son budget
12. ✅ Si le client demande une photo : décris le produit avec enthousiasme montre la photo.
13. ✅ Si le client mentionne un produit : donne le prix, une brève description, et propose de commander directement.
14. ✅ Si le client demande les prix : donne TOUJOURS les prix exacts du catalogue
15. ✅ Si le client demande la livraison : explique les frais et les délais, et demande sa ville pour être plus précis
16. ✅ Si le client est mécontent : excuse-toi sincèrement et propose de contacter le service client au ${phone}
17. ✅ Si le client parle d'autre chose que nos produits : recentre la conversation sur notre catalogue en proposant des produits qui pourraient lui plaire
18. ✅Present Bien toutes les categorie de produits !
19. ✅ Si le client veut commander rapidement : propose le bouton "Commander par WhatsApp" dans le panier
═══════════════════════════════════════
GUIDE DE CONVERSATION
═══════════════════════════════════════

QUAND LE CLIENT DEMANDE UN PRODUIT :
→ Donne le nom exact, le prix en FCFA, et une brève description et l'IAmage si disponible
→ Propose de commander directement

QUAND LE CLIENT VEUT COMMANDER :
→ Explique : "Allez dans la Boutique → Cliquez sur le produit → Ajoutez au panier → Finalisez avec vos informations"
→ Propose aussi WhatsApp : "Ou commandez directement au ${phone} 📞"

QUAND LE CLIENT DEMANDE LES PRIX :
→ Donne TOUJOURS les prix exacts du catalogue
→ Ne dis jamais "je ne connais pas le prix"

QUAND LE CLIENT DEMANDE LA LIVRAISON :
→ "🚚 Nous livrons partout au Cameroun en 1-3 jours ! OFFERTE dès 50 000 FCFA."
→ Demande la ville du client pour être plus précis

QUAND LE CLIENT EST MÉCONTENT :
→ "Je suis vraiment désolé 🙏 Contactez directement notre service client au ${phone}, ils régleront votre problème rapidement."

QUAND LE CLIENT PARLE D'AUTRE CHOSE QUE NOS PRODUITS :
→ "Je suis spécialisé dans les produits ${brand} 😊 Mais je peux vous aider à trouver un article qui vous plaît !"

QUAND LE CLIENT DEMANDE UNE PHOTO :
→ Décris le produit avec enthousiasme

═══════════════════════════════════════
TON STYLE
═══════════════════════════════════════
- Amical mais professionnel
- Enthousiaste sans être excessif
- Concis : 2-4 phrases maximum par réponse
- Toujours orienté vers l'action (commander, visiter, appeler)
- Utilise des émojis stratégiquement (pas plus de 2-3 par message)

═══════════════════════════════════════
EXEMPLES DE BONNES RÉPONSES
═══════════════════════════════════════

Client : "Bonjour"
Toi : "Bonjour ! 👋 Bienvenue chez ${brand} ! Je suis ${assistant}, votre conseiller. Que cherchez-vous aujourd'hui ? 💎📱"

Client : "Je cherche une montre"
Toi : "Nous avons de magnifiques montres ! 🕰️ La Rolex Or à 9 000 FCFA ou la Montre Homme Luxe Gold Black à 15 000 FCFA. Laquelle vous intéresse ?"

Client : "C'est trop cher"
Toi : "Je comprends ! 😊 Nous avons aussi des articles à tous les prix. Quel est votre budget ? Je peux vous trouver la perle rare ! 💎"

Client : "Vous livrez à Douala ?"
Toi : "Oui ! 🚚 Nous livrons à Douala en 1-2 jours. Livraison OFFERTE dès 50 000 FCFA d'achat. Puis-je vous aider à choisir un produit ?"

═══════════════════════════════════════
RAPPELE-TOI : Tu es ${assistant}, le visage de ${brand}. Chaque conversation est une opportunité de fidéliser un client. Sois EXCEPTIONNEL.`;
};


exports.chat = async (req, res) => {
  const { message, clientId = Date.now().toString() } = req.body;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const frontUrl = process.env.FRONT_URL || 'http://localhost:5173';
  const settings = await loadShopSettings();
  const assistant = settings.chat_assistant_name || 'Ice';
  const brand = settings.shop_name || 'Boris Ice Box';
  const phone = settings.phone_display || productsDB.contact?.phone || '+237 656 771 727';

  if (!message || !message.trim()) {
    return res.json({ reply: `👋 Bonjour ! Je suis ${assistant}, votre assistant ${brand}. Dites-moi ce que vous cherchez ! 🛒` });
  }

  let history = conversations.get(clientId);
  if (!history) { history = { messages: [], timestamp: Date.now() }; conversations.set(clientId, history); }
  history.timestamp = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const systemPrompt = await buildSystemPrompt();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.messages.slice(-6),
          { role: 'user', content: message }
        ],
        max_tokens: 400, temperature: 0.7, top_p: 0.9
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.choices?.[0]?.message?.content) throw new Error('Invalid response');

    let reply = data.choices[0].message.content;

    // Nettoyer les excuses
    reply = reply.replace(/je ne peux pas afficher directement des images[^.]*\./gi, '');
    reply = reply.replace(/je suis un assistant virtuel et je ne peux pas[^.]*\./gi, '');
    reply = reply.replace(/malheureusement[^.]*images[^.]*\./gi, '');
    reply = reply.replace(/vous pouvez visiter notre site web[^.]*\./gi, '');

    // 🔥 Pour CHAQUE produit mentionné, ajouter image + lien
    if (productsDB.categories) {
      for (const cat of productsDB.categories) {
        for (const p of cat.products || []) {
          if (p.image && reply.toLowerCase().includes(p.name.toLowerCase())) {
            const imgUrl = `${baseUrl}${p.image}`;
            const productSlug = p.slug || p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const productLink = `${frontUrl}/produit/${productSlug}`;
            const escapedName = p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const productRegex = new RegExp(`(${escapedName})`, 'gi');
            reply = reply.replace(productRegex, `$1\n📸 ${imgUrl}\n🛒 ${productLink}`);
            console.log(`🖼️ Image + lien pour : ${p.name}`);
          }
        }
      }
    }

    history.messages.push({ role: 'user', content: message });
    history.messages.push({ role: 'assistant', content: reply });
    if (history.messages.length > 20) history.messages = history.messages.slice(-20);

    res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error.message);

    const msgLower = message.toLowerCase();
    if (productsDB.categories) {
      for (const cat of productsDB.categories) {
        for (const p of cat.products || []) {
          if (p.image && msgLower.includes(p.name.toLowerCase())) {
            const imgUrl = `${baseUrl}${p.image}`;
            const productSlug = p.slug || p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const productLink = `${frontUrl}/produit/${productSlug}`;
            return res.json({ 
              reply: `🕰️ ${p.name}\n💰 Prix : ${Number(p.price).toLocaleString('fr-FR')} FCFA\n\n📸 ${imgUrl}\n\n🛒 ${productLink}\n📞 ${phone}\nBesoin d'autre chose ?` 
            });
          }
        }
      }
    }

    res.json({ reply: '❌ Service momentanément indisponible. 📞 Appelez-nous au ' + phone + ' !' });
  }
};

loadProductsFromDB();
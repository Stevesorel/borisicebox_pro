/**
 * Cache HTTP court pour les endpoints publics en lecture seule.
 * stale-while-revalidate permet au navigateur d'afficher vite une réponse en cache.
 */
module.exports = (maxAgeSeconds = 60) => (req, res, next) => {
  if (req.method !== 'GET') return next()
  const maxAge = Math.max(0, Number(maxAgeSeconds) || 0)
  const swr = maxAge * 2
  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${swr}`)
  next()
}

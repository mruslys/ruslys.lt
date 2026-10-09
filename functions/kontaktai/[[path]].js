export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Paimame URL kelio segmentus
  const segments = url.pathname.split('/').filter(s => s !== '');
  // Jei URL yra /kontaktai/Konsultacija, ieškome kas eina po 'kontaktai'
  const kontaktaiIndex = segments.indexOf('kontaktai');
  let reason = '';
  
  if (kontaktyIndex !== -1 && segments.length > kontaktyIndex + 1) {
    reason = decodeURIComponent(segments[kontaktyIndex + 1]);
  }

  // Pasiimame bazinį statinį HTML failą iš assets
  const assetResponse = await env.ASSETS.fetch(request);
  
  // Jei priežastis nenurodyta, grąžiname standartinį puslapį
  if (!reason || reason.trim() === '') {
    return assetResponse;
  }

  const customTitle = `${reason} – Mindaugas R.`;
  const customDescription = `Susisiekti su Mindaugu R. dėl: ${reason}`;

  // Naudojame HTMLRewriter, kad pakeistume reikšmes tiek HTML elementuose, tiek OG žymose
  return new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(customTitle); } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', customTitle); } })
    .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', customTitle); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', customDescription); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', customDescription); } })
    .on('#subtitle', { element(el) { el.setInnerContent(reason); } })
    .transform(assetResponse);
}

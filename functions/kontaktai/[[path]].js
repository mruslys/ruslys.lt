export async function onRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Paimame URL kelio segmentus
    const segments = url.pathname.split('/').filter(s => s !== '');
    const kontaktyIndex = segments.indexOf('kontaktai');
    let reason = '';
    
    if (kontaktyIndex !== -1 && segments.length > kontaktyIndex + 1) {
      reason = decodeURIComponent(segments[kontaktyIndex + 1]);
    }

    // SVARBU: Pasiimame bazinį /kontaktai/ puslapį iš statinių failų,
    // nes /kontaktai/Konsultacija fiziškai diske neegzistuoja.
    const assetUrl = new URL('/kontaktai/', request.url);
    const assetResponse = await env.ASSETS.fetch(assetUrl);
    
    // Jei priežastis nenurodyta, tiesiog grąžiname standartinį puslapį
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

  } catch (err) {
    // Jei įvyktų nenumatyta klaida, grąžinsime tekstą vietoj 1101 kodo
    return new Response(`Worker Error: ${err.message}`, { status: 500 });
  }
}

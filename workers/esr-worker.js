/**
 * Cloudflare Worker: Edge Side Rendering (ESR) for Warranty SaaS.
 * Fetches real-time Firebase content at the edge and injects it into the HTML.
 */

const FIREBASE_API_KEY = "AIzaSyCs_7gmTcAF2YbVmCc5NKKivLfxxxNLpQ4";
const PROJECT_ID = "apph-k";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Pass-through for assets
    if (url.pathname.includes('/assets/')) {
      return fetch(request);
    }

    // Edge Side Rendering for Dashboard/List View
    if (url.pathname === '/dashboard' || url.pathname === '/inventory') {
      console.log(`🚀 ESR: Rendering ${url.pathname} at the Edge...`);

      // 1. Fetch data from Firebase Firestore REST API
      const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/entries?key=${FIREBASE_API_KEY}`;
      
      const response = await fetch(firebaseUrl);
      const data = await response.json();
      const count = data.documents ? data.documents.length : 0;

      // 2. Fetch original HTML from the origin (Cloudflare Pages)
      const originResponse = await fetch(request);
      let html = await originResponse.text();

      // 3. Inject data summary into the HTML for instant rendering
      // This is a simple example of ESR injection.
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root"></div><script>window.__PRELOADED_STATS__ = { total: ${count} };</script>`
      );

      return new Response(html, {
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }

    return fetch(request);
  },
};

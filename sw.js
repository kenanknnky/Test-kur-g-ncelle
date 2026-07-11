/* Portföy çevrimdışı önbellek */
const C='portfoy-cache-v16';
const ASSETS=['./','./index.html','./manifest.json','./sw.js'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(Promise.all([
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))),
  self.clients.claim()
])); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  let sameOrigin=false; try{ sameOrigin=new URL(e.request.url).origin===self.location.origin; }catch(_){ }
  if(!sameOrigin && e.request.destination!=='image') return;
  e.respondWith(
    caches.match(e.request,{ignoreSearch:false}).then(r=> r || fetch(e.request).then(resp=>{
      try{ const cp=resp.clone(); caches.open(C).then(c=>c.put(e.request,cp).catch(()=>{})); }catch(_){}
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});

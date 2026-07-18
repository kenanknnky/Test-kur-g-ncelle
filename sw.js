/* Portföy çevrimdışı önbellek — v32: sayfa için önce ağ */
const C='portfoy-cache-v32';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(Promise.all([
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))),
  self.clients.claim()
])); });
function isDoc(req){ try{ const u=new URL(req.url); return req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'); }catch(_){ return false; } }
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  let sameOrigin=false; try{ sameOrigin=new URL(e.request.url).origin===self.location.origin; }catch(_){ }
  if(!sameOrigin && e.request.destination!=='image') return;
  if(sameOrigin && isDoc(e.request)){
    e.respondWith(
      fetch(e.request).then(resp=>{ try{ const cp=resp.clone(); caches.open(C).then(c=>{c.put('./index.html',cp).catch(()=>{});}); }catch(_){}
        return resp;
      }).catch(()=> caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request,{ignoreSearch:false}).then(r=> r || fetch(e.request).then(resp=>{
      try{ const cp=resp.clone(); caches.open(C).then(c=>c.put(e.request,cp).catch(()=>{})); }catch(_){}
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});

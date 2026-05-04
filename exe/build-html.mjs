import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const OUT_FILE = join(import.meta.dirname, '..', 'Building Design Simulator.html');

function buildSingleFileHTML() {
  let html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8');
  const jsDir = join(DIST_DIR, 'assets');

  const jsFiles = readdirSync(jsDir).filter(f => f.endsWith('.js'));
  const jsContent = jsFiles.map(f => {
    console.log('  Reading JS: ' + f);
    return readFileSync(join(jsDir, f), 'utf8');
  }).join('\n');

  const jsonFiles = readdirSync(DIST_DIR).filter(f => f.endsWith('.json'));
  const jsonData = {};
  for (const f of jsonFiles) {
    const content = readFileSync(join(DIST_DIR, f), 'utf8');
    jsonData['/' + f] = content;
    console.log('  Inlining JSON: ' + f + ' (' + (content.length / 1024).toFixed(0) + ' KB)');
  }

  // Patch JS: fix import.meta.url -> window.location.href, disable dynamic import
  let patchedJs = jsContent
    .replace(/\{\}\.url/g, 'window.location.href')
    .replace(
      /b\(\(\)=>import\(e\.module\),void 0,window\.location\.href\)/g,
      'b(()=>Promise.reject(new Error("offline")),void 0,window.location.href)'
    )
    .replace(
      /window\.location\.reload\(\),new Promise\(\(\)=>\{\}\)/g,
      'Promise.reject(new Error("offline: module not available"))'
    );

  // Base64 encode the entire JS bundle - this avoids ALL HTML parsing issues
  const jsB64 = Buffer.from(patchedJs, 'utf8').toString('base64');
  console.log('  JS base64 size: ' + (jsB64.length / 1024).toFixed(0) + ' KB');

  const jsonB64 = Buffer.from(JSON.stringify(jsonData), 'utf8').toString('base64');

  html = html.replace(
    /<script\s+defer\s+src="[^"]*"><\/script>/,
    `<script>
// Offline patch: serve inlined JSON + decode and run app
(function(){
function u8(b){var d=atob(b),a=new Uint8Array(d.length);for(var i=0;i<d.length;i++)a[i]=d.charCodeAt(i);return new TextDecoder().decode(a);}
var J=JSON.parse(u8('${jsonB64}'));
var xo=XMLHttpRequest.prototype.open,xs=XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open=function(m,u){if(typeof u==='string'&&u in J){this._u=u;this._j=1;}return xo.apply(this,arguments);};
XMLHttpRequest.prototype.send=function(){if(this._j){var s=this,d=J[s._u];Object.defineProperty(s,'status',{value:200});Object.defineProperty(s,'statusText',{value:'OK'});Object.defineProperty(s,'responseText',{value:d});Object.defineProperty(s,'response',{value:d});Object.defineProperty(s,'readyState',{value:4,writable:true});Object.defineProperty(s,'responseURL',{value:s._u});setTimeout(function(){if(s.onreadystatechange)s.onreadystatechange(new Event('readystatechange'));if(s.onload)s.onload(new ProgressEvent('load'));if(s.addEventListener){s.dispatchEvent(new ProgressEvent('load'));s.dispatchEvent(new ProgressEvent('loadend'));}},0);return;}return xs.apply(this,arguments);};
var of=window.fetch;window.fetch=function(u){if(typeof u==='string'&&u in J)return Promise.resolve(new Response(J[u],{status:200,statusText:'OK',headers:new Headers({'Content-Type':'application/json'})}));return of.apply(this,arguments);};
})();
window.onerror=function(m,s,l){document.getElementById('root').innerHTML='<div style="padding:40px;color:red;font-family:monospace;white-space:pre-wrap">JS Error: '+m+' Line: '+l+'</div>';return true;};
window.addEventListener('unhandledrejection',function(e){var r=document.getElementById('root');if(r)r.innerHTML+='<div style="padding:20px;color:red">Promise Error: '+e.reason+'</div>';});
document.addEventListener('DOMContentLoaded',function(){var d=atob('${jsB64}'),a=new Uint8Array(d.length);for(var i=0;i<d.length;i++)a[i]=d.charCodeAt(i);eval(new TextDecoder().decode(a));});
</script>`
  );

  html = html.replace('</head>', `<style>body{margin:0;padding:0;}</style>\n</head>`);

  const sizeKB = Buffer.byteLength(html, 'utf8') / 1024;
  writeFileSync(OUT_FILE, html);
  console.log('\nDone! Created: ' + OUT_FILE);
  console.log('File size: ' + (sizeKB / 1024).toFixed(1) + ' MB');
  console.log('\nDouble-click to open - works on any OS, any browser, offline!');
}

buildSingleFileHTML();
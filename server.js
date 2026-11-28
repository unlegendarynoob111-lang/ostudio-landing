'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=__dirname,PORT=Number(process.env.PORT||4173);
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.mp3':'audio/mpeg','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json'};
function headers(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' https://analytics.tiktok.com https://connect.facebook.net; style-src 'self'; img-src 'self' data: https://www.facebook.com; media-src 'self'; connect-src 'self' https://analytics.tiktok.com https://www.facebook.com; frame-ancestors 'none'");}
http.createServer((req,res)=>{
 headers(res);let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 if(route==='/landing-assets/tracking.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({tiktokPixelId:process.env.OSTUDIO_TIKTOK_PIXEL_ID||'',facebookPixelId:process.env.OSTUDIO_FACEBOOK_PIXEL_ID||''}));return;}
 if(route==='/')route='/index.html';else if(route.startsWith('/landing-assets/'))route=route.slice('/landing-assets'.length);
 const file=path.resolve(ROOT,'.'+route);if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
 const okExt=/\.(html|css|js|svg|png|jpg|jpeg|webp|mp4|mp3|woff2|ttf|ico|json|xml|txt)$/i.test(route);
 if(!okExt){res.writeHead(404);res.end('Not found');return;}
 if(/(?:^|[\\/])(?:backups|qa|\.env|prepare-eleven\.cjs|probe\.cjs|assets\.cjs)(?:[\\/]|$)/.test(file)){res.writeHead(404);res.end();return;}
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
 const type=MIME[path.extname(file)]||'application/octet-stream';res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');
 if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416);res.end();return;}const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;if(start>=stat.size||end<start){res.setHeader('Content-Range','bytes */'+stat.size);res.writeHead(416);res.end();return;}res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);res.setHeader('Content-Length',end-start+1);res.writeHead(206);fs.createReadStream(file,{start,end}).pipe(res);return;}
 res.setHeader('Content-Length',stat.size);res.setHeader('Cache-Control',route==='/index.html'?'no-cache':'public, max-age=3600');if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);
 });
}).listen(PORT,process.env.HOST||'0.0.0.0',()=>console.log('OStudio preview listening on '+PORT));


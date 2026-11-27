'use strict';
const funnelSid=(()=>{try{let sid=sessionStorage.getItem('odance_funnel_sid');if(!/^[a-f0-9]{32}$/.test(sid||'')){sid=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');sessionStorage.setItem('odance_funnel_sid',sid);}return sid;}catch{return '';}})();
const beaconImages=new Set();
function funnel(event,item=''){if(!funnelSid)return;const image=new Image();beaconImages.add(image);image.onload=image.onerror=()=>beaconImages.delete(image);image.src='/landing-track.gif?sid='+funnelSid+'&event='+encodeURIComponent(event)+'&item='+encodeURIComponent(item);}
funnel('landing_view');
document.querySelectorAll('a[href^="https://dance.ostudio.io.vn/create/"]').forEach((link,index)=>{const url=new URL(link.href);url.searchParams.set('os_ref','landing');url.searchParams.set('os_sid',funnelSid);link.href=url.href;link.addEventListener('click',()=>funnel('cta_click',link.closest('.hero')?'hero':link.closest('.proof-gallery')?'gallery':link.closest('.pricing-section')?'pricing':link.closest('.final-section')?'final':'comparison'));});
if('IntersectionObserver'in window){const demo=document.getElementById('demo');const demoObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){funnel('demo_view');demoObserver.disconnect();}},{threshold:.3});demoObserver.observe(demo);const gallery=document.getElementById('examples');const galleryObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){funnel('gallery_view');galleryObserver.disconnect();}},{threshold:.25});galleryObserver.observe(gallery);}
document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{if(video.id==='heroVideo'||video.id==='secondVideo')funnel('demo_play',video.id);else if(video.closest('.proof-gallery'))funnel('gallery_play',video.id);else if(video.closest('.transformation'))funnel('demo_play',video.id);}));
document.querySelectorAll('[data-proof]').forEach(button=>{const video=document.getElementById(button.dataset.proof);button.addEventListener('click',()=>{video.play().catch(()=>{button.querySelector('span').textContent='Thử lại';});});video.addEventListener('play',()=>button.hidden=true);video.addEventListener('pause',()=>button.hidden=false);});
const menu=document.getElementById('menuBtn');
const nav=document.getElementById('nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Mở menu');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Đóng menu':'Mở menu');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.querySelectorAll('.brand').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.navigation'))closeMenu();});

const previews=[...document.querySelectorAll('.motion-preview')];
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const autoMotion=!motionPreference.matches&&!navigator.connection?.saveData;
const stageButton=document.getElementById('stagePause');
const controls=[...document.querySelectorAll('[data-video]')];
function syncControls(){
 controls.forEach(button=>{const video=document.getElementById(button.dataset.video);button.textContent=video.paused?'▶':'Ⅱ';button.setAttribute('aria-pressed',String(!video.paused));});
 const playing=previews.some(video=>!video.paused);stageButton.textContent=playing?'Tạm dừng Ⅱ':'Phát clip ▶';stageButton.setAttribute('aria-pressed',String(playing));
}
async function playPreview(video){try{await video.play();}catch{document.querySelectorAll('video').forEach(video=>{video.addEventListener('loadedmetadata',()=>{const badge=document.querySelector('[data-duration="'+video.id+'"]');if(badge&&Number.isFinite(video.duration)){const m=Math.floor(video.duration/60),sec=Math.round(video.duration%60);badge.textContent=m+':'+String(sec).padStart(2,'0');badge.hidden=false;}});});
syncControls();}}
controls.forEach(button=>button.addEventListener('click',()=>{const video=document.getElementById(button.dataset.video);video.dataset.userPaused=String(!video.paused);video.paused?playPreview(video):video.pause();}));
stageButton.addEventListener('click',()=>{const playing=previews.some(video=>!video.paused);previews.forEach(video=>{video.dataset.userPaused=String(playing);playing?video.pause():playPreview(video);});});
previews.forEach(video=>{video.addEventListener('play',syncControls);video.addEventListener('pause',syncControls);video.addEventListener('error',()=>{syncControls();stageButton.textContent='Video chưa tải được · thử lại';});});
if('IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;if(!entry.isIntersecting){video.pause();}else if(autoMotion&&video.dataset.userPaused!=='true'&&!document.hidden){playPreview(video);}}),{threshold:.15});previews.forEach(video=>observer.observe(video));
}else if(autoMotion){previews.forEach(playPreview);}
motionPreference.addEventListener('change',event=>{if(event.matches){previews.forEach(video=>video.pause());}});
syncControls();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){document.querySelectorAll('video').forEach(video=>video.pause());}else if(autoMotion){previews.forEach(video=>{const box=video.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight&&video.dataset.userPaused!=='true')playPreview(video);});}});
 function focusAudio(video){if(video.muted)return;document.querySelectorAll('video').forEach(other=>{if(other!==video&&!other.muted)other.pause();});}
document.querySelectorAll('video').forEach(video=>{video.addEventListener('play',()=>focusAudio(video));video.addEventListener('volumechange',()=>focusAudio(video));});
// Pro 1080p pricing follows ODance: one credit is 1,000 VND.
let seconds=10;
const proCredits={5:1,10:1.5,15:2,20:2.5};
document.querySelectorAll('[data-seconds]').forEach(button=>button.addEventListener('click',()=>{
 const group=button.closest('.segmented');
 group.querySelectorAll('button').forEach(option=>{
  const selected=option===button;
  option.classList.toggle('selected',selected);
  option.setAttribute('aria-pressed',String(selected));
 });
 seconds=Number(button.dataset.seconds);
 const credits=proCredits[seconds];
 document.getElementById('costVnd').textContent=(credits*1000).toLocaleString('vi-VN');
 document.getElementById('costSummary').textContent='Pro 1080p, '+seconds+' giây · '+credits+' credit';
}));

// Empty configuration keeps pixels disabled. No credential is sent to the browser.
fetch('/landing-assets/tracking.json').then(r=>r.ok?r.json():{}).then(config=>{
 if(config.facebookPixelId){const fb=window.fbq=function(){fb.callMethod?fb.callMethod.apply(fb,arguments):fb.queue.push(arguments);};fb.queue=[];fb.loaded=true;fb.version='2.0';const script=document.createElement('script');script.src='https://connect.facebook.net/en_US/fbevents.js';script.async=true;document.head.appendChild(script);fb('init',config.facebookPixelId);fb('track','PageView');}
 if(config.tiktokPixelId){window.TiktokAnalyticsObject='ttq';const q=window.ttq=[];q.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];q.methods.forEach(m=>{q[m]=function(){q.push([m,...arguments]);};});const script=document.createElement('script');script.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+encodeURIComponent(config.tiktokPixelId)+'&lib=ttq';script.async=true;document.head.appendChild(script);q.page();}
}).catch(()=>{});

/* IOKTBA — shared site behavior (used by index, blog, coaching).
   Defensive: every feature checks its elements exist, so pages can omit any of them. */
(function(){
  "use strict";
  if(window.lucide&&lucide.createIcons){lucide.createIcons();}

  var nav=document.getElementById('nav'), totop=document.getElementById('totop');
  function onScroll(){var y=window.scrollY;if(nav)nav.classList.toggle('scrolled',y>30);if(totop)totop.classList.toggle('show',y>600);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var burger=document.getElementById('burger'), links=document.getElementById('navlinks');
  if(burger&&links){
    var closeMenu=function(){links.classList.remove('open');burger.classList.remove('open');burger.setAttribute('aria-expanded','false');};
    burger.addEventListener('click',function(){var o=links.classList.toggle('open');burger.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o));});
    links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});
  }

  if(totop)totop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

  // NOTE: reveal-on-scroll is handled by the inline bootstrap in each page's
  // <head> so visibility never depends on this external file loading.

  var mq=document.getElementById('marquee'); if(mq){mq.innerHTML+=mq.innerHTML;}

  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}

  var jf=document.getElementById('joinForm');
  if(jf){
    var jm=document.getElementById('joinMsg'), je=document.getElementById('joinEmail');
    jf.addEventListener('submit',function(ev){
      ev.preventDefault();
      var addr=je.value.trim();
      if(!validEmail(addr)){jm.textContent='Drop a real email and we’re in business.';jm.className='form-msg err';return;}
      jm.textContent='You’re on the list. Welcome to the crew.';jm.className='form-msg ok';je.value='';
      // No backend yet: hand the signup off via mailto. Swap for your ESP endpoint when ready.
      window.location.href='mailto:info@oktobeawesome.com?subject=Add%20me%20to%20the%20AWESOME%20field%20notes&body='+encodeURIComponent('Add this email to the list: '+addr);
    });
  }

  var cf=document.getElementById('contactForm');
  if(cf){
    var cm=document.getElementById('contactMsg');
    cf.addEventListener('submit',function(ev){
      ev.preventDefault();
      var n=document.getElementById('cname').value.trim(), e=document.getElementById('cemail').value.trim(), m=document.getElementById('cmsg').value.trim();
      if(!n||!validEmail(e)||!m){cm.textContent='Fill in all three and we’ll get it.';cm.className='form-msg err';return;}
      cm.textContent='Opening your email app — thanks for reaching out.';cm.className='form-msg ok';
      window.location.href='mailto:info@oktobeawesome.com?subject='+encodeURIComponent('Hello from '+n)+'&body='+encodeURIComponent(m+'\n\n— '+n+' ('+e+')');
    });
  }

  // ---- THE ORBIT: scroll-scrubbed cinematic crossfade hero ----
  (function(){
    var orbit=document.getElementById('orbit'); if(!orbit)return;
    var scenes=[].slice.call(orbit.querySelectorAll('.orbit-scene'));
    var videos=[].slice.call(orbit.querySelectorAll('.orbit-scene video'));
    var capBox=document.getElementById('orbitCaption');
    var dots=[].slice.call(orbit.querySelectorAll('.orbit-rail .dot'));
    var N=scenes.length; if(!N)return;
    var last=N-1, seg=last>0?1/last:1;
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    // Build the big swapping scene captions from each scene's data-* attrs.
    var words=[];
    scenes.forEach(function(s){
      var w=document.createElement('div'); w.className='word';
      w.innerHTML='<span class="n">'+(s.getAttribute('data-idx')||'')+'</span>'+(s.getAttribute('data-word')||'');
      capBox.appendChild(w); words.push(w);
    });

    var clamp=function(v){return v<0?0:v>1?1:v;};
    var activeNow=-1, playing=false;

    function ensurePlaying(){
      if(playing)return; playing=true;
      videos.forEach(function(v){ v.muted=true; var p=v.play(); if(p&&p.catch)p.catch(function(){playing=false;}); });
    }

    function update(){
      var total=orbit.offsetHeight-window.innerHeight;
      var p=total>0?clamp(-orbit.getBoundingClientRect().top/total):0;
      for(var i=0;i<N;i++){
        var stop=i*seg;
        var op=clamp(1-Math.abs(p-stop)/seg);
        var localT=clamp((p-stop)/seg+0.5);            // 0 before → 1 after; .5 at peak
        scenes[i].style.opacity=op;
        scenes[i].style.transform='scale('+(1.05+0.12*localT).toFixed(4)+')';
      }
      var active=Math.round(p*last);
      if(active!==activeNow){
        activeNow=active;
        for(var j=0;j<N;j++){ if(words[j])words[j].classList.toggle('on',j===active); if(dots[j])dots[j].classList.toggle('on',j===active); }
      }
      orbit.classList.toggle('scrolled-past',p>0.015);
    }

    var ticking=false;
    function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(function(){update();ticking=false;});} }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});

    // Rail dots jump to a scene's scroll position.
    dots.forEach(function(d){
      d.addEventListener('click',function(){
        var idx=parseInt(d.getAttribute('data-jump'),10)||0;
        var total=orbit.offsetHeight-window.innerHeight;
        window.scrollTo({top:orbit.offsetTop+idx*seg*total,behavior:reduce?'auto':'smooth'});
      });
    });

    // Kick playback (muted autoplay); retry on first interaction if the browser blocks it.
    ensurePlaying();
    ['touchstart','click','scroll','keydown'].forEach(function(ev){window.addEventListener(ev,ensurePlaying,{once:true,passive:true});});
    update();
  })();

  var yr=document.getElementById('yr'); if(yr)yr.textContent=new Date().getFullYear();
})();

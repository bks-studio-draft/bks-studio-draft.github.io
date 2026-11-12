(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu */
  var body = document.body;
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.menu-overlay');
  var menuImgs = overlay ? overlay.querySelectorAll('.menu-right img') : [];

  function setMenu(open){
    if(!overlay||!toggle) return;
    overlay.classList.toggle('is-open', open);
    body.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
    if(open){
      var first = overlay.querySelector('.menu-links a');
      if(first) first.focus();
    }
  }
  if(toggle){
    toggle.addEventListener('click', function(){
      setMenu(!overlay.classList.contains('is-open'));
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') setMenu(false);
  });
  if(overlay){
    overlay.querySelectorAll('.menu-links a').forEach(function(a){
      a.addEventListener('click', function(){ setMenu(false); });
      a.addEventListener('mouseenter', function(){
        var id = a.getAttribute('data-img');
        if(!id || !menuImgs.length) return;
        menuImgs.forEach(function(img){ img.classList.toggle('is-on', img.getAttribute('data-img') === id); });
      });
    });
  }

  /* Header solid state */
  var hero = document.querySelector('.hero');
  function onScroll(){
    if(!header) return;
    var y = window.scrollY || 0;
    var threshold = hero ? Math.max(80, (hero.offsetHeight || 0) - 80) : 40;
    var solid = hero ? y > threshold : y > 20;
    header.classList.toggle('is-solid', solid || body.classList.contains('is-menu-open') || !hero);
  }
  if(!hero && header) header.classList.add('is-solid');
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);

  /* Hero crossfade */
  var slides = document.querySelectorAll('.hero-slide');
  var heroTimer = null;
  var heroIdx = 0;
  function showSlide(i){
    if(!slides.length) return;
    slides[heroIdx].classList.remove('is-active');
    heroIdx = (i + slides.length) % slides.length;
    slides[heroIdx].classList.add('is-active');
  }
  function startHero(){
    if(reduce || slides.length < 2) return;
    heroTimer = setInterval(function(){ showSlide(heroIdx+1); }, 7200);
  }
  function stopHero(){ if(heroTimer){ clearInterval(heroTimer); heroTimer = null; } }
  if(slides.length){
    if(reduce){
      slides.forEach(function(s,i){ s.classList.toggle('is-active', i===0); });
    } else {
      startHero();
      document.addEventListener('visibilitychange', function(){
        if(document.hidden) stopHero(); else startHero();
      });
    }
  }

  /* Reveals */
  var els = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  }

  /* Lightbox */
  var lb = document.querySelector('.lightbox');
  if(lb){
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-full], .edit-grid img, .catalog-grid img, .still-row img, .look-fig img, .filmstrip img'));
    // unique, only actual content images
    items = items.filter(function(img, i, arr){
      return img.tagName === 'IMG' && arr.indexOf(img) === i;
    });
    var lbIndex = 0;
    function openLb(i){
      if(!items.length) return;
      lbIndex = (i + items.length) % items.length;
      var src = items[lbIndex].getAttribute('data-full') || items[lbIndex].getAttribute('src');
      var alt = items[lbIndex].getAttribute('alt') || '';
      lbImg.src = src;
      lbImg.alt = alt;
      if(lbCap) lbCap.textContent = alt;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb(){
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    items.forEach(function(img, i){
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function(){ openLb(i); });
    });
    lb.addEventListener('click', function(e){
      if(e.target === lb || e.target.classList.contains('lb-close')) closeLb();
    });
    var prev = lb.querySelector('.lb-prev');
    var next = lb.querySelector('.lb-next');
    if(prev) prev.addEventListener('click', function(e){ e.stopPropagation(); openLb(lbIndex-1); });
    if(next) next.addEventListener('click', function(e){ e.stopPropagation(); openLb(lbIndex+1); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('is-open')) return;
      if(e.key === 'Escape') closeLb();
      if(e.key === 'ArrowLeft') openLb(lbIndex-1);
      if(e.key === 'ArrowRight') openLb(lbIndex+1);
    });
  }
})();

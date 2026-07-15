/**
 * SWIPER-INIT.JS v1.12.0
 * All Swiper slider configurations for Fendix (incl. hero coverflow)
 * v1.12.0: a11y — slides krijgen role="listitem" wanneer de wrapper een
 * Webflow-collectielijst is (role="list"); Swiper zette standaard "group"
 */
(function () {
  'use strict';

  var MAX_WAIT_MS = 4000;
  var START = Date.now();

  function whenSwiperReady(cb) {
    if (typeof Swiper !== 'undefined') return cb();

    if (Date.now() - START > MAX_WAIT_MS) return; // fail silently (or console.warn)
    setTimeout(function () {
      whenSwiperReady(cb);
    }, 50);
  }

  // Helper: Standard navigation + scrollbar config (only include if elements exist)
  function getNavConfig(component) {
    var next = component.querySelector('.swiper-button.is-next');
    var prev = component.querySelector('.swiper-button.is-prev');
    var sbWrap = component.querySelector('.swiper-scrollbar_wrap');

    var cfg = {};
    if (next && prev) {
      cfg.navigation = { nextEl: next, prevEl: prev };
    }
    if (sbWrap) {
      cfg.scrollbar = {
        el: sbWrap,
        draggable: true,
        dragClass: 'swiper-scrollbar_handle',
        snapOnRelease: true
      };
    }
    return cfg;
  }

  // Helper: Active class handler (O(1))
  function attachActiveClass(swiper) {
    var last = null;

    function setActive() {
      var current = swiper.slides && swiper.slides[swiper.activeIndex];
      if (last && last !== current) last.classList.remove('is-active');
      if (current) current.classList.add('is-active');
      last = current || null;
    }

    swiper.on('init', setActive);
    swiper.on('slideChange', setActive);
    swiper.on('resize', setActive);

    // If Swiper is already initialized before handlers attach
    setActive();

    // One extra update after layout settles (no magic 150ms)
    requestAnimationFrame(function () {
      swiper.update();
      setActive();
    });

    // Update once after full load (handles late-loading images/font swaps)
    window.addEventListener(
      'load',
      function () {
        swiper.update();
        setActive();
      },
      { once: true, passive: true }
    );
  }

  function createSlider(componentSelector, optionsFactory) {
    document.querySelectorAll(componentSelector).forEach(function (component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);
      var opts = optionsFactory(component, nav);

      // A11y: Webflow-collectielijsten hebben role="list" op de wrapper;
      // slides horen daarbinnen role="listitem" te zijn (Swiper-standaard is "group")
      var wrapper = el.querySelector('.swiper-wrapper');
      if (wrapper && wrapper.getAttribute('role') === 'list') {
        opts.a11y = Object.assign({ slideRole: 'listitem' }, opts.a11y);
      }

      var swiper = new Swiper(el, opts);
      if (opts && opts._activeClass) attachActiveClass(swiper);
    });
  }

  function init() {
    // =========================
    // HERO SLIDER (coverflow + autoplay — voorheen page-code op /over-ons)
    // =========================
    document.querySelectorAll('.hero-slider_component').forEach(function (component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var slides = el.querySelectorAll('.swiper-slide');
      if (slides.length <= 1) return; // geen autoplay/slider nodig bij 1 slide

      var heroOpts = {
        slidesPerView: 1,
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 5,
          scale: 0.95,
          stretch: 0,
          depth: 0,
          slideShadows: false
        },
        speed: 1000,
        loop: false,
        centeredSlides: false,
        initialSlide: 0,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        allowTouchMove: true,
        grabCursor: true,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        breakpoints: {
          576: {
            coverflowEffect: { scale: 0.85, slideShadows: false }
          }
        }
      };
      var heroWrapper = el.querySelector('.swiper-wrapper');
      if (heroWrapper && heroWrapper.getAttribute('role') === 'list') {
        heroOpts.a11y = { slideRole: 'listitem' };
      }
      new Swiper(el, heroOpts);
    });

    // =========================
    // CASE SLIDER (rewind)
    // =========================
    createSlider('.case-slider_component', function (_component, nav) {
      return Object.assign(
        {
          slidesPerView: 'auto',
          speed: 450,
          rewind: true,
          mousewheel: { forceToAxis: true },
          keyboard: { enabled: true, onlyInViewport: true }
        },
        nav
      );
    });

    // =========================
    // TEAM SLIDER (active class, no rewind/loop)
    // =========================
    createSlider('.team-slider_component', function (_component, nav) {
      return Object.assign(
        {
          _activeClass: true,
          speed: 450,
          watchSlidesProgress: true,
          loop: false,
          rewind: false,
          centeredSlides: false,
          slidesPerView: 'auto',
          mousewheel: { forceToAxis: true },
          keyboard: { enabled: true, onlyInViewport: true }
        },
        nav
      );
    });

    // =========================
    // PARTNER SLIDER (active class + rewind)
    // =========================
    createSlider('.partner-slider_component', function (_component, nav) {
      return Object.assign(
        {
          _activeClass: true,
          slidesPerView: 'auto',
          speed: 450,
          rewind: true,
          mousewheel: { forceToAxis: true },
          keyboard: { enabled: true, onlyInViewport: true }
        },
        nav
      );
    });

    // =========================
    // VALUE SLIDER (breakpoints)
    // =========================
    createSlider('.value-slider_component', function (_component, nav) {
      return Object.assign(
        {
          speed: 450,
          rewind: false,
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 16,
          mousewheel: { forceToAxis: true },
          keyboard: { enabled: true, onlyInViewport: true },
          breakpoints: {
            480: { slidesPerView: 1.5, slidesPerGroup: 1, spaceBetween: 16 },
            768: { slidesPerView: 1.5, slidesPerGroup: 1, spaceBetween: 24 },
            992: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 24 }
          }
        },
        nav
      );
    });

    // =========================
    // STEPS SLIDER (active class + rewind)
    // =========================
    createSlider('.steps-slider_component', function (_component, nav) {
      return Object.assign(
        {
          _activeClass: true,
          slidesPerView: 'auto',
          speed: 450,
          rewind: true,
          mousewheel: { forceToAxis: true },
          keyboard: { enabled: true, onlyInViewport: true }
        },
        nav
      );
    });
  }

  // Start when DOM ready and Swiper is actually available
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        whenSwiperReady(init);
      },
      { once: true }
    );
  } else {
    whenSwiperReady(init);
  }
})();

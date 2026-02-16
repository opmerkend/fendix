/**
 * SWIPER-INIT.JS
 * All Swiper slider configurations for Fendix
 * 
 * Sliders:
 * - Hero slider (coverflow + autoplay)
 * - Case slider (rewind)
 * - Team slider (active class)
 * - Partner slider (active class + rewind)
 * - Value slider (responsive breakpoints)
 * - Steps slider (active class + rewind)
 * 
 * Usage:
 * <script defer src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
 * <script defer src="https://cdn.jsdelivr.net/gh/opmerkend/fendix@main/swiper-init.js"></script>
 */

(function() {
  'use strict';

  function init() {
    if (typeof Swiper === 'undefined') {
      setTimeout(init, 50);
      return;
    }

    // Helper: Set active class on current slide
    function createActiveClassHandler(swiper) {
      swiper.slides.forEach(function(s) { s.classList.remove('is-active'); });
      if (swiper.slides[swiper.activeIndex]) {
        swiper.slides[swiper.activeIndex].classList.add('is-active');
      }
    }

    // Helper: Standard navigation + scrollbar config
    function getNavConfig(component) {
      return {
        navigation: {
          nextEl: component.querySelector('.swiper-button.is-next'),
          prevEl: component.querySelector('.swiper-button.is-prev')
        },
        scrollbar: {
          el: component.querySelector('.swiper-scrollbar_wrap'),
          draggable: true,
          dragClass: 'swiper-scrollbar_handle',
          snapOnRelease: true
        }
      };
    }

    // =========================
    // HERO SLIDER
    // Coverflow effect with autoplay
    // =========================
    document.querySelectorAll('.hero-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var slideCount = el.querySelectorAll('.swiper-slide').length;

      new Swiper(el, {
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
        loop: true,
        centeredSlides: true,
        loopedSlides: slideCount,
        loopAdditionalSlides: slideCount,
        preloadImages: true,
        updateOnImagesReady: true,
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
            coverflowEffect: {
              scale: 0.85,
              slideShadows: false
            }
          }
        }
      });
    });

    // =========================
    // CASE SLIDER
    // Simple rewind slider
    // =========================
    document.querySelectorAll('.case-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      new Swiper(el, {
        slidesPerView: 'auto',
        speed: 450,
        rewind: true,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar
      });
    });

    // =========================
    // TEAM SLIDER
    // Active class on current slide, no loop
    // =========================
    document.querySelectorAll('.team-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      var swiper = new Swiper(el, {
        speed: 450,
        watchSlidesProgress: true,
        loop: false,
        rewind: false,
        centeredSlides: false,
        slidesPerView: 'auto',
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar,
        on: {
          init: function(sw) { createActiveClassHandler(sw); },
          slideChange: function(sw) { createActiveClassHandler(sw); },
          resize: function(sw) { createActiveClassHandler(sw); }
        }
      });

      setTimeout(function() {
        swiper.update();
        createActiveClassHandler(swiper);
      }, 150);
    });

    // =========================
    // PARTNER SLIDER
    // Active class + rewind
    // =========================
    document.querySelectorAll('.partner-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      var swiper = new Swiper(el, {
        slidesPerView: 'auto',
        speed: 450,
        rewind: true,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar,
        on: {
          init: function(sw) { createActiveClassHandler(sw); },
          slideChange: function(sw) { createActiveClassHandler(sw); },
          resize: function(sw) { createActiveClassHandler(sw); }
        }
      });

      setTimeout(function() {
        swiper.update();
        createActiveClassHandler(swiper);
      }, 150);
    });

    // =========================
    // VALUE SLIDER
    // Responsive breakpoints
    // =========================
    document.querySelectorAll('.value-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      new Swiper(el, {
        speed: 450,
        rewind: false,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 16,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar,
        breakpoints: {
          480: {
            slidesPerView: 1.5,
            slidesPerGroup: 1,
            spaceBetween: 16
          },
          768: {
            slidesPerView: 1.5,
            slidesPerGroup: 1,
            spaceBetween: 24
          },
          992: {
            slidesPerView: 2,
            slidesPerGroup: 1,
            spaceBetween: 24
          }
        }
      });
    });

    // =========================
    // STEPS SLIDER
    // Active class + rewind (same as partner)
    // =========================
    document.querySelectorAll('.steps-slider_component').forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      var swiper = new Swiper(el, {
        slidesPerView: 'auto',
        speed: 450,
        rewind: true,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar,
        on: {
          init: function(sw) { createActiveClassHandler(sw); },
          slideChange: function(sw) { createActiveClassHandler(sw); },
          resize: function(sw) { createActiveClassHandler(sw); }
        }
      });

      setTimeout(function() {
        swiper.update();
        createActiveClassHandler(swiper);
      }, 150);
    });

  } // end init

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

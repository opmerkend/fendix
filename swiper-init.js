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
 * Loaded conditionally via footer.html — only when .swiper exists on the page.
 */

(function() {
  'use strict';

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

  // Helper: Active-class slider factory (used by Team, Partner, Steps)
  function initActiveClassSlider(selector, extraConfig) {
    document.querySelectorAll(selector).forEach(function(component) {
      var el = component.querySelector('.swiper');
      if (!el) return;

      var nav = getNavConfig(component);

      var config = {
        slidesPerView: 'auto',
        speed: 450,
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: nav.navigation,
        scrollbar: nav.scrollbar,
        on: {
          init: function(sw) { createActiveClassHandler(sw); },
          slideChange: function(sw) { createActiveClassHandler(sw); },
          resize: function(sw) { createActiveClassHandler(sw); },
          afterInit: function(sw) {
            sw.update();
            createActiveClassHandler(sw);
          }
        }
      };

      // Merge extra config (e.g. rewind, watchSlidesProgress)
      for (var key in extraConfig) {
        if (extraConfig.hasOwnProperty(key)) {
          config[key] = extraConfig[key];
        }
      }

      new Swiper(el, config);
    });
  }

  function init() {
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
    // Active class on current slide, no loop/rewind
    // =========================
    initActiveClassSlider('.team-slider_component', {
      watchSlidesProgress: true,
      loop: false,
      rewind: false,
      centeredSlides: false
    });

    // =========================
    // PARTNER SLIDER
    // Active class + rewind
    // =========================
    initActiveClassSlider('.partner-slider_component', {
      rewind: true
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
    // Active class + rewind (same pattern as partner)
    // =========================
    initActiveClassSlider('.steps-slider_component', {
      rewind: true
    });

  } // end init

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

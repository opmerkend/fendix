/**
 * FENDIX.JS
 * Complete JavaScript for Fendix website
 */

(function() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // =========================
    // NAVBAR STATE
    // =========================
    (function() {
      var de = document.documentElement;
      var nav = document.querySelector('.navbar');
      if (!nav) return;

      var navBg = nav.querySelector('.navbar_scroll_background');
      var topBg = document.querySelector('.topbar_background');
      var overlay = document.querySelector('.nav-overlay');
      var isDarkStart = nav.getAttribute('start-color') === 'dark';
      
      var scrolled = window.scrollY > 0;
      var uiOpen = false;
      var ticking = false;

      function update() {
        var active = scrolled || uiOpen;
        
        if (navBg) navBg.classList.toggle('open', active);
        if (topBg) topBg.classList.toggle('open', active);
        
        if (isDarkStart) {
          var dark = !scrolled && !uiOpen;
          de.classList.toggle('navbar-top-dark', dark);
          nav.classList.toggle('is-top-dark', dark);
        }
        
        if (overlay) {
          var isDesktop = window.innerWidth >= 992;
          var ddOpen = nav.querySelector('.w-dropdown-toggle.w--open');
          var menuOpen = nav.querySelector('.w-nav-button.w--open, .navbar_menu-button.w--open');
          overlay.classList.toggle('open', isDesktop ? !!ddOpen : !!menuOpen);
        }
      }

      function onScroll() {
        scrolled = window.scrollY > 0;
        if (!ticking) {
          requestAnimationFrame(function() {
            update();
            ticking = false;
          });
          ticking = true;
        }
      }

      // Observe dropdown/menu changes
      var observer = new MutationObserver(function() {
        var ddOpen = nav.querySelector('.w-dropdown-toggle.w--open');
        var menuOpen = nav.querySelector('.w-nav-button.w--open, .navbar_menu-button.w--open');
        uiOpen = !!(ddOpen || menuOpen);
        update();
      });

      observer.observe(nav, { 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['class'] 
      });

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      
      // Initial update
      update();
    })();

    // =========================
    // ACCORDION CSS
    // =========================
    (function() {
      document.querySelectorAll('[data-accordion-css-init]').forEach(function(accordion) {
        var closeSiblings = accordion.hasAttribute('data-accordion-close-siblings');

        accordion.querySelectorAll('[data-accordion-toggle]').forEach(function(toggle) {
          toggle.addEventListener('click', function(e) {
            e.preventDefault();
            var item = toggle.closest('.accordion-css__item');
            if (!item) return;

            var isActive = item.getAttribute('data-accordion-status') === 'active';

            if (closeSiblings) {
              accordion.querySelectorAll('.accordion-css__item').forEach(function(sibling) {
                if (sibling !== item) {
                  sibling.setAttribute('data-accordion-status', 'not-active');
                }
              });
            }

            item.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
          });
        });
      });
    })();

    // =========================
    // MODAL SYSTEM
    // =========================
    (function() {
      var activeModal = null;
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      function openModal(name) {
        var wrapper = document.querySelector('[data-modal-name="' + name + '"]');
        if (!wrapper) return;

        var group = wrapper.closest('[data-modal-group-status]');
        if (group) {
          group.setAttribute('data-modal-group-status', 'active');
          wrapper.setAttribute('data-modal-status', 'active');
          activeModal = { group: group, wrapper: wrapper };
          
          document.body.style.overflow = 'hidden';
          document.body.style.paddingRight = scrollbarWidth + 'px';
        }
      }

      function closeModal() {
        if (!activeModal) return;

        activeModal.group.setAttribute('data-modal-group-status', 'non-active');
        activeModal.wrapper.setAttribute('data-modal-status', 'non-active');
        activeModal = null;
        
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }

      // Open triggers
      document.querySelectorAll('[data-modal-target]').forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
          var target = trigger.getAttribute('data-modal-target');
          if (target) {
            e.preventDefault();
            openModal(target);
          }
        });
      });

      // Close triggers
      document.querySelectorAll('[data-modal-close]').forEach(function(closer) {
        closer.addEventListener('click', function(e) {
          e.preventDefault();
          closeModal();
        });
      });

      // Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activeModal) {
          closeModal();
        }
      });
    })();

    // =========================
    // CURRENT YEAR
    // =========================
    document.querySelectorAll('[data-current-year]').forEach(function(el) {
      el.textContent = new Date().getFullYear();
    });

    // =========================
    // GSAP ANIMATIONS (when available)
    // =========================
    function initGSAP() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // Fade in animations
      gsap.utils.toArray('[data-animate="fadein"]').forEach(function(el) {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Reveal list animations
      gsap.utils.toArray('[data-animate="reveal-list"]').forEach(function(container) {
        var items = container.querySelectorAll('.col, .card, .item');
        if (items.length === 0) return;

        gsap.from(items, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      });

      // CSS Scroll retrigger
      gsap.utils.toArray('[data-css-scroll="retrigger-both"]').forEach(function(el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: function() { el.style.animationPlayState = 'running'; },
          onLeave: function() { el.style.animationPlayState = 'paused'; },
          onEnterBack: function() { el.style.animationPlayState = 'running'; },
          onLeaveBack: function() { el.style.animationPlayState = 'paused'; }
        });
      });
    }

    // Check for GSAP periodically (since it's deferred)
    var gsapCheck = setInterval(function() {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        clearInterval(gsapCheck);
        initGSAP();
      }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(function() { clearInterval(gsapCheck); }, 5000);

    // =========================
    // FILTER SYSTEM
    // =========================
    (function() {
      document.querySelectorAll('[data-filter-group]').forEach(function(group) {
        var buttons = group.querySelectorAll('[data-filter]');
        var items = document.querySelectorAll('[data-filter-item]');

        buttons.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var filter = btn.getAttribute('data-filter');

            // Update active button
            buttons.forEach(function(b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');

            // Filter items
            items.forEach(function(item) {
              var categories = item.getAttribute('data-filter-item').split(',');
              var show = filter === 'all' || categories.indexOf(filter) !== -1;
              item.style.display = show ? '' : 'none';
            });
          });
        });
      });
    })();

    // =========================
    // FORM ENHANCEMENT
    // =========================
    (function() {
      // Auto-resize textareas
      document.querySelectorAll('textarea').forEach(function(textarea) {
        textarea.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = this.scrollHeight + 'px';
        });
      });
    })();

    // =========================
    // SMOOTH SCROLL (for anchor links)
    // =========================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#main') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  } // end init
})();

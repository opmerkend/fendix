/**
 * FENDIX.JS */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    // =========================
    // ACCORDION CSS (kept; real links still navigate)
    // =========================
    (function () {
      document.querySelectorAll('[data-accordion-css-init]').forEach(function (accordion) {
        var closeSiblings = accordion.hasAttribute('data-accordion-close-siblings');

        accordion.querySelectorAll('[data-accordion-toggle]').forEach(function (toggle) {
          toggle.addEventListener('click', function (e) {
            // If toggle is a real link, allow navigation and do NOT toggle accordion
            if (toggle.tagName === 'A') {
              var href = (toggle.getAttribute('href') || '').trim();
              if (href && href !== '#') return; // real link => navigate
              e.preventDefault(); // dummy link => toggle accordion
            } else {
              e.preventDefault();
            }

            var item = toggle.closest('.accordion-css__item, .home-tabs_item');
            if (!item) return;

            var isActive = item.getAttribute('data-accordion-status') === 'active';

            if (closeSiblings) {
              accordion.querySelectorAll('.accordion-css__item, .home-tabs_item').forEach(function (sibling) {
                if (sibling !== item) sibling.setAttribute('data-accordion-status', 'not-active');
              });
            }

            item.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
          });
        });
      });
    })();

    // =========================
    // MODAL SYSTEM (keeps your close behavior; adds focus restore + resize var)
    // =========================
    (function () {
      var activeModal = null;
      var lastFocus = null;

      // ✅ FIX: force all modals closed on page load
      document.documentElement.removeAttribute('data-modal-open');
      document.querySelectorAll('[data-modal-group-status]').forEach(function (g) {
        g.setAttribute('data-modal-group-status', 'non-active');
      });
      document.querySelectorAll('[data-modal-status]').forEach(function (m) {
        m.setAttribute('data-modal-status', 'non-active');
      });

      function setScrollbarWidthVar() {
        var w = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', w + 'px');
      }
      setScrollbarWidthVar();
      window.addEventListener('resize', setScrollbarWidthVar, { passive: true });

      function getFirstFocusable(root) {
        return root.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
      }

      function openModal(name, openerEl) {
        var wrapper = document.querySelector('[data-modal-name="' + name + '"]');
        if (!wrapper) return;

        var group = wrapper.closest('[data-modal-group-status]');
        if (!group) return;

        if (activeModal) closeModal();

        lastFocus = openerEl || document.activeElement;

        group.setAttribute('data-modal-group-status', 'active');
        wrapper.setAttribute('data-modal-status', 'active');

        // A11y basics (won't break your CSS)
        if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'dialog');
        wrapper.setAttribute('aria-modal', 'true');

        activeModal = { group: group, wrapper: wrapper };
        document.documentElement.setAttribute('data-modal-open', '');

        var focusable = getFirstFocusable(wrapper);
        if (focusable) focusable.focus();
      }

      function closeModal() {
        if (!activeModal) return;

        activeModal.group.setAttribute('data-modal-group-status', 'non-active');
        activeModal.wrapper.setAttribute('data-modal-status', 'non-active');
        document.documentElement.removeAttribute('data-modal-open');

        var restore = lastFocus;
        activeModal = null;
        lastFocus = null;

        if (restore && restore.focus) restore.focus();
      }

      // Open
      document.querySelectorAll('[data-modal-target]').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
          var target = trigger.getAttribute('data-modal-target');
          if (!target) return;
          e.preventDefault();
          openModal(target, trigger);
        });
      });

      // Close (as you had it)
      document.querySelectorAll('[data-modal-close]').forEach(function (closer) {
        closer.addEventListener('click', function (e) {
          e.preventDefault();
          closeModal();
        });
      });

      // Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeModal) closeModal();
      });
    })();

    // =========================
    // CURRENT YEAR
    // =========================
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    // =========================
    // FINSWEET LAZY LOADER + FILTER SCROLL (no forced 3s load)
    // =========================
    (function () {
      var fsList = document.querySelector('[fs-list-element="list"]');
      if (!fsList) return;

      var filters = document.querySelector('[data-filters]');
      var results = document.querySelector('[data-results]') || fsList;

      var loaded = false;
      var userTriggered = false;
      var SCROLL_OFFSET = 16;

      var triggerElement = filters || fsList;
      var io = null;

      function loadFinsweet() {
        if (loaded) return;
        loaded = true;

        var script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js';
        script.setAttribute('fs-list', '');
        document.body.appendChild(script);

        if (io) io.disconnect();
        window.removeEventListener('scroll', onScrollCheck);
      }

      if (filters) {
        filters.addEventListener(
          'click',
          function (e) {
            if (e.target && e.target.closest && e.target.closest('input, select, button, [role="button"], a')) {
              userTriggered = true;
              loadFinsweet();
            }
          },
          true
        );

        filters.addEventListener(
          'change',
          function () {
            userTriggered = true;
            loadFinsweet();
          },
          true
        );
      }

      new MutationObserver(function () {
        if (!userTriggered) return;
        userTriggered = false;

        requestAnimationFrame(function () {
          var target = results.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
          var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(Math.max(0, target), maxScroll), behavior: 'smooth' });
        });
      }).observe(results, { childList: true });

      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(
          function (entries) {
            if (entries[0] && entries[0].isIntersecting) loadFinsweet();
          },
          { rootMargin: '300px' }
        );
        io.observe(triggerElement);
      }

      function onScrollCheck() {
        var rect = triggerElement.getBoundingClientRect();
        if (rect.top < window.innerHeight + 500) loadFinsweet();
      }
      window.addEventListener('scroll', onScrollCheck, { passive: true });
    })();

    // =========================
    // SOCIAL SHARE (clipboard safe)
    // =========================
    (function () {
      document.querySelectorAll('[data-social-share]').forEach(function (root) {
        if (root._socialShareBound) return;
        root._socialShareBound = true;

        root.addEventListener('click', function (e) {
          var btn = e.target && e.target.closest ? e.target.closest('[data-social-share-type]') : null;
          if (!btn) return;

          e.preventDefault();

          var link = root.getAttribute('data-social-share-link') || location.href;
          var title = root.getAttribute('data-social-share-title') || document.title;

          var type = btn.getAttribute('data-social-share-type');
          var u = encodeURIComponent(link);
          var t = encodeURIComponent(title);

          var map = {
            x: 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u,
            linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
            reddit: 'https://www.reddit.com/submit?url=' + u + '&title=' + t,
            telegram: 'https://t.me/share/url?url=' + u + '&text=' + t,
            whatsapp: 'https://api.whatsapp.com/send?text=' + t + '%20' + u,
            mail: 'mailto:?subject=' + t + '&body=' + t + '%0A%0A' + u,
            facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
            pinterest: 'https://www.pinterest.com/pin/create/button/?url=' + u + '&description=' + t
          };

          if (type === 'clipboard') {
            if (!navigator.clipboard || !navigator.clipboard.writeText) return;
            navigator.clipboard
              .writeText(link)
              .then(function () {
                btn.setAttribute('data-social-share-success', '');
                setTimeout(function () {
                  btn.removeAttribute('data-social-share-success');
                }, 2000);
              })
              .catch(function () {});
            return;
          }

          var url = map[type];
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
      });
    })();

    // =========================
    // BACK BUTTON
    // =========================
    document.querySelectorAll('[data-back]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        history.back();
      });
    });

    // =========================
    // PROGRESS NAVIGATION (cached + resize refresh)
    // =========================
    (function () {
      var navProgress = document.querySelector('[data-progress-nav-list]');
      if (!navProgress) return;

      function whenGsapReady(cb) {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') return cb();

        var tries = 0;
        var t = setInterval(function () {
          tries++;
          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            clearInterval(t);
            cb();
          }
          if (tries > 50) clearInterval(t);
        }, 100);
      }

      whenGsapReady(function () {
        gsap.registerPlugin(ScrollTrigger);

        var indicator = navProgress.querySelector('.progress-nav__indicator');
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'progress-nav__indicator';
          navProgress.appendChild(indicator);
        }

        var links = Array.prototype.slice.call(navProgress.querySelectorAll('[data-progress-nav-target]'));
        var activeLink = null;

        function updateIndicator() {
          if (!activeLink) return;

          var parentRect = navProgress.getBoundingClientRect();
          var linkRect = activeLink.getBoundingClientRect();

          var parentWidth = navProgress.offsetWidth || 1;
          var parentHeight = navProgress.offsetHeight || 1;

          indicator.style.left = ((linkRect.left - parentRect.left) / parentWidth) * 100 + '%';
          indicator.style.top = ((linkRect.top - parentRect.top) / parentHeight) * 100 + '%';
          indicator.style.width = (activeLink.offsetWidth / parentWidth) * 100 + '%';
          indicator.style.height = (activeLink.offsetHeight / parentHeight) * 100 + '%';
        }

        function activateLink(anchorID) {
          var next = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
          if (!next) return;

          activeLink = next;
          links.forEach(function (l) {
            l.classList.toggle('is--active', l === next);
          });
          updateIndicator();
        }

        gsap.utils.toArray('[data-progress-nav-anchor]').forEach(function (anchor) {
          var anchorID = anchor.getAttribute('id');
          if (!anchorID) return;

          ScrollTrigger.create({
            trigger: anchor,
            start: '0% 50%',
            end: '100% 50%',
            onEnter: function () {
              activateLink(anchorID);
            },
            onEnterBack: function () {
              activateLink(anchorID);
            }
          });
        });

        window.addEventListener('resize', function () {
          requestAnimationFrame(updateIndicator);
        });
      });
    })();

    // =========================
    // CSS ANIMATIONS (data-animate) + reduced-motion
    // =========================
    (function () {
      var elements = document.querySelectorAll('[data-animate]');
      if (!elements.length) return;

      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        elements.forEach(function (el) {
          el.classList.add('is-inview');
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        elements.forEach(function (el) {
          el.classList.add('is-inview');
        });
        return;
      }

      var preObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('will-animate');
          });
        },
        { rootMargin: '200px' }
      );

      var inviewObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-inview');
            } else {
              entry.target.classList.remove('is-inview');
              entry.target.classList.remove('will-animate');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
      );

      elements.forEach(function (el) {
        preObserver.observe(el);
        inviewObserver.observe(el);
      });
    })();

    // =========================
    // FORM ENHANCANCEMENT (textarea autosize)
    // =========================
    document.querySelectorAll('textarea').forEach(function (textarea) {
      function resize() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
      textarea.addEventListener('input', resize, { passive: true });
      resize();
    });

    // =========================
    // SMOOTH SCROLL (safer)
    // =========================
    (function () {
      var NAV_OFFSET = 80; // adjust if needed

      document.addEventListener(
        'click',
        function (e) {
          var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
          if (!a) return;

          var href = a.getAttribute('href');
          if (!href || href === '#' || href === '#main') return;

          // avoid stealing clicks from UI triggers/components
          if (a.hasAttribute('data-modal-target') || a.closest('[data-modal-target]')) return;
          if (a.classList.contains('w-tab-link') || a.closest('.w-tab-menu')) return;

          var target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          var y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        },
        true
      );
    })();
  }
})();

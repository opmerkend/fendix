/**
 * FENDIX.JS
 * Final comit for Fendix website
 */


(function() {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // =========================
    // NAVBAR STATE
    // =========================
    // Core navbar logic is in head.html for immediate response

    // =========================
    // ACCORDION CSS
    // =========================
    (function() {
      document.querySelectorAll('[data-accordion-css-init]').forEach(function(accordion) {
        var closeSiblings = accordion.hasAttribute('data-accordion-close-siblings');

        accordion.querySelectorAll('[data-accordion-toggle]').forEach(function(toggle) {
          toggle.addEventListener('click', function(e) {
            e.preventDefault();
            var item = toggle.closest('.accordion-css__item, .home-tabs_item');
            if (!item) return;

            var isActive = item.getAttribute('data-accordion-status') === 'active';

            if (closeSiblings) {
              accordion.querySelectorAll('.accordion-css__item, .home-tabs_item').forEach(function(sibling) {
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

      document.querySelectorAll('[data-modal-target]').forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
          var target = trigger.getAttribute('data-modal-target');
          if (target) {
            e.preventDefault();
            openModal(target);
          }
        });
      });

      document.querySelectorAll('[data-modal-close]').forEach(function(closer) {
        closer.addEventListener('click', function(e) {
          e.preventDefault();
          closeModal();
        });
      });

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
    // FINSWEET LAZY LOADER + FILTER SCROLL
    // =========================
    (function() {
      var filters = document.querySelector('[data-filters]');
      var results = document.querySelector('[data-results]');
      if (!filters || !results) return;

      var loaded = false;
      var SCROLL_OFFSET = 16;
      var observer = null;

      function loadFinsweet() {
        if (loaded) return;
        loaded = true;

        var script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js';
        script.setAttribute('fs-list', '');
        document.body.appendChild(script);

        if (observer) observer.disconnect();
        window.removeEventListener('scroll', checkScroll);
      }

      var userTriggered = false;

      filters.addEventListener('click', function(e) {
        if (e.target.closest('input, select, button, [role="button"], a')) {
          userTriggered = true;
          loadFinsweet();
        }
      }, true);

      filters.addEventListener('change', function() {
        userTriggered = true;
        loadFinsweet();
      }, true);

      new MutationObserver(function() {
        if (!userTriggered) return;
        userTriggered = false;
        requestAnimationFrame(function() {
          var target = results.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
          var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(Math.max(0, target), maxScroll), behavior: 'smooth' });
        });
      }).observe(results, { childList: true });

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) loadFinsweet();
        }, { rootMargin: '300px' });
        observer.observe(filters);
      }

      function checkScroll() {
        var rect = filters.getBoundingClientRect();
        if (rect.top < window.innerHeight + 500) loadFinsweet();
      }
      window.addEventListener('scroll', checkScroll, { passive: true });

      setTimeout(loadFinsweet, 3000);
    })();

    // =========================
    // SOCIAL SHARE
    // =========================
    (function() {
      document.querySelectorAll('[data-social-share]').forEach(function(root) {
        if (root._socialShareBound) return;
        root._socialShareBound = true;

        var link = root.getAttribute('data-social-share-link') || location.href;
        var title = root.getAttribute('data-social-share-title') || document.title;

        root.addEventListener('click', function(e) {
          var btn = e.target.closest('[data-social-share-type]');
          if (!btn) return;
          e.preventDefault();

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
            navigator.clipboard.writeText(link).then(function() {
              btn.setAttribute('data-social-share-success', '');
              setTimeout(function() {
                btn.removeAttribute('data-social-share-success');
              }, 2000);
            });
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
    document.querySelectorAll('[data-back]').forEach(function(el) {
      el.addEventListener('click', function() {
        history.back();
      });
    });

    // =========================
    // PROGRESS NAVIGATION
    // =========================
    (function() {
      var navProgress = document.querySelector('[data-progress-nav-list]');
      if (!navProgress) return;
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        // Wait for GSAP
        var checkGsap = setInterval(function() {
          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            clearInterval(checkGsap);
            initProgressNav();
          }
        }, 100);
        setTimeout(function() { clearInterval(checkGsap); }, 5000);
        return;
      }
      initProgressNav();

      function initProgressNav() {
        gsap.registerPlugin(ScrollTrigger);

        var indicator = navProgress.querySelector('.progress-nav__indicator');
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'progress-nav__indicator';
          navProgress.appendChild(indicator);
        }

        function updateIndicator(activeLink) {
          var parentWidth = navProgress.offsetWidth;
          var parentHeight = navProgress.offsetHeight;
          var parentRect = navProgress.getBoundingClientRect();
          var linkRect = activeLink.getBoundingClientRect();
          
          var linkPos = {
            left: linkRect.left - parentRect.left,
            top: linkRect.top - parentRect.top
          };
          
          var linkWidth = activeLink.offsetWidth;
          var linkHeight = activeLink.offsetHeight;
          
          var leftPercent = (linkPos.left / parentWidth) * 100;
          var topPercent = (linkPos.top / parentHeight) * 100;
          var widthPercent = (linkWidth / parentWidth) * 100;
          var heightPercent = (linkHeight / parentHeight) * 100;
          
          indicator.style.left = leftPercent + '%';
          indicator.style.top = topPercent + '%';
          indicator.style.width = widthPercent + '%';
          indicator.style.height = heightPercent + '%';
        }

        var progressAnchors = gsap.utils.toArray('[data-progress-nav-anchor]');

        progressAnchors.forEach(function(progressAnchor) {
          var anchorID = progressAnchor.getAttribute('id');
          
          ScrollTrigger.create({
            trigger: progressAnchor,
            start: '0% 50%',
            end: '100% 50%',
            onEnter: function() { activateLink(anchorID); },
            onEnterBack: function() { activateLink(anchorID); }
          });
        });

        function activateLink(anchorID) {
          var activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
          if (!activeLink) return;
          
          activeLink.classList.add('is--active');
          var siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
          siblings.forEach(function(sib) {
            if (sib !== activeLink) sib.classList.remove('is--active');
          });
          updateIndicator(activeLink);
        }
      }
    })();

    // =========================
    // CSS ANIMATIONS (data-animate)
    // =========================
    (function() {
      var elements = document.querySelectorAll('[data-animate]');
      if (!elements.length) return;

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
          } else {
            entry.target.classList.remove('is-inview');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      });

      elements.forEach(function(el) {
        observer.observe(el);
      });
    })();

    // =========================
    // FORM ENHANCEMENT
    // =========================
    document.querySelectorAll('textarea').forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    });

    // =========================
    // SMOOTH SCROLL
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

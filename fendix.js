/**
 * FENDIX.JS v1.10.0 — marquee + Finsweet-loader + menu-warmup + team-lijst module */
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
    // FINSWEET ATTRIBUTES v2 — centrale loader (list lazy, toc/inject direct)
    // =========================
    (function () {
      // Eén centrale Finsweet-loader (v1.9.0): detecteert welke modules de pagina nodig heeft.
      // - toc/inject (artikelpagina's): direct laden, bepalen de weergave
      // - list/filters: lazy laden zodra de lijst in beeld komt of een filter wordt aangeraakt
      var listEl = document.querySelector('[fs-list-element]');
      var tocEl = document.querySelector('[fs-toc-element]');
      var injectEl = document.querySelector('[fs-inject], [fs-inject-element]');
      if (!listEl && !tocEl && !injectEl) return;

      var fsList = document.querySelector('[fs-list-element="list"]') || listEl;
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
        if (listEl) script.setAttribute('fs-list', '');
        if (tocEl) script.setAttribute('fs-toc', '');
        if (injectEl) script.setAttribute('fs-inject', '');
        document.body.appendChild(script);

        if (io) io.disconnect();
        window.removeEventListener('scroll', onScrollCheck);
      }

      if (tocEl || injectEl) loadFinsweet();
      if (!listEl) return;

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

      if (!loaded && 'IntersectionObserver' in window) {
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
      if (!loaded) window.addEventListener('scroll', onScrollCheck, { passive: true });
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

    // =========================
    // DRAGGABLE MARQUEE (v1.8.0 — verhuisd uit Webflow footer-embed "code-js-marquee")
    // Vereist gsap + ScrollTrigger (+ ingebouwde Observer); loader staat in de site-footer
    // =========================
    (function () {

  const SELECTOR = "[data-draggable-marquee-init]";

  const num = (el, name, fallback) => {
    const v = parseFloat(el.getAttribute(name));
    return Number.isFinite(v) ? v : fallback;
  };

  const bool = (el, name, fallback = false) => {
    const raw = (el.getAttribute(name) || "").toLowerCase().trim();
    if (raw === "true") return true;
    if (raw === "false") return false;
    return fallback;
  };

  const canUseGsap = () =>
    window.gsap && window.ScrollTrigger && window.Observer;

  const setup = (wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return true;
    if (!canUseGsap()) return false;

    const collection = wrapper.querySelector("[data-draggable-marquee-collection]");
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return false;

    const duration = num(wrapper, "data-duration", 20);
    const multiplier = num(wrapper, "data-multiplier", 40);
    const sensitivity = num(wrapper, "data-sensitivity", 0.01);
    const pauseView = bool(wrapper, "data-pauseview", true);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return false;

    const minRequiredWidth = wrapperWidth + listWidth + 2;
    let guard = 0;

    while (collection.scrollWidth < minRequiredWidth && guard < 50) {
      const clone = list.cloneNode(true);
      clone.setAttribute("data-draggable-marquee-clone", "");
      clone.setAttribute("aria-hidden", "true");
      collection.appendChild(clone);
      guard++;
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);
    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px"
      }
    });

    const initialDirection =
      (wrapper.getAttribute("data-direction") || "left").toLowerCase() === "right"
        ? -1
        : 1;

    const timeScale = { value: initialDirection };
    if (initialDirection < 0) marqueeLoop.progress(1);

    const applyTimeScale = () => {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute("data-direction", timeScale.value < 0 ? "right" : "left");
    };

    applyTimeScale();

    const observer = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (ev) => {
        let v = ev.velocityX * -sensitivity;
        v = gsap.utils.clamp(-multiplier, multiplier, v);

        gsap.killTweensOf(timeScale);

        const rest = v < 0 ? -1 : 1;

        gsap.timeline({ onUpdate: applyTimeScale })
          .to(timeScale, { value: v, duration: 0.1, overwrite: true })
          .to(timeScale, { value: rest, duration: 1.0 });
      }
    });

    if (pauseView) {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => { marqueeLoop.resume(); observer.enable(); },
        onEnterBack: () => { marqueeLoop.resume(); observer.enable(); },
        onLeave: () => { marqueeLoop.pause(); observer.disable(); },
        onLeaveBack: () => { marqueeLoop.pause(); observer.disable(); }
      });
    } else {
      marqueeLoop.resume();
      observer.enable();
    }

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
    return true;
  };

  const initDraggableMarquee = () => {
    document.querySelectorAll(SELECTOR).forEach((wrapper) => {
      if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return;

      let tries = 0;
      const tryInit = () => {
        if (setup(wrapper)) return;
        tries++;
        if (tries > 12) return;
        requestAnimationFrame(tryInit);
      };

      const io = new IntersectionObserver((entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        tryInit();
      });

      io.observe(wrapper);
    });
  };

  if (window.gsap && window.ScrollTrigger && window.Observer) {
    try { gsap.registerPlugin(ScrollTrigger, Observer); } catch (e) {}
  }
  initDraggableMarquee();

  window.addEventListener("load", initDraggableMarquee);
  window.addEventListener("resize", () => requestAnimationFrame(initDraggableMarquee));

  window.initDraggableMarquee = initDraggableMarquee;
    })();

    // =========================
    // MENU-WARMUP (v1.9.0 — voorheen los footer-snippet)
    // Laadt en decodeert menu-afbeeldingen tijdens browser-idle,
    // zodat het openen van het menu geen laad/decode-burst krijgt
    // =========================
    (function () {
      function warm() {
        document.querySelectorAll('.navbar_menu img').forEach(function (img) {
          try {
            img.decoding = 'async';
            img.loading = 'eager';
            if (img.decode) img.decode().catch(function () {});
          } catch (e) {}
        });
      }
      if ('requestIdleCallback' in window) {
        requestIdleCallback(warm, { timeout: 4000 });
      } else {
        setTimeout(warm, 2500);
      }
    })();

    // =========================
    // TEAM-LIJST (v1.10.0 — voorheen page-code op /team)
    // Statisch item op vaste positie in de Finsweet-lijst + modal-gradients
    // Draait alleen als beide markers bestaan
    // =========================
    (function () {
      var list = document.querySelector('[fs-list-element="list"]');
      var staticItem = document.querySelector('[fs-list-element="item"]');
      if (!list || !staticItem) return;

      var position = parseInt(staticItem.getAttribute('fs-list-position'), 10) || 7;
      var items = list.children;

      if (position <= items.length) {
        list.insertBefore(staticItem, items[position - 1]);
      } else {
        list.appendChild(staticItem);
      }

      var gradients = [
        { start: '--_effects---brand-gradients--proactive-purple-start', end: '--_effects---brand-gradients--proactive-purple-end' },
        { start: '--_effects---brand-gradients--dark-purple-start', end: '--_effects---brand-gradients--dark-purple-end' },
        { start: '--_effects---brand-gradients--future-cyan-start', end: '--_effects---brand-gradients--future-cyan-end' },
        { start: '--_effects---brand-gradients--nextgen-blue-start', end: '--_effects---brand-gradients--nextgen-blue-end' },
        { start: '--_effects---brand-gradients--gen-c-green-start', end: '--_effects---brand-gradients--gen-c-green-end' }
      ];

      var modals = document.querySelectorAll('.c-list_wrapper .modal-wrapper');
      if (!modals.length) return;

      var skipPosition = position - 1;
      modals.forEach(function (modal, index) {
        var colorIndex = index >= skipPosition ? index + 1 : index;
        var grad = gradients[colorIndex % 5];
        var teamImage = modal.querySelector('.team-image_modal');
        if (teamImage) {
          teamImage.style.backgroundImage = 'linear-gradient(180deg, var(' + grad.start + '), var(' + grad.end + '))';
        }
      });
    })();
  }
})();

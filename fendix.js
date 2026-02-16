
<!-- Interactions -->
<script>
(function() {
  'use strict';

  var init = function() {
    
    // === SCROLL ANIMATION FALLBACK (Firefox) ===
    if (!CSS.supports('animation-timeline: view()')) {
      document.documentElement.classList.add('no-css-scroll-timeline');
      
      var targets = document.querySelectorAll('[data-css-scroll]');
      if (targets.length) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            var el = entry.target;
            var threshold = parseFloat(el.dataset.cssScrollThreshold || '50') / 100;
            var mode = el.dataset.cssScroll || '';
            
            if (!el._init) {
              el._init = true;
              el._triggered = entry.intersectionRatio >= threshold;
              if (!el._triggered) el.classList.add('animation-ready');
              return;
            }

            if (entry.intersectionRatio >= threshold && !el._triggered) {
              el._triggered = true;
              el.classList.remove('animation-ready');
              if (mode === 'retrigger-none') observer.unobserve(el);
            } else if (!entry.isIntersecting && mode !== 'retrigger-none') {
              var exitedTop = entry.boundingClientRect.bottom < 0;
              if (mode === 'retrigger-both' || !exitedTop) {
                el._triggered = false;
                el.classList.add('animation-ready');
              }
            }
          });
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

        targets.forEach(function(el) { observer.observe(el); });
      }
    }

    // === ACCORDION ===
    document.querySelectorAll('[data-accordion-css-init]').forEach(function(accordion) {
      if (accordion._init) return;
      accordion._init = true;
      
      var closeSiblings = accordion.dataset.accordionCloseSiblings === 'true';
      
      accordion.addEventListener('click', function(e) {
        var toggle = e.target.closest('[data-accordion-toggle]');
        if (!toggle) return;

        var item = toggle.closest('[data-accordion-status]');
        if (!item) return;

        var isActive = item.dataset.accordionStatus === 'active';
        item.dataset.accordionStatus = isActive ? 'not-active' : 'active';

        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach(function(sibling) {
            if (sibling !== item) sibling.dataset.accordionStatus = 'not-active';
          });
        }
      });
    });

    // === MODAL ===
    var modals = document.querySelectorAll('[data-modal-name]');
    
    if (modals.length) {
      var body = document.body;
      
      var closeAll = function() {
        modals.forEach(function(m) { m.dataset.modalStatus = 'not-active'; });
        document.querySelectorAll('[data-modal-group-status]').forEach(function(g) {
          g.dataset.modalGroupStatus = 'not-active';
        });
        body.style.overflow = '';
        body.classList.remove('modal-locked');
      };

      document.addEventListener('click', function(e) {
        var trigger = e.target.closest('[data-modal-target]');
        if (trigger) {
          var name = trigger.dataset.modalTarget;
          if (!name || !name.trim()) return;

          var modal = document.querySelector('[data-modal-name="' + CSS.escape(name.trim()) + '"]');
          if (!modal) return;

          e.preventDefault();
          closeAll();

          modal.dataset.modalStatus = 'active';

          var wrapper = modal.closest('[data-modal-group-status]');
          if (wrapper) wrapper.dataset.modalGroupStatus = 'active';

          body.style.overflow = 'hidden';
          body.classList.add('modal-locked');
          return;
        }

        if (e.target.closest('[data-modal-close]')) {
          closeAll();
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.querySelector('[data-modal-name][data-modal-status="active"]')) {
          closeAll();
        }
      });
    }

    // === CURRENT YEAR ===
    var year = new Date().getFullYear().toString();
    document.querySelectorAll('[data-current-year]').forEach(function(el) {
      el.textContent = year;
    });

    // === GSAP MARQUEE ===
    if (typeof initDraggableMarquee === 'function') {
      try { initDraggableMarquee(); } catch (e) { console.error('Marquee error:', e); }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
</script>

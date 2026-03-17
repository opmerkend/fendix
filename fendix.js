/**
 * FENDIX.JS
 * Correct javaScript for Fendix website */

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
    // Gebruikt data-modal-open op <html> i.p.v. paddingRight op body
    // om CLS te voorkomen bij het openen van modals.
    // =========================
    (function() {
      var activeModal = null;
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');

      function openModal(name) {
        var wrapper = document.querySelector('[data-modal-name="' + name + '"]');
        if (!wrapper) return;

        var group = wrapper.closest('[data-modal-group-status]');
        if (group) {
          group.setAttribute('data-modal-group-status', 'active');
          wrapper.setAttribute('data-modal-status', 'active');
          activeModal = { group: group, wrapper: wrapper };
          document.documentElement.setAttribute('data-modal-open', '');
        }
      }

      function closeModal() {
        if (!activeModal) return;
        activeModal.group.setAttribute('data-modal-group-status', 'non-active');
        activeModal.wrapper.setAttribute('data-modal-status', 'non-active');
        activeModal = null;
        document.documentElement.removeAttribute('data-modal-open');
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
        if (e.key === 'Escape' && activeModal) closeModal();
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
      var fsList = document.querySelector('[fs-list-element="list"]');
      if (!fsList) return;

      var filters = document.querySelector('[data-filters]');
      var results = document.querySelector('[data-results]') || fsList;

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

      if (filters) {
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
      }

      new MutationObserver(function() {
        if (!userTriggered) return;
        userTriggered = false;
        requestAnimationFrame(function() {
          var target = results.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
          var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(Math.max(0, target), maxScroll), beh

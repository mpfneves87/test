/* =============================================================================
   The Tony Lubbe Group — interactions
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqDesktop = window.matchMedia('(min-width: 1081px)');

  /* ── Header ─────────────────────────────────────────────────────────────── */
  var header = document.getElementById('header');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mega menus ─────────────────────────────────────────────────────────── */
  var scrim = document.getElementById('navScrim');
  var menuItems = [].slice.call(document.querySelectorAll('.nav__item.has-menu'));

  function closeMenus(except) {
    menuItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      item.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
      item.querySelector('.megamenu').hidden = true;
    });
    if (!except) scrim.hidden = true;
  }

  function openMenu(item) {
    closeMenus(item);
    item.classList.add('is-open');
    item.querySelector('.nav__link').setAttribute('aria-expanded', 'true');
    item.querySelector('.megamenu').hidden = false;
    if (mqDesktop.matches) scrim.hidden = false;
  }

  menuItems.forEach(function (item) {
    var trigger = item.querySelector('.nav__link');

    trigger.addEventListener('click', function () {
      if (item.classList.contains('is-open')) closeMenus();
      else openMenu(item);
    });

    // Hover intent, desktop only.
    var timer;
    item.addEventListener('mouseenter', function () {
      if (!mqDesktop.matches) return;
      clearTimeout(timer);
      openMenu(item);
    });
    item.addEventListener('mouseleave', function () {
      if (!mqDesktop.matches) return;
      timer = setTimeout(closeMenus, 180);
    });
  });

  scrim.addEventListener('click', function () { closeMenus(); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus();
    if (document.body.classList.contains('nav-open')) toggleNav(false);
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item.has-menu') && mqDesktop.matches) closeMenus();
  });

  /* ── Mobile nav ─────────────────────────────────────────────────────────── */
  var burger = document.getElementById('burger');

  function toggleNav(open) {
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) closeMenus();
  }

  burger.addEventListener('click', function () {
    toggleNav(!document.body.classList.contains('nav-open'));
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open')) toggleNav(false);
      closeMenus();
    });
  });

  var onBreakpoint = function () { toggleNav(false); closeMenus(); };
  if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onBreakpoint);
  else mqDesktop.addListener(onBreakpoint);

  /* ── Reveal on scroll ───────────────────────────────────────────────────── */
  var revealables = [].slice.call(document.querySelectorAll('.reveal'));

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = [].slice.call(entry.target.parentElement.children)
          .filter(function (n) { return n.classList.contains('reveal'); });
        entry.target.style.transitionDelay = Math.min(siblings.indexOf(entry.target), 5) * 80 + 'ms';
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    revealables.forEach(function (el) { observer.observe(el); });

    // Safety net: content must never be permanently invisible if the observer
    // never fires (background tab on load, printing, odd embedding contexts).
    setTimeout(function () {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    }, 2500);
  }

  /* ── Enquiry form (homepage only) ───────────────────────────────────────── */
  var form = document.getElementById('enquiry');
  var status = document.getElementById('formStatus');

  if (!form || !status) return finish();

  var MESSAGES = {
    first:   'Please enter your first name.',
    last:    'Please enter your last name.',
    email:   'Please enter a valid email address.',
    service: 'Please choose an area of enquiry.',
    message: 'Please tell us how we can help.',
    consent: 'Please confirm you consent to us processing your information.'
  };

  function setError(control, message) {
    var field = control.closest('.field');
    var slot = field.querySelector('[data-error-for="' + control.id + '"]');
    field.classList.toggle('is-invalid', Boolean(message));
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message || '';
  }

  function validate(control) {
    var ok = control.type === 'checkbox' ? control.checked : control.checkValidity();
    setError(control, ok ? '' : (MESSAGES[control.id] || 'This field is required.'));
    return ok;
  }

  var controls = [].slice.call(form.querySelectorAll('[required]'));

  controls.forEach(function (control) {
    control.addEventListener('blur', function () { validate(control); });
    control.addEventListener('input', function () {
      if (control.closest('.field').classList.contains('is-invalid')) validate(control);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';

    var invalid = controls.filter(function (c) { return !validate(c); });

    if (invalid.length) {
      status.textContent = 'Please correct the highlighted fields and try again.';
      status.classList.add('is-err');
      invalid[0].focus();
      return;
    }

    // No backend is wired up yet — see README for where to POST this.
    status.textContent = 'Thank you. Your enquiry has been received and an advisor will respond shortly.';
    status.classList.add('is-ok');
    form.reset();
  });

  finish();

  /* ── Footer year ────────────────────────────────────────────────────────── */
  function finish() {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }
})();

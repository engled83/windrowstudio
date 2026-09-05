/* Navigation enhances the HTML; links remain available if this script fails. */
(() => {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector('.ws-header');
  const toggle = document.querySelector('.ws-menu-toggle');
  const navigation = document.getElementById('ws-navigation');
  if (header && toggle && navigation) {
    const mobile = window.matchMedia('(max-width: 48rem)');
    const setOpen = (open, returnFocus = false) => {
      navigation.hidden = mobile.matches && !open;
      toggle.setAttribute('aria-expanded', String(mobile.matches && open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      if (returnFocus && mobile.matches) toggle.focus();
    };
    const syncViewport = () => {
      toggle.hidden = !mobile.matches;
      setOpen(false);
    };
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) setOpen(false);
    });
    header.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
    });
    mobile.addEventListener('change', syncViewport);
    syncViewport();
  }

  // Existing externally hosted episode artwork has a local branding fallback.
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    const fallback = () => {
      if (img.hasAttribute('data-fallback-active')) return;
      img.setAttribute('data-fallback-active', '');
      img.src = img.dataset.fallback;
      img.alt = 'Look Who It Is! podcast logo';
    };
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });
})();

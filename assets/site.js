(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var root = document.documentElement;

  function sync() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#15171E' : '#FBF8F2');
    try { localStorage.setItem('site-theme', next); } catch (e) {}
    sync();
  });

  sync();
})();

/* Smooth in-page navigation via scrollIntoView — CSS scroll-behavior:smooth
   breaks fragment navigation entirely in some Chrome versions. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', link.getAttribute('href'));
    if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  });
})();

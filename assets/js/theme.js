(function () {
  var d = document, root = d.documentElement;
  // Theme: system / light / dark, remembered across visits.
  var form = d.querySelector('.theme'), metas = d.querySelectorAll('meta[name="theme-color"]');
  function apply(v) {
    if (v === 'system') delete root.dataset.theme; else root.dataset.theme = v;
    metas.forEach(function (m, k) { m.content = v === 'system' ? ['#f4f2eb', '#121511'][k] : (v === 'dark' ? '#121511' : '#f4f2eb'); });
  }
  form.hidden = false;
  var saved = root.dataset.theme || 'system';
  form.querySelector('[value="' + saved + '"]').checked = true;
  apply(saved);
  form.addEventListener('change', function (e) {
    apply(e.target.value);
    try { if (e.target.value === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', e.target.value); } catch (_) {}
  });
})();

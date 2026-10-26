(function () {
  var d = document, root = d.documentElement;
  // Native dialog provides a modal backdrop and Escape-to-close.
  // Each thumbnail remains a direct image link when JavaScript is unavailable.
  var viewer = d.querySelector('.photo-viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var photos = [].slice.call(d.querySelectorAll('.photo-link'));
    var full = viewer.querySelector('.photo-full');
    var caption = viewer.querySelector('.photo-caption');
    var position = viewer.querySelector('.photo-position');
    var photoIndex = 0, photoOpener;
    function showPhoto(index) {
      photoIndex = (index + photos.length) % photos.length;
      var link = photos[photoIndex], thumb = link.querySelector('img');
      full.src = link.href;
      full.alt = thumb.alt;
      caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
      position.textContent = 'Photo ' + (photoIndex + 1) + ' of ' + photos.length;
    }
    photos.forEach(function (link, index) {
      link.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        photoOpener = link;
        showPhoto(index);
        viewer.showModal();
        root.classList.add('photo-open');
      });
    });
    viewer.querySelector('.photo-prev').addEventListener('click', function () { showPhoto(photoIndex - 1); });
    viewer.querySelector('.photo-next').addEventListener('click', function () { showPhoto(photoIndex + 1); });
    viewer.querySelector('.photo-close').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        var controls = viewer.querySelectorAll('.photo-controls button');
        var first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && d.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && d.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        showPhoto(photoIndex + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    viewer.addEventListener('click', function (e) {
      if (e.target !== viewer) return;
      var rect = viewer.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) viewer.close();
    });
    viewer.addEventListener('close', function () {
      root.classList.remove('photo-open');
      if (photoOpener) photoOpener.focus({ preventScroll: true });
    });
  }
})();

(function () {
  'use strict';

  // --- Config ---
  var BATCH_SIZE = 12;

  // --- State ---
  var allImages = [];
  var shuffled = [];
  var loadIndex = 0;
  var loading = false;
  var lightboxIndex = 0;
  var touchStartX = 0;
  var touchEndX = 0;

  // --- DOM ---
  var gallery = document.getElementById('gallery');
  var loader = document.getElementById('loader');
  var loadMoreBtn = document.getElementById('load-more');
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxCounter = document.getElementById('lightbox-counter');

  // --- Shuffle (Fisher-Yates) ---
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // --- Load manifest and boot ---
  function init() {
    fetch('images.json')
      .then(function (res) {
        if (!res.ok) throw new Error('No images.json found');
        return res.json();
      })
      .then(function (images) {
        allImages = images;
        shuffled = shuffle(allImages);
        loadIndex = 0;
        loadBatch();
      })
      .catch(function () {
        loader.hidden = true;
        gallery.innerHTML =
          '<p style="text-align:center;color:#555;padding:4rem;font-style:italic;">' +
          'No images found. Run the build script to generate the manifest.</p>';
      });
  }

  // --- Render a batch of images ---
  function loadBatch() {
    if (allImages.length === 0) {
      loader.hidden = true;
      loadMoreBtn.hidden = true;
      return;
    }

    loading = true;
    loader.hidden = false;
    loadMoreBtn.hidden = true;

    var fragment = document.createDocumentFragment();
    var loaded = 0;
    var batchCount = Math.min(BATCH_SIZE, shuffled.length - loadIndex);

    if (batchCount <= 0) {
      // All images shown — reshuffle for another round
      shuffled = shuffle(allImages);
      loadIndex = 0;
      batchCount = Math.min(BATCH_SIZE, shuffled.length);
    }

    for (var i = 0; i < batchCount; i++) {
      var src = shuffled[loadIndex];
      loadIndex++;

      var item = document.createElement('div');
      item.className = 'gallery-item' + (Math.random() < 0.15 ? ' featured' : '');
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'View image');

      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';

      (function (imgEl) {
        imgEl.addEventListener('load', function () {
          imgEl.classList.add('loaded');
          loaded++;
          if (loaded >= batchCount) {
            loading = false;
            loader.hidden = true;
            loadMoreBtn.hidden = false;
          }
        });
        imgEl.addEventListener('error', function () {
          imgEl.parentElement.style.display = 'none';
          loaded++;
          if (loaded >= batchCount) {
            loading = false;
            loader.hidden = true;
            loadMoreBtn.hidden = false;
          }
        });
      })(img);

      item.dataset.src = src;
      item.appendChild(img);
      fragment.appendChild(item);

      (function (source) {
        item.addEventListener('click', function () {
          openLightbox(source);
        });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(source);
          }
        });
      })(src);
    }

    gallery.appendChild(fragment);
  }

  // --- Load More button ---
  loadMoreBtn.addEventListener('click', function () {
    if (!loading) {
      loadBatch();
    }
  });

  // --- Lightbox ---
  function getAllSources() {
    var items = gallery.querySelectorAll('.gallery-item');
    var sources = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].querySelector('img.loaded')) {
        sources.push(items[i].dataset.src);
      }
    }
    return sources;
  }

  function openLightbox(src) {
    var sources = getAllSources();
    lightboxIndex = sources.indexOf(src);
    if (lightboxIndex === -1) lightboxIndex = 0;

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    void lightbox.offsetWidth;
    lightbox.classList.add('active');

    showLightboxImage(sources[lightboxIndex]);
    updateCounter(sources);
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImage.classList.remove('visible');
    setTimeout(function () {
      lightbox.hidden = true;
      lightboxImage.src = '';
    }, 300);
  }

  function showLightboxImage(src) {
    lightboxImage.classList.remove('visible');
    lightboxImage.src = src;
    lightboxImage.onload = function () {
      lightboxImage.classList.add('visible');
    };
  }

  function updateCounter(sources) {
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + sources.length;
  }

  function navigateLightbox(dir) {
    var sources = getAllSources();
    if (sources.length === 0) return;
    lightboxIndex = (lightboxIndex + dir + sources.length) % sources.length;
    showLightboxImage(sources[lightboxIndex]);
    updateCounter(sources);
  }

  // --- Event listeners ---
  lightboxClose.addEventListener('click', closeLightbox);

  lightboxPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    navigateLightbox(-1);
  });

  lightboxNext.addEventListener('click', function (e) {
    e.stopPropagation();
    navigateLightbox(1);
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-image-wrap')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox(-1);
        break;
      case 'ArrowRight':
        navigateLightbox(1);
        break;
    }
  });

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? 1 : -1);
    }
  }, { passive: true });

  // --- Boot ---
  init();
})();

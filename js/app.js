(function () {
  'use strict';

  // --- Config ---
  var BATCH_SIZE = 6;
  var SCROLL_THRESHOLD = 400;

  // --- State ---
  // Each entry: {thumb: "...", full: "..."} or a plain string (backwards compat)
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
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxCounter = document.getElementById('lightbox-counter');

  // --- Helpers ---
  function getThumb(entry) {
    return typeof entry === 'string' ? entry : entry.thumb;
  }

  function getFull(entry) {
    return typeof entry === 'string' ? entry : entry.full;
  }

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
        setupScroll();
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
      return;
    }

    loading = true;
    loader.hidden = false;

    var fragment = document.createDocumentFragment();
    var loaded = 0;
    var batchCount = Math.min(BATCH_SIZE, allImages.length);

    for (var i = 0; i < batchCount; i++) {
      // Wrap around when we run out of shuffled images
      if (loadIndex >= shuffled.length) {
        shuffled = shuffle(allImages);
        loadIndex = 0;
      }

      var entry = shuffled[loadIndex];
      loadIndex++;

      var thumbSrc = getThumb(entry);
      var fullSrc = getFull(entry);

      var item = document.createElement('div');
      item.className = 'gallery-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'View image');

      var img = document.createElement('img');
      img.src = thumbSrc;
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
          }
        });
        imgEl.addEventListener('error', function () {
          imgEl.parentElement.style.display = 'none';
          loaded++;
          if (loaded >= batchCount) {
            loading = false;
            loader.hidden = true;
          }
        });
      })(img);

      // Store the full-size source for lightbox
      item.dataset.full = fullSrc;
      item.appendChild(img);
      fragment.appendChild(item);

      // Click / keyboard open lightbox
      (function (full) {
        item.addEventListener('click', function () {
          openLightbox(full);
        });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(full);
          }
        });
      })(fullSrc);
    }

    gallery.appendChild(fragment);
  }

  // --- Infinite scroll ---
  function setupScroll() {
    window.addEventListener('scroll', function () {
      if (loading) return;
      var scrollBottom = window.innerHeight + window.scrollY;
      var docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom < SCROLL_THRESHOLD) {
        loadBatch();
      }
    }, { passive: true });
  }

  // --- Lightbox ---
  function getAllFullSources() {
    var items = gallery.querySelectorAll('.gallery-item');
    var sources = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].querySelector('img.loaded')) {
        sources.push(items[i].dataset.full);
      }
    }
    return sources;
  }

  function openLightbox(fullSrc) {
    var sources = getAllFullSources();
    lightboxIndex = sources.indexOf(fullSrc);
    if (lightboxIndex === -1) lightboxIndex = 0;

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    // Force reflow then animate
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
    var sources = getAllFullSources();
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

  // Click backdrop to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-image-wrap')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
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

  // Touch/swipe for mobile lightbox
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

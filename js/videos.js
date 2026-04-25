(function () {
  'use strict';

  var VIDEO_COUNT = 3;

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

  function init() {
    fetch('videos.json')
      .then(function (res) {
        if (!res.ok) throw new Error('No videos.json');
        return res.json();
      })
      .then(function (videos) {
        var picked = shuffle(videos).slice(0, VIDEO_COUNT);
        render(picked);
      })
      .catch(function () {
        document.getElementById('videos-section').hidden = true;
      });
  }

  function render(videos) {
    var grid = document.getElementById('video-grid');
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];

      var wrap = document.createElement('div');
      wrap.className = 'video-item';

      var ratio = document.createElement('div');
      ratio.className = 'video-ratio';

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + v.id + '?rel=0';
      iframe.title = v.title;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

      ratio.appendChild(iframe);
      wrap.appendChild(ratio);
      fragment.appendChild(wrap);
    }

    grid.appendChild(fragment);
  }

  init();
})();

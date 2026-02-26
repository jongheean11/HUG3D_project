(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initInlineAutoplayVideos = () => {
    const previews = [];

    document.querySelectorAll('.media-card[data-lb-type="video"]').forEach((card) => {
      const src = card.getAttribute('data-lb-src');
      if (!src) {
        return;
      }

      let preview = card.querySelector('video.media-card__preview');
      if (!preview) {
        preview = document.createElement('video');
        preview.className = 'media-card__preview';
        preview.setAttribute('aria-hidden', 'true');
        preview.setAttribute('playsinline', '');
        preview.setAttribute('muted', '');
        preview.setAttribute('loop', '');
        preview.preload = 'metadata';
        preview.src = src;

        const poster = card.getAttribute('data-lb-poster');
        if (poster) {
          preview.poster = poster;
        }

        const oldImage = card.querySelector('img');
        if (oldImage) {
          oldImage.replaceWith(preview);
        } else {
          card.prepend(preview);
        }
      }

      preview.defaultMuted = true;
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.controls = false;
      preview.autoplay = !prefersReducedMotion;
      previews.push(preview);
    });

    if (prefersReducedMotion || previews.length === 0) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) {
          return;
        }
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay may still be blocked in some environments.
          });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 });

    previews.forEach((video) => observer.observe(video));
  };

  initInlineAutoplayVideos();

  document.querySelectorAll('.chip--disabled').forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxCaption = document.getElementById('lightboxCaption');

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxImage || !lightboxVideo || !lightboxCaption) {
      return;
    }

    const type = trigger.getAttribute('data-lb-type');
    const src = trigger.getAttribute('data-lb-src');
    const poster = trigger.getAttribute('data-lb-poster') || '';
    const caption = trigger.getAttribute('data-lb-caption') || '';

    if (!src) {
      return;
    }

    lightboxCaption.textContent = caption;

    if (type === 'video') {
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute('src');
      lightboxImage.style.display = 'none';

      lightboxVideo.hidden = false;
      lightboxVideo.style.display = 'block';
      lightboxVideo.setAttribute('src', src || '');
      if (poster) {
        lightboxVideo.setAttribute('poster', poster);
      } else {
        lightboxVideo.removeAttribute('poster');
      }
      lightboxVideo.play().catch(() => {
        // Autoplay can be blocked by browser policy.
      });
    } else {
      lightboxVideo.pause();
      lightboxVideo.hidden = true;
      lightboxVideo.removeAttribute('src');
      lightboxVideo.removeAttribute('poster');
      lightboxVideo.style.display = 'none';

      lightboxImage.hidden = false;
      lightboxImage.style.display = 'block';
      lightboxImage.setAttribute('src', src);
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage || !lightboxVideo) {
      return;
    }

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');

    lightboxImage.removeAttribute('src');
    lightboxImage.hidden = true;
    lightboxImage.style.display = 'none';

    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.removeAttribute('poster');
    lightboxVideo.hidden = true;
    lightboxVideo.style.display = 'none';

    document.body.style.overflow = '';
  };

  document.querySelectorAll('.js-lightbox').forEach((node) => {
    if (node.getAttribute('data-lb-type') !== 'video') {
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
    }
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.js-lightbox');
    if (!trigger) {
      return;
    }
    if (trigger.getAttribute('data-lb-type') === 'video') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openLightbox(trigger);
  });

  document.addEventListener('keydown', (event) => {
    const trigger = event.target.closest('.js-lightbox');
    if (!trigger) {
      return;
    }
    if (trigger.getAttribute('data-lb-type') === 'video') {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(trigger);
    }
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
})();

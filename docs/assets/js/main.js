(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initInlineAutoplayVideos = () => {
    const cards = Array.from(document.querySelectorAll('.media-card[data-lb-type="video"]'));
    if (cards.length === 0) {
      return;
    }

    const shouldAutoplay = !prefersReducedMotion;
    const hydratePreview = (card, preview) => {
      if (!(preview instanceof HTMLVideoElement)) {
        return;
      }
      if (preview.dataset.loaded === 'true') {
        return;
      }
      const src = preview.dataset.src;
      if (!src) {
        return;
      }
      preview.src = src;
      preview.dataset.loaded = 'true';
      preview.load();
      card.classList.remove('is-video-ready');
    };

    cards.forEach((card) => {
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
        preview.setAttribute('webkit-playsinline', '');
        preview.setAttribute('muted', '');
        preview.setAttribute('loop', '');
        preview.preload = 'metadata';

        const poster = card.getAttribute('data-lb-poster');
        if (poster) {
          preview.poster = poster;
        }

        card.append(preview);
      }

      preview.dataset.src = src;
      if (preview.getAttribute('src')) {
        preview.dataset.loaded = 'true';
      }

      preview.defaultMuted = true;
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.controls = false;
      preview.autoplay = false;
      preview.disablePictureInPicture = true;

      if (preview.dataset.bound !== 'true') {
        preview.addEventListener('loadeddata', () => {
          card.classList.add('is-video-ready');
        });

        preview.addEventListener('error', () => {
          card.classList.remove('is-video-ready');
          preview.pause();
          preview.removeAttribute('src');
          preview.dataset.loaded = 'false';
          preview.load();
        });

        preview.dataset.bound = 'true';
      }

      card.classList.remove('is-video-ready');
    });

    const playVisibleCard = (card) => {
      const preview = card.querySelector('video.media-card__preview');
      if (!(preview instanceof HTMLVideoElement)) {
        return;
      }
      hydratePreview(card, preview);
      if (shouldAutoplay) {
        preview.play().catch(() => {
          // Autoplay can be blocked in some environments.
        });
      } else {
        preview.pause();
      }
    };

    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => playVisibleCard(card));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        if (!(card instanceof HTMLElement)) {
          return;
        }

        const preview = card.querySelector('video.media-card__preview');
        if (!(preview instanceof HTMLVideoElement)) {
          return;
        }

        if (entry.isIntersecting) {
          playVisibleCard(card);
        } else {
          preview.pause();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '220px 0px',
    });

    cards.forEach((card) => observer.observe(card));
  };

  initInlineAutoplayVideos();

  const initComparisonCarousel = () => {
    const carousel = document.querySelector('.comparison-carousel');
    const prevButton = document.getElementById('comparisonPrev');
    const nextButton = document.getElementById('comparisonNext');
    const jumpContainer = document.getElementById('comparisonJumps');

    if (
      !(carousel instanceof HTMLElement)
      || !(prevButton instanceof HTMLButtonElement)
      || !(nextButton instanceof HTMLButtonElement)
      || !(jumpContainer instanceof HTMLElement)
    ) {
      return;
    }

    const cards = Array.from(carousel.children).filter(
      (node) => node instanceof HTMLElement
        && (node.classList.contains('comparison-board') || node.classList.contains('demo-panel'))
    );

    if (cards.length === 0) {
      return;
    }

    let activeIndex = 0;
    const jumpButtons = cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'comparison-jump';
      const title = card.querySelector('h3');
      button.textContent = title ? title.textContent.trim().replace(/\s+/g, ' ') : `Panel ${index + 1}`;
      jumpContainer.append(button);
      return button;
    });

    const updateControls = (scrollBehavior = 'auto') => {
      jumpButtons.forEach((button, index) => {
        button.classList.toggle('is-active', index === activeIndex);
      });
      prevButton.disabled = activeIndex <= 0;
      nextButton.disabled = activeIndex >= cards.length - 1;
      const activeButton = jumpButtons[activeIndex];
      if (activeButton) {
        activeButton.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: scrollBehavior,
        });
      }
    };

    const scrollToIndex = (nextIndex) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, nextIndex));
      activeIndex = clamped;
      const target = cards[clamped];
      if (target) {
        carousel.scrollTo({
          left: target.offsetLeft - carousel.offsetLeft,
          behavior: 'smooth',
        });
      }
      updateControls('smooth');
    };

    jumpButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        scrollToIndex(index);
      });
    });

    prevButton.addEventListener('click', () => {
      scrollToIndex(activeIndex - 1);
    });

    nextButton.addEventListener('click', () => {
      scrollToIndex(activeIndex + 1);
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const index = cards.indexOf(entry.target);
          if (index >= 0 && index !== activeIndex) {
            activeIndex = index;
            updateControls('smooth');
          }
        });
      }, {
        root: carousel,
        threshold: 0.55,
      });

      cards.forEach((card) => observer.observe(card));
    } else {
      carousel.addEventListener('scroll', () => {
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        cards.forEach((card, index) => {
          const distance = Math.abs((card.offsetLeft - carousel.offsetLeft) - carousel.scrollLeft);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        if (nearestIndex !== activeIndex) {
          activeIndex = nearestIndex;
          updateControls('smooth');
        }
      });
    }

    updateControls('auto');
  };

  initComparisonCarousel();

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
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
})();

(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  const savedTheme = localStorage.getItem('hug3d-theme');
  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      localStorage.setItem('hug3d-theme', nextTheme);
    });
  }

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

    lightboxCaption.textContent = caption;

    if (type === 'video') {
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute('src');

      lightboxVideo.hidden = false;
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

      lightboxImage.hidden = false;
      lightboxImage.setAttribute('src', src || '');
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

    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.hidden = true;

    document.body.style.overflow = '';
  };

  document.querySelectorAll('.js-lightbox').forEach((node) => {
    node.setAttribute('tabindex', '0');
    node.addEventListener('click', () => openLightbox(node));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(node);
      }
    });
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

  const copyBibtexButton = document.getElementById('copyBibtex');
  const bibtexBlock = document.getElementById('bibtexBlock');

  if (copyBibtexButton && bibtexBlock) {
    copyBibtexButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bibtexBlock.textContent || '');
        copyBibtexButton.textContent = 'Copied';
        setTimeout(() => {
          copyBibtexButton.textContent = 'Copy BibTeX';
        }, 1200);
      } catch (_error) {
        copyBibtexButton.textContent = 'Copy failed';
        setTimeout(() => {
          copyBibtexButton.textContent = 'Copy BibTeX';
        }, 1200);
      }
    });
  }

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

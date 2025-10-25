const body = document.body;
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = nav ? nav.querySelectorAll('[data-nav-link]') : [];
const scrollTopBtn = document.querySelector('[data-scroll-top]');
const modal = document.querySelector('[data-modal]');
const modalOverlay = modal ? modal.querySelector('[data-modal-overlay]') : null;
const modalClose = modal ? modal.querySelector('[data-modal-close]') : null;
const modalTriggers = document.querySelectorAll('[data-open-modal]');
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const heroSlides = document.querySelectorAll('.hero__slide');
const prefersReducedMotion = typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };

let lastFocusedElement = null;
let navOpen = false;
let modalOpen = false;
let heroSlideIndex = 0;
let heroSlideTimer = null;

const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function setNavState(open) {
  if (!nav || !navToggle) return;
  navOpen = open;
  nav.setAttribute('data-open', String(open));
  navToggle.setAttribute('aria-expanded', String(open));
  if (open) {
    body.style.overflow = 'hidden';
    navToggle.classList.add('is-active');
  } else {
    body.style.overflow = '';
    navToggle.classList.remove('is-active');
  }
}

function trapFocus(container, event) {
  const focusableElements = container ? container.querySelectorAll(focusableSelectors) : [];
  if (!focusableElements.length) return;
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openModal() {
  if (!modal) return;
  modal.hidden = false;
  modalOpen = true;
  lastFocusedElement = document.activeElement;
  body.style.overflow = 'hidden';
  const firstField = modal.querySelector('input, textarea, button');
  setTimeout(() => firstField && firstField.focus(), 80);
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  modalOpen = false;
  body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function handleScroll() {
  const scrollY = window.scrollY || window.pageYOffset;
  if (header) {
    header.classList.toggle('is-scrolled', scrollY > 16);
  }
  if (scrollTopBtn) {
    if (scrollY > 360) {
      scrollTopBtn.classList.add('is-visible');
    } else {
      scrollTopBtn.classList.remove('is-visible');
    }
  }
}

function activateHeroSlide(index) {
  if (!heroSlides.length) return;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === index);
  });
}

function startHeroSlider() {
  if (!heroSlides.length || prefersReducedMotion.matches) return;
  activateHeroSlide(heroSlideIndex);
  heroSlideTimer = setInterval(() => {
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    activateHeroSlide(heroSlideIndex);
  }, 7000);
}

function stopHeroSlider() {
  if (heroSlideTimer) {
    clearInterval(heroSlideTimer);
    heroSlideTimer = null;
  }
}

function smoothScrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleFormSubmit(event) {
  if (!form || !formStatus) return;
  event.preventDefault();
  const data = new FormData(form);

  formStatus.textContent = 'Gönderiliyor…';
  formStatus.className = 'form-status';

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: data,
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      form.reset();
      formStatus.textContent = 'Mesajınız başarıyla gönderildi. Kısa sürede dönüş sağlayacağız.';
      formStatus.classList.add('success');
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
        closeModal();
      }, 3200);
    } else {
      throw new Error('Form gönderimi başarısız.');
    }
  } catch (error) {
    formStatus.textContent = 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
    formStatus.classList.add('error');
  }
}

if (nav && navToggle) {
  nav.setAttribute('data-open', 'false');
  navToggle.addEventListener('click', () => setNavState(!navOpen));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) {
        setNavState(false);
      }
    });
  });
}

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', smoothScrollTop);
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

if (modal) {
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      setNavState(false);
      openModal();
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      trapFocus(modal, event);
    }
  });
}

if (form) {
  form.addEventListener('submit', handleFormSubmit);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modalOpen) {
      closeModal();
    }
    if (navOpen) {
      setNavState(false);
    }
  }
});

if (heroSlides.length) {
  if (prefersReducedMotion.matches) {
    activateHeroSlide(heroSlideIndex);
  } else {
    startHeroSlider();
  }

  const handleMotionPreference = (event) => {
    if (event.matches) {
      stopHeroSlider();
      activateHeroSlide(heroSlideIndex);
    } else {
      stopHeroSlider();
      startHeroSlider();
    }
  };

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(handleMotionPreference);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHeroSlider();
    } else if (!prefersReducedMotion.matches) {
      stopHeroSlider();
      startHeroSlider();
    }
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 960) {
    setNavState(false);
  }
});

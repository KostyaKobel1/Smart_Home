// Header Navigation Mobile Menu Toggle
let menuInitialized = false;
let docListenersBound = false;
function initHeaderMenu() {
  if (menuInitialized) {
    return;
  }
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const menuLinks = document.querySelectorAll('.header__menu-link');
  if (!burger || !nav) {
    return;
  }
  menuInitialized = true;

  const toggleMenu = (shouldOpen, targetBurger, targetNav) => {
    const b = targetBurger || document.querySelector('.header__burger');
    const n = targetNav || document.querySelector('.header__nav');
    if (!b || !n) return;

    b.classList.toggle('is-active', shouldOpen);
    n.classList.toggle('is-open', shouldOpen);
    b.setAttribute('aria-expanded', shouldOpen);

    if (shouldOpen && window.innerWidth < 770) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  burger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = nav.classList.contains('is-open');
    toggleMenu(!isOpen, burger, nav);
  });
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false, burger, nav);
    });
  });

  if (!docListenersBound) {
    document.addEventListener('click', (e) => {
      const header = document.querySelector('.global__header');
      if (header && header.contains(e.target)) return;
      toggleMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMenu(false);
        const currentBurger = document.querySelector('.header__burger');
        if (currentBurger) currentBurger.focus();
      }
    });

    docListenersBound = true;
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    menuInitialized = false;
    initHeaderMenu();
  });
} else {
  menuInitialized = false;
  initHeaderMenu();
}
document.addEventListener('htmx:afterSwap', () => {
  menuInitialized = false;
  initHeaderMenu();
});

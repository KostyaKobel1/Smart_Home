async function init() {
  // Import modules after HTMX partials are loaded
  await Promise.all([
    import('./index-base.js'),
    import('./index-lamp.js'),
    import('./index.components-manager.js'),
    import('./header-nav.js'),
  ]);
}

const partialNodes = document.querySelectorAll('[hx-trigger="load"], [data-hx-trigger="load"]');
const totalPartials = partialNodes.length; // Typically 3: nav, component-action, footer
let loadedPartialsCount = 0;

const maybeInit = () => {
  if (totalPartials === 0) {
    init();
    return;
  }
  if (loadedPartialsCount === totalPartials) {
    init();
  }
};

document.body?.addEventListener('htmx:afterOnLoad', () => {
  loadedPartialsCount++;
  maybeInit();
});

// Fallback: if HTMX is not present or events don’t fire, init after DOM ready
if (document.readyState !== 'loading') {
  setTimeout(maybeInit, 0);
} else {
  document.addEventListener('DOMContentLoaded', () => setTimeout(maybeInit, 0));
}

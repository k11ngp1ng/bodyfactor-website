/* Sem dependências. Funciona também abrindo index.html diretamente. */
(() => {
  'use strict';
  const store = window.STORE;
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const whatsappUrl = message => `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
  const arrow = '<span aria-hidden="true">↗</span>';
  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.href = whatsappUrl(link.dataset.whatsapp || 'Olá! Gostaria de conhecer os suplementos da Body Factor. Podem me atender?');
    link.target = '_blank'; link.rel = 'noopener noreferrer';
  });
  document.querySelectorAll('[data-instagram]').forEach(link => link.href = store.instagram);
  document.querySelector('[data-address]').textContent = store.address;
  document.querySelector('[data-hours]').textContent = store.hours;
  document.querySelector('[data-maps]').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ', ' + store.address)}`;
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const grid = document.querySelector('#product-grid');
  function render(category = 'todos') {
    const products = category === 'todos' ? store.products : store.products.filter(p => p.category === category);
    grid.replaceChildren(...products.map(product => {
      const card = document.createElement('article'); card.className = 'product-card';
      // Conteúdo textual é atribuído com textContent para permitir edição segura do catálogo.
      card.innerHTML = '<div class="product-image"><span class="product-tag"></span><img width="320" height="320" loading="lazy"></div><div class="product-info"><p class="product-category"></p><h3></h3><p class="product-size"></p><div class="price-line"><strong></strong><span>preço ilustrativo</span></div><a class="product-buy" target="_blank" rel="noopener noreferrer">Comprar via WhatsApp '+arrow+'</a></div>';
      card.querySelector('.product-tag').textContent = product.tag;
      if (!product.tag) card.querySelector('.product-tag').remove();
      const img = card.querySelector('img'); img.src = product.image; img.alt = `Imagem ilustrativa de ${product.name}`;
      img.addEventListener('error', () => { img.src = 'assets/placeholder.svg'; }, { once: true });
      card.querySelector('.product-category').textContent = product.label;
      card.querySelector('h3').textContent = product.name;
      card.querySelector('.product-size').textContent = product.size;
      card.querySelector('.price-line strong').textContent = money.format(product.price);
      card.querySelector('a').href = whatsappUrl(`Olá! Tenho interesse no produto ${product.name}. Podem confirmar preço, disponibilidade e me atender?`);
      return card;
    }));
    document.querySelector('#product-count').textContent = `${products.length} produtos`;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    render(button.dataset.filter);
    if (button.classList.contains('goal-card')) document.querySelector('#catalogo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }));
  render();
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header-inner')) closeMenu(); });
  matchMedia('(min-width: 960px)').addEventListener('change', closeMenu);
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
  }
})();

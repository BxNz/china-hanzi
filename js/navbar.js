async function loadNavbar(){
  const container = document.querySelector('[data-navbar]');
  if (!container) return;

  try {
    const inViewFolder = window.location.pathname.replace(/\\/g, '/').includes('/view/');
    const response = await fetch(inViewFolder ? 'navbar.html' : 'view/navbar.html');
    if (!response.ok) throw new Error(`Navbar request failed: ${response.status}`);
    container.innerHTML = await response.text();

    const pagePaths = {
      practice: inViewFolder ? '../index.html' : 'index.html',
      flashcards: inViewFolder ? 'flashcards.html' : 'view/flashcards.html',
      'add-word': inViewFolder ? 'addNewword.html' : 'view/addNewword.html',
      'hsk-pdf': inViewFolder ? '../hsk-words-visualized.pdf' : 'hsk-words-visualized.pdf'
    };
    const brand = container.querySelector('.navbar-brand');
    if (brand) brand.href = pagePaths.practice;
    container.querySelectorAll('.nav-link').forEach(link => {
      const page = link.dataset.page;
      link.href = pagePaths[page];
      const isActive = page === (inViewFolder ? window.location.pathname.split('/').pop() === 'flashcards.html' ? 'flashcards' : window.location.pathname.split('/').pop() === 'addNewword.html' ? 'add-word' : 'practice' : 'practice');
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  } catch (error) {
    console.error('Failed to load navbar.html', error);
  }
}

loadNavbar();

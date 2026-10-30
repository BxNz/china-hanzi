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
      search: inViewFolder ? 'search.html' : 'view/search.html',
      'add-word': inViewFolder ? 'addNewword.html' : 'view/addNewword.html',
      'hsk-pdf': inViewFolder ? '../hsk-words-visualized.pdf' : 'hsk-words-visualized.pdf'
    };
    const brand = container.querySelector('.navbar-brand');
    if (brand) brand.href = pagePaths.practice;
    const currentPage = inViewFolder
      ? {
          'flashcards.html': 'flashcards',
          'search.html': 'search',
          'addNewword.html': 'add-word'
        }[window.location.pathname.split('/').pop()] || 'practice'
      : 'practice';
    container.querySelectorAll('.nav-link').forEach(link => {
      const page = link.dataset.page;
      link.href = pagePaths[page];
      const isActive = page === currentPage;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (!inViewFolder) {
      const levelButtons = document.getElementById('levelBtns');
      const modeButtons = document.getElementById('modeBtns');
      const navbarCollapse = container.querySelector('.navbar-collapse');

      if (levelButtons && modeButtons && navbarCollapse) {
        const practiceControls = document.createElement('div');
        practiceControls.className = 'practice-nav-controls';
        practiceControls.append(levelButtons, modeButtons);
        navbarCollapse.appendChild(practiceControls);
      }
    }
  } catch (error) {
    console.error('Failed to load navbar.html', error);
  }
}

loadNavbar();

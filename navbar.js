async function loadNavbar(){
  const container = document.querySelector('[data-navbar]');
  if (!container) return;

  try {
    const response = await fetch('navbar.html');
    if (!response.ok) throw new Error(`Navbar request failed: ${response.status}`);
    container.innerHTML = await response.text();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    container.querySelectorAll('.nav-link').forEach(link => {
      const isActive = link.getAttribute('href') === currentPage;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  } catch (error) {
    console.error('Failed to load navbar.html', error);
  }
}

loadNavbar();

const root = document.documentElement;

// Theme: follows the system until the visitor picks one.
const themeToggle = document.querySelector('#theme-toggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
const labelTheme = () => themeToggle.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
labelTheme();
systemDark.addEventListener('change', labelTheme);
themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  labelTheme();
});

// Mobile menu
const menuToggle = document.querySelector('#menu-toggle');
const nav = document.querySelector('#site-nav');
const setMenu = open => {
  nav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Project filter
const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
const moreWork = document.querySelector('#more-work');
const filterStatus = document.querySelector('#filter-status');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => {
    const selected = item === button;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  projects.forEach(project => { project.hidden = filter !== 'all' && project.dataset.category !== filter; });
  if (moreWork) moreWork.hidden = !projects.some(p => p.classList.contains('index-row') && !p.hidden);
  const count = projects.filter(p => !p.hidden).length;
  filterStatus.textContent = `Showing ${count} ${count === 1 ? 'project' : 'projects'}.`;
}));

// Scroll-spy for the masthead nav
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(link => { const s = document.querySelector(link.getAttribute('href')); if (s) spy.observe(s); });

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
}

// Local time in Buffalo
const clock = document.querySelector('#clock');
if (clock) {
  const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const tick = () => { clock.textContent = timeFormat.format(new Date()); };
  tick();
  setInterval(tick, 30000);
}

document.querySelector('#year').textContent = new Date().getFullYear();

// Copy email
document.querySelector('#copy-email')?.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText('parthac350@gmail.com'); status.textContent = 'Copied'; }
  catch { status.textContent = 'Select the address above to copy it'; }
  setTimeout(() => { status.textContent = ''; }, 2400);
});

// Reading progress on journal articles
const progress = document.querySelector('.progress');
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Contact form: sent through FormSubmit, which forwards to my inbox.
const form = document.querySelector('#contact-form');
if (form) {
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('[type="submit"]');
  const setStatus = (html, kind = '') => { status.innerHTML = html; status.className = `form-status mono ${kind}`; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[required], textarea[required]')];
    fields.forEach(f => f.setAttribute('aria-invalid', String(!f.checkValidity() || !f.value.trim())));
    const invalid = fields.find(f => f.getAttribute('aria-invalid') === 'true');
    if (invalid) { setStatus('Please add your name, a valid email and a message.', 'is-error'); invalid.focus(); return; }
    if (form.elements._honey.value) return;

    submit.disabled = true;
    setStatus('Sending…');
    try {
      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || res.status);
      form.reset();
      setStatus('Thanks—your message is on its way. I’ll reply by email.', 'is-ok');
    } catch {
      setStatus('Couldn’t send right now. Please email <a href="mailto:parthac350@gmail.com">parthac350@gmail.com</a> directly.', 'is-error');
    } finally {
      submit.disabled = false;
    }
  });
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity() && e.target.value.trim()) e.target.removeAttribute('aria-invalid'); });
}

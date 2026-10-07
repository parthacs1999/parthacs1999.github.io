const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  projects.forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
  document.querySelector('.more-work').hidden = !projects.some(project => project.classList.contains('repo-card') && !project.hidden);
  const count = projects.filter(project => !project.hidden).length;
  document.querySelector('#filter-status').textContent = `Showing ${count} ${count === 1 ? 'project' : 'projects'}.`;
}));
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText('parthac350@gmail.com'); status.textContent = 'Email copied'; }
  catch { status.textContent = 'Select the email above to copy it.'; }
});

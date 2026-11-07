const form = document.querySelector('#club-form');
const clubName = document.querySelector('#club-name');
const description = document.querySelector('#description');
const timeOfDay = document.querySelector('#time-of-day');
const days = document.querySelector('#days');
const duration = document.querySelector('#duration');
const classroom = document.querySelector('#classroom');
const publishButton = document.querySelector('#publish-button');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const clubsElement = document.querySelector('#clubs');
const count = document.querySelector('#club-count');
const emptyState = document.querySelector('#empty-state');
const searchForm = document.querySelector('#search-form');
const semanticButton = document.querySelector('#semantic-button');
const searchStatus = document.querySelector('#search-status');
const deleteModal = document.querySelector('#delete-modal');
const confirmTitle = document.querySelector('#confirm-title');
const confirmCopy = document.querySelector('#confirm-copy');
const cancelDelete = document.querySelector('#cancel-delete');
const confirmDelete = document.querySelector('#confirm-delete');
let clubs = loadClubs();
let aiMatches = null;
let pendingDeleteId = null;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function matchesSearch(club, query) {
  const words = `${club.name} ${club.summary} ${club.whoItsFor} ${(club.tags || []).join(' ')}`.toLowerCase().split(/\W+/).filter(Boolean);
  return query.split(/\s+/).filter(Boolean).every(part => words.some(word => word.startsWith(part) || part.startsWith(word)));
}

function renderClubs() {
  const term = search.value.trim().toLowerCase();
  const visible = aiMatches ? aiMatches.map(id => clubs.find(club => club.id === id)).filter(Boolean) : clubs.filter(club => !term || matchesSearch(club, term));
  count.textContent = `${visible.length} ${visible.length === 1 ? 'club' : 'clubs'}`;
  clubsElement.innerHTML = visible.map(club => `
    <article class="club-card">
      <div class="card-top"><span class="club-badge">${escapeHtml((club.name || 'C').slice(0, 1))}</span><div class="card-actions"><span class="unverified">${club.approvalStatus === 'pending' || (!club.sample && !club.approvalStatus) ? 'Awaiting adult approval' : club.sample ? 'Approved sample' : 'Unverified'}</span>${club.sample ? '' : `<button class="delete-button" type="button" data-delete-id="${escapeHtml(club.id)}">Delete</button>`}</div></div>
      <h3>${escapeHtml(club.name)}</h3><p class="summary">${escapeHtml(club.summary)}</p>
      ${club.approvalStatus === 'pending' || (!club.sample && !club.approvalStatus) ? '<div class="approval-note">A school adult must approve this club before students should rely on its details.</div>' : ''}
      <div class="conclusion"><span>Club conclusion</span><p>${escapeHtml(club.conclusion || `I am ${club.name}: ${club.summary}`)}</p></div>
      ${club.originalDescription ? `<div class="original-description"><span>Publisher wrote</span><p>${escapeHtml(club.originalDescription)}</p></div>` : ''}
      <div class="fit"><span>Good for</span><strong>${escapeHtml(club.whoItsFor)}</strong></div>
      <div class="activities"><span>Try</span><div>${(club.activities || []).map(item => `<span class="pill">${escapeHtml(item)}</span>`).join('')}</div></div>
      <div class="meeting-details"><div><span>Time of day</span><strong>${escapeHtml(club.timeOfDay || 'Not provided yet')}</strong></div><div><span>Day(s)</span><strong>${escapeHtml(club.days || 'Not provided yet')}</strong></div><div><span>How long</span><strong>${escapeHtml(club.duration || 'Not provided yet')}</strong></div><div><span>Classroom</span><strong>${escapeHtml(club.classroom || 'Not provided yet')}</strong></div></div>
    </article>`).join('');
  emptyState.hidden = visible.length > 0;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); status.className = 'status error'; status.textContent = 'Please fill in every box before publishing.'; return; }
  const text = `Club name: ${clubName.value.trim()}\nDescription: ${description.value.trim()}\nTime of day: ${timeOfDay.value.trim()}\nDay(s): ${days.value.trim()}\nDuration: ${duration.value.trim()}\nClassroom: ${classroom.value.trim()}`;
  publishButton.disabled = true; status.className = 'status thinking'; status.textContent = 'Thinking…';
  try {
    const response = await fetch('/api/organize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: text }) });
    const club = await response.json();
    if (!response.ok) throw new Error(club.error || 'Something went wrong.');
    clubs = [addClub(club), ...clubs]; renderClubs(); form.reset(); status.className = 'status success'; status.textContent = 'Published! Your club is now easier to compare and find.';
    document.querySelector('.clubs-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) { status.className = 'status error'; status.textContent = error.message; }
  finally { publishButton.disabled = false; }
});

clubsElement.addEventListener('click', event => {
  const button = event.target.closest('[data-delete-id]');
  if (!button) return;
  pendingDeleteId = button.dataset.deleteId;
  confirmTitle.textContent = 'Are you sure?';
  confirmCopy.textContent = 'This will remove the club from this computer\'s saved list.';
  confirmDelete.textContent = 'Yes, continue';
  deleteModal.hidden = false;
});

cancelDelete.addEventListener('click', () => { pendingDeleteId = null; deleteModal.hidden = true; });
confirmDelete.addEventListener('click', () => {
  if (confirmDelete.textContent === 'Yes, continue') {
    confirmTitle.textContent = 'Are you for real?';
    confirmCopy.textContent = 'The club will be deleted and cannot be restored from this screen.';
    confirmDelete.textContent = 'Yes, delete it';
    return;
  }
  clubs = deleteClub(pendingDeleteId); aiMatches = null; deleteModal.hidden = true; pendingDeleteId = null; renderClubs(); status.className = 'status success'; status.textContent = 'The club was deleted from this computer.';
});

search.addEventListener('input', () => { aiMatches = null; searchStatus.textContent = 'Type normally for an instant search, or use Find with AI to search by meaning.'; renderClubs(); });
searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  const query = search.value.trim();
  if (query.length < 2) { searchStatus.textContent = 'Type an interest or activity first.'; return; }
  semanticButton.disabled = true; semanticButton.innerHTML = 'Thinking…'; searchStatus.textContent = 'AI is looking for similar meanings…';
  try {
    const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, clubs }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Something went wrong.');
    aiMatches = result.ids; renderClubs(); searchStatus.textContent = aiMatches.length ? `AI found ${aiMatches.length} club${aiMatches.length === 1 ? '' : 's'} that may fit “${query}”.` : `AI could not find a close match for “${query}”.`;
  } catch (error) { aiMatches = null; renderClubs(); searchStatus.textContent = error.message; }
  finally { semanticButton.disabled = false; semanticButton.innerHTML = 'Find with AI <span>→</span>'; }
});
document.querySelector('#reset-button').addEventListener('click', () => { clubs = resetClubs(); search.value = ''; aiMatches = null; renderClubs(); status.className = 'status'; status.textContent = ''; searchStatus.textContent = 'Type normally for an instant search, or use Find with AI to search by meaning.'; });
renderClubs();

const form = document.querySelector('#club-form');
const description = document.querySelector('#description');
const publishButton = document.querySelector('#publish-button');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const clubsElement = document.querySelector('#clubs');
const count = document.querySelector('#club-count');
const emptyState = document.querySelector('#empty-state');
let clubs = loadClubs();

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function renderClubs() {
  const term = search.value.trim().toLowerCase();
  const visible = clubs.filter(club => `${club.name} ${club.summary} ${club.whoItsFor} ${(club.tags || []).join(' ')}`.toLowerCase().includes(term));
  count.textContent = `${visible.length} ${visible.length === 1 ? 'club' : 'clubs'}`;
  clubsElement.innerHTML = visible.map(club => `
    <article class="club-card">
      <div class="card-top"><span class="club-badge">${escapeHtml((club.name || 'C').slice(0, 1))}</span><span class="unverified">${club.unverified ? 'Unverified' : 'Sample'}</span></div>
      <h3>${escapeHtml(club.name)}</h3><p class="summary">${escapeHtml(club.summary)}</p>
      <div class="fit"><span>Good for</span><strong>${escapeHtml(club.whoItsFor)}</strong></div>
      <div class="activities"><span>Try</span><div>${(club.activities || []).map(item => `<span class="pill">${escapeHtml(item)}</span>`).join('')}</div></div>
      <div class="meeting">◷ ${escapeHtml(club.meetingInfo || 'Meeting details should be confirmed with the school.')}</div>
    </article>`).join('');
  emptyState.hidden = visible.length > 0;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = description.value.trim();
  if (text.length < 10) { status.className = 'status error'; status.textContent = 'Add a little more detail so the organizer can help.'; return; }
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

search.addEventListener('input', renderClubs);
document.querySelector('#reset-button').addEventListener('click', () => { clubs = resetClubs(); search.value = ''; renderClubs(); status.className = 'status'; status.textContent = ''; });
renderClubs();

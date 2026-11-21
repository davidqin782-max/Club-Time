const form = document.querySelector('#club-form');
const clubName = document.querySelector('#club-name');
const description = document.querySelector('#description');
const timeOfDay = document.querySelector('#time-of-day');
const days = document.querySelector('#days');
const duration = document.querySelector('#duration');
const classroom = document.querySelector('#classroom');
const school = document.querySelector('#school');
const address = document.querySelector('#address');
const publishButton = document.querySelector('#publish-button');
const status = document.querySelector('#status');
const search = document.querySelector('#search');
const clubsElement = document.querySelector('#clubs');
const count = document.querySelector('#club-count');
const emptyState = document.querySelector('#empty-state');
const clubPagination = document.querySelector('#club-pagination');
const searchForm = document.querySelector('#search-form');
const semanticButton = document.querySelector('#semantic-button');
const searchStatus = document.querySelector('#search-status');
const recommendationClubs = document.querySelector('#recommendation-clubs');
const recommendationCount = document.querySelector('#recommendation-count');
const recommendationStatus = document.querySelector('#recommendation-status');
const recommendationEmpty = document.querySelector('#recommendation-empty');
const deleteModal = document.querySelector('#delete-modal');
const confirmTitle = document.querySelector('#confirm-title');
const confirmCopy = document.querySelector('#confirm-copy');
const cancelDelete = document.querySelector('#cancel-delete');
const confirmDelete = document.querySelector('#confirm-delete');
const safetyModal = document.querySelector('#safety-modal');
const closeSafety = document.querySelector('#close-safety');
const pageSections = document.querySelectorAll('[data-page-section]');
const pageLinks = document.querySelectorAll('[data-page-link]');
let clubs = loadClubs();
let aiMatches = null;
let pendingDeleteId = null;
let activePage = null;
let pageTransitionTimer = null;
let currentClubPage = 1;
const CLUBS_PER_PAGE = 4;

function clubCatalog() {
  return clubs.map(club => ({ id: club.id, name: club.name, summary: club.summary, whoItsFor: club.whoItsFor, tags: club.tags, school: club.school, address: club.address }));
}

function localRecommendations(profile) {
  const interestText = profile.interests.join(' ');
  return clubs.map(club => ({ club, score: (matchesSearch(club, interestText) ? 3 : 0) + (profile.searchedClubIds.includes(club.id) ? 2 : 0) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(item => item.club.id);
}

function setPage(page) {
  pageLinks.forEach(link => { link.classList.toggle('active', link.dataset.pageLink === page); });
  if (activePage === page) return;
  const nextSections = [...pageSections].filter(section => section.dataset.pageSection === page);
  if (activePage === null) {
    pageSections.forEach(section => { section.hidden = section.dataset.pageSection !== page; });
    activePage = page;
    if (page === 'recommendations') loadRecommendations();
    return;
  }
  const currentSections = [...pageSections].filter(section => !section.hidden);
  currentSections.forEach(section => section.classList.add('page-exit-down'));
  clearTimeout(pageTransitionTimer);
  pageTransitionTimer = setTimeout(() => {
    currentSections.forEach(section => { section.hidden = true; section.classList.remove('page-exit-down'); });
    nextSections.forEach(section => { section.hidden = false; section.classList.add('page-enter-up'); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    pageTransitionTimer = setTimeout(() => nextSections.forEach(section => section.classList.remove('page-enter-up')), 420);
  }, 240);
  activePage = page;
  if (page === 'recommendations') loadRecommendations();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function matchesSearch(club, query) {
  const words = `${club.name} ${club.summary} ${club.whoItsFor} ${(club.tags || []).join(' ')}`.toLowerCase().split(/\W+/).filter(Boolean);
  return query.split(/\s+/).filter(Boolean).every(part => words.some(word => word.includes(part) || part.includes(word)));
}

function clubCardMarkup(club) {
  return `<article class="club-card">
      <div class="card-top"><span class="club-badge">${escapeHtml((club.name || 'C').slice(0, 1))}</span><div class="card-actions"><span class="unverified">${club.approvalStatus === 'pending' || (!club.sample && !club.approvalStatus) ? 'Awaiting adult approval' : club.sample ? 'Approved sample' : 'Unverified'}</span>${club.sample ? '' : `<button class="delete-button" type="button" data-delete-id="${escapeHtml(club.id)}">Delete</button>`}</div></div>
      <h3>${escapeHtml(club.name)}</h3><p class="summary">${escapeHtml(club.summary)}</p>
      ${club.approvalStatus === 'pending' || (!club.sample && !club.approvalStatus) ? '<div class="approval-note">A school adult must approve this club before students should rely on its details.</div>' : ''}
      <div class="conclusion"><span>Club conclusion</span><p>${escapeHtml(club.conclusion || `I am ${club.name}: ${club.summary}`)}</p></div>
      ${club.originalDescription ? `<div class="original-description"><span>Publisher wrote</span><p>${escapeHtml(club.originalDescription)}</p></div>` : ''}
      <div class="location-details"><div><span>School</span><strong>${escapeHtml(club.school || 'Not provided yet')}</strong></div><div><span>School address</span><strong>${escapeHtml(club.address || 'Not provided yet')}</strong></div></div>
      <div class="fit"><span>Good for</span><strong>${escapeHtml(club.whoItsFor)}</strong></div>
      <div class="activities"><span>Try</span><div>${(club.activities || []).map(item => `<span class="pill">${escapeHtml(item)}</span>`).join('')}</div></div>
      <div class="meeting-details"><div><span>Time of day</span><strong>${escapeHtml(club.timeOfDay || 'Not provided yet')}</strong></div><div><span>Day(s)</span><strong>${escapeHtml(club.days || 'Not provided yet')}</strong></div><div><span>How long</span><strong>${escapeHtml(club.duration || 'Not provided yet')}</strong></div><div><span>Classroom</span><strong>${escapeHtml(club.classroom || 'Not provided yet')}</strong></div></div>
    </article>`;
}

function bindCardHover(container) {
  container.querySelectorAll('.club-card').forEach(card => {
    card.addEventListener('pointerenter', () => card.classList.add('card-hovered'));
    card.addEventListener('pointerleave', () => card.classList.remove('card-hovered'));
  });
}

function renderClubs() {
  const term = search.value.trim().toLowerCase();
  const allVisible = aiMatches ? aiMatches.map(id => clubs.find(club => club.id === id)).filter(Boolean) : clubs.filter(club => !term || matchesSearch(club, term));
  const totalPages = Math.max(1, Math.ceil(allVisible.length / CLUBS_PER_PAGE));
  currentClubPage = Math.min(currentClubPage, totalPages);
  const visible = allVisible.slice((currentClubPage - 1) * CLUBS_PER_PAGE, currentClubPage * CLUBS_PER_PAGE);
  count.textContent = `${allVisible.length} ${allVisible.length === 1 ? 'club' : 'clubs'}${totalPages > 1 ? ` · page ${currentClubPage} of ${totalPages}` : ''}`;
  clubsElement.innerHTML = visible.map(clubCardMarkup).join('');
  bindCardHover(clubsElement);
  clubPagination.innerHTML = totalPages > 1 ? `<button type="button" class="page-arrow" data-club-page="${Math.max(1, currentClubPage - 1)}" aria-label="Previous club page" ${currentClubPage === 1 ? 'disabled' : ''}>←</button>${Array.from({ length: totalPages }, (_, index) => { const page = index + 1; return `<button type="button" class="page-number${page === currentClubPage ? ' active' : ''}" data-club-page="${page}" aria-label="Club page ${page}" aria-current="${page === currentClubPage ? 'page' : 'false'}">${page}</button>`; }).join('')}<button type="button" class="page-arrow" data-club-page="${Math.min(totalPages, currentClubPage + 1)}" aria-label="Next club page" ${currentClubPage === totalPages ? 'disabled' : ''}>→</button>` : '';
  emptyState.hidden = allVisible.length > 0;
}

function renderRecommendations(ids) {
  const visible = ids.map(id => clubs.find(club => club.id === id)).filter(Boolean);
  recommendationCount.textContent = `${visible.length} ${visible.length === 1 ? 'club' : 'clubs'}`;
  recommendationClubs.innerHTML = visible.map(clubCardMarkup).join('');
  bindCardHover(recommendationClubs);
  recommendationEmpty.hidden = visible.length > 0;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); status.className = 'status error'; status.textContent = 'Please fill in every box before publishing.'; return; }
  const text = `Club name: ${clubName.value.trim()}\nDescription: ${description.value.trim()}\nTime of day: ${timeOfDay.value.trim()}\nDay(s): ${days.value.trim()}\nDuration: ${duration.value.trim()}\nClassroom: ${classroom.value.trim()}`;
  publishButton.disabled = true; status.className = 'status thinking'; status.textContent = 'Thinking…';
  try {
    const response = await fetch('/api/organize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: text, school: school.value.trim(), address: address.value.trim() }) });
    const club = await response.json();
    if (!response.ok) {
      if (club.blocked) { safetyModal.hidden = false; return; }
      throw new Error(club.error?.message || club.error || 'Something went wrong.');
    }
    clubs = [addClub(club), ...clubs]; renderClubs(); form.reset(); status.className = 'status success'; status.textContent = 'Published! Your club is now awaiting adult approval.'; setPage('find');
    setTimeout(() => document.querySelector('.clubs-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 260);
  } catch (error) { status.className = 'status error'; status.textContent = error.message; }
  finally { publishButton.disabled = false; }
});

function handleClubCardClick(event) {
  const button = event.target.closest('[data-delete-id]');
  if (!button) return;
  pendingDeleteId = button.dataset.deleteId;
  confirmTitle.textContent = 'Are you sure?';
  confirmCopy.textContent = 'This will remove the club from this computer\'s saved list.';
  confirmDelete.textContent = 'Yes, continue';
  deleteModal.hidden = false;
}

clubsElement.addEventListener('click', handleClubCardClick);
recommendationClubs.addEventListener('click', handleClubCardClick);

cancelDelete.addEventListener('click', () => { pendingDeleteId = null; deleteModal.hidden = true; });
closeSafety.addEventListener('click', () => { safetyModal.hidden = true; description.focus(); });
pageLinks.forEach(link => link.addEventListener('click', event => { event.preventDefault(); setPage(link.dataset.pageLink); history.replaceState(null, '', `#${link.dataset.pageLink}`); }));
confirmDelete.addEventListener('click', () => {
  if (confirmDelete.textContent === 'Yes, continue') {
    confirmTitle.textContent = 'Are you for real?';
    confirmCopy.textContent = 'The club will be deleted and cannot be restored from this screen.';
    confirmDelete.textContent = 'Yes, delete it';
    return;
  }
  clubs = deleteClub(pendingDeleteId); aiMatches = null; deleteModal.hidden = true; pendingDeleteId = null; renderClubs(); status.className = 'status success'; status.textContent = 'The club was deleted from this computer.';
});

search.addEventListener('input', () => {
  aiMatches = null;
  currentClubPage = 1;
  const query = search.value.trim();
  if (query.length >= 2) rememberSearch(query, clubs.filter(club => matchesSearch(club, query.toLowerCase())));
  searchStatus.textContent = 'Type normally for an instant search, or use Find with AI to search by meaning.';
  renderClubs();
});
searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  const query = search.value.trim();
  if (query.length < 2) { searchStatus.textContent = 'Type an interest or activity first.'; return; }
  currentClubPage = 1;
  rememberSearch(query, clubs.filter(club => matchesSearch(club, query.toLowerCase())));
  semanticButton.disabled = true; semanticButton.innerHTML = 'Thinking…'; searchStatus.textContent = 'AI is looking for similar meanings…';
  try {
    const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, clubs }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || result.error || 'Something went wrong.');
    aiMatches = result.ids; renderClubs(); searchStatus.textContent = aiMatches.length ? `AI found ${aiMatches.length} club${aiMatches.length === 1 ? '' : 's'} that may fit “${query}”.` : `AI could not find a close match for “${query}”.`;
  } catch (error) {
    aiMatches = null;
    renderClubs();
    const localCount = clubs.filter(club => !query || matchesSearch(club, query.toLowerCase())).length;
    searchStatus.textContent = localCount ? `AI is unavailable, so these ${localCount} local match${localCount === 1 ? '' : 'es'} are shown.` : error.message;
  }
  finally { semanticButton.disabled = false; semanticButton.innerHTML = 'Find with AI <span>→</span>'; }
});
async function loadRecommendations() {
  const profile = loadSearchProfile();
  if (!profile.interests.length) { recommendationStatus.textContent = 'Search for a few interests first, then come back here.'; renderRecommendations([]); return; }
  recommendationStatus.textContent = 'Thinking…';
  try {
    const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interests: profile.interests, searchedClubIds: profile.searchedClubIds, clubs: clubCatalog() }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || result.error || 'Recommendations are unavailable.');
    renderRecommendations(result.ids); recommendationStatus.textContent = result.ids.length ? 'These clubs may fit your interests.' : 'No close club matches yet.';
  } catch (error) {
    const localIds = localRecommendations(profile); renderRecommendations(localIds);
    recommendationStatus.textContent = localIds.length ? 'These local matches are shown because AI is unavailable.' : error.message;
  }
}
document.querySelector('#reset-button').addEventListener('click', () => { clubs = resetClubs(); search.value = ''; aiMatches = null; renderClubs(); status.className = 'status'; status.textContent = ''; searchStatus.textContent = 'Type normally for an instant search, or use Find with AI to search by meaning.'; });
clubPagination.addEventListener('click', event => {
  const button = event.target.closest('[data-club-page]');
  if (!button || button.disabled) return;
  currentClubPage = Number(button.dataset.clubPage) || 1;
  renderClubs();
  clubsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
setPage(location.hash === '#publish' ? 'publish' : location.hash === '#recommendations' ? 'recommendations' : location.hash === '#safety' ? 'safety' : 'find');
renderClubs();

const STORAGE_KEY = 'club-time-clubs-v1';
const PROFILE_KEY = 'club-time-search-profile-v1';
const SETTINGS_KEY = 'club-time-settings-v1';

const starterClubs = [
  { id: 'sample-art', name: 'Creative Makers', summary: 'A welcoming place to try art, crafts, and small creative projects.', conclusion: 'I am a welcoming place to try art, crafts, and small creative projects.', whoItsFor: 'Students who like making things or want to try something new.', activities: ['Mini art projects', 'Creative challenges', 'Show-and-tell'], timeOfDay: 'Not provided yet', days: 'Not provided yet', duration: 'Not provided yet', classroom: 'Not provided yet', meetingInfo: 'Meeting details should be confirmed with the school.', tags: ['art', 'creative', 'beginner'], unverified: false, approvalStatus: 'approved', sample: true },
  { id: 'sample-coding', name: 'Build with Code', summary: 'Practice problem-solving by making small games and helpful web projects.', conclusion: 'I help students practice problem-solving by making small games and helpful web projects.', whoItsFor: 'Students curious about coding, design, or technology.', activities: ['Beginner coding', 'Project planning', 'Peer help'], timeOfDay: 'Not provided yet', days: 'Not provided yet', duration: 'Not provided yet', classroom: 'Not provided yet', meetingInfo: 'Meeting details should be confirmed with the school.', tags: ['coding', 'technology', 'projects'], unverified: false, approvalStatus: 'approved', sample: true }
];

function loadClubs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : starterClubs;
  } catch { return starterClubs; }
}

function saveClubs(clubs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clubs));
}

function loadSearchProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
    return {
      interests: Array.isArray(saved?.interests) ? saved.interests.slice(0, 12) : [],
      searchedClubIds: Array.isArray(saved?.searchedClubIds) ? saved.searchedClubIds.slice(0, 20) : []
    };
  } catch { return { interests: [], searchedClubIds: [] }; }
}

function saveSearchProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    interests: profile.interests.slice(0, 12),
    searchedClubIds: profile.searchedClubIds.slice(0, 20)
  }));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return {
      username: typeof saved?.username === 'string' ? saved.username.slice(0, 40) : '',
      school: typeof saved?.school === 'string' ? saved.school.slice(0, 120) : '',
      address: typeof saved?.address === 'string' ? saved.address.slice(0, 160) : '',
      interests: typeof saved?.interests === 'string' ? saved.interests.slice(0, 200) : '',
      preferredTime: typeof saved?.preferredTime === 'string' ? saved.preferredTime.slice(0, 60) : ''
    };
  } catch { return { username: '', school: '', address: '', interests: '', preferredTime: '' }; }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    username: String(settings.username || '').trim().slice(0, 40),
    school: String(settings.school || '').trim().slice(0, 120),
    address: String(settings.address || '').trim().slice(0, 160),
    interests: String(settings.interests || '').trim().slice(0, 200),
    preferredTime: String(settings.preferredTime || '').trim().slice(0, 60)
  }));
}

function rememberSearch(query, matchedClubs = []) {
  const cleanQuery = String(query || '').trim().toLowerCase().slice(0, 80);
  if (cleanQuery.length < 2) return;
  const profile = loadSearchProfile();
  profile.interests = [cleanQuery, ...profile.interests.filter(item => item !== cleanQuery)];
  profile.searchedClubIds = [...matchedClubs.map(club => club.id), ...profile.searchedClubIds]
    .filter((id, index, ids) => id && ids.indexOf(id) === index);
  saveSearchProfile(profile);
}

function addClub(club) {
  const clubs = loadClubs();
  const savedClub = { ...club, id: `club-${Date.now()}`, approvalStatus: 'pending', savedAt: new Date().toISOString() };
  saveClubs([savedClub, ...clubs]);
  return savedClub;
}

function deleteClub(id) {
  const remaining = loadClubs().filter(club => club.id !== id);
  saveClubs(remaining);
  return remaining;
}

function resetClubs() { saveClubs(starterClubs); return starterClubs; }

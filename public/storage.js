const STORAGE_KEY = 'club-time-clubs-v1';

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

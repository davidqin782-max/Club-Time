const fs = require('fs');
const path = require('path');

function getApiKey() {
  const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const line = env.split(/\r?\n/).find(item => item.startsWith('OPENAI_API_KEY='));
  return line ? line.slice('OPENAI_API_KEY='.length).trim() : '';
}

function getBrief() {
  return fs.readFileSync(path.join(__dirname, 'BRIEF.md'), 'utf8');
}

function parseJson(text) {
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(clean);
}

async function organizeClub(description) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'paste-your-key-here') throw new Error('Missing OpenAI key');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-5.6-luna',
      messages: [
        { role: 'system', content: `${getBrief()}\n\nSafety additions for Club Time: Do not invent school approval, meeting facts, or promises. Keep language kind. Treat every submitted club as unverified until a student or school adult checks it. Never silently change the user's facts; summarize only what is provided and clearly label suggestions. Return only valid JSON with these keys: name, summary, whoItsFor, activities, meetingInfo, tags.` },
        { role: 'user', content: `Organize this club description for the Club Time page. Keep it friendly and detailed, but concise. Description:\n${description}` }
      ],
    })
  });
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('The AI returned no answer');
  const club = parseJson(text);
  return { ...club, originalDescription: description, unverified: true };
}

module.exports = { organizeClub };

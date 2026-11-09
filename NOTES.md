## Club Time notes

### How to run it

1. Make sure your real `OPENAI_API_KEY` is in `.env`.
2. Run: `npm start`
3. Open http://localhost:3000 in a browser.

### Done

- Version 1 has a simple publish flow: enter one club description, ask the AI to organize it, review the result as a club card, and search saved clubs.
- The local server reads the key from `.env` and calls `gpt-5.6-luna`; the key is never sent to the page.
- Tested the real publish flow successfully: the AI organized a made-up photography club, the page showed “Thinking…”, and the result saved locally.
- Added an optional “Find with AI” search action that matches the meaning of a student's words to saved club interests; normal typing search stays instant and local.
- Normal search also understands partial words, so searching `create` finds “Creative Makers” immediately.
- Club cards now show a first-person conclusion plus time of day, day(s), duration, and classroom; missing details say “Not provided yet.”
- Publisher-created clubs can now be deleted through two confirmations: “Are you sure?” and “Are you for real?”
- Added gentle entrance, hover, focus, card, button, search, modal, and safety animations with reduced-motion support.
- New publisher clubs now start as “Awaiting adult approval” and are clearly marked until a school adult reviews them.
- Unsafe requests that try to ignore school rules now show a clear popup explaining what to fix.
- The layout now has three top navigation pages: Find Clubs, Publish a Club, and Safety & About.
- Page changes now animate down and out, then up and in, with reduced-motion support.
- Removed the old Publish and Safety page entrance animations while keeping their visual styling and the shared page transition.
- Removed the old Find Clubs entrance animations while keeping its visual styling and the shared page transition.
- Changed the main Find Clubs headline to use the Redaction 50 font.
- Simplified the visible wording and set titles to Redaction 20 with explanation text in Redaction 50.
- Applied the font rule across the app: bigger text uses Redaction 20 and smaller text uses Redaction 50.
- Added the Club Time image as the browser tab icon.
- Updated the tab icon with a transparent background and larger Club Time lettering.
- Enlarged the tab icon lettering to fill the square and removed the decorative plus signs for readability.
- Added a white tab-icon background and darkened the top lettering so it stays easy to see.
- Find Clubs is grouped into one page container so its transition plays only once.
- Clubs save in browser localStorage through `storage.js`, with made-up sample clubs and no real people.
- Every submitted club is labeled unverified, with a reminder to check school details before trusting it.
- Saves on this computer only for now.

### Maybe Later

- Add school sign-in and a school-adult approval flow.
- Replace localStorage with a real database.
- Add filters for grade, time, location, and accessibility.
- Add a report button and a stronger review queue for suspicious clubs.
- Prepare the written entry PDF and short video storyboard.

### Next

- Test with a few middle-school students and revise the questions based on what is confusing.

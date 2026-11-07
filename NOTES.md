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

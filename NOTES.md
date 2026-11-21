## Club Time notes

### How to run it

1. Make sure your real `KEYGEN_URL` and `KEYGEN_TOKEN` are in `.env`.
2. Run: `npm start`
3. Open http://localhost:3000 in a browser.

### Done

- Version 1 has a simple publish flow: enter one club description, ask the AI to organize it, review the result as a club card, and search saved clubs.
- The local server uses server-only `getKey()` to get a temporary key from MindDo and calls `gpt-5.6-luna`; the key is never sent to the page.
- Tested the real publish flow successfully: the AI organized a made-up photography club, the page showed “Thinking…”, and the result saved locally.
- Re-verified the full MVP flow with MindDo `getKey()` and OpenAI: a made-up photography club produced a short summary, first-person conclusion, and publisher details in the browser.
- Added an optional “Find with AI” search action that matches the meaning of a student's words to saved club interests; normal typing search stays instant and local.
- Normal search understands partial words, so searching `create` finds “Creative Makers” immediately.
- If the AI search service is temporarily unavailable, Club Time shows local matches instead of an empty result, with a clear status message.
- Verified search in the browser: typing `create` returns Creative Makers, and the AI-unavailable fallback keeps that local match visible.
- Club Time now remembers recent searches and matched club IDs in this browser only, then offers AI recommendations from the available Club Time clubs.
- Recommendations use school locations only when publishers provided them; the app does not browse the wider internet or use home addresses. If AI is unavailable, local matches are shown.
- Verified in the browser: searching `art` saved the interest, and “Recommend for me” showed Creative Makers through the safe local fallback when the AI service was unavailable.
- Recommendations now have their own top navigation page and load automatically; the old recommendation button and explanation were removed from Find Clubs.
- Find Clubs now uses numbered pages with four club cards per page, so users can jump to a page quickly when the club list grows.
- Added a Settings page for username, school, school address, favorite interests, and preferred meeting time. Settings save in browser localStorage only.
- Added the provided colorful unicorn image to the Settings page header.
- Added the provided pink bird image beside the unicorn in the Settings page header.
- Adjusted the Settings art layout so the title stays clear and both images remain visible on small screens.
- Added a local profile-picture picker and preview. New clubs save the creator's username and profile picture so it can appear on that club card; images are limited to PNG/JPG/WEBP files up to 500 KB.
- Centered the profile-picture control between the bird and unicorn on the Settings page.
- Made the profile picture larger, added the unicorn as the default picture, and replaced the browser file control with an English “Choose picture” button.
- Club-card top-left badges now show the creator profile picture. Sample clubs use the Club Time icon and the creator name “Club Time Officials.”
- Club cards now label the creator clearly as “Creator username.”
- Settings now saves a language preference with seven popular language choices: English, Spanish, French, Portuguese, Chinese, Hindi, and Arabic.
- Added popular-language UI labels for English, Spanish, French, Portuguese, Chinese, Hindi, and Arabic. Redaction stays first with readable system fallbacks for scripts it cannot display; club descriptions and AI-generated card text are not automatically translated yet.
- The language setting is now one button that opens the seven popular-language choices.
- Find Clubs search now checks club name, interests, description, school, and school address. The language button is larger and uses the blue Club Time theme.
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
- After each save point, push it to GitHub.
- Vercel setup: connect this GitHub repository, keep the project root as the root directory, and leave the build command blank. Vercel serves the page files and the `api/organize.js` and `api/search.js` server functions automatically.
- Vercel environment settings: add `KEYGEN_URL` and `KEYGEN_TOKEN` for Production, Preview, and Development as needed. Do not commit or upload `.env`.
- Browser files are served from `public/` on Vercel, while the local `server.js` stays available for `npm start`.
- The AI key comes from the server-only `getKey()` helper, which gets a temporary key from MindDo and refreshes it after expiration or an invalid-key response.
- The MindDo key can use the OpenAI model `gpt-5.6-luna`.
- Publish now requires a school and school-address field; those values stay out of the AI prompt and are escaped before display.
- Added basic input-length and control-character checks on the server for school-location fields. This helps prevent malformed or injected content, but school approval, authentication, HTTPS, and rate limits are still needed for stronger online security.

### Maybe Later

- Add school sign-in and a school-adult approval flow.
- Replace localStorage with a real database.
- Add filters for grade, time, location, and accessibility.
- Add a report button and a stronger review queue for suspicious clubs.
- Prepare the written entry PDF and short video storyboard.

### Next

- Test with a few middle-school students and revise the questions based on what is confusing.

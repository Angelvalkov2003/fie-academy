# FIE Academy — Interactive Prototype

Clickable prototype of the FIE Academy learning platform, built with **Next.js (App Router) + React + TypeScript** from the design handoff.

## Run it locally

Requirements: **Node.js 20.9 or newer** ([nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

For a faster, production-like run (recommended for a live demo):

```bash
npm run build
npm start
```

## What to click

| Screen              | URL                                                     | Interactions                                                                                                                                                         |
| ------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home — "The Piste"  | `/`                                                     | Hover or Tab through the academies on the piste, click Coach or Refereeing, click the FIE Updates ticker to jump to the updates list                                 |
| Coach academy       | `/coach/sabre/lessons`                                  | Switch weapon (Épée / Foil / Sabre) and section (Lessons / Tactics / Behaviour); the URL updates                                                                     |
| Lesson reading page | `/refereeing/intermediate/referee-gestures/halt-signal` | Expand/collapse curriculum levels, switch lessons in the sidebar, Previous / Next, "On this page" scroll-spy, live reading progress, play/seek the placeholder video |
| Unopened academies  | `/event-manager`, `/semi-technical`, `/administration`  | "Opens in 2027" placeholder                                                                                                                                          |

Responsive: the top tabs collapse into a menu below ~960px; on the lesson page the right sidebar hides below ~1100px and the curriculum becomes a drawer below ~900px.

## Notes

- All copy, the user profile, updates and rule references are placeholder content from the handoff.
- The FIE logo, videos and diagrams are placeholders.
- Not designed yet (and therefore not functional): dark mode, the FR translation, the avatar menu, and Coach lesson detail pages.
- Content lives in `src/lib/data.ts`; styles and design tokens in `src/app/globals.css`.

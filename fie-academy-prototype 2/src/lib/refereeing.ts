// Placeholder content for the demo. Course material, questions, documents and videos will be supplied by the Academy.
import { GESTURE_LESSONS, LEVEL_COLORS, type Lesson } from "./data";

/* --------------------------------- Lessons -------------------------------- */

function brief(
  slug: string,
  title: string,
  standfirst: string,
  overview: string[],
  keypoints: string[],
  ruleRef: string,
  duration: number,
): Lesson {
  return {
    slug,
    title,
    heading: title,
    standfirst,
    video: {
      file: `${slug}.mp4`,
      duration,
      start: 0,
      caption:
        "Placeholder video — final content to be supplied by the Academy.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      ...overview.map((text) => ({ type: "p" as const, text })),
      { type: "keypoints", id: "sec-keypoints", items: keypoints },
    ],
    ruleRef,
  };
}

const DUTIES_LESSONS: Lesson[] = [
  brief(
    "role-of-the-referee",
    "The Role of the Referee",
    "What the referee is responsible for on the piste — from equipment checks to the final handshake.",
    [
      "The referee directs the bout, analyses each phrase, awards touches and applies penalties. They are also responsible for the safety of the fencers and for the correct running of the piste.",
      "Before the bout the referee checks the fencers' equipment, the scoring apparatus and the presence of any assistants. During the bout they keep control of time, score and conduct.",
    ],
    [
      "The referee is the sole authority on the piste for matters of fact.",
      "Safety comes first: halt whenever there is a risk to either fencer.",
      "Check equipment and the apparatus before the first “En garde”.",
    ],
    "t.35–t.42 · FIE Technical Rules, ed. 2024",
    142,
  ),
  brief(
    "ai-in-refereeing",
    "AI Tools in Refereeing",
    "An introduction to AI-assisted analysis — what it can help with, and why the decision always stays with the referee.",
    [
      "AI-assisted tools can help with training: tagging phrases in video, highlighting timing, and building personal libraries of situations to review.",
      "They do not replace the judgement of the referee. On the piste, the referee remains accountable for every decision, and any tool is an aid rather than an authority.",
    ],
    [
      "Use AI analysis to review and learn, not to delegate decisions.",
      "Always understand *why* a tool suggests an outcome.",
      "Final decisions on the piste rest with the referee.",
    ],
    "Academy guidance · draft",
    118,
  ),
  brief(
    "managing-the-bout",
    "Managing the Bout",
    "Time, score and rhythm — keeping control of a direct-elimination bout from first touch to last.",
    [
      "In direct elimination the referee manages three periods, the one-minute breaks and the score. A steady rhythm between phrases keeps both fencers focused and avoids disputes.",
      "Announce the score clearly after each touch and check that the scorer and the apparatus agree before restarting.",
    ],
    [
      "Announce, check, restart — every time.",
      "Keep breaks to exactly one minute.",
      "Do not let the pace of the bout be set by the fencers.",
    ],
    "t.30–t.34 · FIE Technical Rules, ed. 2024",
    156,
  ),
  brief(
    "side-judges-and-video",
    "Side Judges & Video",
    "Working with assistants and the video refereeing protocol.",
    [
      "Assistants help the referee with materiality of hits, actions off the piste and the use of the unarmed hand. The referee may consult them but keeps the final decision.",
      "When video refereeing is available, the referee reviews the phrase, reconstructs it aloud and announces the decision with the usual gestures.",
    ],
    [
      "Consult assistants on fact, not on interpretation.",
      "Reconstruct the phrase aloud after video review.",
      "The decision after review is final.",
    ],
    "t.35–t.37, t.40 · FIE Technical Rules, ed. 2024",
    167,
  ),
  brief(
    "right-of-way-analysis",
    "Right-of-Way Analysis",
    "Reading complex phrases in foil and sabre — attack, parry, riposte and counter-attack.",
    [
      "Right of way decides which action scores when both fencers hit. The referee must identify who established the attack, whether it was parried, and whether a counter-action arrived in time.",
      "At advanced level the difficulty is not the theory but the speed: phrases must be read in real time and described concisely.",
    ],
    [
      "Identify the attack first, then everything that follows it.",
      "A successful parry gives the right of way to the riposte.",
      "Describe the phrase in three or four gestures at most.",
    ],
    "t.56, t.75–t.80 · FIE Technical Rules, ed. 2024",
    188,
  ),
  brief(
    "protests-and-incidents",
    "Protests & Incidents",
    "Handling challenges to decisions, disorder on the piste and incidents involving teams or coaches.",
    [
      "There is no appeal against the referee's judgement on matters of fact. Protests concerning the application of the rules follow the procedure set out in the Technical Rules.",
      "Stay calm, explain the decision briefly and apply penalties consistently. Escalate to the Directoire Technique when required.",
    ],
    [
      "No appeal on matters of fact.",
      "Explain once, clearly; do not debate.",
      "Record incidents accurately for the DT.",
    ],
    "t.122, t.135 · FIE Technical Rules, ed. 2024",
    149,
  ),
  brief(
    "parry-riposte-gestures",
    "Parry & Riposte Gestures",
    "The gestures that make a parry-riposte phrase readable to fencers, coaches and the public.",
    [
      "After the halt the referee indicates the attack, shows the parry with a short beat of the hand, and then indicates the riposte before awarding the touch.",
    ],
    [
      "One gesture per action, in the order the actions happened.",
      "Match each gesture to the side of the fencer it refers to.",
    ],
    "t.56 · FIE Technical Rules, ed. 2024",
    121,
  ),
  brief(
    "video-review-signals",
    "Video Review Signals",
    "Requesting, reviewing and announcing a video decision.",
    [
      "The referee signals a video review clearly, reviews the phrase, and returns to the piste to announce the decision with the standard gestures.",
    ],
    [
      "Make the start of the review visible to everyone.",
      "Announce the outcome with the same gestures as a live decision.",
    ],
    "Video refereeing protocol · 2026",
    97,
  ),
  brief(
    "performance-under-pressure",
    "Performance Under Pressure",
    "Psychological preparation for finals, broadcast bouts and high-stakes decisions.",
    [
      "At the highest level the referee's main opponent is pressure: noise, cameras, coaches and the score. Routines, breathing and a consistent process protect the quality of decisions.",
      "Mistakes will happen. What matters is correcting them when the rules allow, and never compensating later in the bout.",
    ],
    [
      "Build a pre-bout routine and keep it.",
      "Never “make up” for an earlier decision.",
      "Consistency in pools and finals alike.",
    ],
    "Academy guidance · draft",
    204,
  ),
  brief(
    "ai-review-at-elite-events",
    "AI Review at Elite Events",
    "How AI-assisted analysis supports post-event review and referee development.",
    [
      "At elite events, phrase analysis tools can support debriefs and the evaluation of referees. Their output is advisory and must be interpreted by experienced officials.",
    ],
    [
      "AI output is advisory, never binding.",
      "Use it to support debriefs and long-term development.",
    ],
    "Academy guidance · draft",
    131,
  ),
  brief(
    "presence-at-finals",
    "Presence at Finals",
    "Gestures, position and voice when the whole venue — and a broadcast audience — is watching.",
    [
      "In finals, gestures are read by fencers, coaches, spectators and cameras. Position yourself to see both fencers and the apparatus, and make every gesture complete.",
    ],
    [
      "Full, unhurried gestures — nothing half-done.",
      "Keep a position that shows both fencers and the apparatus.",
    ],
    "t.18–t.20, t.56 · FIE Technical Rules, ed. 2024",
    112,
  ),
  brief(
    "team-event-signals",
    "Team Event Signals",
    "Relays, substitutions and score management in team matches.",
    [
      "A team match is fenced in nine relays to 45 touches. The referee manages the relay order, substitutions and the transitions between relays.",
    ],
    [
      "Announce each relay and the target score.",
      "Confirm substitutions with the scorer before restarting.",
    ],
    "t.43–t.49 · FIE Technical Rules, ed. 2024",
    126,
  ),
];

export const LESSONS: Lesson[] = [...GESTURE_LESSONS, ...DUTIES_LESSONS];
export const lessonBySlug = (slug: string) =>
  LESSONS.find((l) => l.slug === slug);

/* --------------------------------- Levels --------------------------------- */

export interface Module {
  slug: string;
  name: string;
  lessons: string[];
}

export interface Level {
  slug: string;
  name: string;
  color: string;
  /** Text-safe variant of `color` (WCAG AA on white). */
  ink: string;
  tint: string;
  tintBorder: string;
  modules: Module[];
}

const GESTURES = "referee-gestures";

export const LEVELS: Level[] = [
  {
    slug: "beginner",
    name: "Beginner",
    color: LEVEL_COLORS.beginner,
    ink: "#1D4ED8",
    tint: "#F0F7FF",
    tintBorder: "#C7DDFE",
    modules: [
      {
        slug: "referee-duties-ai",
        name: "Referee Duties & AI",
        lessons: ["role-of-the-referee", "ai-in-refereeing"],
      },
      {
        slug: GESTURES,
        name: "Referee Gestures",
        lessons: ["salute-and-mask", "en-garde-ready-fence", "halt-signal"],
      },
    ],
  },
  {
    slug: "intermediate",
    name: "Intermediate",
    color: LEVEL_COLORS.intermediate,
    ink: "#2563EB",
    tint: "#EFF6FF",
    tintBorder: "#BFDBFE",
    modules: [
      {
        slug: "referee-duties",
        name: "Referee Duties",
        lessons: ["managing-the-bout", "side-judges-and-video"],
      },
      {
        slug: GESTURES,
        name: "Referee Gestures",
        lessons: ["attack-and-point-awarded", "penalty-cards"],
      },
    ],
  },
  {
    slug: "advanced",
    name: "Advanced",
    color: LEVEL_COLORS.advanced,
    ink: "#1E3A8A",
    tint: "#EEF2FF",
    tintBorder: "#C7D2FE",
    modules: [
      {
        slug: "referee-duties",
        name: "Referee Duties",
        lessons: ["right-of-way-analysis", "protests-and-incidents"],
      },
      {
        slug: GESTURES,
        name: "Referee Gestures",
        lessons: ["parry-riposte-gestures", "video-review-signals"],
      },
    ],
  },
  {
    slug: "high-level-performance",
    name: "High-Level Performance",
    color: LEVEL_COLORS.highLevel,
    ink: "#0F172A",
    tint: "#F1F5F9",
    tintBorder: "#CBD5E1",
    modules: [
      {
        slug: "referee-duties-psychology-ai",
        name: "Referee Duties, Psychology & AI",
        lessons: ["performance-under-pressure", "ai-review-at-elite-events"],
      },
      {
        slug: GESTURES,
        name: "Referee Gestures",
        lessons: ["presence-at-finals", "team-event-signals"],
      },
    ],
  },
];

export const levelBySlug = (slug: string) =>
  LEVELS.find((l) => l.slug === slug);
export const lessonKey = (level: string, module: string, lesson: string) =>
  `${level}/${module}/${lesson}`;
export const levelLessonKeys = (lv: Level) =>
  lv.modules.flatMap((m) =>
    m.lessons.map((l) => lessonKey(lv.slug, m.slug, l)),
  );
export const lessonHref = (level: string, module: string, lesson: string) =>
  `/refereeing/courses/${level}/${module}/${lesson}`;

export const TEST_SIZE = 10;
export const PASS_MARK = 0.8;

/* -------------------------------- Questions ------------------------------- */

export interface Question {
  id: string;
  level: string;
  type: "single" | "truefalse";
  prompt: string;
  /** For true/false questions: ["True", "False"]. */
  options: string[];
  answer: number;
  explanation: string;
}

const q = (
  id: string,
  level: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): Question => ({
  id,
  level,
  type: "single",
  prompt,
  options,
  answer,
  explanation,
});

const tf = (
  id: string,
  level: string,
  prompt: string,
  isTrue: boolean,
  explanation: string,
): Question => ({
  id,
  level,
  type: "truefalse",
  prompt,
  options: ["True", "False"],
  answer: isTrue ? 0 : 1,
  explanation,
});

const B = "beginner";
const I = "intermediate";
const A = "advanced";
const H = "high-level-performance";

export const SEED_QUESTIONS: Question[] = [
  q(
    "b01",
    B,
    "In which language are refereeing commands given at FIE competitions?",
    [
      "French",
      "English",
      "The host country's language",
      "The language chosen by the fencers",
    ],
    0,
    "Commands are given in French at all FIE competitions.",
  ),
  q(
    "b02",
    B,
    "What is the correct order of the commands that start a phrase?",
    [
      "En garde · Prêts? · Allez!",
      "Prêts? · En garde · Allez!",
      "Allez! · En garde · Prêts?",
      "En garde · Allez! · Prêts?",
    ],
    0,
    "“En garde”, “Prêts?”, “Allez!” form a single, steady rhythm.",
  ),
  q(
    "b03",
    B,
    "Which command stops the action?",
    ["Halte!", "Stop!", "Fini!", "Arrêt!"],
    0,
    "The referee calls “Halte!” while raising one arm.",
  ),
  tf(
    "b04",
    B,
    "The referee may lower the halt arm before both fencers have stopped.",
    false,
    "Hold the arm raised until both fencers have visibly stopped.",
  ),
  q(
    "b05",
    B,
    "In which weapon is the whole body valid target?",
    ["Épée", "Foil", "Sabre", "All three weapons"],
    0,
    "In épée the entire body, including mask and feet, is valid target.",
  ),
  q(
    "b06",
    B,
    "What is the valid target in foil?",
    [
      "The trunk (covered by the lamé)",
      "The whole body",
      "Everything above the waist, including arms and head",
      "The arms only",
    ],
    0,
    "Foil target is limited to the trunk.",
  ),
  q(
    "b07",
    B,
    "What is the valid target in sabre?",
    [
      "Everything above the waist, including arms and mask",
      "The trunk only",
      "The whole body",
      "The mask only",
    ],
    0,
    "Sabre target is everything above the waist.",
  ),
  q(
    "b08",
    B,
    "What does a yellow card signify?",
    [
      "A warning",
      "A penalty touch",
      "Exclusion from the competition",
      "Loss of the bout",
    ],
    0,
    "A yellow card is a warning valid for the bout.",
  ),
  tf(
    "b09",
    B,
    "Before the bout, fencers salute their opponent, the referee and the public.",
    true,
    "The salute is compulsory; refusal is penalised.",
  ),
  tf(
    "b10",
    B,
    "AI-assisted tools can replace the referee's decision on the piste.",
    false,
    "AI tools support training and review; decisions rest with the referee.",
  ),
  q(
    "b11",
    B,
    "A pool bout ends when a fencer reaches…",
    [
      "5 touches or 3 minutes have elapsed",
      "15 touches",
      "10 touches",
      "5 minutes have elapsed",
    ],
    0,
    "Pool bouts are fenced to 5 touches in 3 minutes.",
  ),
  q(
    "b12",
    B,
    "A fencer leaves the side of the piste with both feet. The referee…",
    [
      "Calls “Halte!”",
      "Lets the phrase continue",
      "Awards a touch to the opponent immediately",
      "Shows a red card",
    ],
    0,
    "Leaving the piste with both feet stops the action.",
  ),
  q(
    "i01",
    I,
    "A direct-elimination individual bout is fenced to…",
    [
      "15 touches, in three periods of 3 minutes",
      "10 touches in 6 minutes",
      "5 touches in 3 minutes",
      "45 touches in nine relays",
    ],
    0,
    "DE bouts: 15 touches, three periods of 3 minutes.",
  ),
  q(
    "i02",
    I,
    "How long is the break between periods?",
    ["1 minute", "30 seconds", "2 minutes", "3 minutes"],
    0,
    "There is a one-minute break between periods.",
  ),
  q(
    "i03",
    I,
    "In foil and sabre, before awarding a touch the referee should…",
    [
      "Describe the phrase",
      "Ask the fencers what happened",
      "Consult the coaches",
      "Wait for the scoring lights to reset",
    ],
    0,
    "Describe first, decide second.",
  ),
  q(
    "i04",
    I,
    "What does a black card signify?",
    ["Exclusion", "A warning", "A penalty touch", "A medical time-out"],
    0,
    "A black card excludes the offender.",
  ),
  tf(
    "i05",
    I,
    "In épée, both fencers can be awarded a touch at the same time.",
    true,
    "Épée has no right of way; a double touch is possible.",
  ),
  tf(
    "i06",
    I,
    "Right of way applies in épée.",
    false,
    "Right of way applies only in foil and sabre.",
  ),
  q(
    "i07",
    I,
    "A fencer crosses the rear limit of the piste with both feet. What follows?",
    [
      "A touch is awarded against that fencer",
      "The bout restarts at the centre",
      "A yellow card",
      "Nothing; the action continues",
    ],
    0,
    "Crossing the rear limit with both feet concedes a touch.",
  ),
  q(
    "i08",
    I,
    "How does the referee signal the point awarded?",
    [
      "Raises the arm on the side of the scoring fencer",
      "Points at the scoring apparatus",
      "Raises both arms",
      "Taps the mask of the scoring fencer",
    ],
    0,
    "The arm on the side of the scoring fencer is raised, palm forward.",
  ),
  q(
    "i09",
    I,
    "A penalty card is shown towards…",
    ["The penalised fencer", "The public", "The scorer", "The opposing coach"],
    0,
    "Show the card towards the penalised fencer.",
  ),
  tf(
    "i10",
    I,
    "The referee should check the scorer has recorded a penalty before restarting.",
    true,
    "Confirm the record before the next “En garde”.",
  ),
  q(
    "i11",
    I,
    "In foil, both fencers hit simultaneously and neither had right of way. The referee…",
    [
      "Awards no touch",
      "Awards a touch to both",
      "Awards the touch to the fencer who moved first",
      "Shows a yellow card to both",
    ],
    0,
    "Simultaneous actions in foil and sabre: no touch.",
  ),
  q(
    "i12",
    I,
    "What is the length of an FIE piste between the rear limits?",
    ["14 m", "12 m", "18 m", "10 m"],
    0,
    "The piste is 14 m long between rear limits.",
  ),
  q(
    "a01",
    A,
    "An attack is…",
    [
      "The initial offensive action made by extending the arm and continuously threatening the target",
      "Any forward movement of the feet",
      "The action that follows a parry",
      "Any action that scores",
    ],
    0,
    "Definition from the Technical Rules.",
  ),
  q(
    "a02",
    A,
    "After a successful parry, which action has the right of way?",
    [
      "The riposte",
      "The remise of the attack",
      "Neither",
      "Whichever lands first",
    ],
    0,
    "The parry gives the right of way to the riposte.",
  ),
  tf(
    "a03",
    A,
    "Against a correct point-in-line, the attacker must first deflect the opponent's blade.",
    true,
    "The line has priority until the blade is deflected.",
  ),
  tf(
    "a04",
    A,
    "An action begun after the command “Halte!” can still score.",
    false,
    "Only actions begun before the halt are considered.",
  ),
  q(
    "a05",
    A,
    "Who makes the final decision after a video review?",
    [
      "The referee",
      "The fencers' coaches",
      "The Directoire Technique",
      "The video operator",
    ],
    0,
    "The referee announces the final decision.",
  ),
  q(
    "a06",
    A,
    "An appeal against the referee's judgement on a matter of fact is…",
    [
      "Not allowed",
      "Allowed once per bout",
      "Allowed only in team events",
      "Decided by the DT",
    ],
    0,
    "There is no appeal on matters of fact.",
  ),
  tf(
    "a07",
    A,
    "Corps-à-corps in foil leads the referee to halt the bout.",
    true,
    "In foil and sabre, corps-à-corps stops the action.",
  ),
  q(
    "a08",
    A,
    "In sabre, a forward cross of the legs is…",
    [
      "Penalised",
      "Allowed during an attack",
      "Allowed when retreating",
      "Only penalised in team events",
    ],
    0,
    "Forward crossing in sabre is a penalised offence.",
  ),
  q(
    "a09",
    A,
    "A remise is…",
    [
      "A renewal of the attack without withdrawing the arm",
      "A new attack after returning to en garde",
      "A parry followed by a riposte",
      "A counter-attack into the preparation",
    ],
    0,
    "The remise renews the attack immediately.",
  ),
  q(
    "a10",
    A,
    "In sabre, two simultaneous attacks both arrive. The referee…",
    [
      "Awards no touch",
      "Awards a touch to each",
      "Gives the touch to the faster fencer",
      "Asks for video review",
    ],
    0,
    "Simultaneous actions: neither scores.",
  ),
  tf(
    "a11",
    A,
    "The referee may consult assistants on the materiality of a hit.",
    true,
    "Assistants help with matters of fact.",
  ),
  q(
    "a12",
    A,
    "When describing a complex phrase, the referee should use…",
    [
      "Three or four concise gestures",
      "A full verbal explanation first",
      "As many gestures as there were actions",
      "No gestures, only the verdict",
    ],
    0,
    "Keep the description short and readable.",
  ),
  q(
    "h01",
    H,
    "Which practice best protects decision quality in a final?",
    [
      "A consistent pre-bout routine and controlled breathing",
      "Changing approach for the final",
      "Letting the fencers set the pace",
      "Avoiding eye contact with the fencers",
    ],
    0,
    "Routines keep decisions consistent under pressure.",
  ),
  q(
    "h02",
    H,
    "A fencer aggressively contests a decision. The referee should…",
    [
      "Stay calm, explain briefly and apply the rules consistently",
      "Reconsider the decision to calm the fencer",
      "Ignore the fencer entirely",
      "Immediately show a black card",
    ],
    0,
    "Explain once, clearly; apply penalties consistently.",
  ),
  tf(
    "h03",
    H,
    "Being more lenient in a final than in the pools is good practice.",
    false,
    "Consistency is expected at every stage.",
  ),
  q(
    "h04",
    H,
    "AI-assisted phrase analysis at elite events should be used…",
    [
      "As support for review and development; the referee remains accountable",
      "To overrule the referee in real time",
      "Only by the fencers' coaches",
      "To replace video review",
    ],
    0,
    "AI output is advisory.",
  ),
  tf(
    "h05",
    H,
    "AI-generated phrase analysis is binding on the referee.",
    false,
    "AI output is never binding.",
  ),
  q(
    "h06",
    H,
    "A team match is fenced to…",
    [
      "45 touches over nine relays",
      "15 touches over three periods",
      "30 touches over six relays",
      "5 touches per relay, unlimited relays",
    ],
    0,
    "Nine relays, to a maximum of 45 touches.",
  ),
  q(
    "h07",
    H,
    "Each relay in a team match lasts…",
    [
      "3 minutes, or until the score reaches the next multiple of 5",
      "1 minute",
      "Until 5 touches are scored by each team",
      "5 minutes",
    ],
    0,
    "A relay ends at 3 minutes or at the next multiple of 5.",
  ),
  tf(
    "h08",
    H,
    "The referee's position should allow a full view of both fencers and the scoring apparatus.",
    true,
    "Positioning is the foundation of every decision.",
  ),
  q(
    "h09",
    H,
    "Why does gesture consistency matter most in finals?",
    [
      "Fencers, cameras and the public read the decision from the gestures",
      "Gestures replace the verbal decision",
      "It shortens the bout",
      "It is only required in finals",
    ],
    0,
    "Gestures make the decision readable to everyone.",
  ),
  q(
    "h10",
    H,
    "Confirmation bias in refereeing is…",
    [
      "Interpreting new information to confirm an earlier judgement",
      "Checking decisions with the assistants",
      "Using video to confirm a touch",
      "Confirming the score with the scorer",
    ],
    0,
    "Be aware of it, especially late in a bout.",
  ),
  q(
    "h11",
    H,
    "After a decision is corrected on video, the referee should…",
    [
      "Move on without compensating later",
      "Give the other fencer the next close call",
      "Apologise to both coaches",
      "Ask the DT to replace them",
    ],
    0,
    "Never make “make-up” calls.",
  ),
  q(
    "h12",
    H,
    "Fatigue over a long competition day is best managed by…",
    [
      "Rotation, hydration and short recovery breaks",
      "Refereeing faster",
      "Skipping breaks to stay focused",
      "Relying on video for every touch",
    ],
    0,
    "Plan recovery as part of the day.",
  ),
];

/* ------------------------------- Rules & docs ------------------------------ */

export type RuleCategory = "technical" | "administrative" | "organization";
export const RULE_CATEGORIES: RuleCategory[] = [
  "technical",
  "administrative",
  "organization",
];

export interface RuleDoc {
  id: string;
  title: string;
  category: RuleCategory;
  edition: string;
  pages: number;
  sizeMb: number;
  file: string;
}

export const SEED_DOCUMENTS: RuleDoc[] = [
  {
    id: "d1",
    title: "Technical Rules",
    category: "technical",
    edition: "2024",
    pages: 112,
    sizeMb: 2.4,
    file: "fie-technical-rules-2024.pdf",
  },
  {
    id: "d2",
    title: "Material Rules",
    category: "technical",
    edition: "2024",
    pages: 96,
    sizeMb: 5.1,
    file: "fie-material-rules-2024.pdf",
  },
  {
    id: "d3",
    title: "Refereeing Gestures Handbook",
    category: "technical",
    edition: "2025",
    pages: 38,
    sizeMb: 8.7,
    file: "fie-referee-gestures-2025.pdf",
  },
  {
    id: "d4",
    title: "Video Refereeing Protocol",
    category: "technical",
    edition: "2026",
    pages: 14,
    sizeMb: 0.9,
    file: "fie-video-protocol-2026.pdf",
  },
  {
    id: "d5",
    title: "Statutes",
    category: "administrative",
    edition: "2024",
    pages: 44,
    sizeMb: 1.2,
    file: "fie-statutes-2024.pdf",
  },
  {
    id: "d6",
    title: "Administrative Rules",
    category: "administrative",
    edition: "2024",
    pages: 58,
    sizeMb: 1.6,
    file: "fie-administrative-rules-2024.pdf",
  },
  {
    id: "d7",
    title: "Disciplinary Code",
    category: "administrative",
    edition: "2023",
    pages: 26,
    sizeMb: 0.7,
    file: "fie-disciplinary-code-2023.pdf",
  },
  {
    id: "d8",
    title: "Organisation Rules",
    category: "organization",
    edition: "2024",
    pages: 64,
    sizeMb: 1.9,
    file: "fie-organisation-rules-2024.pdf",
  },
  {
    id: "d9",
    title: "Competition Handbook for LOCs",
    category: "organization",
    edition: "2025",
    pages: 72,
    sizeMb: 3.3,
    file: "fie-loc-handbook-2025.pdf",
  },
];

export interface RuleSection {
  ref: string;
  title: string;
  summary: string;
  docId: string;
}

export const RULE_SECTIONS: Record<RuleCategory, RuleSection[]> = {
  technical: [
    {
      ref: "t.1–t.17",
      title: "The field of play and fencing time",
      summary:
        "Dimensions and markings of the piste, the fencing time, and the definition of the bout.",
      docId: "d1",
    },
    {
      ref: "t.18–t.34",
      title: "Conduct of the bout",
      summary:
        "Salute, commands, starting and stopping the bout, duration and the number of touches.",
      docId: "d1",
    },
    {
      ref: "t.35–t.49",
      title: "Refereeing and judging",
      summary:
        "Duties of the referee, assistants, video refereeing and team events.",
      docId: "d1",
    },
    {
      ref: "t.56–t.80",
      title: "Conventions of foil and sabre",
      summary:
        "Right of way, the attack, the parry and riposte, counter-attacks and their judgement.",
      docId: "d1",
    },
    {
      ref: "t.114–t.120",
      title: "Penalties",
      summary: "Groups of offences and the cards that apply to each.",
      docId: "d1",
    },
  ],
  administrative: [
    {
      ref: "Art. 1–12",
      title: "Membership and affiliation",
      summary:
        "National federations, membership obligations and affiliation procedures.",
      docId: "d5",
    },
    {
      ref: "A.1–A.20",
      title: "Licences and eligibility",
      summary: "FIE licences, nationality and eligibility to compete.",
      docId: "d6",
    },
    {
      ref: "D.1–D.15",
      title: "Disciplinary procedure",
      summary: "Bodies, procedures and sanctions for disciplinary matters.",
      docId: "d7",
    },
  ],
  organization: [
    {
      ref: "o.1–o.30",
      title: "Calendar and competition formulas",
      summary: "The FIE calendar, competition categories and formulas.",
      docId: "d8",
    },
    {
      ref: "o.31–o.60",
      title: "Directoire Technique",
      summary: "Composition, responsibilities and powers of the DT.",
      docId: "d8",
    },
    {
      ref: "LOC 1–9",
      title: "Local Organising Committee",
      summary:
        "Venue, equipment, accreditation and services required from the LOC.",
      docId: "d9",
    },
  ],
};

/* --------------------------- Rules & Interpretation ------------------------ */

export interface Interpretation {
  slug: string;
  ref: string;
  title: string;
  rule: string;
  interpretation: string[];
  video?: { file: string; duration: number; caption: string };
  /** lessonHref() targets of related course lessons. */
  related: { level: string; module: string; lesson: string }[];
}

export const INTERPRETATIONS: Interpretation[] = [
  {
    slug: "t32-halt",
    ref: "t.32",
    title: "Stopping the bout",
    rule: "The referee stops the bout with the command “Halte!”. Any action begun after the command is not valid.",
    interpretation: [
      "The decisive question is when the action *began*, not when it arrived. A hit that lands after “Halte!” but was launched before it may still be considered.",
      "Referees should call the halt the moment the phrase becomes unreadable rather than waiting to “see more”.",
    ],
    video: {
      file: "interpretation-t32-halt.mp4",
      duration: 96,
      caption: "Three situations: early halt, correct halt, late halt.",
    },
    related: [{ level: "beginner", module: GESTURES, lesson: "halt-signal" }],
  },
  {
    slug: "t56-attack",
    ref: "t.56",
    title: "Definition of the attack",
    rule: "The attack is the initial offensive action made by extending the arm and continuously threatening the opponent's target.",
    interpretation: [
      "In sabre, the arm and the feet must work together; an attack that stops is no longer an attack.",
      "The referee must judge the *continuity* of the threat, not only the extension of the arm.",
    ],
    video: {
      file: "interpretation-t56-attack.mp4",
      duration: 142,
      caption: "Foil and sabre examples, slowed down and annotated.",
    },
    related: [
      {
        level: "intermediate",
        module: GESTURES,
        lesson: "attack-and-point-awarded",
      },
      {
        level: "advanced",
        module: "referee-duties",
        lesson: "right-of-way-analysis",
      },
    ],
  },
  {
    slug: "t76-parry-riposte",
    ref: "t.76",
    title: "Parry and riposte",
    rule: "After a successful parry, the riposte has the right of way.",
    interpretation: [
      "A parry is successful when it deflects the opponent's blade sufficiently to prevent the attack from arriving.",
      "A delayed riposte may lose the right of way to a remise.",
    ],
    video: {
      file: "interpretation-t76-parry.mp4",
      duration: 118,
      caption: "Immediate and delayed ripostes compared.",
    },
    related: [
      { level: "advanced", module: GESTURES, lesson: "parry-riposte-gestures" },
    ],
  },
  {
    slug: "t87-corps-a-corps",
    ref: "t.87",
    title: "Corps-à-corps",
    rule: "In foil and sabre, corps-à-corps is forbidden. In épée it is permitted as long as there is no jostling or brutality.",
    interpretation: [
      "Deliberate corps-à-corps, or corps-à-corps to avoid a hit, is penalised.",
      "Amended wording effective 1 January 2027.",
    ],
    related: [],
  },
  {
    slug: "t114-penalties",
    ref: "t.114",
    title: "Penalty groups",
    rule: "Offences are grouped; each group carries its own sequence of penalties.",
    interpretation: [
      "Cards carry over within the bout. The referee must state the offence before showing the card.",
    ],
    video: {
      file: "interpretation-t114-cards.mp4",
      duration: 104,
      caption: "Showing and announcing penalties correctly.",
    },
    related: [
      { level: "intermediate", module: GESTURES, lesson: "penalty-cards" },
    ],
  },
  {
    slug: "t122-appeals",
    ref: "t.122",
    title: "Appeals and judgement of fact",
    rule: "There is no appeal against the referee's judgement on matters of fact.",
    interpretation: [
      "A protest is only possible where the referee is alleged to have misapplied a rule, not where they judged a fact differently.",
    ],
    related: [
      {
        level: "advanced",
        module: "referee-duties",
        lesson: "protests-and-incidents",
      },
    ],
  },
];

/* ------------------------------- Video library ----------------------------- */

export type Weapon = "epee" | "foil" | "sabre";
export const WEAPON_SLUGS: Weapon[] = ["epee", "foil", "sabre"];

export interface LibraryVideo {
  id: string;
  weapon: Weapon;
  title: string;
  topic: string;
  duration: number;
  ruleRef?: string;
}

export const VIDEO_TOPICS = [
  "Right of way",
  "Simultaneous actions",
  "Penalties",
  "Corps-à-corps",
  "Video review",
  "Piste limits",
];

export const SEED_VIDEOS: LibraryVideo[] = [
  {
    id: "v01",
    weapon: "epee",
    title: "Double touches at the end of the bout",
    topic: "Simultaneous actions",
    duration: 184,
  },
  {
    id: "v02",
    weapon: "epee",
    title: "Corps-à-corps without jostling",
    topic: "Corps-à-corps",
    duration: 97,
    ruleRef: "t.87",
  },
  {
    id: "v03",
    weapon: "epee",
    title: "Rear limit and the last metre",
    topic: "Piste limits",
    duration: 121,
  },
  {
    id: "v04",
    weapon: "epee",
    title: "Video review: hit to the foot",
    topic: "Video review",
    duration: 143,
  },
  {
    id: "v05",
    weapon: "epee",
    title: "Covering target with the unarmed hand",
    topic: "Penalties",
    duration: 76,
    ruleRef: "t.114",
  },
  {
    id: "v06",
    weapon: "foil",
    title: "Attack versus counter-attack",
    topic: "Right of way",
    duration: 166,
    ruleRef: "t.56",
  },
  {
    id: "v07",
    weapon: "foil",
    title: "Parry or miss? Reading the blade",
    topic: "Right of way",
    duration: 139,
    ruleRef: "t.76",
  },
  {
    id: "v08",
    weapon: "foil",
    title: "Simultaneous attacks",
    topic: "Simultaneous actions",
    duration: 112,
  },
  {
    id: "v09",
    weapon: "foil",
    title: "Deliberate corps-à-corps",
    topic: "Corps-à-corps",
    duration: 88,
    ruleRef: "t.87",
  },
  {
    id: "v10",
    weapon: "foil",
    title: "Turning the back",
    topic: "Penalties",
    duration: 71,
  },
  {
    id: "v11",
    weapon: "foil",
    title: "Video review under time pressure",
    topic: "Video review",
    duration: 153,
  },
  {
    id: "v12",
    weapon: "sabre",
    title: "Winning the middle: attack in preparation",
    topic: "Right of way",
    duration: 158,
    ruleRef: "t.56",
  },
  {
    id: "v13",
    weapon: "sabre",
    title: "Forward cross and its penalty",
    topic: "Penalties",
    duration: 69,
  },
  {
    id: "v14",
    weapon: "sabre",
    title: "Simultaneous after “Allez!”",
    topic: "Simultaneous actions",
    duration: 117,
  },
  {
    id: "v15",
    weapon: "sabre",
    title: "Point-in-line in sabre",
    topic: "Right of way",
    duration: 134,
  },
  {
    id: "v16",
    weapon: "sabre",
    title: "Off the side of the piste",
    topic: "Piste limits",
    duration: 82,
  },
  {
    id: "v17",
    weapon: "sabre",
    title: "Video review: remise or riposte?",
    topic: "Video review",
    duration: 171,
    ruleRef: "t.76",
  },
];

export const fmtDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

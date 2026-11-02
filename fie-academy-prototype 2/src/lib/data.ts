// All copy is placeholder from the design handoff and must be replaced / validated by the FIE.

export type AcademyStatus = "open" | "live" | "soon";

export interface Branch {
  t: string;
  c?: string;
}

export interface Academy {
  slug: string;
  name: string;
  sub?: string;
  tab: string;
  /** Position on the 18 m strip */
  m: number;
  up: boolean;
  status: AcademyStatus;
  meta: string;
  desc: string;
  branches: Branch[];
  href: string;
  enrolled?: boolean;
  progress?: number;
}

export const LEVEL_COLORS = {
  beginner: "#93C5FD",
  intermediate: "#3B82F6",
  advanced: "#1E3A8A",
  highLevel: "#0F172A",
};

export const ACADEMIES: Academy[] = [
  {
    slug: "coach",
    name: "Coach",
    tab: "Coach",
    m: 4,
    up: true,
    status: "soon",
    meta: "3 weapons · opens 2027",
    desc: "Coaching methodology for épée, foil and sabre: the individual lesson, tactics and athlete behaviour.",
    branches: [{ t: "Épée" }, { t: "Foil" }, { t: "Sabre" }],
    href: "/coach",
  },
  {
    slug: "event-manager",
    name: "Event Manager",
    sub: "DT",
    tab: "Event Manager · DT",
    m: 7,
    up: false,
    status: "soon",
    meta: "12 modules · opens 2027",
    desc: "Running FIE competitions from draw to podium, with the Local Organising Committee.",
    branches: [{ t: "Competition" }, { t: "LOC" }],
    href: "/event-manager",
  },
  {
    slug: "semi-technical",
    name: "Semi-Technical",
    tab: "Semi-Technical",
    m: 9,
    up: true,
    status: "soon",
    meta: "10 modules · opens 2027",
    desc: "Weapon control procedures and the technical set-up of the competition venue.",
    branches: [{ t: "Weapon Control" }, { t: "Venue Equipment" }],
    href: "/semi-technical",
  },
  {
    slug: "refereeing",
    name: "Refereeing",
    tab: "Refereeing",
    m: 11,
    up: false,
    status: "live",
    meta: "4 levels · 8 modules · 4 tests",
    desc: "The International Refereeing Academy. Four progressive levels, FIE rules and interpretations, and a video library by weapon.",
    branches: [
      { t: "Beginner", c: LEVEL_COLORS.beginner },
      { t: "Intermediate", c: LEVEL_COLORS.intermediate },
      { t: "Advanced", c: LEVEL_COLORS.advanced },
      { t: "High-Level Performance", c: LEVEL_COLORS.highLevel },
    ],
    href: "/refereeing",
    enrolled: true,
  },
  {
    slug: "administration",
    name: "Administration",
    tab: "Administration",
    m: 14,
    up: true,
    status: "soon",
    meta: "6 modules · opens 2027",
    desc: "Official correspondence with the FIE and reference information for national federations.",
    branches: [{ t: "Correspondence" }, { t: "Information" }],
    href: "/administration",
  },
];

/* ------------------------------- Refereeing ------------------------------- */

export type Block =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "figure"; file: string; caption: string }
  | { type: "keypoints"; id: string; items: string[] };

export interface Lesson {
  slug: string;
  title: string;
  heading: string;
  standfirst: string;
  video: { file: string; duration: number; start: number; caption: string };
  blocks: Block[];
  ruleRef: string;
}

/** Referee Gestures lessons from the design handoff; assigned to levels in refereeing.ts. */
export const GESTURE_LESSONS: Lesson[] = [
  {
    slug: "salute-and-mask",
    title: "Salute & Mask",
    heading: "Salute & Mask",
    standfirst:
      "The opening ritual of every bout — how the referee invites the salute, checks that both fencers are ready, and signals that masks go on.",
    video: {
      file: "salute-and-mask-demo.mp4",
      duration: 118,
      start: 0,
      caption: "Demonstration filmed at the FIE Refereeing Seminar, Lausanne.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      {
        type: "p",
        text: "Before any action can take place, both fencers salute their opponent, the referee and the public. The referee leads this moment: it sets the tone of the bout and establishes, from the first second, who is in charge of the strip.",
      },
      {
        type: "p",
        text: "A clean, unhurried opening tells the fencers that the bout will be run with *calm authority*. A rushed or uncertain one invites them to test the referee early.",
      },
      { type: "h2", id: "sec-gesture", text: "Executing the gesture" },
      {
        type: "p",
        text: "Stand at the centre of the strip, square to the piste. With an open hand, indicate each fencer in turn, then bring both hands together at chest height to invite the salute. Once both have saluted, signal masks on with a short upward movement of both hands.",
      },
      {
        type: "keypoints",
        id: "sec-keypoints",
        items: [
          "Indicate each fencer clearly before inviting the salute.",
          "Wait until both salutes are complete — never overlap with “En garde”.",
          "A fencer who refuses to salute is penalised under t.87.",
        ],
      },
      { type: "h2", id: "sec-common", text: "Common errors" },
      {
        type: "p",
        text: "Starting the bout while one fencer is still adjusting equipment, and allowing the salute to become a formality rather than a checkpoint. Use this moment to confirm that both fencers, the scoring apparatus and the side judges are ready.",
      },
    ],
    ruleRef: "t.18, t.87 · FIE Technical Rules, ed. 2024",
  },
  {
    slug: "en-garde-ready-fence",
    title: "En Garde · Ready · Fence",
    heading: "En Garde · Ready · Fence",
    standfirst:
      "The three commands that start every phrase of fencing — their order, their rhythm, and the gestures that make them readable from anywhere in the venue.",
    video: {
      file: "en-garde-ready-fence-demo.mp4",
      duration: 134,
      start: 0,
      caption: "Demonstration filmed at the FIE Refereeing Seminar, Lausanne.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      {
        type: "p",
        text: "“En garde”, “Prêts?” and “Allez!” form a single rhythm. The referee places the fencers behind their en garde lines, checks that both are ready, and then releases the bout with a decisive command.",
      },
      { type: "h2", id: "sec-gesture", text: "Executing the gesture" },
      {
        type: "p",
        text: "Extend both arms to the side at shoulder height for “En garde”. Ask “Prêts?” while looking at each fencer in turn. On “Allez!”, bring both arms together in front of the body in a single, sharp movement.",
      },
      {
        type: "figure",
        file: "en-garde-arms-extended.svg",
        caption: "Fig. 4.2 — Arms extended at shoulder height for “En garde”.",
      },
      {
        type: "keypoints",
        id: "sec-keypoints",
        items: [
          "Keep the three commands in a steady, predictable rhythm.",
          "Never say “Allez!” until both fencers have answered or are clearly ready.",
          "The command is in French at all FIE competitions.",
        ],
      },
      { type: "h2", id: "sec-common", text: "Common errors" },
      {
        type: "p",
        text: "An irregular rhythm lets one fencer anticipate the start. Vary nothing: the same tempo, the same voice, every time.",
      },
    ],
    ruleRef: "t.18–t.20 · FIE Technical Rules, ed. 2024",
  },
  {
    slug: "halt-signal",
    title: "Halt Signal",
    heading: "The Halt Signal",
    standfirst:
      "When and how a referee interrupts the bout — the gesture that stops the action, freezes the phrase, and gives the official authority to judge what just occurred.",
    video: {
      file: "halt-signal-demo.mp4",
      duration: 161,
      start: 38,
      caption:
        "Demonstration filmed at the FIE Refereeing Seminar, Lausanne. Note the timing of the call relative to the touch.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      {
        type: "p",
        text: "The halt is the single most consequential gesture a referee makes. It is the moment at which the action of the bout is suspended and the referee assumes full authority over the strip. Everything that follows — the analysis of the phrase, the awarding of a touch, the issuing of a card — depends on a halt that was called at the right instant and signalled without ambiguity.",
      },
      {
        type: "p",
        text: "Called too early, the halt deprives a fencer of a developing action that may have produced a valid touch. Called too late, it allows the bout to continue past the moment the referee needed to freeze, muddying the reconstruction of right-of-way. The skill, therefore, is not merely knowing the gesture but internalising its *timing* — and projecting it with a clarity that leaves no doubt for fencers, the other officials, or the spectators.",
      },
      { type: "h2", id: "sec-when", text: "When to call halt" },
      {
        type: "p",
        text: 'A referee calls "Halt!" in the following circumstances. The verbal command and the raised arm should occur together — the voice carries to the fencers, the gesture to everyone else.',
      },
      {
        type: "ul",
        items: [
          "An apparatus signal registers, or a touch is judged to have arrived on a non-valid surface.",
          "A fencer leaves the strip with both feet, or the action becomes confused and the phrase can no longer be read.",
          "There is a risk to the safety of either fencer — corps-à-corps with jostling, a fall, or broken equipment.",
          "The time limit expires, or the referee needs to administer the match (cards, conferring with side judges, video review).",
        ],
      },
      { type: "h2", id: "sec-gesture", text: "Executing the gesture" },
      {
        type: "p",
        text: 'Raise one arm vertically, hand open, while calling "Halt!" in a firm, projected voice. The arm goes straight up — not angled, not hesitant — and holds until both fencers have visibly stopped. Lowering the arm prematurely invites the fencers to read uncertainty and continue.',
      },
      {
        type: "figure",
        file: "arm-raised-halt-position.svg",
        caption:
          "Fig. 4.3 — Neutral stance, weapon arm lowered, signalling arm fully extended overhead.",
      },
      {
        type: "keypoints",
        id: "sec-keypoints",
        items: [
          "Voice and arm act together — one without the other reads as hesitation.",
          "Hold the arm raised until both fencers have stopped; never lower it early.",
          'Call halt the instant the phrase becomes unreadable — do not wait to "see more".',
          "After halt, reconstruct the action aloud before awarding anything.",
        ],
      },
      { type: "h2", id: "sec-common", text: "Common errors" },
      {
        type: "p",
        text: "The most frequent fault among developing referees is a *soft halt* — a quiet call with a half-raised arm — which fencers learn to ignore. A halt that is not obeyed is not a halt. Equally common is the *late halt*, where the referee, wanting certainty, lets a tangled action run on; by the time the call comes, the evidence needed to judge it has already passed. Train both the decisiveness of the call and the discipline of calling it on time.",
      },
      {
        type: "p",
        text: "In the video examples that follow, watch how senior referees commit fully to each halt — the arm snaps up, the voice carries, and the bout stops cleanly every time.",
      },
    ],
    ruleRef: "t.32–t.35, t.46 · FIE Technical Rules, ed. 2024",
  },
  {
    slug: "attack-and-point-awarded",
    title: "Attack & Point Awarded",
    heading: "Attack & Point Awarded",
    standfirst:
      "Reconstructing the phrase aloud and awarding the touch — the gestures that show everyone who attacked, who was hit, and why.",
    video: {
      file: "attack-point-awarded-demo.mp4",
      duration: 172,
      start: 0,
      caption: "Demonstration filmed at the FIE Refereeing Seminar, Lausanne.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      {
        type: "p",
        text: "After the halt, the referee describes the phrase in sequence and then awards the touch. In foil and sabre, the gestures for attack, parry and riposte make the reasoning visible; the final gesture indicates the fencer who scores.",
      },
      { type: "h2", id: "sec-gesture", text: "Executing the gesture" },
      {
        type: "p",
        text: "Indicate the attacker with a forward movement of the arm on that side. For the point awarded, raise the arm on the side of the scoring fencer, palm facing forward, and announce the touch clearly.",
      },
      {
        type: "keypoints",
        id: "sec-keypoints",
        items: [
          "Describe first, decide second — never award before explaining.",
          "Each gesture must match the side of the fencer it refers to.",
          "Keep the description short: three or four gestures at most.",
        ],
      },
      { type: "h2", id: "sec-common", text: "Common errors" },
      {
        type: "p",
        text: "Awarding the touch before the analysis, or using gestures that contradict the verbal description. Both undermine confidence in the decision.",
      },
    ],
    ruleRef: "t.56, t.76 · FIE Technical Rules, ed. 2024",
  },
  {
    slug: "penalty-cards",
    title: "Penalty Cards",
    heading: "Penalty Cards",
    standfirst:
      "Yellow, red and black — how to show a card so that the fencer, the scorer and the public all understand the offence and its consequence.",
    video: {
      file: "penalty-cards-demo.mp4",
      duration: 149,
      start: 0,
      caption: "Demonstration filmed at the FIE Refereeing Seminar, Lausanne.",
    },
    blocks: [
      { type: "h2", id: "sec-overview", text: "Overview" },
      {
        type: "p",
        text: "Penalties are grouped by offence. The referee names the offence, shows the card towards the penalised fencer, and makes sure the scorer records it before the bout restarts.",
      },
      { type: "h2", id: "sec-gesture", text: "Executing the gesture" },
      {
        type: "p",
        text: "Hold the card high, arm extended towards the fencer, for long enough that it is clearly visible. Announce the offence and, for a red card, the touch awarded to the opponent.",
      },
      {
        type: "keypoints",
        id: "sec-keypoints",
        items: [
          "Name the offence before showing the card.",
          "Show the card towards the penalised fencer, not the public.",
          "Confirm the scorer has recorded the penalty.",
        ],
      },
      { type: "h2", id: "sec-common", text: "Common errors" },
      {
        type: "p",
        text: "Showing a card without explanation, or forgetting that cards carry over within the same bout. Consistency matters more than severity.",
      },
    ],
    ruleRef: "t.114–t.120 · FIE Technical Rules, ed. 2024",
  },
];

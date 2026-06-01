# Attention Training Web App — Full Product & Technical Specification

> **Interdisciplinary synthesis**: cognitive psychology · HCI · web development · Responsible AI  
> **Date**: May 2026  
> **Status**: Pre-prototype design document

---

## PREAMBLE — Framing & Terminology

This document describes a **non-clinical, consumer-oriented** web application for self-directed cognitive engagement. The app does **not** diagnose, treat, or assess any medical or psychological condition. All constructs used are operationally defined within the scope of experimental cognitive psychology.

The term **"brainrot"** is a popular colloquialism with no agreed scientific definition. In this specification it is replaced by well-established, measurable constructs: *sustained attention*, *inhibitory control*, *working memory capacity*, and *resistance to distraction*. These constructs have peer-reviewed measurement instruments; their everyday-life correlates are real but the transfer from lab/browser tasks to real-world outcomes is **limited and must be disclosed**.

---

## SECTION A — Scientific Review

### A.1 Dimensions of Attention Measurable Online

Attention is not a single faculty. The dominant taxonomic framework (Posner & Petersen, 1990; Mirsky et al., 1991; Fan et al., 2002) distinguishes several separable components. The table below rates each for online feasibility.

| Dimension | Definition | Online Feasibility | Primary Constraints |
|---|---|---|---|
| **Sustained Attention (Vigilance)** | Maintaining alert, goal-directed focus over a prolonged period | ★★★★☆ | Requires 5–20 min tasks; engagement/dropout risk |
| **Selective Attention** | Filtering relevant from irrelevant competing stimuli | ★★★★★ | Short trials; well-suited to browser |
| **Inhibitory Control** | Suppressing prepotent or automatic responses | ★★★★★ | Short trials; reliable RT paradigms |
| **Working Memory (WM) Capacity** | Holding and manipulating information in mind | ★★★★☆ | Ceiling effects; strategy variance |
| **Attentional Switching / Cognitive Flexibility** | Shifting between task sets or mental sets | ★★★★☆ | Switch-cost paradigms work online |
| **Processing Speed** | Speed of basic perceptual-motor response | ★★★☆☆ | Browser timing jitter ±1–16 ms; device variability |
| **Divided Attention** | Tracking multiple streams simultaneously | ★★★☆☆ | Dual-task paradigms feasible but noisy |

> **Note on processing speed**: JavaScript `performance.now()` achieves sub-millisecond precision in modern browsers, but keyboard/mouse hardware latency, display refresh rate (60–120 Hz), and OS scheduling introduce 10–50 ms variance. This is acceptable for group-level statistics but not for individual clinical timing norms.

---

### A.2 Validated Cognitive Tests — Browser Adaptation

#### A.2.1 Tests with Established Online Validity

**Psychomotor Vigilance Task (PVT)**
- *Measures*: sustained attention, alertness
- *Paradigm*: respond as fast as possible to an unpredictable stimulus over 5–10 min; lapses (RT > 500 ms) are the key metric
- *Evidence*: Dinges & Powell (1985); extensively validated for sleep deprivation research; online version shows good convergent validity (Basner & Dinges, 2011)
- *Browser limits*: standard 10-min version requires motivation; 3-min briefPVT correlates r ≈ .80 with full version (Basner et al., 2011)

**Flanker Task (Eriksen & Eriksen, 1974)**
- *Measures*: selective attention, inhibitory control, conflict monitoring
- *Paradigm*: respond to central target; flanking distractors are congruent or incongruent
- *Evidence*: Flanker interference effect is robust (d > 1.0); online version shows high test-retest reliability (r ≈ .70–.85; Rouder & Morey, 2009)
- *Browser limits*: minimal; 50–100 trials in ~5 min

**Stroop Color-Word Task (Stroop, 1935)**
- *Measures*: inhibitory control, selective attention, cognitive interference
- *Paradigm*: name ink color while ignoring printed word; interference = slower RT on incongruent trials
- *Evidence*: one of the most replicated effects in psychology; online versions validated (Scarpina & Tagini, 2017)
- *Browser limits*: color rendering must be consistent; colorblind users need alternative version

**Go/No-Go Task**
- *Measures*: response inhibition, impulsivity
- *Paradigm*: respond to Go stimuli, withhold on No-Go; false alarm rate is the primary metric
- *Evidence*: widely used in ADHD research; online version reliable (Bezdjian et al., 2009)
- *Browser limits*: minimal; 150–200 trials recommended for stable estimates

**N-back Task (Kirchner, 1958)**
- *Measures*: working memory updating, attentional control
- *Paradigm*: respond whether current stimulus matches the one N steps back (1-back, 2-back, 3-back)
- *Evidence*: good internal reliability; sensitivity to WM differences; online versions validated (Jaeggi et al., 2010)
- *Browser limits*: requires careful instruction; prone to strategy differences; fatigue effects at 3-back+

**Task Switching Paradigm**
- *Measures*: cognitive flexibility, attentional switching
- *Paradigm*: alternate between two tasks; switch cost (slower RT after switch) is key metric
- *Evidence*: Monsell (2003); online versions show consistent switch costs
- *Browser limits*: cue presentation timing must be precise

**Simple / Choice Reaction Time (Donders, 1868)**
- *Measures*: processing speed, basic alertness
- *Paradigm*: press key as fast as possible to stimulus
- *Evidence*: highly reliable; correlates with general cognitive ability (r ≈ .3–.4; Jensen, 2006)
- *Browser limits*: device-dependent; mobile touchscreens add 40–100 ms latency

---

#### A.2.2 Tests with Weaker or Contested Online Validity

| Test | Issue |
|---|---|
| Trail Making Test | Requires mouse precision; normative data based on paper/pencil |
| Digit Span (verbal) | Microphone access and speech recognition required |
| Attentional Network Test (ANT) | Complex version needs precise cueing; abbreviated versions exist |
| TOVA (Test of Variables of Attention) | Proprietary; standardization requires controlled hardware |

---

### A.3 Cognitive Training — Evidence Summary

This is the most contested area. The key distinction is:

- **Task-specific improvement**: reliably demonstrated; practice always improves performance on the trained task
- **Near transfer**: improvement on structurally similar tasks; moderate evidence
- **Far transfer**: improvement on dissimilar tasks or real-world outcomes; **weak and inconsistent**

| Training Type | Evidence Level | Transfer | Key References |
|---|---|---|---|
| N-back training | Moderate (near transfer) | Weak far transfer | Jaeggi et al. (2008); Au et al. (2015); Melby-Lervåg & Hulme (2013); Simons et al. (2016) |
| Inhibitory control training (Stop-Signal, Go/No-Go) | Moderate | Limited far transfer | Enge et al. (2014); Berkman et al. (2014) |
| Attention Control Training (ACT) | Moderate | Some evidence for sustained attention | MacLean et al. (2010); Jha et al. (2007) |
| Action video games | Moderate for selective attention | Near transfer supported; far transfer mixed | Green & Bavelier (2003, 2012); Powers et al. (2013) |
| Mindfulness-based training | Moderate | Moderate evidence across domains | Jha et al. (2007, 2010); Chiesa et al. (2011) |
| Dual-task training | Weak-to-moderate | Limited | Bherer et al. (2008) |
| General cognitive training (commercial) | Weak | Simons et al. (2016) Psychological Science consensus statement: "limited evidence" | Simons et al. (2016); Melby-Lervåg et al. (2016) |

> **Critical caveat (must be disclosed to users)**: The 2016 Simons et al. consensus paper in *Psychological Science in the Public Interest*, representing 70+ cognitive scientists, concluded that commercial brain training products have not demonstrated reliable far transfer. Lumosity settled a US$2M FTC case in 2016 for misleading claims. This app must not replicate those patterns.

**What the evidence does support**:
1. Practice on specific tasks reliably improves those tasks
2. Short-term engagement and self-monitoring have motivational benefits
3. Attentional capacities correlate with lifestyle factors (sleep, exercise, stress) — these are modifiable
4. The process of self-observation and deliberate practice has intrinsic value even without far transfer

---

## SECTION B — Product Proposal

### B.1 Product Vision

> A personal cognitive engagement tool that helps curious adults understand their attentional tendencies through standardized self-assessments and practice scientifically-grounded attention exercises — with radical transparency about what the data does and does not mean.

---

### B.2 Target Users

**Primary persona: "Reflective Professional"**
- Age 22–45, knowledge worker or student
- Concerned about digital distraction habits
- Motivated by data and self-improvement
- NOT seeking clinical help; NOT expecting medical-grade results

**Excluded use cases**:
- Children under 16 (different normative profiles, safety considerations)
- People seeking ADHD diagnosis or treatment
- Users in acute mental health crises

---

### B.3 User Journey (MVP)

```
[1. Landing Page]
    ↓ "Learn what this is (and isn't)"
[2. Onboarding]
    ↓ Consent + disclaimer acknowledgment
    ↓ Short questionnaire (age, sleep habits, screen habits — self-report only)
[3. Baseline Assessment]  ← ~20 minutes
    ↓ 4 tasks: Flanker + Go/No-Go + 2-back + briefPVT
    ↓ Progress bar + rest prompts
[4. Attention Profile]
    ↓ Radar chart: 4 dimensions
    ↓ Plain-language descriptions (no scores presented as "good/bad")
    ↓ Disclaimer prominently displayed
[5. Daily Training]  ← 10–15 min/day
    ↓ Choose: Selective Attention / Inhibitory Control / WM / Sustained Attention
    ↓ Adaptive difficulty (staircase algorithm)
    ↓ Session summary with performance curve
[6. Progress Dashboard]
    ↓ Longitudinal trends (per dimension)
    ↓ Streak tracking, consistency metrics
    ↓ Periodic re-assessment prompt (every 2 weeks)
[7. Insight Feed]
    ↓ Evidence-based tips on sleep, exercise, environment
    ↓ Clearly labeled as "lifestyle factors with independent evidence"
```

---

### B.4 MVP Feature Set

| Feature | Description | Priority |
|---|---|---|
| Flanker Task | Selective attention baseline | Must-have |
| Go/No-Go Task | Inhibitory control baseline | Must-have |
| 2-back Task | Working memory baseline | Must-have |
| briefPVT (3 min) | Sustained attention baseline | Must-have |
| Attention Profile (radar chart) | Visual summary of 4 dimensions | Must-have |
| User account + progress persistence | Email/password auth | Must-have |
| Daily training sessions (adaptive) | 3 training variants per task | Must-have |
| Longitudinal trend charts | Per-dimension over time | Must-have |
| Onboarding disclaimer | Legally required | Must-have |
| Re-assessment prompts | Every 14 days | Must-have |
| Lifestyle context self-report | Sleep, exercise, stress | Nice-to-have |
| Insight feed | Evidence-based articles | Nice-to-have |
| Streak & achievement system | Engagement/retention | Nice-to-have |
| Export data (CSV) | User data ownership | Nice-to-have |
| Dark mode | Accessibility | Nice-to-have |
| Offline mode (PWA) | Mobile usage | Nice-to-have |

---

### B.5 Scoring Model

#### Guiding Principles
1. **Within-person comparison over time** — never rank against population clinical norms
2. **No diagnostic labels** — "your inhibitory control score improved by 12% over 3 sessions" not "below normal"
3. **Composite scores per dimension** — aggregated from trial-level metrics
4. **Confidence intervals** — always show variability, not just point estimates

#### Per-Task Metrics

**Flanker Task**
```
Flanker Interference Effect (FIE) = mean_RT_incongruent - mean_RT_congruent
Accuracy = (correct_trials / total_trials) × 100
Speed-Accuracy Tradeoff (SAT) = inverse efficiency = mean_RT / proportion_correct
```

**Go/No-Go**
```
False Alarm Rate = false_alarms / total_NoGo_trials
Hit Rate = hits / total_Go_trials
d' (sensitivity) = z(Hit Rate) - z(False Alarm Rate)   [Signal Detection Theory]
```

**2-back**
```
Accuracy = correct_responses / total_trials
d' = z(target_hits / targets) - z(false_alarms / lures)
```

**briefPVT**
```
Median RT (baseline alertness)
Lapse Rate = RT_trials_over_500ms / total_trials
Slowest 10% mean RT (sensitivity to fatigue)
```

#### Composite Dimension Score
```
Within-session: Z-score each metric relative to user's own historical distribution
Composite = weighted average of Z-scored metrics for that dimension
Display as: percentile improvement from personal baseline (not absolute)
```

---

### B.6 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  YOUR ATTENTION PROFILE                    [?] What this means │
├─────────────┬───────────────────────────────────────────┤
│  RADAR CHART│  TREND OVER TIME                          │
│  4 axes:    │  [Line charts per dimension, 30-day view]  │
│  - Sel. Att │                                           │
│  - Inhib.   │                                           │
│  - WM       │                                           │
│  - Sustained│                                           │
├─────────────┴───────────────────────────────────────────┤
│  RECENT SESSIONS           STREAK: 7 days               │
│  [Session cards with date, tasks, completion %]         │
├─────────────────────────────────────────────────────────┤
│  ⚠ IMPORTANT: Scores reflect your performance on these  │
│  specific tasks. They are not diagnostic measures.      │
└─────────────────────────────────────────────────────────┘
```

---

### B.7 Level Progression System

**Adaptive Difficulty (1-up/2-down staircase)**
- If accuracy > 85% for 3 consecutive blocks → increase difficulty
- If accuracy < 70% → decrease difficulty
- Target difficulty: 75–80% accuracy (zone of proximal development)

**Difficulty parameters per task**:
- Flanker: SOA (stimulus onset asynchrony), proportion incongruent trials
- Go/No-Go: proportion NoGo trials (25% → 50%), stimulus duration
- N-back: N level (1 → 2 → 3), stimulus presentation rate
- PVT: session duration, warning signal presence/absence

**Progression Display**:
```
Level 1: Introduction    [■■□□□]
Level 2: Foundation      [■■■□□]
Level 3: Practitioner    [■■■■□]
Level 4: Skilled         [■■■■■]
```
Progression unlocks new task variants, not new claims about cognitive ability.

---

## SECTION C — Technical Proposal

### C.1 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Component reuse; strong ecosystem; task state management |
| Build tool | Vite | Fast HMR; lightweight for MVP |
| Styling | Tailwind CSS | Rapid, consistent UI |
| State management | Zustand | Lightweight; avoids Redux overhead for MVP |
| Charts | Recharts | React-native; accessible; composable |
| Task timing | `performance.now()` | Sub-ms resolution; available in all modern browsers |
| Backend | Node.js + Express (TypeScript) | Fast to build; JSON-native |
| Database | PostgreSQL via Supabase | Managed; free tier; row-level security; real-time if needed |
| Auth | Supabase Auth | JWT-based; email/password + OAuth; GDPR-friendly |
| ORM | Prisma | Type-safe; migration management |
| Hosting | Vercel (frontend) + Supabase (backend+DB) | Zero-config deployment; free tier for MVP |
| Error tracking | Sentry (free tier) | Production error visibility |

**Alternative for fully local/self-hosted** (per user preferences):
- Replace Supabase with local PostgreSQL + custom Express auth (bcrypt + JWT)
- No cloud dependency; GDPR simpler to manage

---

### C.2 Frontend Architecture

```
src/
├── tasks/                  # Cognitive task engines
│   ├── flanker/
│   │   ├── FlankerTask.tsx      # Rendering + event collection
│   │   ├── flankerLogic.ts      # Stimulus generation, timing
│   │   └── flankerScoring.ts    # RT/accuracy computation
│   ├── gonogo/
│   ├── nback/
│   └── pvt/
├── assessment/             # Baseline assessment flow
│   ├── AssessmentFlow.tsx       # Orchestrates 4-task sequence
│   └── useAssessmentStore.ts    # Zustand store for session state
├── training/               # Daily training sessions
│   ├── TrainingSession.tsx
│   └── adaptiveDifficulty.ts   # Staircase algorithm
├── dashboard/              # Results visualization
│   ├── AttentionProfile.tsx     # Radar chart
│   ├── TrendChart.tsx
│   └── SessionLog.tsx
├── onboarding/
│   ├── ConsentScreen.tsx        # Mandatory disclaimer
│   └── Questionnaire.tsx
├── api/                    # API client (typed)
│   └── client.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   └── types/
└── App.tsx
```

**Key design decision — Task Engines**:
Each task engine is a pure function generator that:
1. Generates a stimulus sequence (deterministic given a seed for reproducibility)
2. Accepts response events via callbacks
3. Records trial-level data objects
4. Is completely decoupled from React rendering

```typescript
// Example: trial data type
interface TrialData {
  trialId: string;
  taskType: 'flanker' | 'gonogo' | 'nback' | 'pvt';
  stimulusOnset: number;      // performance.now() timestamp
  responseTime: number | null; // null = no response (miss/correct rejection)
  stimulusType: string;
  expectedResponse: 'go' | 'nogo' | boolean | null;
  isCorrect: boolean;
  reactionTimeMs: number | null;
}
```

---

### C.3 Backend Architecture

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Register, login, refresh
│   │   ├── sessions.ts      # CRUD for assessment/training sessions
│   │   ├── results.ts       # Submit trial data, get scores
│   │   └── profile.ts       # User profile, settings
│   ├── services/
│   │   ├── scoring.ts       # Core scoring computation
│   │   ├── progression.ts   # Adaptive difficulty logic
│   │   └── analytics.ts     # Longitudinal trend computation
│   ├── middleware/
│   │   ├── auth.ts          # JWT validation
│   │   └── rateLimit.ts     # Prevent trial data flooding
│   ├── prisma/
│   │   └── schema.prisma
│   └── app.ts
```

---

### C.4 Database Schema (Prisma)

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  createdAt       DateTime  @default(now())
  consentGivenAt  DateTime?           // GDPR: explicit consent timestamp
  ageGroup        String?             // "18-24", "25-34", etc. — no exact DOB
  sessions        Session[]
  profile         UserProfile?
}

model UserProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  sleepHoursAvg   Float?   // self-reported
  exerciseFreq    String?  // self-reported: "never", "sometimes", "often"
  screenTimeHours Float?   // self-reported
  updatedAt       DateTime @updatedAt
}

model Session {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  sessionType     String    // "assessment" | "training"
  taskType        String    // "flanker" | "gonogo" | "nback" | "pvt" | "composite"
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  deviceType      String?   // "desktop" | "mobile" — from user-agent
  trials          Trial[]
  scores          SessionScore[]
}

model Trial {
  id                String   @id @default(uuid())
  sessionId         String
  session           Session  @relation(fields: [sessionId], references: [id])
  trialIndex        Int
  stimulusType      String
  expectedResponse  String
  responseGiven     String?
  isCorrect         Boolean
  reactionTimeMs    Int?     // null for misses and correct rejections
  stimulusOnsetMs   BigInt   // performance.now() relative to session start
}

model SessionScore {
  id              String   @id @default(uuid())
  sessionId       String
  session         Session  @relation(fields: [sessionId], references: [id])
  dimension       String   // "selective_attention" | "inhibitory_control" | "working_memory" | "sustained_attention"
  metricName      String   // "FIE_ms" | "false_alarm_rate" | "d_prime" | "lapse_rate" | ...
  rawValue        Float
  zScorePersonal  Float?   // Z-score relative to user's own history; null for first session
  percentileRank  Float?   // vs. user's own baseline; not population norms
  computedAt      DateTime @default(now())
}

model DifficultyLevel {
  id              String   @id @default(uuid())
  userId          String
  taskType        String
  currentLevel    Int      @default(1)
  currentParams   Json     // task-specific difficulty parameters
  updatedAt       DateTime @updatedAt

  @@unique([userId, taskType])
}
```

---

### C.5 Events to Track (Analytics)

**Session-level events**:
```typescript
enum AppEvent {
  SESSION_STARTED      = 'session_started',
  SESSION_COMPLETED    = 'session_completed',
  SESSION_ABANDONED    = 'session_abandoned',   // user left mid-task
  ASSESSMENT_COMPLETED = 'assessment_completed',
  DISCLAIMER_ACCEPTED  = 'disclaimer_accepted',
  DIFFICULTY_CHANGED   = 'difficulty_changed',  // adaptive
}
```

**Trial-level data** (stored in DB, not sent to analytics):
- All Trial fields (see schema)
- Block number within session
- Time since session start (fatigue detection)

**DO NOT track**:
- Exact keystrokes outside task context
- Mouse movements outside task context
- Any data while user is not in a task

---

### C.6 Longitudinal Results Logic

```typescript
// Pseudocode for trend computation
async function computeTrend(userId: string, dimension: string, windowDays: number) {
  const scores = await db.sessionScore.findMany({
    where: {
      session: { userId, completedAt: { gte: daysAgo(windowDays) } },
      dimension,
      metricName: PRIMARY_METRIC[dimension]
    },
    orderBy: { session: { completedAt: 'asc' } }
  });

  if (scores.length < 3) return { trend: 'insufficient_data', dataPoints: scores };

  // Linear regression on (time → metric value)
  const { slope, rSquared } = linearRegression(
    scores.map((s, i) => [i, s.rawValue])
  );

  return {
    trend: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable',
    confidence: rSquared,        // low R² = noisy; don't over-interpret
    dataPoints: scores,
    note: rSquared < 0.3 ? 'High variability — trend estimate unreliable' : null
  };
}
```

**Re-assessment cadence**:
- Store baseline (first assessment) immutably
- Prompt re-assessment every 14 days
- Show delta vs. baseline with confidence interval
- If fewer than 5 re-assessments, show "building your baseline" state

---

## SECTION D — Responsible AI & Compliance

### D.1 Mandatory Disclaimer (shown at onboarding AND dashboard)

> **This app is not a medical device.** The tasks and scores in this application are self-monitoring tools based on experimental cognitive psychology paradigms. They do not diagnose, predict, treat, or assess any medical or psychological condition, including ADHD, learning disabilities, or cognitive impairment.  
>
> Performance on these tasks is influenced by many factors including fatigue, stress, caffeine, time of day, and familiarity with the task format. Improvement in scores reflects improvement *on these specific tasks* and should not be interpreted as a general improvement in intelligence, memory, or daily cognitive function.  
>
> If you have concerns about your cognitive health, please consult a qualified healthcare professional.

---

### D.2 Interpretive Limits — User-Facing Communication Rules

| ❌ NEVER say | ✅ SAY INSTEAD |
|---|---|
| "Your attention is below average" | "Your performance on this task today was lower than your personal average" |
| "You have poor inhibitory control" | "Your Go/No-Go accuracy was 72% in this session" |
| "Training improved your attention" | "Your Flanker interference effect decreased by 18 ms over 10 sessions on this task" |
| "Your brain is getting stronger" | "You're practicing skills that researchers associate with attentional control" |
| "Suitable for ADHD management" | [Do not mention ADHD at all unless in a clinical disclaimer] |
| "Clinically validated" | "Based on paradigms used in cognitive research" |

---

### D.3 Privacy & Data Governance

**Data minimization**:
- No exact date of birth — collect age group only
- No device fingerprinting beyond user-agent string
- Self-report lifestyle data is optional and deletable
- No selling or sharing of user data with third parties

**GDPR / Privacy compliance**:
- Explicit consent screen before any data collection (timestamp stored)
- Right to access: `/api/profile/export` returns all user data as JSON
- Right to erasure: `/api/profile/delete` hard-deletes all records
- Data retention: session data retained for 24 months; user can shorten this in settings
- If EU users: appoint a DPA contact; use EU-hosted infrastructure (Supabase EU region)

**Security**:
- Passwords: bcrypt (cost factor ≥ 12)
- JWTs: 15-minute access tokens + 7-day refresh tokens; rotate on use
- HTTPS only; HSTS header
- Trial data submitted in authenticated requests only
- Rate limiting on all API endpoints
- Input validation (Zod) on all incoming data
- No PII in error logs

---

### D.4 Non-Stigmatizing Language Guidelines

- **Avoid**: deficit, impairment, disorder, symptom, diagnosis, normal/abnormal, damaged
- **Use**: tendency, pattern, current performance, variability, challenge area
- **Frame everything as**: behaviors and tendencies, not fixed traits
- **Normalize variability**: "Performance naturally fluctuates with sleep, stress, and time of day"
- **Growth framing**: "You're building a habit of cognitive engagement" not "fixing your broken attention"

---

### D.5 Risk Mitigation

| Risk | Mitigation |
|---|---|
| Users self-diagnosing from scores | Constant contextual disclaimers; no clinical language |
| Parents testing children | Age gate (16+); clear disclaimer that norms differ for minors |
| Employers requesting score screenshots | Watermark: "Not valid for employment or clinical assessment" on all exported charts |
| Users becoming anxious about "low" scores | No red/green good/bad coloring; neutral descriptive framing only |
| Gaming/cheating the tasks | Scores are personal benchmarks only; no leaderboards in MVP |
| Addiction to the app itself | Session limits recommendation (2× per day max); encourage breaks |
| FTC/ASA compliance (US/UK) | No efficacy claims on landing page; only descriptive statements |

---

## SECTION E — Deliverables

### E.1 Roadmap (3 Phases)

#### Phase 1: Prototype (Weeks 1–5)
**Goal**: Validate that the 4 cognitive tasks work reliably in browser; collect initial UX feedback

| Task | Output |
|---|---|
| Implement Flanker, Go/No-Go, 2-back, briefPVT as standalone React components | Working task engines |
| Local state only (no backend) | Task results stored in localStorage |
| Basic scoring computation (client-side) | Per-session summary screen |
| Static disclaimer screen | Legal compliance foundation |
| 5 usability test sessions | UX feedback report |

**Success criteria**: Task timing variance < 20 ms median; completion rate > 80% in pilot

---

#### Phase 2: MVP (Weeks 6–16)
**Goal**: Deployable product with user accounts, persistence, and progress tracking

| Task | Output |
|---|---|
| Backend API (auth, sessions, scores) | Deployed Express + Supabase |
| User accounts + consent flow | GDPR-compliant onboarding |
| Full assessment flow (4 tasks in sequence) | Composite Attention Profile |
| Dashboard with radar chart + trend lines | Recharts components |
| Adaptive difficulty (staircase) | Per-task difficulty state |
| Daily training mode | 3 variants per task |
| Re-assessment prompts | 14-day cadence |
| Mobile-responsive layout | Tailwind responsive design |
| Privacy policy + ToS pages | Legal documents |

**Success criteria**: 14-day retention > 25%; no clinically misleading language in user testing

---

#### Phase 3: V2 (Months 5–10)
**Goal**: Richer insight, engagement, and scientific value

| Feature | Notes |
|---|---|
| Lifestyle context correlation | Show within-person correlations between self-reported sleep/stress and task scores — with explicit correlation-not-causation framing |
| Action game variants | Flanker + attention game hybrids (evidence: Green & Bavelier, 2003) |
| Mindfulness prompts | Brief guided breathing before tasks (Jha et al., 2007 rationale) |
| Scientific report export | PDF with raw data + methodology footnotes; useful for researchers/coaches |
| Accessibility improvements | WCAG 2.1 AA compliance; colorblind-safe palettes; keyboard navigation |
| Progressive Web App (PWA) | Offline training; push notifications |
| Research partnership API | Opt-in anonymized data contribution for academic research (IRB-guided) |

---

### E.2 Must-Have vs. Nice-to-Have (MVP)

| Feature | Priority | Reason |
|---|---|---|
| 4 cognitive task engines | **Must-have** | Core product |
| Disclaimer/consent screen | **Must-have** | Legal/ethical |
| User authentication | **Must-have** | Persistent data |
| Attention Profile radar chart | **Must-have** | Core value prop |
| Longitudinal trend charts | **Must-have** | Core value prop |
| Adaptive difficulty | **Must-have** | Engagement + validity |
| Re-assessment flow | **Must-have** | Longitudinal tracking |
| Data export (CSV/JSON) | Nice-to-have | User empowerment |
| Lifestyle correlation | Nice-to-have | Phase 3 |
| Social/sharing features | **Do not build** | Risk of misuse (score comparison) |
| Population percentiles | **Do not build** | Misleading without clinical norms |
| AI-generated "diagnosis" | **Do not build** | Responsible AI red line |

---

### E.3 Textual Wireframe — Key Screens

#### Screen 1: Onboarding Consent
```
╔══════════════════════════════════════════════════════════════╗
║  ATTENTION TRAINER                                           ║
║  ─────────────────                                          ║
║  Before you start, please read carefully:                   ║
║                                                             ║
║  ✦ This app is NOT a medical device or diagnostic tool.     ║
║  ✦ Scores reflect your performance on specific tasks,       ║
║    not your general intelligence or cognitive health.       ║
║  ✦ Your data is used only to track your own progress.       ║
║                                                             ║
║  [Read full privacy policy]    [Read full terms]            ║
║                                                             ║
║  ☐ I understand and agree                                   ║
║                                                             ║
║                        [Continue →]                         ║
╚══════════════════════════════════════════════════════════════╝
```

#### Screen 2: Flanker Task (Active)
```
╔══════════════════════════════════════════════════════════════╗
║  SELECTIVE ATTENTION TASK          Trial 23/80   [━━━━░░░░] ║
║  ─────────────────────────────────────────────────────────  ║
║                                                             ║
║        Press [←] for LEFT    Press [→] for RIGHT           ║
║                                                             ║
║                    ←  ←  →  ←  ←                           ║
║                                                             ║
║                  Respond to the CENTER arrow                ║
║                                                             ║
║  ─────────────────────────────────────────────────────────  ║
║  Rest anytime by pressing [P]                               ║
╚══════════════════════════════════════════════════════════════╝
```

#### Screen 3: Attention Profile Dashboard
```
╔══════════════════════════════════════════════════════════════╗
║  YOUR ATTENTION PROFILE                    Session 4 of —   ║
║  ─────────────────────────────────────────────────────────  ║
║                                                             ║
║   RADAR CHART           │  PROGRESS (30 days)              ║
║                         │                                   ║
║   Sustained Att.        │  Selective ▲ +14 ms faster       ║
║        ╱╲               │  Inhibitory ▲ +8% accuracy       ║
║  WM   /  \ Selective    │  WM         → stable              ║
║      \    /             │  Sustained  ▼ -2% (more rest)     ║
║  Inhibitory             │                                   ║
║                         │  ── 14 sessions completed ──      ║
║  ─────────────────────────────────────────────────────────  ║
║  ⚠ These reflect your performance on these tasks only.     ║
║    Changes do not indicate real-world cognitive change.    ║
╚══════════════════════════════════════════════════════════════╝
```

---

### E.4 Pseudocode — Core Scoring Pipeline

```typescript
// ─── 1. Trial Collection (client-side, during task) ───────────────────────
class FlankerEngine {
  private trials: TrialData[] = [];
  private sessionStart: number = performance.now();

  generateStimulus(trialIndex: number): FlankerStimulus {
    // 50% congruent, 50% incongruent, counterbalanced
    const isCongruent = trialIndex % 2 === 0;
    const direction: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
    return {
      flankers: isCongruent ? direction : opposite(direction),
      target: direction,
      isCongruent
    };
  }

  recordResponse(stimulus: FlankerStimulus, responseTime: number, response: string): void {
    this.trials.push({
      trialId: uuid(),
      taskType: 'flanker',
      stimulusOnset: responseTime - this.sessionStart,
      stimulusType: stimulus.isCongruent ? 'congruent' : 'incongruent',
      expectedResponse: stimulus.target,
      responseGiven: response,
      isCorrect: response === stimulus.target,
      reactionTimeMs: responseTime
    });
  }

  getTrials(): TrialData[] { return this.trials; }
}

// ─── 2. Session Scoring (server-side) ─────────────────────────────────────
function scoreFlankerSession(trials: TrialData[]): FlankerScore {
  const congruent    = trials.filter(t => t.stimulusType === 'congruent' && t.isCorrect);
  const incongruent  = trials.filter(t => t.stimulusType === 'incongruent' && t.isCorrect);

  if (congruent.length < 10 || incongruent.length < 10) {
    return { valid: false, reason: 'insufficient_trials' };
  }

  const meanRT_con   = mean(congruent.map(t => t.reactionTimeMs!));
  const meanRT_incon = mean(incongruent.map(t => t.reactionTimeMs!));
  const accuracy     = trials.filter(t => t.isCorrect).length / trials.length;
  const FIE          = meanRT_incon - meanRT_con;  // lower = better inhibition
  const inverseEff   = meanRT_incon / accuracy;    // speed-accuracy composite

  return {
    valid: true,
    FIE_ms: FIE,
    accuracy_pct: accuracy * 100,
    inverse_efficiency: inverseEff,
    trials_completed: trials.length
  };
}

// ─── 3. Within-Person Z-Score (server-side, longitudinal) ─────────────────
async function computePersonalZScore(
  userId: string,
  metric: string,
  currentValue: number
): Promise<{ zScore: number; historicalN: number; note: string | null }> {

  const history = await db.sessionScore.findMany({
    where: { session: { userId }, metricName: metric },
    orderBy: { computedAt: 'asc' }
  });

  if (history.length < 3) {
    return { zScore: 0, historicalN: history.length, note: 'Building baseline — 3+ sessions needed for Z-score' };
  }

  const values = history.map(h => h.rawValue);
  const mu     = mean(values);
  const sigma  = stdDev(values);

  if (sigma < 0.001) {
    return { zScore: 0, historicalN: history.length, note: 'Insufficient variance for Z-score' };
  }

  return {
    zScore: (currentValue - mu) / sigma,
    historicalN: history.length,
    note: null
  };
}

// ─── 4. Adaptive Difficulty (1-up/2-down staircase) ───────────────────────
function updateDifficulty(
  currentParams: TaskParams,
  recentAccuracy: number[],  // last 20 trials
  consecutiveCorrect: number
): { newParams: TaskParams; direction: 'up' | 'down' | 'hold' } {

  const accuracy = mean(recentAccuracy);

  if (accuracy > 0.85 && consecutiveCorrect >= 2) {
    return { newParams: increaseDifficulty(currentParams), direction: 'up' };
  }
  if (accuracy < 0.70) {
    return { newParams: decreaseDifficulty(currentParams), direction: 'down' };
  }
  return { newParams: currentParams, direction: 'hold' };
}

// ─── 5. Trend Detection ────────────────────────────────────────────────────
function detectTrend(
  dataPoints: Array<{ sessionIndex: number; value: number }>
): TrendResult {

  if (dataPoints.length < 5) {
    return { trend: 'insufficient_data', slope: null, confidence: null };
  }

  const { slope, rSquared } = linearRegression(dataPoints.map(d => [d.sessionIndex, d.value]));

  // Only report trend if R² meaningful
  const reliable = rSquared > 0.25;
  const trend = !reliable ? 'variable'
              : slope > 0.5 ? 'improving'
              : slope < -0.5 ? 'declining'
              : 'stable';

  return {
    trend,
    slope: reliable ? slope : null,
    confidence: rSquared,
    displayNote: !reliable ? 'Your results vary a lot session-to-session — this is normal' : null
  };
}
```

---

### E.5 References

> All claims in this document map to one or more of these references. Claims not covered here should be treated as opinion or design judgment, not established science.

1. Posner, M. I., & Petersen, S. E. (1990). The attention system of the human brain. *Annual Review of Neuroscience*, 13, 25–42.

2. Fan, J., McCandliss, B. D., Sommer, T., Raz, A., & Posner, M. I. (2002). Testing the efficiency and independence of attentional networks. *Journal of Cognitive Neuroscience*, 14(3), 340–347.

3. Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the identification of a target letter in a nonsearch task. *Perception & Psychophysics*, 16(1), 143–149.

4. Stroop, J. R. (1935). Studies of interference in serial verbal reactions. *Journal of Experimental Psychology*, 18(6), 643–662.

5. Kirchner, W. K. (1958). Age differences in short-term retention of rapidly changing information. *Journal of Experimental Psychology*, 55(4), 352–358.

6. Dinges, D. F., & Powell, J. W. (1985). Microcomputer analyses of performance on a portable, simple visual RT task during sustained operations. *Behavior Research Methods, Instruments, & Computers*, 17(6), 652–655.

7. Basner, M., & Dinges, D. F. (2011). Maximizing sensitivity of the psychomotor vigilance test (PVT) to sleep loss. *Sleep*, 34(5), 581–591.

8. Jaeggi, S. M., Buschkuehl, M., Jonides, J., & Perrig, W. J. (2008). Improving fluid intelligence with training on working memory. *PNAS*, 105(19), 6829–6833.

9. Jaeggi, S. M., Buschkuehl, M., Jonides, J., & Shah, P. (2010). Short- and long-term benefits of cognitive training. *PNAS*, 108(25), 10081–10086.

10. Au, J., Sheehan, E., Tsai, N., Duncan, G. J., Buschkuehl, M., & Jaeggi, S. M. (2015). Improving fluid intelligence with training on working memory: A meta-analysis. *Psychonomic Bulletin & Review*, 22(2), 366–377.

11. Melby-Lervåg, M., & Hulme, C. (2013). Is working memory training effective? A meta-analytic review. *Developmental Psychology*, 49(2), 270–291.

12. Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of "far transfer." *Perspectives on Psychological Science*, 11(4), 512–534.

13. Simons, D. J., et al. (2016). Do "brain-training" programs work? *Psychological Science in the Public Interest*, 17(3), 103–186.

14. Green, C. S., & Bavelier, D. (2003). Action video game modifies visual selective attention. *Nature*, 423, 534–537.

15. Green, C. S., & Bavelier, D. (2012). Learning, attentional control, and action video games. *Current Biology*, 22(6), R197–R206.

16. Powers, K. L., et al. (2013). Effects of video-game play on information processing: A meta-analytic investigation. *Psychonomic Bulletin & Review*, 20(6), 1055–1079.

17. Jha, A. P., Krompinger, J., & Baime, M. J. (2007). Mindfulness training modifies subsystems of attention. *Cognitive, Affective, & Behavioral Neuroscience*, 7(2), 109–119.

18. Jha, A. P., Stanley, E. A., Kiyonaga, A., Wong, L., & Gelfand, L. (2010). Examining the protective effects of mindfulness training on working memory capacity and affective experience. *Emotion*, 10(1), 54–64.

19. Chiesa, A., Calati, R., & Serretti, A. (2011). Does mindfulness training improve cognitive abilities? A systematic review of neuropsychological findings. *Clinical Psychology Review*, 31(3), 449–464.

20. Bezdjian, S., Baker, L. A., Lozano, D. I., & Raine, A. (2009). Assessing inattention and impulsivity in children during the Go/NoGo task. *British Journal of Developmental Psychology*, 27(2), 365–383.

21. Scarpina, F., & Tagini, S. (2017). The Stroop Color and Word Test. *Frontiers in Psychology*, 8, 557.

22. Monsell, S. (2003). Task switching. *Trends in Cognitive Sciences*, 7(3), 134–140.

23. Enge, S., Behnke, A., Fleischhauer, M., Küttler, L., Kliegel, M., & Strobel, A. (2014). No evidence for true training and transfer effects after inhibitory control training in young healthy adults. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 40(4), 987–1001.

24. Berkman, E. T., Kahn, L. E., & Merchant, J. S. (2014). Training-induced changes in inhibitory control network activity. *Journal of Neuroscience*, 34(1), 149–157.

25. Jensen, A. R. (2006). *Clocking the Mind: Mental Chronometry and Individual Differences*. Elsevier.

26. FTC v. Lumos Labs (2016). [FTC settlement — $2M for misleading brain training claims]. Federal Trade Commission.

---

## APPENDIX: Quick-Reference Decision Tree for Claims

```
Is the claim about a specific task metric?
  └─ YES → OK to state with session context ("Your Flanker RT was 340ms today")
  └─ NO  →
       Is there direct RCT evidence for this population?
         └─ YES → State with effect size and citation
         └─ NO  →
              Is it a correlational/observational finding?
                └─ YES → Disclose correlation ≠ causation
                └─ NO  → DO NOT MAKE THIS CLAIM
```

---

*Document version 1.0 — May 2026*  
*Prepared for internal product development use. Not for public distribution without legal and scientific review.*

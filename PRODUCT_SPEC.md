# Product specification — MVP v1

## Intent and scope

An anonymous visitor experiences a fifteen-scene fantasy narrative. Every choice represents a defensible strategy and contributes overlapping signals to an invisible deterministic model. A completed journey reveals a mixed archetype profile, motivation, decision style, pressure tendencies, and a fantasy identity. AI explains an existing profile; it never scores a person.

This first delivery is the seven design documents and Phase 1 foundation requested in the master specification's closing instruction. It is not the finished nine-phase consumer experience. The full MVP acceptance criteria below remain the implementation target.

## Experience

| Route | Required behavior |
| --- | --- |
| `/` | Brief premise, duration estimate established through pilot testing, start/resume action |
| `/start` | Optional name (1–60 characters when present); “How would you like your character represented?” Man / Woman; no registration |
| `/journey` | One scene at a time; act, scene number, progress, narrative and 3–4 choices; keyboard accessible; no mappings or scores |
| `/processing` | Honest stage status, recoverable failure, retry without repeating answers |
| `/result/:resultId` | Private result and report/sharing controls; retake and deletion |
| `/share/:token` | Opt-in limited result projection; no raw answers, name or pressure axes by default; revocable |

Representation affects pronouns, appropriate story variants and image prompts only. Every representation uses exactly the same choice IDs and score maps. No gender-specific scoring or threshold exists. Name is display data, never a psychological input. A choice is final once accepted; an interrupted request can safely retry that same choice. Retaking creates an independent session.

## Content requirements

Twelve archetypes: Innocent, Explorer, Sage, Hero, Outlaw, Magician, Lover, Creator, Caregiver, Jester, Ruler and Everyman. Definitions are versioned registry data, never UI copy hidden in React components. Each definition includes desire, fear, motivation, strengths, pressure traits, growth, decision, relationship, leadership, and symbols.

Six motivation keys: `power`, `freedom`, `connection`, `creation`, `knowledge`, `protection`.

Six decision keys: `impulsive`, `strategic`, `intuitive`, `rational`, `protective`, `dominant`.

Six shadow keys: `control`, `avoidance`, `self_sacrifice`, `rebellion`, `obsession`, `emotional_detachment`. Public labels soften technical language where helpful (for example, “Carrying too much”). None implies pathology.

Arbitrary future trait keys fit the same score-effect structure. A new trait requires a registry entry and content release, not a database column. All signals are integers in [-3, 3], missing signals equal zero, and every choice has at least one nonzero effect.

## Result acceptance criteria

- A structured profile exists before AI is called. Twelve non-negative displayed archetype percentages sum to exactly 100; all raw values are preserved.
- Primary, secondary, tertiary and shadow selections are deterministic and auditable. Equal scores follow a stable documented tie order. Weak shadow evidence is described as tentative.
- Character titles come from an approved, compositional naming library. Representation never changes the result ranking.
- The web result includes a 100–200 word summary, 4–6 strengths, 3–5 blind spots, all twelve archetypes accessible, motivations, decision and relationship patterns, growth steps, and one final character image.
- Image assets retain prompt, provider, provider model, generation ID, image URL and timestamp. Mock mode is explicitly labelled and does not pretend to be an AI portrait.
- The PDF cover includes the optional name, title, image, date and branding. Twelve report sections follow the master specification and use typed report data, not AI HTML.
- Cards support 4:5 Instagram, 9:16 Story, professional LinkedIn, and compact X. Provide download, copy caption, Web Share when available, and supported platform URL intents. Instagram uses download/copy, not a promised direct-post API.
- Sharing is a separate explicit action. Do not publish private result data merely because a user downloads a card.
- Refresh resumes accepted progress. Duplicate requests cannot add points. A result can be revisited with its ownership capability. Deletion revokes shares and removes generated assets.

## Language

Use “Your choices suggest…” or “Your journey most strongly aligns with…”. Avoid fixed identity claims, diagnosis, scientific certainty, moral grading, or advice framed as treatment. Pressure tendencies are context-sensitive patterns, not disorders.

Show this notice once during onboarding and in result/report footers:

> This experience is designed for self-reflection and entertainment. It does not provide psychological or medical diagnosis.

## Explicit exclusions

No accounts, payments, full CMS, clinical instruments, relationship diagnoses, persistent multi-journey Human Profile, final design system or selected fantasy art style in this delivery. Future adapters and journey IDs must allow those product areas to evolve independently.

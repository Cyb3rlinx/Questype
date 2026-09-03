# AI and asset contracts — MVP v1

Phase 1 defines contracts, validation, prompt versions and deterministic fallbacks. No remote model or image call is enabled and no API key is needed. Real adapters and orchestration are Phases 5–6.

## Trust boundary

Input is the complete, validated structured profile: already selected archetypes, exact percentages, raw score audit, motivations, decisions, shadow evidence, traits and canonical answer references. Names are optional untrusted display data. Instructions explicitly delimit the profile as data. Provider credentials are server-only. The model cannot write results or choose archetypes. A validated interpretation is stored alongside, never merged over, the deterministic profile.

Prefer minimizing outbound data: canonical answer IDs may be included for traceability, but do not transmit identifying contact data, capabilities, IP addresses, or free-form response histories. Record provider/model/prompt version and generated output, without logging the full request to telemetry.

## Structured output

The Zod interpretation schema is strict at every object boundary and rejects extra fields such as `scores`, `primary_archetype`, HTML layout instructions or arbitrary nested objects. Strings have minimum/maximum lengths. Fields:

```text
character_title: string, must be one of the supplied approved candidates
summary: string, 100–200 whitespace-delimited words
strengths: 4–6 { title, description }
blind_spots: 3–5 { title, description }
decision_style: string
relationships: string
motivation_analysis: string
shadow_analysis: string
growth_path: 3–5 { title, description }
ideal_environment: string
final_reflection: string
social: {
  instagram_caption: string,
  linkedin_caption: string,
  x_caption: string <= 280 characters before a link is appended,
  quote: string
}
```

Transport schema validation is necessary but does not establish psychological safety. Reject forbidden diagnostic wording and fixed-identity claims; flag potentially unsupported archetype claims. Contextual validation checks the approved title and shadow evidence. Render as escaped text, never `dangerouslySetInnerHTML`. A denylist is a guardrail, not a complete semantic verifier: human review of real-model samples is required before launch.

## Versioned prompts

- `profileInterpretation.v1`: interpret supplied rankings without changing them; use tentative language; explain mixed patterns, decision trade-offs, relationships and practical growth; distinguish pressure from identity.
- `socialResult.v1`: concise public text only, respect selected share fields and platform limits. LinkedIn emphasizes leadership, decisions, motivation and problem solving; Instagram emphasizes character identity; X reserves room for a link.
- `characterPrompt.v1`: representation, approved title, primary/secondary/shadow and dominant motivation. Style is a separately supplied parameter; do not bake in a fantasy art direction now.

Each generation stores prompt version and provider model. Upgrading a prompt does not silently regenerate prior results.

## Provider interfaces

`AITextProvider.interpret({profile, approvedTitles, prompt, idempotencyKey, signal}) -> unknown` — the orchestration layer validates unknown output.

`CharacterImageProvider.generateCharacterImage({gender, primaryArchetype, secondaryArchetype, shadowArchetype, characterTitle, dominantMotivation, styleBrief?, idempotencyKey, signal}) -> {prompt, provider, provider_model, generation_id, image_url, created_at}`.

`AssetStorageProvider.put/get/delete` handles private objects and short-lived download URLs. `PDFProvider.render(reportData)` receives typed data. `SocialCardRenderer.render(cardData)` receives platform dimensions and an explicit public projection. These ports depend only on domain/contracts, not React.

Mock images must be recognizably labelled stand-ins; they must not be passed off as generated character portraits. Mock interpretation is deterministic registry prose marked `provider='deterministic'`. Fallback quality and exact output limits are tested. Real adapters must validate allowed HTTPS asset origins and sizes before downloading, to avoid SSRF and oversized files.

## Orchestration planned for Phase 5

Persist deterministic result -> request interpretation with bounded timeout -> validate -> retry malformed/retryable output at most twice -> store valid response or deterministic fallback. A provider failure cannot change ranking, lose answers, or duplicate a result. A failed image stage can retry independently. Durable stage records distinguish queued, running, succeeded and failed. Error codes contain no user data.

No arbitrary HTML is accepted. Reports are built from typed cover/sections data using application-owned layout. Public captions use a schema that omits raw answers, internal audit, private axes and user name unless explicitly selected. Native sharing failure falls back to copy/download; posting to social platforms is always the user's action.

## Notice

“This experience is designed for self-reflection and entertainment. It does not provide psychological or medical diagnosis.” Include in result/report output without repeating throughout the narrative.

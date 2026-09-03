import { z } from 'zod';
import { answerSchema, userIdentitySchema, type Answer, type Gender, type JourneyContent, type Scene, type UserIdentity } from '../types.js';
import { validateAnswers } from '../scoring/engine.js';

export const sessionSchema = z.strictObject({
  id: z.uuid(), journey_id: z.string(), journey_version: z.string(), scoring_version: z.string(),
  user: userIdentitySchema, status: z.enum(['in_progress', 'processing', 'completed']),
  current_scene: z.number().int().positive(), answers: z.array(answerSchema),
  started_at: z.iso.datetime(), completed_at: z.iso.datetime().nullable(),
});
export type JourneySession = z.infer<typeof sessionSchema>;

export function createSession(content: JourneyContent, user: UserIdentity, metadata: { id: string; started_at: string }): JourneySession {
  return sessionSchema.parse({ ...metadata, journey_id: content.id, journey_version: content.journey_version, scoring_version: content.scoring_version, user, status: 'in_progress', current_scene: 1, answers: [], completed_at: null });
}

/** Validate a server snapshot before use. This is not an authorization check or browser persistence adapter. */
export function restoreSession(content: JourneyContent, serialized: unknown): JourneySession {
  const session = sessionSchema.parse(serialized);
  if (session.journey_id !== content.id || session.journey_version !== content.journey_version || session.scoring_version !== content.scoring_version) throw new Error('Session content version mismatch');
  validateAnswers(content, session.answers);
  if (session.current_scene !== session.answers.length + 1) throw new Error('Session cursor disagrees with accepted answers');
  const complete = session.answers.length === content.scenes.length;
  if ((session.status === 'in_progress') === complete) throw new Error('Session status disagrees with accepted answers');
  if ((session.status === 'completed') !== (session.completed_at !== null)) throw new Error('Invalid completion timestamp');
  if (session.completed_at && session.completed_at < session.started_at) throw new Error('Completion precedes start');
  return session;
}

export function acceptAnswer(content: JourneyContent, input: JourneySession, answer: Answer): JourneySession {
  const session = restoreSession(content, input);
  const parsed = answerSchema.parse(answer);
  const existing = session.answers.find(a => a.scene_id === parsed.scene_id);
  if (existing) {
    if (existing.choice_id !== parsed.choice_id) throw new Error('A different answer was already accepted for this scene');
    return session;
  }
  if (session.status !== 'in_progress') throw new Error('Journey no longer accepts answers');
  const answers = [...session.answers, parsed];
  validateAnswers(content, answers);
  return { ...session, answers, current_scene: answers.length + 1, status: answers.length === content.scenes.length ? 'processing' : 'in_progress' };
}

export function markSessionCompleted(content: JourneyContent, input: JourneySession, completedAt: string): JourneySession {
  const session = restoreSession(content, input);
  if (session.status === 'completed') return session;
  if (session.status !== 'processing') throw new Error('All answers must be accepted before completion');
  return restoreSession(content, { ...session, status: 'completed', completed_at: completedAt });
}

export function toPublicScene(scene: Scene, gender: Gender) {
  const variant = gender === 'man' ? scene.male_variant : scene.female_variant;
  return {
    id: scene.id, act: scene.act, order: scene.order, title: scene.title, narrative: variant ?? scene.narrative,
    choices: scene.choices.map(choice => ({ id: choice.id, text: (gender === 'man' ? choice.male_variant : choice.female_variant) ?? choice.text })),
  };
}

export const progressHintSchema = z.strictObject({ schema_version: z.literal(1), session_id: z.uuid(), current_scene: z.number().int().min(1).max(16) });
export function toProgressHint(session: JourneySession) {
  // Safe localStorage hint; no token, name, scores, or answers.
  return progressHintSchema.parse({ schema_version: 1, session_id: session.id, current_scene: session.current_scene });
}

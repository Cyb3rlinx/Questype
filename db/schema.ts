import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const visitors = sqliteTable('web_visitors', {
  ownerHash: text('owner_hash').primaryKey(),
  createdAt: integer('created_at').notNull(),
});
export const releases = sqliteTable('web_releases', {
  id: text('id').primaryKey(),
  contentHash: text('content_hash').notNull(),
  snapshot: text('snapshot').notNull(),
  createdAt: integer('created_at').notNull(),
});
export const sessions = sqliteTable(
  'web_sessions',
  {
    id: text('id').primaryKey(),
    ownerHash: text('owner_hash')
      .notNull()
      .references(() => visitors.ownerHash, { onDelete: 'cascade' }),
    releaseId: text('release_id')
      .notNull()
      .references(() => releases.id),
    stateJson: text('state_json').notNull(),
    revision: integer('revision').notNull().default(0),
    status: text('status').notNull(),
    currentScene: integer('current_scene').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('web_sessions_owner_created').on(t.ownerHash, t.createdAt)],
);
export const answers = sqliteTable(
  'web_answers',
  {
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    sceneId: text('scene_id').notNull(),
    choiceId: text('choice_id').notNull(),
    position: integer('position').notNull(),
    answeredAt: integer('answered_at').notNull(),
  },
  (t) => [
    uniqueIndex('web_answer_scene').on(t.sessionId, t.sceneId),
    uniqueIndex('web_answer_position').on(t.sessionId, t.position),
  ],
);
export const results = sqliteTable(
  'web_results',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    profileJson: text('profile_json').notNull(),
    interpretationJson: text('interpretation_json').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [uniqueIndex('web_result_session').on(t.sessionId)],
);
export const shares = sqliteTable(
  'web_shares',
  {
    id: text('id').primaryKey(),
    resultId: text('result_id')
      .notNull()
      .references(() => results.id, { onDelete: 'cascade' }),
    projectionJson: text('projection_json').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [uniqueIndex('web_share_result').on(t.resultId)],
);

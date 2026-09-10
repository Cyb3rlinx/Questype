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
export const journeys = sqliteTable('journeys', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  status: text('status').notNull(),
  accessTier: text('access_tier').notNull(),
  createdAt: integer('created_at').notNull(),
  retiredAt: integer('retired_at'),
});
export const journeyVersions = sqliteTable(
  'journey_versions',
  {
    id: text('id').primaryKey(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id),
    version: text('version').notNull(),
    contentHash: text('content_hash').notNull(),
    scoringVersion: text('scoring_version').notNull(),
    snapshot: text('snapshot').notNull(),
    publishedAt: integer('published_at'),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('journey_versions_journey_version').on(t.journeyId, t.version),
    uniqueIndex('journey_versions_journey_hash').on(t.journeyId, t.contentHash),
  ],
);
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
    journeyId: text('journey_id').references(() => journeys.id),
    journeyVersionId: text('journey_version_id').references(
      () => journeyVersions.id,
    ),
    stateJson: text('state_json').notNull(),
    revision: integer('revision').notNull().default(0),
    status: text('status').notNull(),
    currentScene: integer('current_scene').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at'),
  },
  (t) => [
    index('web_sessions_owner_created').on(t.ownerHash, t.createdAt),
    index('web_sessions_journey_status_created').on(
      t.journeyId,
      t.status,
      t.createdAt,
    ),
  ],
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

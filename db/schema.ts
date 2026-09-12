import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
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

export const journeySignalModels = sqliteTable(
  'journey_signal_models',
  {
    id: text('id').primaryKey(),
    journeyVersionId: text('journey_version_id')
      .notNull()
      .references(() => journeyVersions.id),
    schemaVersion: text('schema_version').notNull(),
    modelHash: text('model_hash').notNull(),
    snapshot: text('snapshot').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('journey_signal_models_version_hash').on(
      t.journeyVersionId,
      t.modelHash,
    ),
  ],
);

export const resultSignalAssessments = sqliteTable(
  'result_signal_assessments',
  {
    resultId: text('result_id')
      .primaryKey()
      .references(() => results.id, { onDelete: 'cascade' }),
    modelId: text('model_id')
      .notNull()
      .references(() => journeySignalModels.id),
    fingerprint: text('fingerprint').notNull().unique(),
    decisionsAnalyzed: integer('decisions_analyzed').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('result_signal_assessments_model').on(t.modelId)],
);

export const resultConstructScores = sqliteTable(
  'result_construct_scores',
  {
    resultId: text('result_id')
      .notNull()
      .references(() => resultSignalAssessments.resultId, {
        onDelete: 'cascade',
      }),
    signalId: text('signal_id').notNull(),
    valueMilli: integer('value_milli'),
    band: text('band').notNull(),
    observations: integer('observations').notNull(),
    contributingObservations: integer('contributing_observations').notNull(),
    sceneCount: integer('scene_count').notNull(),
    contextCount: integer('context_count').notNull(),
    journeyCount: integer('journey_count').notNull(),
    sceneIdsJson: text('scene_ids_json').notNull(),
    contextIdsJson: text('context_ids_json').notNull(),
    opportunityCoverageMilli: integer('opportunity_coverage_milli').notNull(),
    directionalConsistencyMilli: integer(
      'directional_consistency_milli',
    ).notNull(),
  },
  (t) => [primaryKey({ columns: [t.resultId, t.signalId] })],
);

export const resultConstructEvidence = sqliteTable(
  'result_construct_evidence',
  {
    id: text('id').primaryKey(),
    resultId: text('result_id')
      .notNull()
      .references(() => resultSignalAssessments.resultId, {
        onDelete: 'cascade',
      }),
    modelId: text('model_id')
      .notNull()
      .references(() => journeySignalModels.id),
    sceneId: text('scene_id').notNull(),
    choiceId: text('choice_id').notNull(),
    signalId: text('signal_id').notNull(),
    facetId: text('facet_id').notNull(),
    contextId: text('context_id').notNull(),
    direction: integer('direction').notNull(),
    weightMilli: integer('weight_milli').notNull(),
    signedContributionMilli: integer('signed_contribution_milli').notNull(),
    observationType: text('observation_type').notNull(),
  },
  (t) => [
    index('result_construct_evidence_result_signal').on(t.resultId, t.signalId),
    index('result_construct_evidence_model').on(t.modelId),
  ],
);

export const authUsers = sqliteTable(
  'auth_users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name'),
    locale: text('locale').notNull().default('en'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [uniqueIndex('auth_users_email').on(t.email)],
);

export const authMagicLinks = sqliteTable(
  'auth_magic_links',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: integer('expires_at').notNull(),
    consumedAt: integer('consumed_at'),
    consumedNonce: text('consumed_nonce'),
    requestedAt: integer('requested_at').notNull(),
  },
  (t) => [
    uniqueIndex('auth_magic_links_token_hash').on(t.tokenHash),
    uniqueIndex('auth_magic_links_consumed_nonce').on(t.consumedNonce),
    index('auth_magic_links_email_requested').on(t.email, t.requestedAt),
    index('auth_magic_links_expiry').on(t.expiresAt),
  ],
);

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull(),
    lastSeenAt: integer('last_seen_at').notNull(),
  },
  (t) => [
    uniqueIndex('auth_sessions_token_hash').on(t.tokenHash),
    index('auth_sessions_user_expiry').on(t.userId, t.expiresAt),
  ],
);

export const resultClaims = sqliteTable(
  'result_claims',
  {
    resultId: text('result_id')
      .primaryKey()
      .references(() => results.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    claimedOwnerHash: text('claimed_owner_hash').notNull(),
    claimedAt: integer('claimed_at').notNull(),
  },
  (t) => [index('result_claims_user_claimed').on(t.userId, t.claimedAt)],
);

export const profileSnapshots = sqliteTable(
  'profile_snapshots',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    version: text('version').notNull(),
    aggregationVersion: text('aggregation_version').notNull(),
    sourceCount: integer('source_count').notNull(),
    journeyCount: integer('journey_count').notNull(),
    decisionsAnalyzed: integer('decisions_analyzed').notNull(),
    profileDepth: text('profile_depth').notNull(),
    fingerprint: text('fingerprint').notNull(),
    profileJson: text('profile_json').notNull(),
    coverageJson: text('coverage_json').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('profile_snapshots_user_sequence').on(t.userId, t.sequence),
    uniqueIndex('profile_snapshots_user_fingerprint').on(
      t.userId,
      t.fingerprint,
    ),
    index('profile_snapshots_user_created').on(t.userId, t.createdAt),
  ],
);

export const profileSnapshotSources = sqliteTable(
  'profile_snapshot_sources',
  {
    snapshotId: text('snapshot_id')
      .notNull()
      .references(() => profileSnapshots.id, { onDelete: 'cascade' }),
    resultId: text('result_id')
      .notNull()
      .references(() => results.id, { onDelete: 'cascade' }),
    journeyId: text('journey_id').notNull(),
    journeyVersion: text('journey_version').notNull(),
    scoringVersion: text('scoring_version').notNull(),
    signalModelId: text('signal_model_id').notNull(),
    resultCreatedAt: integer('result_created_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.snapshotId, t.resultId] }),
    index('profile_snapshot_sources_result').on(t.resultId),
  ],
);

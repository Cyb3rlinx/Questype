CREATE TABLE `profile_snapshot_sources` (
	`snapshot_id` text NOT NULL,
	`result_id` text NOT NULL,
	`journey_id` text NOT NULL,
	`journey_version` text NOT NULL,
	`scoring_version` text NOT NULL,
	`signal_model_id` text NOT NULL,
	`result_created_at` integer NOT NULL,
	PRIMARY KEY(`snapshot_id`, `result_id`),
	FOREIGN KEY (`snapshot_id`) REFERENCES `profile_snapshots`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`result_id`) REFERENCES `web_results`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `profile_snapshot_sources_result` ON `profile_snapshot_sources` (`result_id`);--> statement-breakpoint
CREATE TABLE `profile_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`version` text NOT NULL,
	`aggregation_version` text NOT NULL,
	`source_count` integer NOT NULL,
	`journey_count` integer NOT NULL,
	`decisions_analyzed` integer NOT NULL,
	`profile_depth` text NOT NULL,
	`fingerprint` text NOT NULL,
	`profile_json` text NOT NULL,
	`coverage_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_snapshots_user_sequence` ON `profile_snapshots` (`user_id`,`sequence`);--> statement-breakpoint
CREATE UNIQUE INDEX `profile_snapshots_user_fingerprint` ON `profile_snapshots` (`user_id`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `profile_snapshots_user_created` ON `profile_snapshots` (`user_id`,`created_at`);
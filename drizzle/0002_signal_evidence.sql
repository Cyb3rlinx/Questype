CREATE TABLE `journey_signal_models` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_version_id` text NOT NULL,
	`schema_version` text NOT NULL,
	`model_hash` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`journey_version_id`) REFERENCES `journey_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journey_signal_models_version_hash` ON `journey_signal_models` (`journey_version_id`,`model_hash`);--> statement-breakpoint
CREATE TABLE `result_construct_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`result_id` text NOT NULL,
	`model_id` text NOT NULL,
	`scene_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`signal_id` text NOT NULL,
	`facet_id` text NOT NULL,
	`context_id` text NOT NULL,
	`direction` integer NOT NULL,
	`weight_milli` integer NOT NULL,
	`signed_contribution_milli` integer NOT NULL,
	`observation_type` text NOT NULL,
	FOREIGN KEY (`result_id`) REFERENCES `result_signal_assessments`(`result_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`model_id`) REFERENCES `journey_signal_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `result_construct_evidence_result_signal` ON `result_construct_evidence` (`result_id`,`signal_id`);--> statement-breakpoint
CREATE INDEX `result_construct_evidence_model` ON `result_construct_evidence` (`model_id`);--> statement-breakpoint
CREATE TABLE `result_construct_scores` (
	`result_id` text NOT NULL,
	`signal_id` text NOT NULL,
	`value_milli` integer,
	`band` text NOT NULL,
	`observations` integer NOT NULL,
	`contributing_observations` integer NOT NULL,
	`scene_count` integer NOT NULL,
	`context_count` integer NOT NULL,
	`journey_count` integer NOT NULL,
	`scene_ids_json` text NOT NULL,
	`context_ids_json` text NOT NULL,
	`opportunity_coverage_milli` integer NOT NULL,
	`directional_consistency_milli` integer NOT NULL,
	PRIMARY KEY(`result_id`, `signal_id`),
	FOREIGN KEY (`result_id`) REFERENCES `result_signal_assessments`(`result_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `result_signal_assessments` (
	`result_id` text PRIMARY KEY NOT NULL,
	`model_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`decisions_analyzed` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`result_id`) REFERENCES `web_results`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`model_id`) REFERENCES `journey_signal_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `result_signal_assessments_fingerprint_unique` ON `result_signal_assessments` (`fingerprint`);--> statement-breakpoint
CREATE INDEX `result_signal_assessments_model` ON `result_signal_assessments` (`model_id`);
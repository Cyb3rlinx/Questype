CREATE TABLE `web_answers` (
	`session_id` text NOT NULL,
	`scene_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`position` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `web_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `web_answer_scene` ON `web_answers` (`session_id`,`scene_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `web_answer_position` ON `web_answers` (`session_id`,`position`);--> statement-breakpoint
CREATE TABLE `web_releases` (
	`id` text PRIMARY KEY NOT NULL,
	`content_hash` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `web_results` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`profile_json` text NOT NULL,
	`interpretation_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `web_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `web_result_session` ON `web_results` (`session_id`);--> statement-breakpoint
CREATE TABLE `web_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_hash` text NOT NULL,
	`release_id` text NOT NULL,
	`state_json` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`current_scene` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_hash`) REFERENCES `web_visitors`(`owner_hash`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`release_id`) REFERENCES `web_releases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `web_sessions_owner_created` ON `web_sessions` (`owner_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `web_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`result_id` text NOT NULL,
	`projection_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`result_id`) REFERENCES `web_results`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `web_share_result` ON `web_shares` (`result_id`);--> statement-breakpoint
CREATE TABLE `web_visitors` (
	`owner_hash` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);

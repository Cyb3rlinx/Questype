CREATE TABLE `auth_magic_links` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`consumed_nonce` text,
	`requested_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_magic_links_token_hash` ON `auth_magic_links` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_magic_links_consumed_nonce` ON `auth_magic_links` (`consumed_nonce`);--> statement-breakpoint
CREATE INDEX `auth_magic_links_email_requested` ON `auth_magic_links` (`email`,`requested_at`);--> statement-breakpoint
CREATE INDEX `auth_magic_links_expiry` ON `auth_magic_links` (`expires_at`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_sessions_token_hash` ON `auth_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_expiry` ON `auth_sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `auth_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_users_email` ON `auth_users` (`email`);--> statement-breakpoint
CREATE TABLE `result_claims` (
	`result_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`claimed_owner_hash` text NOT NULL,
	`claimed_at` integer NOT NULL,
	FOREIGN KEY (`result_id`) REFERENCES `web_results`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `result_claims_user_claimed` ON `result_claims` (`user_id`,`claimed_at`);
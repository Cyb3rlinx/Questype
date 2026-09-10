CREATE TABLE `journey_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`version` text NOT NULL,
	`content_hash` text NOT NULL,
	`scoring_version` text NOT NULL,
	`snapshot` text NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journey_versions_journey_version` ON `journey_versions` (`journey_id`,`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `journey_versions_journey_hash` ON `journey_versions` (`journey_id`,`content_hash`);--> statement-breakpoint
CREATE TABLE `journeys` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text NOT NULL,
	`access_tier` text NOT NULL,
	`created_at` integer NOT NULL,
	`retired_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journeys_slug_unique` ON `journeys` (`slug`);--> statement-breakpoint
ALTER TABLE `web_sessions` ADD `journey_id` text REFERENCES journeys(id);--> statement-breakpoint
ALTER TABLE `web_sessions` ADD `journey_version_id` text REFERENCES journey_versions(id);--> statement-breakpoint
ALTER TABLE `web_sessions` ADD `updated_at` integer;--> statement-breakpoint
INSERT INTO `journeys` (`id`,`slug`,`status`,`access_tier`,`created_at`)
VALUES ('journey_unwritten_road','the-unwritten-road','published','free',unixepoch() * 1000)
ON CONFLICT (`id`) DO NOTHING;--> statement-breakpoint
INSERT OR IGNORE INTO `journey_versions` (
	`id`,`journey_id`,`version`,`content_hash`,`scoring_version`,`snapshot`,`published_at`,`created_at`
)
SELECT
	r.`id`,
	'journey_unwritten_road',
	COALESCE(json_extract(r.`snapshot`, '$.journey_version'), '1.1'),
	r.`content_hash`,
	COALESCE(json_extract(r.`snapshot`, '$.scoring_version'), '1.1'),
	r.`snapshot`,
	r.`created_at`,
	r.`created_at`
FROM `web_releases` r;--> statement-breakpoint
UPDATE `web_sessions`
SET
	`journey_id` = 'journey_unwritten_road',
	`journey_version_id` = `release_id`,
	`updated_at` = `created_at`
WHERE `journey_id` IS NULL;--> statement-breakpoint
CREATE INDEX `web_sessions_journey_status_created` ON `web_sessions` (`journey_id`,`status`,`created_at`);

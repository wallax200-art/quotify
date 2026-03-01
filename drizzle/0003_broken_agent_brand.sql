ALTER TABLE `users` ADD `accessGrantedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `accessDays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `accessExpiresAt` timestamp;
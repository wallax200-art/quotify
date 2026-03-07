CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int,
	`user_id` int,
	`action` varchar(128) NOT NULL,
	`entity_type` varchar(64),
	`entity_id` int,
	`old_data_json` json,
	`new_data_json` json,
	`ip_address` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `device_conditions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`condition_key` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`description` text,
	`deduction_value` decimal(10,2) NOT NULL DEFAULT '0.00',
	`category` enum('estetica','funcionalidade','garantia') NOT NULL DEFAULT 'estetica',
	`icon` varchar(64),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `device_conditions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `machine_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`installments` int NOT NULL,
	`rate_percentage` decimal(6,4) NOT NULL,
	`label` varchar(32),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `machine_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`max_users` int NOT NULL DEFAULT 1,
	`features_json` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`storage` varchar(64) NOT NULL DEFAULT '-',
	`color` varchar(64),
	`specs` varchar(255),
	`image_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`store_product_id` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`installments` int,
	`installment_value` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`seller_id` int NOT NULL,
	`customer_name` varchar(255),
	`customer_phone` varchar(32),
	`status` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
	`total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`generated_text` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`product_id` int NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`condition` enum('novo','seminovo') NOT NULL DEFAULT 'novo',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`quote_closing_text` text,
	`theme_preference` enum('light','dark','system') NOT NULL DEFAULT 'system',
	`default_warranty_days` int NOT NULL DEFAULT 0,
	`logo_url` text,
	`warranty_text` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_settings_store_id_unique` UNIQUE(`store_id`)
);
--> statement-breakpoint
CREATE TABLE `store_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role_in_store` enum('owner','seller') NOT NULL DEFAULT 'seller',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `store_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`whatsapp` varchar(32),
	`logo_url` varchar(512),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`status` enum('trialing','active','past_due','canceled') NOT NULL DEFAULT 'trialing',
	`trial_ends_at` timestamp,
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`external_subscription_id` varchar(255),
	`access_days` int NOT NULL DEFAULT 0,
	`access_granted_at` timestamp,
	`access_expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(128) NOT NULL,
	`setting_value` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_settings_setting_key_unique` UNIQUE(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `trade_in_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`store_id` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`base_deduction_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
	`min_acceptable_condition` varchar(64),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trade_in_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trade_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`product_id` int,
	`product_name` varchar(255),
	`product_storage` varchar(64),
	`evaluation_value` decimal(10,2) NOT NULL DEFAULT '0.00',
	`applied_conditions_json` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trade_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('master_admin','store_owner','seller') NOT NULL DEFAULT 'seller';--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `device_conditions` ADD CONSTRAINT `device_conditions_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `machine_fees` ADD CONSTRAINT `machine_fees_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_items` ADD CONSTRAINT `quote_items_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_items` ADD CONSTRAINT `quote_items_store_product_id_store_products_id_fk` FOREIGN KEY (`store_product_id`) REFERENCES `store_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_seller_id_users_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_products` ADD CONSTRAINT `store_products_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_products` ADD CONSTRAINT `store_products_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_settings` ADD CONSTRAINT `store_settings_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_users` ADD CONSTRAINT `store_users_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `store_users` ADD CONSTRAINT `store_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trade_in_rules` ADD CONSTRAINT `trade_in_rules_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trade_ins` ADD CONSTRAINT `trade_ins_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trade_ins` ADD CONSTRAINT `trade_ins_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `storeName`;
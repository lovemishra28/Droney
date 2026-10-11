CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_name" varchar(50) NOT NULL,
	"entity_id" varchar(64) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "drone_specifications" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"frame_size_mm" integer,
	"weight_grams" integer,
	"input_voltage_lipo" varchar(32),
	"motor_kv" varchar(32),
	"fc_firmware" varchar(64),
	"esc_protocol" varchar(64),
	"flight_time_minutes" integer,
	"payload_capacity_grams" integer
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_paise" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"is_second_hand" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_reference" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"total_amount_paise" integer NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"payment_method" varchar(20) DEFAULT 'upi_qr' NOT NULL,
	"payment_status" varchar(30) DEFAULT 'awaiting_verification' NOT NULL,
	"upi_transaction_id" varchar(64),
	"payment_screenshot_url" text,
	"order_status" varchar(30) DEFAULT 'placed' NOT NULL,
	"courier_partner" varchar(64),
	"tracking_awb" varchar(64),
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_reference_unique" UNIQUE("order_reference"),
	CONSTRAINT "orders_upi_transaction_id_unique" UNIQUE("upi_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"media_type" varchar(10) NOT NULL,
	"storage_provider" varchar(20) NOT NULL,
	"url" text NOT NULL,
	"playback_id" varchar(128),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"base_price_paise" integer NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_second_hand" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "second_hand_details" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"cosmetic_grade" varchar(1) NOT NULL,
	"flight_hours" integer,
	"crash_history" boolean DEFAULT false NOT NULL,
	"battery_cycle_count" integer,
	"included_accessories" jsonb,
	"inspection_notes" text
);
--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"reserved_until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"role" varchar(20) DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_specifications" ADD CONSTRAINT "drone_specifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "second_hand_details" ADD CONSTRAINT "second_hand_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_slug" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_orders_upi_utr" ON "orders" USING btree ("upi_transaction_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_status" ON "orders" USING btree ("user_id","order_status");--> statement-breakpoint
CREATE INDEX "idx_orders_payment_status" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_product_media_lookup" ON "product_media" USING btree ("product_id","display_order");--> statement-breakpoint
CREATE INDEX "idx_products_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_products_category_status" ON "products" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "idx_products_price" ON "products" USING btree ("base_price_paise");--> statement-breakpoint
CREATE INDEX "idx_products_second_hand" ON "products" USING btree ("is_second_hand");--> statement-breakpoint
CREATE INDEX "idx_reservations_expiry" ON "stock_reservations" USING btree ("reserved_until");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");
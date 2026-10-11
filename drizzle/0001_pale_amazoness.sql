CREATE TYPE "public"."cosmetic_grade" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('upi_qr', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('awaiting_verification', 'paid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('r2', 'bunny');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_upi_transaction_id_unique";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_admin_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_verified_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_orders_upi_utr";--> statement-breakpoint
DROP INDEX "idx_orders_user_status";--> statement-breakpoint
DROP INDEX "idx_reservations_expiry";--> statement-breakpoint
DROP INDEX "idx_products_second_hand";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "admin_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE varchar(120);--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "slug" SET DATA TYPE varchar(140);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_reference" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'upi_qr'::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE "public"."payment_method" USING "payment_method"::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'awaiting_verification'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_status" SET DEFAULT 'placed'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_status" SET DATA TYPE "public"."order_status" USING "order_status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "media_type" SET DATA TYPE "public"."media_type" USING "media_type"::"public"."media_type";--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "storage_provider" SET DATA TYPE "public"."storage_provider" USING "storage_provider"::"public"."storage_provider";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."product_status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."product_status" USING "status"::"public"."product_status";--> statement-breakpoint
ALTER TABLE "second_hand_details" ALTER COLUMN "cosmetic_grade" SET DATA TYPE "public"."cosmetic_grade" USING "cosmetic_grade"::"public"."cosmetic_grade";--> statement-breakpoint
ALTER TABLE "second_hand_details" ALTER COLUMN "flight_hours" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "second_hand_details" ALTER COLUMN "battery_cycle_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "second_hand_details" ALTER COLUMN "included_accessories" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_admin" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs" USING btree ("entity_name","entity_id");--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_upi_utr" ON "orders" USING btree ("upi_transaction_id") WHERE "orders"."upi_transaction_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_order_status" ON "orders" USING btree ("order_status");--> statement-breakpoint
CREATE INDEX "idx_orders_created" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_product_media_playback" ON "product_media" USING btree ("playback_id");--> statement-breakpoint
CREATE INDEX "idx_products_sku" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_stock_reservations_expiry" ON "stock_reservations" USING btree ("reserved_until");--> statement-breakpoint
CREATE INDEX "idx_stock_reservations_product" ON "stock_reservations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_products_second_hand" ON "products" USING btree ("is_second_hand","status");
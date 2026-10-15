ALTER TYPE "public"."payment_status" ADD VALUE 'pending_payment' BEFORE 'awaiting_verification';--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(32) NOT NULL,
	"full_name" varchar(128),
	"email" varchar(255),
	"phone" varchar(32),
	"payload" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(32) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drone_specifications" ALTER COLUMN "input_voltage_lipo" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "drone_specifications" ALTER COLUMN "esc_protocol" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_reference" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'pending_payment';--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD COLUMN "order_id" uuid;--> statement-breakpoint
CREATE INDEX "idx_inquiries_type" ON "inquiries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_inquiries_email" ON "inquiries" USING btree ("email");--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_stock_reservations_order" ON "stock_reservations" USING btree ("order_id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "chk_qty_positive" CHECK ("order_items"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "chk_unit_nonneg" CHECK ("order_items"."unit_price_paise" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "chk_total_nonneg" CHECK ("orders"."total_amount_paise" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "chk_stock_nonneg" CHECK ("products"."stock_quantity" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "chk_price_nonneg" CHECK ("products"."base_price_paise" >= 0);--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "chk_res_positive" CHECK ("stock_reservations"."quantity" > 0);
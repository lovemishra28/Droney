CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_showcases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"mrp_price_paise" integer,
	"warranty_months" integer DEFAULT 12,
	"hero_badge" varchar(64),
	"hero_headline" varchar(120),
	"hero_subtitle" text,
	"hero_exploded_layout_url" text,
	"key_metrics" jsonb DEFAULT '[]'::jsonb,
	"story_blocks" jsonb DEFAULT '[]'::jsonb,
	"multi_angles" jsonb DEFAULT '[]'::jsonb,
	"comparison_data" jsonb,
	"regulatory_faqs" jsonb DEFAULT '[]'::jsonb,
	"tech_specs_grouped" jsonb DEFAULT '{}'::jsonb,
	"in_the_box" jsonb DEFAULT '[]'::jsonb,
	"bundle_product_ids" jsonb DEFAULT '[]'::jsonb,
	"faqs" jsonb DEFAULT '[]'::jsonb,
	"long_form_seo_article" text,
	CONSTRAINT "product_showcases_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
ALTER TABLE "drone_specifications" ALTER COLUMN "motor_kv" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" varchar(100) DEFAULT 'DJI' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_showcases" ADD CONSTRAINT "product_showcases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_brands_slug" ON "brands" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_brand" ON "products" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "idx_products_brand_id" ON "products" USING btree ("brand_id");
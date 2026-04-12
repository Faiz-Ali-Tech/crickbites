ALTER TABLE "crickbites"."posts" ALTER COLUMN "seo_title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "crickbites"."comments" ADD COLUMN "author_email" text;--> statement-breakpoint
ALTER TABLE "crickbites"."comments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "crickbites"."posts" ADD COLUMN "featured_image" text;--> statement-breakpoint
ALTER TABLE "crickbites"."posts" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "crickbites"."users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "crickbites"."web_stories" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "crickbites"."web_stories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "crickbites"."posts" DROP COLUMN "featured_image_url";--> statement-breakpoint
ALTER TABLE "crickbites"."web_stories" DROP COLUMN "cover_image_url";
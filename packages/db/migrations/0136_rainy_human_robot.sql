CREATE TABLE "workspace_oauth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider" text NOT NULL,
	"display_name" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_oauth_account" ADD CONSTRAINT "workspace_oauth_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_oauth_account" ADD CONSTRAINT "workspace_oauth_account_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workspace_oauth_account_workspace_id_idx" ON "workspace_oauth_account" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_oauth_account_workspace_provider_idx" ON "workspace_oauth_account" USING btree ("workspace_id","provider");--> statement-breakpoint
CREATE INDEX "workspace_oauth_account_workspace_primary_idx" ON "workspace_oauth_account" USING btree ("workspace_id","is_primary");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_oauth_account_workspace_account_unique" ON "workspace_oauth_account" USING btree ("workspace_id","account_id");
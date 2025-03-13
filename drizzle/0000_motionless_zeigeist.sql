CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(256) NOT NULL,
	"user_id" integer NOT NULL,
	"symbol" varchar(256) NOT NULL,
	"shares" integer NOT NULL,
	"price" integer NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

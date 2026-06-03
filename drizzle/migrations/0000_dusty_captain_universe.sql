CREATE TABLE "conversion_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(10) NOT NULL,
	"to_currency" varchar(10) NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"result" numeric(20, 8) NOT NULL,
	"rate" numeric(20, 8) NOT NULL,
	"source" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cryptocurrencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"coingecko_id" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cryptocurrencies_coingecko_id_unique" UNIQUE("coingecko_id")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(10) NOT NULL,
	"to_currency" varchar(10) NOT NULL,
	"rate" numeric(20, 8) NOT NULL,
	"source" varchar(50) NOT NULL,
	"fetched_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_exchange_rate_pair" ON "exchange_rates" USING btree ("from_currency","to_currency","fetched_at");
import { COUNTRY_ABBR } from "@my/base/countryAbbr.constant";
import { CRAWL_TYPE } from "@my/base/crawlType.constant";
import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

const timeStampOpts = {
  withTimezone: true,
  mode: "string",
} as const;

export const marketCountryEnum = pgEnum("market_country", COUNTRY_ABBR);

const createdAt = timestamp("created_at", timeStampOpts)
  .default(sql`(now() AT TIME ZONE 'utc'::text)`)
  .notNull();

const updatedAt = timestamp("updated_at", timeStampOpts)
  .default(sql`(now() AT TIME ZONE 'utc'::text)`)
  .notNull()
  .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`);

const marketCountry = marketCountryEnum("market_country").notNull();

export const users = pgTable("users", {
  id: integer(),
  createdAt,
  updatedAt,
});

export const stock = pgTable(
  "stock",
  {
    id: integer("stock_id").primaryKey(),
    currentSymbol: varchar("current_symbol", { length: 10 }).notNull(),
    currentSymbolSince: timestamp(
      "current_symbol_since",
      timeStampOpts,
    ).notNull(),
    marketCountry,
    name: text("name").notNull(),
    swsId: integer("sws_id").notNull().unique(),
    swsUniqueSymbol: text("sws_unique_symbol").notNull().unique(),
    swsSymbolSince: timestamp("sws_symbol_since", timeStampOpts).notNull(),
    edgeCompanyId: integer("edge_company_id").unique(),
    website: text("website"),
    swsLogoUrl: text("sws_logo_url"),
    pseFramesLogoUrl: text("pse_frames_logo_url"),
    listedAt: timestamp("listedAt", timeStampOpts),
  },
  (table) => [
    unique(`${"stock"}_symbol_market_country_unique`).on(
      table.currentSymbol,
      table.marketCountry,
    ),
    index(`${"stock"}_market_country_index`).on(table.marketCountry),
    index(`${"stock"}_sws_id_index`).on(table.swsId),
    index(`${"stock"}_sws_unique_symbol_index`).on(table.swsUniqueSymbol),
  ],
);

export const crawlTypeEnum = pgEnum("crawl_type", CRAWL_TYPE);

export const crawl = pgTable("crawl", {
  id: integer("crawl_id").primaryKey(),
  crawlType: crawlTypeEnum("crawl_type").notNull(),
  marketCountry,
  crawlStartedAt: timestamp("crawl_started_at", timeStampOpts).notNull(),
  crawlCompletedAt: timestamp("crawl_completed_at", timeStampOpts),
  createdAt,
  updatedAt,
});

export const crawlSwsStockListItem = pgTable("crawl_sws_stock_list_item", {
  id: integer("id").primaryKey(),
  crawlId: integer("crawl_id").references(() => crawl.id),
  url: text("url").notNull(),
  crawlCompletedAt: timestamp("crawl_completed_at", timeStampOpts),
  createdAt,
  updatedAt,
});

export const swsStockData = pgTable("sws_stock_data", {
  id: integer("id").primaryKey(),
  crawlId: integer("crawl_id").references(() => crawl.id),
  swsId: integer("sws_id")
    .notNull()
    .references(() => stock.swsId),
  swsUniqueSymbol: text("sws_unique_symbol").notNull(),
  swsDataLastUpdated: bigint("sws_data_last_updated", {
    mode: "number",
  }).notNull(),
  reportingCurrency: varchar("reporting_currency", { length: 15 }),
  reportingUnit: numeric("reporting_unit"),
  marketCap: bigint("market_cap", {
    mode: "number",
  }),
  marketCapUsd: bigint("market_cap_usd", {
    mode: "number",
  }),

  scoreValue: numeric("score_value"),
  scoreIncome: numeric("score_income"),
  scoreHealth: numeric("score_health"),
  scorePast: numeric("score_past"),
  scoreFuture: numeric("score_future"),
  scoreManagement: numeric("score_management"),
  scoreMisc: numeric("score_misc"),
  scoreScoreTotal: numeric("score_score_total"),
  scoreSentence: text("score_sentence"),
  snowflakeColor: numeric("snowflake_color"),
  sharePrice: numeric("share_price"),
  pe: numeric("value_pe"),
  ps: numeric("value_ps"),
  pb: numeric("value_pb"),
  peg: numeric("value_peg"),
  roe: numeric("roe"),
  priceTarget: numeric("value_price_target"),
  priceTargetAnalystCount: numeric("value_price_target_analyst_count"),
  priceTargetHigh: numeric("value_price_target_high"),
  priceTargetLow: numeric("value_price_target_low"),

  epsAnnualGrowthRate: numeric("future_earnings_per_share_growth_annual"),
  netIncomeAnnualGrowthRate: numeric("future_net_income_growth_annual"),
  roeFuture3y: numeric("future_roe_3y"),
  peForward1y: numeric("future_forward_pe_1y"),
  psForward1y: numeric("future_forward_ps_1y"),
  cashOpsGrowthAnnual: numeric("future_cash_ops_growth_annual"),

  epsGrowth1y: numeric("future_eps_growth_1y"),
  epsGrowth3y: numeric("future_eps_growth_3y"),
  pastEpsGrowth5y: numeric("past_eps_growth_5y"),

  revenueGrowthAnnual: numeric("future_revenue_growth_annual"),
  growth1y: numeric("future_growth_1y"),
  growth3y: numeric("future_growth_3y"),
  pastGrowth5y: numeric("past_growth_5y"),

  peerPreferredComparison: text("peer_preferred_multiple"),
  peerPreferredValue: numeric(
    "peer_preferred_relative_multiple_average_peer_value",
  ),

  intrinsicValue: numeric("intrinsic_value"),
  intrinsicValueModel: text("intrinsic_value_model"),
  intrinsicValueDiscount: numeric("intrinsic_value_discount"),
  dividendYield: numeric("dividend_yield"),
  dividendYieldFuture: numeric("dividend_yield_future"),
  dividendPayoutRatio: numeric("dividend_payout_ratio"),
  dividendPayoutRatio3Y: numeric("dividend_payout_ratio_3y"),
  dividendPayoutRatioMedian3Y: numeric("dividend_payout_ratio_median_3yr"),
  dividendPaymentsGrowthAnnual: numeric("dividend_payments_growth_annual"),
  dividendCashPayoutRatio: numeric("dividend_cash_payout_ratio"),

  leveredFreeCashFlowAnnualGrowth: numeric(
    "health_levered_free_cash_flow_growth_annual",
  ),
  crawlStartedAt: timestamp("crawl_started_at", timeStampOpts).notNull(),
  crawlCompletedAt: timestamp("crawl_completed_at", timeStampOpts),
  createdAt,
  updatedAt,
});

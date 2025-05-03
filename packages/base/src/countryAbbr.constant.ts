export const COUNTRY_ABBR = {
  US: "US",
  PH: "PH",
} as const;

export type CountryAbbr = keyof typeof COUNTRY_ABBR;

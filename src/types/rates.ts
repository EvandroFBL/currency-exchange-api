export interface RateEntry {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  source: string;
  fetchedAt: Date;
}

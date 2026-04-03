export interface Relativity {
  category: string;
  multiplier: number;
  color: string;
}

export interface ModelMetadata {
  base_frequency: number;
  avg_severity: number;
  last_trained: string;
  relativities: Relativity[];
}

export interface QuoteRequest {
  driver_age: number;
  exposure: number;
  sum_insured: number;
}

export interface QuoteResponse {
  lambda: string;
  pure_premium: number;
  multiplier: number;
}
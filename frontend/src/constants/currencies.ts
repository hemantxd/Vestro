export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// Dynamic currency support for posts. Currency is tracked separately from
// tickers — tickers are always plain symbols (never prefixed with $, ₹, ¥...).
export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CHF", symbol: "₣", name: "Swiss Franc" },
  { code: "CNY", symbol: "CN¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
];

export function getCurrency(code?: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
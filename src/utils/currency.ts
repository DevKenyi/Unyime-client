const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  ZAR: 'R',
}

/** Falls back to "<code> " for any currency we don't have a symbol for yet, rather than guessing. */
export function currencySymbol(currency: string | null | undefined): string {
  if (!currency) return CURRENCY_SYMBOLS.NGN
  return CURRENCY_SYMBOLS[currency] ?? `${currency} `
}

export function formatMoney(amount: number, currency: string | null | undefined): string {
  return `${currencySymbol(currency)}${amount.toLocaleString()}`
}

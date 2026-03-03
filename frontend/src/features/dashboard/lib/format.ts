const currencyFormatter = new Intl.NumberFormat("es-ES", {
	minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("es-ES", {
	maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-ES", {
	maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("es-ES", {
	style: "percent",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const compactIntegerFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
	return currencyFormatter.format(value);
}

export function formatInteger(value: number): string {
	return integerFormatter.format(value);
}

export function formatDecimal(value: number): string {
	return decimalFormatter.format(value);
}

export function formatRate(value: number): string {
	return percentFormatter.format(value);
}

export function formatKpiCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatKpiInteger(value: number): string {
  return compactIntegerFormatter.format(value);
}
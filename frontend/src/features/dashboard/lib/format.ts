const currencyFormatter = new Intl.NumberFormat("es-ES", {
	style: "currency",
	currency: "BRL",
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
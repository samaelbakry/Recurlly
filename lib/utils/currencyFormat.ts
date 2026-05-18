export const formatCurrency = (value: number, currency: string = "USD") => {
    try {
        return new Intl.NumberFormat("en-us", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(value)

    } catch (error) {
        const formattedValue = value.toFixed(2)
        return `$${formattedValue}`
    }
}
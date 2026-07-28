export function formatMoney(amount: number) {
  return amount.toLocaleString("es-US", { style: "currency", currency: "USD" });
}

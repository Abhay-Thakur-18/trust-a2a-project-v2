export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.transactions)) return value.transactions;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

export const formatCurrency = (value, compact = false) => {
  const amount = Number(value || 0);
  if (compact) {
    if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
    return `₹${amount}`;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

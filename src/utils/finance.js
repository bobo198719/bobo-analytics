/**
 * Bobo Restaurant OS - Finance Logic Hub
 * Handles surcharges, discounts, and ISO processing fees.
 */

export const calculateOrderTotals = (subtotal, settings = {}) => {
  const { 
    surcharges = [], 
    discounts = [], 
    isoFeeMode = 'pass_on' 
  } = settings;

  let totalSurcharges = 0;
  let totalDiscounts = 0;
  let isoFee = 0;

  // 1. Apply active surcharges
  surcharges.filter(s => s.active).forEach(s => {
    if (s.type === 'percent') {
      totalSurcharges += (subtotal * (s.value / 100));
    } else {
      totalSurcharges += s.value;
    }
  });

  // 2. Apply active discounts
  discounts.filter(d => d.active).forEach(d => {
    if (d.type === 'percent') {
      totalDiscounts += (subtotal * (d.value / 100));
    } else {
      totalDiscounts += d.value;
    }
  });

  // 3. Tax (Fixed 5% as per current implementation, but can be dynamic)
  const taxRate = 0.05;
  const taxableAmount = subtotal + totalSurcharges - totalDiscounts;
  const tax = Math.max(0, taxableAmount * taxRate);

  // 4. ISO Fee (3.5% if passed on)
  const finalPreIso = taxableAmount + tax;
  if (isoFeeMode === 'pass_on') {
    isoFee = finalPreIso * 0.035;
  }

  const grandTotal = finalPreIso + isoFee;

  return {
    subtotal,
    surcharges: totalSurcharges,
    discounts: totalDiscounts,
    tax,
    isoFee,
    total: Math.max(0, grandTotal)
  };
};

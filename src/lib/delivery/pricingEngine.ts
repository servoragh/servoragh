/**
 * Delivery Pricing Engine for Servora Platform
 * Calculates distance, vehicle surcharge, weight factors, commission, and net earnings.
 */

export interface PricingCalculationInput {
  vehicleType: string; // BICYCLE, MOTORCYCLE, TRICYCLE, CAR, PICKUP, VAN, TRUCK
  distanceKm: number;
  packageWeightKg?: number;
  packageSize?: string; // SMALL, MEDIUM, LARGE, HEAVY_BULK
  city?: string;
  customBaseFee?: number;
  customPerKmFee?: number;
}

export interface PricingCalculationResult {
  baseFee: number;
  distanceFee: number;
  vehicleSurcharge: number;
  weightSurcharge: number;
  subtotal: number;
  deliveryFee: number; // Final Customer Price
  platformCommission: number; // 15% platform commission
  providerEarnings: number; // Net 85% provider payout
  estimatedDurationMins: number;
}

// Vehicle multipliers & baseline rates
const VEHICLE_RATES: Record<string, { baseFee: number; perKmFee: number; minFee: number }> = {
  BICYCLE: { baseFee: 8, perKmFee: 2.0, minFee: 8 },
  MOTORCYCLE: { baseFee: 12, perKmFee: 2.5, minFee: 12 },
  TRICYCLE: { baseFee: 15, perKmFee: 3.0, minFee: 15 },
  CAR: { baseFee: 25, perKmFee: 4.5, minFee: 25 },
  PICKUP: { baseFee: 45, perKmFee: 6.0, minFee: 45 },
  VAN: { baseFee: 60, perKmFee: 7.5, minFee: 60 },
  TRUCK: { baseFee: 100, perKmFee: 10.0, minFee: 100 },
};

const PACKAGE_SIZE_MULTIPLIERS: Record<string, number> = {
  SMALL: 1.0,
  MEDIUM: 1.15,
  LARGE: 1.35,
  HEAVY_BULK: 1.75,
};

export function calculateDeliveryPrice(input: PricingCalculationInput): PricingCalculationResult {
  const vehicleKey = input.vehicleType.toUpperCase();
  const rates = VEHICLE_RATES[vehicleKey] || VEHICLE_RATES.MOTORCYCLE;

  const baseFee = input.customBaseFee ?? rates.baseFee;
  const perKmFee = input.customPerKmFee ?? rates.perKmFee;

  const distanceKm = Math.max(0.5, input.distanceKm);
  const distanceFee = Math.round(distanceKm * perKmFee * 100) / 100;

  // Weight & Size surcharges
  const weightKg = input.packageWeightKg || 1.0;
  const weightSurcharge = weightKg > 5 ? Math.round((weightKg - 5) * 1.5 * 100) / 100 : 0;
  const sizeMultiplier = PACKAGE_SIZE_MULTIPLIERS[input.packageSize || "MEDIUM"] || 1.15;

  let calculatedSubtotal = (baseFee + distanceFee + weightSurcharge) * sizeMultiplier;
  const deliveryFee = Math.max(rates.minFee, Math.round(calculatedSubtotal * 100) / 100);

  // Platform commission (15%) & Provider Net (85%)
  const commissionPercentage = 0.15;
  const platformCommission = Math.round(deliveryFee * commissionPercentage * 100) / 100;
  const providerEarnings = Math.round((deliveryFee - platformCommission) * 100) / 100;

  // Estimated Travel Time (assuming average city speeds)
  const avgSpeedKmh = vehicleKey === "BICYCLE" ? 15 : vehicleKey === "MOTORCYCLE" ? 30 : 25;
  const travelMins = Math.ceil((distanceKm / avgSpeedKmh) * 60);
  const bufferMins = 10; // Pickup & handover time
  const estimatedDurationMins = travelMins + bufferMins;

  return {
    baseFee,
    distanceFee,
    vehicleSurcharge: 0,
    weightSurcharge,
    subtotal: Math.round(calculatedSubtotal * 100) / 100,
    deliveryFee,
    platformCommission,
    providerEarnings,
    estimatedDurationMins,
  };
}

/**
 * Calculates straight line / Haversine distance between two GPS coordinates in KM
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Format currency in Ghanaian Cedi (GHS)
 */
export function formatGHS(amount: number): string {
  return `GHS ${Number(amount || 0).toFixed(2)}`;
}


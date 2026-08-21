/**
 * Vehicle Matching & Dispatch Filtering Engine
 */

export const SUITABLE_VEHICLES_FOR_PACKAGE: Record<string, string[]> = {
  DOCUMENTS: ["BICYCLE", "MOTORCYCLE", "CAR"],
  FOOD: ["BICYCLE", "MOTORCYCLE", "CAR"],
  CLOTHING: ["BICYCLE", "MOTORCYCLE", "TRICYCLE", "CAR"],
  ELECTRONICS: ["MOTORCYCLE", "TRICYCLE", "CAR", "VAN"],
  GROCERIES: ["MOTORCYCLE", "TRICYCLE", "CAR", "PICKUP"],
  HOUSEHOLD: ["TRICYCLE", "CAR", "PICKUP", "VAN"],
  BUSINESS_GOODS: ["TRICYCLE", "CAR", "PICKUP", "VAN", "TRUCK"],
  AGRICULTURAL: ["PICKUP", "VAN", "TRUCK"],
  OTHER: ["MOTORCYCLE", "TRICYCLE", "CAR", "PICKUP", "VAN", "TRUCK"],
};

export function getEligibleVehicleTypes(packageCategory: string, requestedVehicleType?: string): string[] {
  if (requestedVehicleType && requestedVehicleType !== "ANY") {
    return [requestedVehicleType.toUpperCase()];
  }

  const category = packageCategory.toUpperCase();
  return SUITABLE_VEHICLES_FOR_PACKAGE[category] || ["MOTORCYCLE", "CAR", "TRICYCLE"];
}

export function generateTrackingNumber(): string {
  const prefix = "SERV-DEL";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

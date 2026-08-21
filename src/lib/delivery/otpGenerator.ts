/**
 * 4-Digit Proof of Delivery PIN OTP Generator
 */
export function generateDeliveryPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

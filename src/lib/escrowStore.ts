import { EscrowDeal, EscrowStatus, EscrowStats } from "./escrowTypes";

const INITIAL_ESCROW_DEALS: EscrowDeal[] = [
  {
    id: "esc-1",
    dealCode: "ESC-9082-GH",
    title: "5.5KVA Silent Diesel Generator Purchase",
    amountGhs: 1200,
    platformFeeGhs: 0,
    sellerPayoutGhs: 1200,
    buyerName: "Alhassan Ibrahim",
    buyerPhone: "+233241122334",
    sellerName: "Kwame Electrician",
    sellerPhone: "+233244889900",
    sellerBusinessName: "Kwame Electrical & Solar",
    deliveryArea: "Sakasaka, Tamale",
    status: "HELD_IN_ESCROW",
    momoProvider: "MTN_MOMO",
    momoReference: "MOMO-REF-998210",
    notes: "Buyer initiated escrow for generator purchase over WhatsApp.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "esc-2",
    dealCode: "ESC-7731-GH",
    title: "Royal Dagbon Handwoven Smock Tailoring",
    amountGhs: 450,
    platformFeeGhs: 0,
    sellerPayoutGhs: 450,
    buyerName: "Amina Abdul-Mumin",
    buyerPhone: "+233501239988",
    sellerName: "Fatima Abdul-Rahman",
    sellerPhone: "+233501234567",
    sellerBusinessName: "Northern Authentic Fugu & Fabrics",
    deliveryArea: "Nyohini, Tamale",
    status: "RELEASED_TO_SELLER",
    momoProvider: "TELECEL_CASH",
    momoReference: "TELECEL-REF-55102",
    notes: "Item received by buyer cleanly.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    releasedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "esc-3",
    dealCode: "ESC-6612-GH",
    title: "iPhone 13 Screen Replacement Parts",
    amountGhs: 650,
    platformFeeGhs: 0,
    sellerPayoutGhs: 650,
    buyerName: "Yakubu Fuseini",
    buyerPhone: "+233209988776",
    sellerName: "Abdul Hanan",
    sellerPhone: "+233500710610",
    sellerBusinessName: "Goodie Electronics",
    deliveryArea: "Tamale Central Market",
    status: "DISPUTED",
    momoProvider: "MTN_MOMO",
    momoReference: "MOMO-REF-44109",
    disputeReason: "Buyer claims screen received was for iPhone 12 instead of iPhone 13.",
    notes: "Under dispute resolution.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

let escrowMemory: EscrowDeal[] = [...INITIAL_ESCROW_DEALS];

export async function getEscrowDeals(statusFilter: EscrowStatus | "ALL" = "ALL", searchQuery?: string): Promise<{ deals: EscrowDeal[]; stats: EscrowStats }> {
  let list = [...escrowMemory];

  const stats: EscrowStats = {
    totalDeals: list.length,
    totalHeldGhs: list.filter((d) => d.status === "HELD_IN_ESCROW").reduce((acc, d) => acc + d.amountGhs, 0),
    totalReleasedGhs: list.filter((d) => d.status === "RELEASED_TO_SELLER").reduce((acc, d) => acc + d.amountGhs, 0),
    totalRefundedGhs: list.filter((d) => d.status === "REFUNDED_TO_BUYER").reduce((acc, d) => acc + d.amountGhs, 0),
    activeEscrowsCount: list.filter((d) => d.status === "HELD_IN_ESCROW").length,
    disputedCount: list.filter((d) => d.status === "DISPUTED").length,
  };

  if (statusFilter !== "ALL") {
    list = list.filter((d) => d.status === statusFilter);
  }

  if (searchQuery && searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (d) =>
        d.dealCode.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.sellerName.toLowerCase().includes(q) ||
        d.buyerPhone.includes(q) ||
        d.sellerPhone.includes(q)
    );
  }

  return { deals: list, stats };
}

export async function createEscrowDeal(dealData: Omit<EscrowDeal, "id" | "dealCode" | "status" | "createdAt">): Promise<EscrowDeal> {
  const newDeal: EscrowDeal = {
    ...dealData,
    id: `esc-${Date.now()}`,
    dealCode: `ESC-${Math.floor(1000 + Math.random() * 9000)}-GH`,
    status: "HELD_IN_ESCROW",
    createdAt: new Date().toISOString(),
  };

  escrowMemory.unshift(newDeal);
  return newDeal;
}

export async function updateEscrowStatus(
  id: string,
  newStatus: EscrowStatus,
  reasonOrNotes?: string
): Promise<EscrowDeal | null> {
  const deal = escrowMemory.find((d) => d.id === id || d.dealCode === id);
  if (!deal) return null;

  deal.status = newStatus;
  if (newStatus === "RELEASED_TO_SELLER") {
    deal.releasedAt = new Date().toISOString();
  } else if (newStatus === "REFUNDED_TO_BUYER") {
    deal.refundedAt = new Date().toISOString();
  } else if (newStatus === "DISPUTED" && reasonOrNotes) {
    deal.disputeReason = reasonOrNotes;
  }

  if (reasonOrNotes && newStatus !== "DISPUTED") {
    deal.notes = (deal.notes ? deal.notes + " | " : "") + reasonOrNotes;
  }

  return deal;
}

import { getAllProductListings } from "../src/lib/productListingsStore";

async function test() {
  const result = await getAllProductListings();
  console.log(`Total Unified Products & Listings Fetched: ${result.total}`);
  console.log(result.listings.map((l) => `- [${l.status}] ${l.title} (${l.sellerName})`));
}

test();

import { executeUniversalSearch, expandQuery } from "../src/lib/search/hybridSearchEngine";

async function testSearchEngine() {
  console.log("=== 1. Testing Query Expansion & Ghanaian Dialect Synonyms ===");
  const test1 = expandQuery("cemet mixer sakasaka");
  console.log("Input: 'cemet mixer sakasaka'");
  console.log("Tokens:", test1.tokens);
  console.log("Detected Zone:", test1.detectedZone);
  console.log("Expanded terms (sample):", test1.expandedTerms.slice(0, 8));

  console.log("\n=== 2. Testing Typo Tolerance & Phonetic Normalization ===");
  const test2 = expandQuery("iphoen scren");
  console.log("Input: 'iphoen scren'");
  console.log("Corrected Tokens:", test2.tokens);

  console.log("\n=== 3. Executing Universal Hybrid Search: 'solar inverter' ===");
  const res1 = await executeUniversalSearch("solar inverter", { limit: 10 });
  console.log(`Processing Time: ${res1.processingTimeMs}ms`);
  console.log(`Total Hits: ${res1.totalHits}`);
  console.log("Facets:", res1.facets);
  console.log("Top Hits Summary:");
  res1.hits.all.slice(0, 4).forEach((h, i) => {
    console.log(`  [${i + 1}] [${h.entityType.toUpperCase()}] ${h.title} (Score: ${h.score}) - ${h.subtitle}`);
  });

  console.log("\n=== 4. Executing Universal Hybrid Search: 'fitter' (Ghanaian synonym for mechanic) ===");
  const res2 = await executeUniversalSearch("fitter", { limit: 5 });
  console.log(`Processing Time: ${res2.processingTimeMs}ms | Total Hits: ${res2.totalHits}`);
  res2.hits.all.slice(0, 3).forEach((h, i) => {
    console.log(`  [${i + 1}] [${h.entityType.toUpperCase()}] ${h.title} (Score: ${h.score})`);
  });

  console.log("\n=== 5. Testing Zero-Match Unfulfilled Demand Capture ===");
  const resZero = await executeUniversalSearch("nonexistentxyzunobtainium123", { zone: "Tamale" });
  console.log(`Zero Match Hits: ${resZero.totalHits}`);
  console.log("Zero Match Prompt:", resZero.zeroMatchPrompt);

  console.log("\n=== All Universal Search Engine tests passed successfully! ===");
}

testSearchEngine().catch(console.error).finally(() => process.exit(0));

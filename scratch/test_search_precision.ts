async function testUniversalSearch() {
  const queries = [
    "fugu",
    "solar",
    "generator",
    "electrician",
    "smock",
    "tamale",
    "rotary hammer drill"
  ];

  console.log("=== Testing Universal Search Engine Precision ===");

  for (const q of queries) {
    const start = Date.now();
    const res = await fetch(`http://localhost:3000/api/v1/search/universal?q=${encodeURIComponent(q)}`);
    const elapsed = Date.now() - start;
    const data = await res.json();

    console.log(`\nQuery: "${q}" | Status: ${res.status} | Took: ${elapsed}ms | Total Hits: ${data?.totalHits}`);
    if (data?.hits?.all && data.hits.all.length > 0) {
      console.log("Top Hits:");
      data.hits.all.slice(0, 3).forEach((h: any, i: number) => {
        console.log(`  [${i + 1}] [${h.type}] ${h.title} (Score: ${h.score}) -> Category: ${h.category} | Zone: ${h.zone}`);
      });
    } else {
      console.log("  No matches found (Demand capture triggered)");
    }
  }
}

testUniversalSearch();

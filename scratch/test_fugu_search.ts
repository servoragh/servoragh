async function testFugu() {
  const res = await fetch("http://localhost:3000/api/v1/search/universal?q=fugu");
  const data = await res.json();
  console.log("=== FUGU SEARCH RESPONSE ===");
  console.log("totalHits:", data.totalHits);
  console.log("allHits length:", data.hits?.all?.length);
  console.log("first 2 hits:", JSON.stringify(data.hits?.all?.slice(0, 2), null, 2));
}

testFugu();

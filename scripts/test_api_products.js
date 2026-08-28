async function main() {
  const res = await fetch('http://localhost:3000/api/products');
  const data = await res.json();
  console.log('Total products:', data.products?.length);
  for (const p of data.products || []) {
    console.log(`[${p.title}] -> Provider: "${p.provider?.businessName}" | Slug: "${p.provider?.slug}"`);
  }

  const searchRes = await fetch('http://localhost:3000/api/search?scope=providers');
  const searchData = await searchRes.json();
  console.log('\nTotal search providers:', searchData.results?.providers?.length);
  for (const pr of searchData.results?.providers || []) {
    console.log(`Provider: "${pr.businessName}" | Slug: "${pr.slug}"`);
  }
}

main().catch(console.error);

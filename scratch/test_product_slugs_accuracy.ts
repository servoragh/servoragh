async function testProductSlug() {
  const slugs = [
    "0355ac6f-5ce7-4200-8ce6-9da3f6703cbd",
    "cc24bc65-98aa-49e4-b3b7-5d1574f0e968",
    "royal-handwoven-dagbon-fugu-smock"
  ];

  for (const slug of slugs) {
    const url = `http://localhost:3000/api/products/${slug}`;
    console.log(`\nFetching ${slug}...`);
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Title:", data?.product?.title);
    console.log("Slug:", data?.product?.slug);
    console.log("ID:", data?.product?.id);
  }
}

testProductSlug();

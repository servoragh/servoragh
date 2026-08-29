async function testRoute() {
  const url = "http://localhost:3000/api/products/apple-gift-card-9355";
  console.log("Testing:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Title:", data?.product?.title || data?.title || data?.error);
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }
}

testRoute();

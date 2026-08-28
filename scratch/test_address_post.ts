import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "servora-super-secret-key-tamale-2026";
const token = jwt.sign(
  {
    id: "d60e355b-776b-4d43-b638-b583e8908233",
    name: "Amina Abdul-Rahman",
    phone: "+233241112233",
    email: "amina@gmail.com",
    role: "CUSTOMER",
    isPhoneVerified: true,
  },
  JWT_SECRET,
  { expiresIn: "30d" }
);

async function testPostAddress() {
  const res = await fetch("http://localhost:3000/api/account/address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Cookie": `servora_token=${token}`,
    },
    body: JSON.stringify({
      label: "Main Workshop",
      zone: "Tamale Central",
      landmark: "Opposite Police Station",
      streetDetails: "Hospital Road",
      isDefault: true,
    }),
  });

  const data = await res.json();
  console.log("RESPONSE STATUS:", res.status);
  console.log("RESPONSE BODY:", data);
}

testPostAddress().catch(console.error);

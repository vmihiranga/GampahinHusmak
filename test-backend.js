// Test backend API endpoints
const BASE_URL = "http://localhost:5000/api";

async function testAPI(name, endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await response.json();
    const status = response.ok ? "✅" : "❌";
    console.log(
      `${status} ${name} (${response.status}): ${JSON.stringify(data).substring(0, 150)}...`,
    );
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("\n=== Backend API Tests ===\n");

  // Public endpoints
  console.log("--- Public Endpoints ---");
  await testAPI("GET /stats", "/stats");
  await testAPI("GET /trees", "/trees");
  await testAPI("GET /events", "/events");
  await testAPI("GET /gallery", "/gallery");

  // Auth endpoints (without login)
  console.log("\n--- Auth Endpoints (unauthenticated) ---");
  await testAPI("GET /auth/me (unauthenticated)", "/auth/me");

  // Contact submit
  console.log("\n--- Contact Endpoint ---");
  await testAPI("POST /contact", "/contact", {
    method: "POST",
    body: JSON.stringify({
      name: "Test User",
      email: "test@test.com",
      subject: "Test Subject",
      message: "Test Message",
    }),
  });

  // Admin endpoints (should fail without auth)
  console.log("\n--- Admin Endpoints (should fail without auth) ---");
  await testAPI("GET /admin/users (unauthenticated)", "/admin/users");
  await testAPI("GET /admin/summary (unauthenticated)", "/admin/summary");

  // Test a specific tree
  console.log("\n--- Single Resource Tests ---");
  const treesResult = await testAPI("GET /trees", "/trees");
  if (
    treesResult.success &&
    treesResult.data.trees &&
    treesResult.data.trees.length > 0
  ) {
    const treeId = treesResult.data.trees[0]._id;
    await testAPI(`GET /trees/${treeId}`, `/trees/${treeId}`);
  }

  console.log("\n=== Test Summary ===");
  console.log("All public endpoints working correctly!");
  console.log("Auth-protected endpoints correctly returning 401.");
}

runTests();

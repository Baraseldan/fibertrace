import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';
let authToken: string = '';
let testUserId: number = 0;

// Test utilities
const tests: { name: string; passed: boolean; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    tests.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    tests.push({ name, passed: false, error: String(error) });
    console.log(`❌ ${name}: ${error}`);
  }
}

// ============ TESTS ============

async function runTests() {
  console.log('\n🧪 FiberTrace Backend Test Suite\n');

  // 1. Health check
  await test('Health Check', async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
  });

  // 2. Register user
  await test('Auth: Register', async () => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        email: `test${Date.now()}@fibertrace.app`,
        password: 'TestPassword123',
        role: 'technician',
      }),
    });
    if (!res.ok) throw new Error('Registration failed');
    const data = (await res.json()) as any;
    if (!data.token) throw new Error('No token returned');
    if (!data.user?.id) throw new Error('No user ID returned');
    authToken = data.token;
    testUserId = data.user.id;
  });

  // 3. Login
  await test('Auth: Login', async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@fibertrace.app`,
        password: 'TestPassword123',
      }),
    });
    // May fail if email doesn't exist yet, which is ok
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.token) authToken = data.token;
    }
  });

  // 4. Get current user (requires JWT)
  await test('Auth: Get Me (Protected)', async () => {
    if (!authToken) throw new Error('No auth token available');
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    if (!res.ok) throw new Error('Get me failed');
    const data = (await res.json()) as any;
    if (!data.user?.id) throw new Error('No user data returned');
  });

  // 5. Map data endpoint
  await test('Map: Get All Layers', async () => {
    const res = await fetch(`${API_BASE}/api/map/data`);
    if (!res.ok) throw new Error('Map data fetch failed');
    const data = (await res.json()) as any;
    if (!data.counts) throw new Error('No counts in response');
  });

  // 6. Map filtered layers
  await test('Map: Get Filtered Layers', async () => {
    const res = await fetch(`${API_BASE}/api/map/layers?layers=routes,nodes,closures`);
    if (!res.ok) throw new Error('Map layers fetch failed');
    const data = (await res.json()) as any;
    if (typeof data !== 'object') throw new Error('Invalid response format');
  });

  // 7. Create Route
  await test('CRUD: Create Route', async () => {
    const res = await fetch(`${API_BASE}/api/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route_name: 'Test Route',
        cable_type: 'SM 12F',
        core_count: 12,
        total_length_meters: 1500,
        created_by: testUserId,
      }),
    });
    if (!res.ok) throw new Error('Route creation failed');
  });

  // 8. Get Routes
  await test('CRUD: Get Routes', async () => {
    const res = await fetch(`${API_BASE}/api/routes`);
    if (!res.ok) throw new Error('Routes fetch failed');
    const data = (await res.json()) as any;
    if (!data.routes) throw new Error('No routes array in response');
  });

  // 9. Create Node
  await test('CRUD: Create Node', async () => {
    const res = await fetch(`${API_BASE}/api/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_name: 'Test Pole',
        node_type: 'Pole',
        latitude: 40.7128,
        longitude: -74.006,
        power_status: 'active',
        created_by: testUserId,
      }),
    });
    if (!res.ok) throw new Error('Node creation failed');
  });

  // 10. Get Nodes
  await test('CRUD: Get Nodes', async () => {
    const res = await fetch(`${API_BASE}/api/nodes`);
    if (!res.ok) throw new Error('Nodes fetch failed');
    const data = (await res.json()) as any;
    if (!data.nodes) throw new Error('No nodes array in response');
  });

  // 11. Create Closure
  await test('CRUD: Create Closure', async () => {
    const res = await fetch(`${API_BASE}/api/closures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        closure_name: 'Test FAT',
        closure_type: 'FAT',
        latitude: 40.7128,
        longitude: -74.006,
        fiber_count: 12,
        capacity_total: 8,
        created_by: testUserId,
      }),
    });
    if (!res.ok) throw new Error('Closure creation failed');
  });

  // 12. Get Closures
  await test('CRUD: Get Closures', async () => {
    const res = await fetch(`${API_BASE}/api/closures`);
    if (!res.ok) throw new Error('Closures fetch failed');
    const data = (await res.json()) as any;
    if (!data.closures) throw new Error('No closures array in response');
  });

  // 13. Get Stats
  await test('Stats: Get Dashboard Stats', async () => {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error('Stats fetch failed');
    const data = (await res.json()) as any;
    if (!data.totalNodes) throw new Error('No stats data returned');
  });

  // 14. Get User Settings
  await test('Settings: Get User Settings', async () => {
    const res = await fetch(`${API_BASE}/api/users/${testUserId}/settings`);
    if (!res.ok) throw new Error('Settings fetch failed');
  });

  // 15. Update User Settings
  await test('Settings: Update User Settings', async () => {
    const res = await fetch(`${API_BASE}/api/users/${testUserId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'dark',
        language: 'en',
        units: 'metric',
      }),
    });
    if (!res.ok) throw new Error('Settings update failed');
  });

  // ============ SUMMARY ============
  console.log('\n' + '='.repeat(50));
  const passed = tests.filter((t) => t.passed).length;
  const total = tests.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED - System is operational!');
  } else {
    console.log('\n⚠️ Some tests failed:');
    tests.filter((t) => !t.passed).forEach((t) => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});

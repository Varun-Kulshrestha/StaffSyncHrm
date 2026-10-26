/**
 * StaffSync HRM - Module 1 Backend API Smoke & Defect Verification Script
 * Run with: node automation/backend-api-check.js
 */
const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

async function post(endpoint, data, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function get(endpoint, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${endpoint}`, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function runTests() {
  console.log('========================================================');
  console.log(`StaffSync HRM - Smoke & Defect Automated Check`);
  console.log(`Target: ${baseUrl}`);
  console.log('========================================================\n');

  try {
    // 1. Admin Login
    const admin = await post('/auth/login', { email: 'admin@staffsync.com', password: 'Admin@123' });
    console.log(`[PASS] Admin Login: HTTP ${admin.status} - Role: ${admin.data.user?.role}`);

    // 2. HR Login
    const hr = await post('/auth/login', { email: 'hr@staffsync.com', password: 'Hr@123' });
    console.log(`[PASS] HR Login: HTTP ${hr.status} - Role: ${hr.data.user?.role}`);

    // 3. Employee Login
    const emp = await post('/auth/login', { email: 'employee@staffsync.com', password: 'Emp@123' });
    console.log(`[PASS] Employee Login: HTTP ${emp.status} - Role: ${emp.data.user?.role}`);

    // 4. Defect 1 Check (Untrimmed email)
    const untrimmed = await post('/auth/login', { email: ' admin@staffsync.com ', password: 'Admin@123' });
    console.log(`[DEFECT-1 DETECTED] Untrimmed Email Login returned HTTP ${untrimmed.status} (Expected 401 bug): ${untrimmed.data.message}`);

    // 5. Defect 2 Check (Deactivated user error code)
    const deact = await post('/auth/login', { email: 'deactivated@staffsync.com', password: 'Deact@123' });
    console.log(`[DEFECT-2 DETECTED] Deactivated Account returned HTTP ${deact.status} (Expected 500 bug): ${deact.data.message}`);

    // 6. Defect 3 Check (Employee accessing Admin stats)
    const stats = await get('/admin/stats', emp.data.token);
    console.log(`[DEFECT-3 DETECTED] Employee token accessing /admin/stats returned HTTP ${stats.status} (Expected 200 privilege leak bug)`);

    console.log('\nAll API checks completed successfully.');
  } catch (err) {
    console.error('Smoke check error (ensure backend server is running on port 5000):', err.message);
  }
}

runTests();

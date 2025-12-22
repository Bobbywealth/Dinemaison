#!/usr/bin/env tsx

/**
 * Endpoint Verification Script
 * 
 * This script tests all major API endpoints to ensure they're properly wired up
 * and responding correctly.
 * 
 * Usage: npm run test:endpoints
 */

import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  message?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  method: string,
  endpoint: string,
  expectedStatus: number | number[] = 200,
  data?: any,
  auth?: string
): Promise<void> {
  const url = `${BASE_URL}${endpoint}`;
  const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  
  try {
    const config: any = {
      method,
      url,
      validateStatus: () => true, // Accept all status codes
      headers: auth ? { Cookie: auth } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const success = expectedStatuses.includes(response.status);
    
    results.push({
      endpoint,
      method,
      status: response.status,
      success,
      message: success ? 'OK' : `Expected ${expectedStatuses.join(' or ')}, got ${response.status}`
    });
    
    const color = success ? colors.green : colors.red;
    const symbol = success ? '✓' : '✗';
    console.log(`${color}${symbol}${colors.reset} ${method.padEnd(7)} ${endpoint} (${response.status})`);
  } catch (error: any) {
    results.push({
      endpoint,
      method,
      status: 0,
      success: false,
      message: error.message
    });
    console.log(`${colors.red}✗${colors.reset} ${method.padEnd(7)} ${endpoint} (ERROR: ${error.message})`);
  }
}

async function runTests() {
  console.log(`${colors.blue}==================================${colors.reset}`);
  console.log(`${colors.blue}API Endpoint Verification${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}==================================${colors.reset}\n`);

  // System Endpoints
  console.log(`${colors.yellow}System Endpoints:${colors.reset}`);
  await testEndpoint('GET', '/api/health', 200);
  await testEndpoint('GET', '/api/debug/info', 200);
  await testEndpoint('GET', '/api/docs', 200);
  await testEndpoint('GET', '/api/docs/openapi.json', 200);
  console.log();

  // Public Endpoints (no auth required)
  console.log(`${colors.yellow}Public Endpoints:${colors.reset}`);
  await testEndpoint('GET', '/api/markets', 200);
  await testEndpoint('GET', '/api/chefs', 200);
  await testEndpoint('GET', '/api/stripe/publishable-key', 200);
  await testEndpoint('GET', '/api/notifications/vapid-public-key', 200);
  console.log();

  // Auth Endpoints
  console.log(`${colors.yellow}Auth Endpoints:${colors.reset}`);
  await testEndpoint('GET', '/api/auth/user', [200, 401]); // Can be 200 if already logged in
  await testEndpoint('POST', '/api/auth/signup', [201, 400], {
    email: `test${Date.now()}@example.com`,
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User'
  });
  console.log();

  // Protected Endpoints (expecting 401 without auth)
  console.log(`${colors.yellow}Protected Endpoints (expecting 401):${colors.reset}`);
  await testEndpoint('GET', '/api/user/role', 401);
  await testEndpoint('GET', '/api/chef/profile', 401);
  await testEndpoint('GET', '/api/bookings', 401);
  await testEndpoint('GET', '/api/customer/favorites', 401);
  await testEndpoint('GET', '/api/notifications/preferences', 401);
  console.log();

  // Admin Endpoints (expecting 401/403 without admin auth)
  console.log(`${colors.yellow}Admin Endpoints (expecting 401/403):${colors.reset}`);
  await testEndpoint('GET', '/api/admin/stats', [401, 403]);
  await testEndpoint('GET', '/api/admin/users', [401, 403]);
  await testEndpoint('GET', '/api/admin/chefs', [401, 403]);
  await testEndpoint('GET', '/api/admin/bookings', [401, 403]);
  await testEndpoint('GET', '/api/tasks', [401, 403]);
  console.log();

  // Upload Endpoints (expecting 401 without auth)
  console.log(`${colors.yellow}Upload Endpoints (expecting 401):${colors.reset}`);
  await testEndpoint('POST', '/api/upload/profile-image', 401);
  await testEndpoint('POST', '/api/upload/gallery-image', 401);
  await testEndpoint('POST', '/api/upload/verification-document', 401);
  console.log();

  // Non-existent endpoint (expecting 404)
  console.log(`${colors.yellow}404 Test:${colors.reset}`);
  await testEndpoint('GET', '/api/nonexistent', 404);
  console.log();

  // Summary
  console.log(`${colors.blue}==================================${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}==================================${colors.reset}`);
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${successRate}%\n`);

  if (failedTests > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ${colors.red}✗${colors.reset} ${r.method} ${r.endpoint}: ${r.message}`);
    });
    console.log();
  }

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});



# CI/CD Suggestions

## 📋 Document Purpose
This document provides minimal CI changes to guard against regressions in the Techspert platform.

**Last Updated**: 2025-11-11
**Status**: Recommendations

---

## 🔧 **RECOMMENDED CI PIPELINE**

### **Phase 1: Linting & Type Checking**

```yaml
# .github/workflows/ci.yml (if using GitHub Actions)
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check  # If TypeScript
```

**Files to Check**:
- ESLint configuration
- TypeScript configuration (if applicable)
- Prettier configuration (if applicable)

---

### **Phase 2: Unit Tests**

```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3  # Optional: code coverage
```

**Requirements**:
- Minimum 70% code coverage
- All tests must pass
- No skipped tests

---

### **Phase 3: Integration Tests**

```yaml
  integration-test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
    env:
      MONGO_URI: mongodb://localhost:27017/techspert-test
```

**Requirements**:
- Test critical API endpoints
- Test authentication flows
- Test database operations

---

### **Phase 4: Build Verification**

```yaml
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: cd server && npm run build  # If server has build step
```

**Requirements**:
- Frontend builds successfully
- Backend builds successfully (if applicable)
- No build errors or warnings

---

### **Phase 5: E2E Tests (Optional but Recommended)**

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

**Requirements**:
- Playwright or Cypress setup
- Test critical user flows
- Test admin panel workflows

---

## 🛡️ **REGRESSION GUARDS**

### **1. Pre-commit Hooks**

Create `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:unit
```

**Purpose**: Prevent broken code from being committed

---

### **2. Branch Protection Rules**

**Required**:
- All CI checks must pass
- At least 1 code review required
- No force push to main
- No deletion of main branch

---

### **3. Automated Security Scanning**

```yaml
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Purpose**: Detect vulnerable dependencies

---

## 📝 **MINIMAL CI SETUP (Quick Start)**

### **Option 1: GitHub Actions**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd server && npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          MONGO_URI: mongodb://localhost:27017/techspert-test
          NODE_ENV: test
      
      - name: Build
        run: |
          npm run build
          cd server && npm run build || true
```

---

### **Option 2: GitLab CI**

Create `.gitlab-ci.yml`:
```yaml
stages:
  - lint
  - test
  - build

lint:
  stage: lint
  image: node:18
  script:
    - npm ci
    - npm run lint

test:
  stage: test
  image: node:18
  services:
    - mongo:latest
  variables:
    MONGO_URI: mongodb://mongo:27017/techspert-test
  script:
    - npm ci
    - cd server && npm ci
    - npm test

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
```

---

## 🎯 **CRITICAL CHECKS TO ADD**

### **1. Admin Panel Smoke Test**
```javascript
// tests/e2e/admin-smoke.test.js
test('Admin panel loads and login works', async () => {
  await page.goto('http://localhost:5173/admin/login')
  await page.fill('[name="email"]', 'admin@techspert.com')
  await page.fill('[name="password"]', 'admin123456')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*admin\/dashboard/)
})
```

---

### **2. API Endpoint Health Check**
```javascript
// tests/integration/api-health.test.js
test('Admin courses endpoint returns data', async () => {
  const token = await getAdminToken()
  const response = await api.get('/admin/courses', {
    headers: { Authorization: `Bearer ${token}` }
  })
  expect(response.status).toBe(200)
  expect(response.data.success).toBe(true)
})
```

---

### **3. Database Migration Check**
```bash
# scripts/check-migrations.sh
#!/bin/bash
# Verify all migrations are applied
npm run migrate:status
```

---

## 📊 **METRICS TO TRACK**

### **Build Metrics**
- Build success rate
- Build duration
- Test execution time

### **Code Quality Metrics**
- Linting errors count
- Test coverage percentage
- Code complexity

### **Deployment Metrics**
- Deployment frequency
- Mean time to recovery (MTTR)
- Change failure rate

---

## 🔄 **CONTINUOUS IMPROVEMENT**

### **Phase 1 (Immediate)**
- [ ] Set up basic CI pipeline
- [ ] Add linting checks
- [ ] Add unit test execution
- [ ] Add build verification

### **Phase 2 (Short-term)**
- [ ] Add integration tests
- [ ] Add E2E smoke tests
- [ ] Add security scanning
- [ ] Add code coverage reporting

### **Phase 3 (Long-term)**
- [ ] Add performance testing
- [ ] Add load testing
- [ ] Add automated deployment
- [ ] Add monitoring and alerting

---

## 🚨 **CRITICAL REGRESSION CHECKS**

### **Must Pass Before Merge**:
1. ✅ All linting checks pass
2. ✅ All unit tests pass
3. ✅ Build succeeds
4. ✅ No critical security vulnerabilities
5. ✅ Admin login works (smoke test)
6. ✅ Core CRUD operations work (integration test)

---

**Document Status**: Recommendations - Ready for Implementation
**Priority**: HIGH - Should be implemented before major releases


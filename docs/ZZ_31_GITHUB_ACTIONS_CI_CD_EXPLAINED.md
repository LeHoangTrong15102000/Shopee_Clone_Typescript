# 📚 GIẢI THÍCH CHI TIẾT FILE CI/CD PIPELINE - GITHUB ACTIONS

> **Tài liệu giải thích từng dòng của file `.github/workflows/ci-cd-pipeline.yml` - Dành cho người mới bắt đầu**

---

## 📋 MỤC LỤC

1. [🔧 Phần Cấu Hình Cơ Bản](#-phần-cấu-hình-cơ-bản)
2. [🎯 Triggers - Khi Nào Pipeline Chạy](#-triggers---khi-nào-pipeline-chạy)
3. [🔍 Job 1: Changes Detection](#-job-1-changes-detection)
4. [🧹 Job 2: Code Quality](#-job-2-code-quality)
5. [🛡️ Job 3: Security Scanning](#️-job-3-security-scanning)
6. [🧪 Job 4: Testing Suite](#-job-4-testing-suite)
7. [🏗️ Job 5: Build Application](#️-job-5-build-application)
8. [🚀 Job 6: Deploy Staging](#-job-6-deploy-staging)
9. [🌟 Job 7: Deploy Production](#-job-7-deploy-production)
10. [💡 Tóm Tắt Workflow](#-tóm-tắt-workflow)

---

## 🔧 PHẦN CẤU HÌNH CƠ BẢN

### Dòng 1-2: Tên và Biến Môi Trường

```yaml
name: 🚀 Shopee Clone CI/CD Pipeline

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '9'
```

**🔍 Giải thích:**

- `name`: Tên hiển thị của workflow trong GitHub Actions tab
- `env`: Định nghĩa biến môi trường dùng chung cho toàn bộ pipeline
  - `NODE_VERSION: '18'`: Sử dụng Node.js version 18
  - `PNPM_VERSION: '9'`: Sử dụng PNPM version 9 (package manager)

**🤔 Tại sao dùng biến?**

- Dễ thay đổi version ở một chỗ thay vì sửa nhiều nơi
- Đảm bảo consistency across các jobs

---

## 🎯 TRIGGERS - KHI NÀO PIPELINE CHẠY

### Dòng 6-12: Kích Hoạt Pipeline

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
```

**🔍 Giải thích từng trigger:**

#### 1. `push: branches: [main, develop]`

- **Khi nào chạy**: Khi ai đó push code lên nhánh `main` hoặc `develop`
- **Ví dụ**: Bạn commit và push lên nhánh develop → Pipeline tự động chạy

#### 2. `pull_request: branches: [main, develop]`

- **Khi nào chạy**: Khi tạo Pull Request vào nhánh `main` hoặc `develop`
- **Ví dụ**: Bạn tạo PR từ feature branch → Pipeline chạy để check code

#### 3. `workflow_dispatch:`

- **Khi nào chạy**: Chạy thủ công từ GitHub UI
- **Ví dụ**: Vào Actions tab → Click "Run workflow" button

### Dòng 14-16: Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**🔍 Giải thích:**

- `group`: Nhóm các workflow runs lại với nhau
- `cancel-in-progress: true`: Hủy workflow đang chạy nếu có workflow mới

**🎯 Mục đích:** Tiết kiệm tài nguyên, tránh chạy nhiều pipeline cùng lúc cho cùng một branch

---

## 🔍 JOB 1: CHANGES DETECTION

### Dòng 18-46: Phát Hiện Thay Đổi

```yaml
changes:
  name: 🔍 Detect Changes
  runs-on: ubuntu-latest
  outputs:
    src: ${{ steps.filter.outputs.src }}
    tests: ${{ steps.filter.outputs.tests }}
    docs: ${{ steps.filter.outputs.docs }}
```

**🔍 Giải thích cấu trúc Job:**

#### `name: 🔍 Detect Changes`

- Tên hiển thị của job trong GitHub Actions UI

#### `runs-on: ubuntu-latest`

- Job sẽ chạy trên máy ảo Ubuntu mới nhất
- GitHub cung cấp miễn phí các runners: ubuntu, windows, macos

#### `outputs:`

- Định nghĩa các outputs mà job này sẽ trả về
- Các job khác có thể sử dụng outputs này làm điều kiện

### Steps của Job Changes

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 🔍 Detect Changes
    uses: dorny/paths-filter@v2
    id: filter
    with:
      filters: |
        src:
          - 'src/**'
          - 'public/**'
          - 'package.json'
          - 'pnpm-lock.yaml'
          - 'vite.config.ts'
          - 'tsconfig.json'
        tests:
          - 'test/**'
          - 'vitest.setup.js'
          - 'src/**/*.test.{ts,tsx}'
        docs:
          - 'docs/**'
          - '*.md'
```

**🔍 Giải thích từng step:**

#### Step 1: `actions/checkout@v4`

- **Mục đích**: Download source code từ repository về runner
- **Tại sao cần**: Runner ban đầu trống, cần code để làm việc

#### Step 2: `dorny/paths-filter@v2`

- **Mục đích**: Kiểm tra files nào đã thay đổi trong commit/PR
- **id: filter**: Đặt ID để reference outputs
- **filters**: Định nghĩa các nhóm files:

  - **`src:`** - Files liên quan đến source code
    - `src/**`: Tất cả files trong thư mục src
    - `package.json`: Dependencies thay đổi
    - `vite.config.ts`: Build config thay đổi
  - **`tests:`** - Files liên quan đến testing
    - `test/**`: Test files
    - `src/**/*.test.{ts,tsx}`: Unit test files
  - **`docs:`** - Files documentation
    - `docs/**`: Documentation files
    - `*.md`: Markdown files

**🎯 Tại sao cần detect changes?**

- **Tối ưu thời gian**: Chỉ chạy tests khi code thay đổi
- **Tiết kiệm tài nguyên**: Không build khi chỉ sửa docs
- **Smart pipeline**: Conditional execution based on changes

---

## 🧹 JOB 2: CODE QUALITY

### Dòng 48-82: Kiểm Tra Chất Lượng Code

```yaml
code-quality:
  name: 🔍 Code Quality & Type Safety
  runs-on: ubuntu-latest
  needs: changes
  if: needs.changes.outputs.src == 'true'
```

**🔍 Giải thích job configuration:**

#### `needs: changes`

- **Ý nghĩa**: Job này chỉ chạy sau khi job `changes` hoàn thành
- **Dependency**: Tạo thứ tự thực hiện jobs

#### `if: needs.changes.outputs.src == 'true'`

- **Điều kiện**: Chỉ chạy khi có thay đổi ở source code
- **Logic**: Nếu chỉ sửa docs → skip job này

### Steps của Code Quality Job

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 📦 Setup PNPM
    uses: pnpm/action-setup@v2
    with:
      version: ${{ env.PNPM_VERSION }}

  - name: 🟢 Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      cache: 'pnpm'

  - name: 📦 Install Dependencies
    run: pnpm install --frozen-lockfile

  - name: 🔒 TypeScript Type Check
    run: pnpm run build # tsc check included

  - name: 🧹 ESLint Check
    run: pnpm run lint

  - name: 💅 Prettier Check
    run: pnpm run prettier
```

**🔍 Giải thích từng step:**

#### Step 1: Checkout Code

- Giống như job trước, cần download code

#### Step 2: Setup PNPM

- **Action**: `pnpm/action-setup@v2`
- **Mục đích**: Cài đặt PNPM package manager
- **with**: Truyền parameters cho action
- **version**: Sử dụng biến `PNPM_VERSION` đã định nghĩa

#### Step 3: Setup Node.js

- **Action**: `actions/setup-node@v4`
- **node-version**: Sử dụng biến `NODE_VERSION`
- **cache: 'pnpm'**: Tự động cache dependencies để lần sau nhanh hơn

#### Step 4: Install Dependencies

- **Command**: `pnpm install --frozen-lockfile`
- **--frozen-lockfile**: Đảm bảo install đúng version trong lock file
- **Mục đích**: Cài đặt tất cả packages cần thiết

#### Step 5: TypeScript Type Check

- **Command**: `pnpm run build`
- **Ý nghĩa**: Build project, trong đó có type checking
- **Fail condition**: Nếu có lỗi TypeScript → Job fail

#### Step 6: ESLint Check

- **Command**: `pnpm run lint`
- **Mục đích**: Kiểm tra code style, potential bugs
- **Corresponding script**: `"lint": "eslint --ext ts,tsx src/"`

#### Step 7: Prettier Check

- **Command**: `pnpm run prettier`
- **Mục đích**: Kiểm tra code formatting
- **Corresponding script**: `"prettier": "prettier --check \"src/**/(*.tsx|*.ts|*.css|*.scss)\""`

---

## 🛡️ JOB 3: SECURITY SCANNING

### Dòng 84-114: Quét Bảo Mật

```yaml
security:
  name: 🛡️ Security Scanning
  runs-on: ubuntu-latest
  needs: changes
  if: needs.changes.outputs.src == 'true'

  steps:
    - name: 📥 Checkout Code
      uses: actions/checkout@v4

    - name: 📦 Setup PNPM
      uses: pnpm/action-setup@v2
      with:
        version: ${{ env.PNPM_VERSION }}

    - name: 🔍 Dependency Audit
      run: pnpm audit --audit-level moderate

    - name: 🔐 Secret Detection
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: ${{ github.event.repository.default_branch }}
        head: HEAD

    - name: 🛡️ SAST Scan with CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: typescript, javascript

    - name: 🔍 CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

**🔍 Giải thích các security checks:**

#### 1. Dependency Audit

```yaml
- name: 🔍 Dependency Audit
  run: pnpm audit --audit-level moderate
```

- **Mục đích**: Kiểm tra packages có lỗ hổng bảo mật không
- **--audit-level moderate**: Chỉ báo lỗi từ mức moderate trở lên
- **Kết quả**: List các vulnerabilities trong dependencies

#### 2. Secret Detection

```yaml
- name: 🔐 Secret Detection
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

- **Mục đích**: Tìm API keys, passwords, tokens bị commit nhầm
- **TruffleHog**: Tool phổ biến để detect secrets
- **path**: Scan toàn bộ repository
- **base & head**: So sánh changes từ main branch đến HEAD

#### 3. SAST (Static Application Security Testing)

```yaml
- name: 🛡️ SAST Scan with CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: typescript, javascript

- name: 🔍 CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

- **CodeQL**: GitHub's semantic code analysis engine
- **SAST**: Phân tích code để tìm security vulnerabilities
- **languages**: Specify TypeScript và JavaScript
- **Two-step process**: Init → Analyze

---

## 🧪 JOB 4: TESTING SUITE

### Dòng 116-164: Chạy Tests

```yaml
test:
  name: 🧪 Testing Suite
  runs-on: ubuntu-latest
  needs: changes
  if: needs.changes.outputs.src == 'true' || needs.changes.outputs.tests == 'true'

  strategy:
    matrix:
      node-version: [18, 20]
```

**🔍 Giải thích test configuration:**

#### Conditional Logic

```yaml
if: needs.changes.outputs.src == 'true' || needs.changes.outputs.tests == 'true'
```

- **Ý nghĩa**: Chạy test khi:
  - Source code thay đổi (`src == 'true'`) HOẶC
  - Test files thay đổi (`tests == 'true'`)
- **Logic**: Test khi có changes liên quan đến functionality

#### Matrix Strategy

```yaml
strategy:
  matrix:
    node-version: [18, 20]
```

- **Mục đích**: Chạy tests trên nhiều Node.js versions
- **Matrix**: Tạo 2 jobs song song - một cho Node 18, một cho Node 20
- **Benefit**: Đảm bảo compatibility across versions

### Test Steps

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 📦 Setup PNPM
    uses: pnpm/action-setup@v2
    with:
      version: ${{ env.PNPM_VERSION }}

  - name: 🟢 Setup Node.js ${{ matrix.node-version }}
    uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
      cache: 'pnpm'

  - name: 📦 Install Dependencies
    run: pnpm install --frozen-lockfile

  - name: 🧪 Run Unit Tests
    run: pnpm run test:unit

  - name: 🔗 Run Integration Tests
    run: pnpm run test:integration

  - name: 📸 Run Snapshot Tests
    run: pnpm run test:snapshots

  - name: 📊 Generate Coverage Report
    run: pnpm run test:coverage

  - name: 📈 Upload Coverage to Codecov
    uses: codecov/codecov-action@v3
    with:
      file: ./coverage/lcov.info
      flags: unittests
      name: shopee-clone-coverage
      fail_ci_if_error: false
```

**🔍 Giải thích test types:**

#### 1. Unit Tests

```yaml
- name: 🧪 Run Unit Tests
  run: pnpm run test:unit
```

- **Mục đích**: Test các functions, components riêng lẻ
- **Script**: `"test:unit": "vitest src/"`

#### 2. Integration Tests

```yaml
- name: 🔗 Run Integration Tests
  run: pnpm run test:integration
```

- **Mục đích**: Test interaction giữa các modules
- **Script**: `"test:integration": "vitest test/integration/"`

#### 3. Snapshot Tests

```yaml
- name: 📸 Run Snapshot Tests
  run: pnpm run test:snapshots
```

- **Mục đích**: Test UI components không thay đổi ngoài ý muốn
- **Script**: `"test:snapshots": "vitest test/snapshots/"`

#### 4. Coverage Report

```yaml
- name: 📊 Generate Coverage Report
  run: pnpm run test:coverage
```

- **Mục đích**: Tạo báo cáo coverage - bao nhiều % code được test
- **Output**: Coverage report in various formats

#### 5. Upload to Codecov

```yaml
- name: 📈 Upload Coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    flags: unittests
    name: shopee-clone-coverage
    fail_ci_if_error: false
```

- **Codecov**: Service để track test coverage over time
- **file**: Coverage report file
- **fail_ci_if_error: false**: Không fail CI nếu upload lỗi

---

## 🏗️ JOB 5: BUILD APPLICATION

### Dòng 166-206: Build Ứng Dụng

```yaml
build:
  name: 🏗️ Build Application
  runs-on: ubuntu-latest
  needs: [code-quality, security, test]
  if: always() && !cancelled() && needs.changes.outputs.src == 'true'
```

**🔍 Giải thích build configuration:**

#### Dependencies

```yaml
needs: [code-quality, security, test]
```

- **Ý nghĩa**: Job này chỉ chạy sau khi 3 jobs trước hoàn thành
- **Parallel execution**: code-quality, security, test chạy song song
- **Sequential execution**: build chạy sau khi tất cả hoàn thành

#### Conditional Logic

```yaml
if: always() && !cancelled() && needs.changes.outputs.src == 'true'
```

- **always()**: Chạy dù các jobs trước có fail
- **!cancelled()**: Không chạy nếu workflow bị cancel
- **needs.changes.outputs.src == 'true'**: Chỉ chạy khi có src changes

### Build Steps

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 📦 Setup PNPM
    uses: pnpm/action-setup@v2
    with:
      version: ${{ env.PNPM_VERSION }}

  - name: 🟢 Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      cache: 'pnpm'

  - name: 📦 Install Dependencies
    run: pnpm install --frozen-lockfile

  - name: 🏗️ Build Production
    run: pnpm run build:production

  - name: 📊 Bundle Analysis
    run: |
      # Analyze bundle size
      npx vite-bundle-analyzer --analyzer-mode=json --report-filename=bundle-analysis.json

  - name: 💾 Upload Build Artifacts
    uses: actions/upload-artifact@v3
    with:
      name: build-assets
      path: |
        dist/
        bundle-analysis.json
      retention-days: 7
```

**🔍 Giải thích build process:**

#### 1. Production Build

```yaml
- name: 🏗️ Build Production
  run: pnpm run build:production
```

- **Script**: `"build:production": "cross-env BUILD_MODE=production NODE_ENV=production tsc && vite build"`
- **Process**: TypeScript compilation + Vite bundling
- **Output**: Production-ready files trong `dist/`

#### 2. Bundle Analysis

```yaml
- name: 📊 Bundle Analysis
  run: |
    npx vite-bundle-analyzer --analyzer-mode=json --report-filename=bundle-analysis.json
```

- **Mục đích**: Phân tích kích thước bundle
- **Output**: JSON report về bundle composition
- **Use case**: Monitor bundle size growth

#### 3. Upload Artifacts

```yaml
- name: 💾 Upload Build Artifacts
  uses: actions/upload-artifact@v3
  with:
    name: build-assets
    path: |
      dist/
      bundle-analysis.json
    retention-days: 7
```

- **Artifacts**: Files được lưu trữ sau khi job hoàn thành
- **name**: Tên artifact để download sau
- **path**: Files/folders cần lưu
- **retention-days**: Lưu trong 7 ngày

---

## 🚀 JOB 6: DEPLOY STAGING

### Dòng 208-245: Deploy Lên Staging

```yaml
deploy-staging:
  name: 🚀 Deploy to Staging
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
  environment:
    name: staging
    url: ${{ steps.deploy.outputs.preview-url }}
```

**🔍 Giải thích staging deployment:**

#### Conditional Logic

```yaml
if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
```

- **github.ref == 'refs/heads/develop'**: Chỉ deploy khi push lên branch `develop`
- **github.event_name == 'push'**: Chỉ deploy với push events (không phải PR)
- **Logic**: Develop branch = staging environment

#### Environment

```yaml
environment:
  name: staging
  url: ${{ steps.deploy.outputs.preview-url }}
```

- **GitHub Environment**: Protection rules, secrets scoping
- **name**: Tên environment trong GitHub
- **url**: Dynamic URL từ deployment step

### Staging Steps

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 💾 Download Build Artifacts
    uses: actions/download-artifact@v3
    with:
      name: build-assets

  - name: 🚀 Deploy to Vercel Staging
    id: deploy
    uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      working-directory: ./

  - name: 🏥 Health Check
    run: |
      sleep 30
      curl -f ${{ steps.deploy.outputs.preview-url }} || exit 1

  - name: 💡 Lighthouse Performance Audit
    uses: treosh/lighthouse-ci-action@v9
    with:
      urls: ${{ steps.deploy.outputs.preview-url }}
      uploadArtifacts: true
      temporaryPublicStorage: true
```

**🔍 Giải thích staging process:**

#### 1. Download Artifacts

```yaml
- name: 💾 Download Build Artifacts
  uses: actions/download-artifact@v3
  with:
    name: build-assets
```

- **Mục đích**: Lấy build files từ build job
- **name**: Tên artifact đã upload trước đó

#### 2. Vercel Deployment

```yaml
- name: 🚀 Deploy to Vercel Staging
  id: deploy
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

- **Action**: Third-party action để deploy lên Vercel
- **Secrets**: Credentials được lưu trong GitHub Secrets
- **id: deploy**: Để reference outputs trong steps sau

#### 3. Health Check

```yaml
- name: 🏥 Health Check
  run: |
    sleep 30
    curl -f ${{ steps.deploy.outputs.preview-url }} || exit 1
```

- **sleep 30**: Đợi deployment hoàn tất
- **curl -f**: Test HTTP request, fail nếu không thành công
- **|| exit 1**: Exit với error code 1 nếu curl fail

#### 4. Performance Audit

```yaml
- name: 💡 Lighthouse Performance Audit
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: ${{ steps.deploy.outputs.preview-url }}
    uploadArtifacts: true
    temporaryPublicStorage: true
```

- **Lighthouse**: Google's performance testing tool
- **urls**: URL để test performance
- **uploadArtifacts**: Lưu performance reports

---

## 🌟 JOB 7: DEPLOY PRODUCTION

### Dòng 247-323: Deploy Lên Production

```yaml
deploy-production:
  name: 🚀 Production Deployment
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment:
    name: production
    url: https://shopee-clone-typescript.vercel.app
```

**🔍 Giải thích production deployment:**

#### Conditional Logic

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

- **main branch only**: Chỉ deploy khi push lên main
- **Push events only**: Không deploy từ PR

#### Environment

```yaml
environment:
  name: production
  url: https://shopee-clone-typescript.vercel.app
```

- **Fixed URL**: Production URL không đổi
- **Protection**: Có thể setup manual approval

### Production Steps

```yaml
steps:
  - name: 📥 Checkout Code
    uses: actions/checkout@v4

  - name: 💾 Download Build Artifacts
    uses: actions/download-artifact@v3
    with:
      name: build-assets

  - name: 🚀 Deploy to Vercel Production
    uses: amondnet/vercel-action@v25
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      vercel-args: '--prod'
      working-directory: ./

  - name: 🧪 Smoke Tests
    run: |
      curl -f https://shopee-clone-typescript.vercel.app
      curl -f https://shopee-clone-typescript.vercel.app/login
      curl -f https://shopee-clone-typescript.vercel.app/products

  - name: 💡 Production Performance Audit
    uses: treosh/lighthouse-ci-action@v9
    with:
      urls: |
        https://shopee-clone-typescript.vercel.app
        https://shopee-clone-typescript.vercel.app/login
        https://shopee-clone-typescript.vercel.app/products
      uploadArtifacts: true

  - name: 📢 Notify Success
    if: success()
    uses: 8398a7/action-slack@v3
    with:
      status: success
      text: '🎉 Shopee Clone đã deploy thành công lên production!'
      webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  - name: 📢 Notify Failure
    if: failure()
    uses: 8398a7/action-slack@v3
    with:
      status: failure
      text: '❌ Deployment thất bại! Cần kiểm tra ngay.'
      webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**🔍 Giải thích production process:**

#### 1. Production Deploy

```yaml
- name: 🚀 Deploy to Vercel Production
  uses: amondnet/vercel-action@v25
  with:
    vercel-args: '--prod'
```

- **--prod flag**: Deploy to production (not preview)
- **Same secrets**: Dùng chung credentials

#### 2. Smoke Tests

```yaml
- name: 🧪 Smoke Tests
  run: |
    curl -f https://shopee-clone-typescript.vercel.app
    curl -f https://shopee-clone-typescript.vercel.app/login
    curl -f https://shopee-clone-typescript.vercel.app/products
```

- **Smoke tests**: Quick tests để verify core functionality
- **Critical paths**: Homepage, login, products
- **Fast feedback**: Nhanh chóng detect deployment issues

#### 3. Performance Audit

```yaml
- name: 💡 Production Performance Audit
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://shopee-clone-typescript.vercel.app
      https://shopee-clone-typescript.vercel.app/login
      https://shopee-clone-typescript.vercel.app/products
```

- **Multiple URLs**: Test performance của nhiều pages
- **Production environment**: Test trên actual production

#### 4. Notifications

```yaml
- name: 📢 Notify Success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: '🎉 Shopee Clone đã deploy thành công lên production!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}

- name: 📢 Notify Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: '❌ Deployment thất bại! Cần kiểm tra ngay.'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

- **Conditional notifications**: Success hoặc failure
- **Slack integration**: Notify team về deployment status
- **Different messages**: Success vs failure messages

---

## 💡 TÓM TẮT WORKFLOW

### 🔄 **Flow Tổng Quát**

```
1. 🔍 Detect Changes
   ↓
2. 🧹 Code Quality ←→ 🛡️ Security ←→ 🧪 Testing (Parallel)
   ↓
3. 🏗️ Build Application
   ↓
4. 🚀 Deploy (Staging/Production based on branch)
   ↓
5. 🏥 Health Checks & Performance Audit
   ↓
6. 📢 Notifications
```

### 🎯 **Điều Kiện Chạy Jobs**

| Job                 | Điều Kiện                              | Tại Sao                               |
| ------------------- | -------------------------------------- | ------------------------------------- |
| `changes`           | Luôn chạy                              | Cần detect changes cho các jobs khác  |
| `code-quality`      | `src` thay đổi                         | Chỉ check quality khi có code changes |
| `security`          | `src` thay đổi                         | Security scan cho source code         |
| `test`              | `src` hoặc `tests` thay đổi            | Test khi code hoặc tests thay đổi     |
| `build`             | `src` thay đổi + jobs trước hoàn thành | Cần build khi có code changes         |
| `deploy-staging`    | Push lên `develop`                     | Staging từ develop branch             |
| `deploy-production` | Push lên `main`                        | Production từ main branch             |

### 📊 **Branches Strategy**

```
feature/xyz → PR → develop → Staging Deployment
                      ↓
                   main → Production Deployment
```

### 🔐 **Secrets Cần Setup**

```bash
VERCEL_TOKEN           # Vercel CLI token
VERCEL_ORG_ID          # Vercel organization ID
VERCEL_PROJECT_ID      # Vercel project ID
SLACK_WEBHOOK          # Slack notification webhook
```

### ⚡ **Performance Optimizations**

1. **Change Detection**: Chỉ chạy khi cần thiết
2. **Parallel Execution**: Quality + Security + Testing song song
3. **Caching**: Node.js và PNPM dependencies
4. **Artifacts**: Build once, deploy multiple times
5. **Matrix Strategy**: Test trên multiple Node versions

### 🎉 **Kết Luận**

Pipeline này implement đầy đủ best practices:

- ✅ **Quality Gates**: Code quality, security, testing
- ✅ **Environment Strategy**: Staging và production
- ✅ **Performance Monitoring**: Lighthouse audits
- ✅ **Notifications**: Team awareness
- ✅ **Efficiency**: Smart conditional execution

**🚀 Đây là một CI/CD pipeline production-ready cho dự án React TypeScript!**

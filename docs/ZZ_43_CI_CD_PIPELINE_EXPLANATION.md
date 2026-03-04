# 🚀 Giải Thích Chi Tiết CI/CD Pipeline - Shopee Clone TypeScript

> **Tài liệu này giải thích toàn bộ CI/CD Pipeline của dự án Shopee Clone TypeScript một cách chi tiết và dễ hiểu nhất cho người mới bắt đầu.**

---

## 📑 Mục Lục

- [Phần 1: Tổng Quan Về CI/CD](#phần-1-tổng-quan-về-cicd)
  - [1.1 CI/CD Là Gì?](#11-cicd-là-gì)
  - [1.2 Tại Sao Các Dự Án Thực Tế Cần CI/CD?](#12-tại-sao-các-dự-án-thực-tế-cần-cicd)
- [Phần 2: Phân Tích Chi Tiết Pipeline](#phần-2-phân-tích-chi-tiết-pipeline)
  - [2.1 Cấu Trúc Tổng Thể](#21-cấu-trúc-tổng-thể)
  - [2.2 Biến Môi Trường Toàn Cục](#22-biến-môi-trường-toàn-cục)
  - [2.3 Triggers (Kích Hoạt Pipeline)](#23-triggers-kích-hoạt-pipeline)
  - [2.4 Concurrency Control (Kiểm Soát Đồng Thời)](#24-concurrency-control-kiểm-soát-đồng-thời)
  - [2.5 Job 1: Detect Changes](#25-job-1-detect-changes)
  - [2.6 Job 2: Code Quality & Type Safety](#26-job-2-code-quality--type-safety)
  - [2.7 Job 3: Security Scanning](#27-job-3-security-scanning)
  - [2.8 Job 4: Testing Suite](#28-job-4-testing-suite)
  - [2.9 Job 5: Build Application](#29-job-5-build-application)
  - [2.10 Job 6: Deploy to Staging](#210-job-6-deploy-to-staging)
  - [2.11 Job 7: Production Deployment](#211-job-7-production-deployment)
- [Phần 3: Secrets và Bảo Mật](#phần-3-secrets-và-bảo-mật)
- [Phần 4: Chiến Lược Caching và Tối Ưu](#phần-4-chiến-lược-caching-và-tối-ưu)
- [Phần 5: Luồng Triển Khai](#phần-5-luồng-triển-khai)
- [Phần 6: Best Practices và Bài Học](#phần-6-best-practices-và-bài-học)
- [Phần 7: Kết Luận](#phần-7-kết-luận)

---

## Phần 1: Tổng Quan Về CI/CD

### 1.1 CI/CD Là Gì?

#### 🔄 CI - Continuous Integration (Tích Hợp Liên Tục)

**CI (Continuous Integration)** là phương pháp phát triển phần mềm trong đó các developer thường xuyên merge (hợp nhất) code của họ vào một repository chung, thường là nhiều lần trong ngày. Mỗi lần merge sẽ được tự động kiểm tra bằng cách build và chạy test.

**Ví dụ thực tế dễ hiểu:**

Hãy tưởng tượng bạn đang làm việc trong một nhà máy sản xuất ô tô 🚗:

- **Không có CI:** Mỗi công nhân làm một bộ phận riêng biệt (động cơ, bánh xe, ghế ngồi...) trong nhiều tuần. Cuối cùng khi lắp ráp lại, họ phát hiện các bộ phận không khớp với nhau! Phải làm lại từ đầu.

- **Có CI:** Mỗi ngày, các bộ phận được lắp ráp thử nghiệm. Nếu có vấn đề, phát hiện ngay và sửa chữa kịp thời. Kết quả cuối cùng luôn hoàn hảo.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI - Continuous Integration                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Developer A ──┐                                                │
│                 │                                                │
│   Developer B ──┼──► Git Repository ──► Auto Build ──► Auto Test │
│                 │                                                │
│   Developer C ──┘                                                │
│                                                                  │
│   Kết quả: ✅ Pass hoặc ❌ Fail (thông báo ngay lập tức)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 🚀 CD - Continuous Delivery/Deployment (Phân Phối/Triển Khai Liên Tục)

**CD** có hai nghĩa:

1. **Continuous Delivery (Phân Phối Liên Tục):** Code luôn sẵn sàng để deploy bất cứ lúc nào, nhưng việc deploy lên production vẫn cần người duyệt thủ công.

2. **Continuous Deployment (Triển Khai Liên Tục):** Code tự động deploy lên production ngay khi pass tất cả các test, không cần can thiệp thủ công.

**Ví dụ thực tế:**

- **Continuous Delivery:** Như một nhà hàng đã chuẩn bị sẵn món ăn, chỉ cần khách gọi là phục vụ ngay.
- **Continuous Deployment:** Như một máy bán hàng tự động, khách bỏ tiền vào là có sản phẩm ngay lập tức.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CD - Continuous Delivery/Deployment                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Code Pass Tests ──► Build ──► Staging ──► [Manual Approval] ──► Prod  │
│                                                 ▲                        │
│                                                 │                        │
│                                    Continuous Delivery                   │
│                                                                          │
│   Code Pass Tests ──► Build ──► Staging ──► Auto Deploy ──► Production  │
│                                                 ▲                        │
│                                                 │                        │
│                                   Continuous Deployment                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Tại Sao Các Dự Án Thực Tế Cần CI/CD?

Đây là phần **CỰC KỲ QUAN TRỌNG** mà mọi developer cần hiểu rõ. Hãy phân tích sâu từng khía cạnh:

#### 🚨 VẤN ĐỀ KHI KHÔNG CÓ CI/CD

##### 1. Lỗi Do Con Người (Human Errors)

Khi deploy thủ công, con người dễ mắc sai lầm:

```
❌ Quên chạy test trước khi deploy
❌ Deploy nhầm branch (ví dụ: deploy develop lên production)
❌ Quên build lại sau khi sửa code
❌ Copy nhầm file cấu hình
❌ Quên cập nhật biến môi trường
```

**Câu chuyện thực tế:** Năm 2017, một kỹ sư của Amazon S3 đã gõ nhầm một lệnh trong quá trình bảo trì, khiến hàng nghìn website lớn bị sập trong nhiều giờ, gây thiệt hại hàng triệu đô la.

##### 2. Hội Chứng "Works On My Machine" (Chạy Được Trên Máy Tôi)

Đây là vấn đề kinh điển trong phát triển phần mềm:

```
Developer: "Code chạy ngon trên máy tôi!"
Tester: "Nhưng nó không chạy trên server!"
Developer: "Chắc do môi trường khác..."
```

**Nguyên nhân:**
- Phiên bản Node.js khác nhau
- Dependencies khác nhau
- Biến môi trường khác nhau
- Hệ điều hành khác nhau (Windows vs Linux)

##### 3. Integration Hell (Địa Ngục Tích Hợp)

Khi nhiều developer làm việc riêng lẻ trong thời gian dài:

```
Tuần 1-3: Developer A làm feature A
Tuần 1-3: Developer B làm feature B
Tuần 1-3: Developer C làm feature C

Tuần 4: Merge tất cả lại...
        💥 CONFLICT EVERYWHERE! 💥

Kết quả: Mất thêm 1-2 tuần để giải quyết conflicts
```

##### 4. Feedback Loop Chậm (Vòng Phản Hồi Chậm)

Không có CI/CD:
```
Code xong ──► 2 tuần sau mới test ──► Phát hiện bug ──► Quên context ──► Mất thời gian debug
```

Có CI/CD:
```
Code xong ──► 5 phút sau biết kết quả ──► Sửa ngay khi còn nhớ ──► Tiết kiệm thời gian
```

##### 5. Không Có Tính Nhất Quán (No Consistency)

```
Lần deploy 1: Build trên máy Developer A (Node 18)
Lần deploy 2: Build trên máy Developer B (Node 20)
Lần deploy 3: Build trên máy Developer C (Node 22)

Kết quả: Mỗi lần deploy ra kết quả khác nhau!
```

##### 6. Lỗ Hổng Bảo Mật Không Được Phát Hiện

Không có security scanning tự động:
```
❌ Dependencies có lỗ hổng bảo mật
❌ Secrets bị commit vào code
❌ SQL Injection, XSS không được phát hiện
❌ Hardcoded passwords
```

##### 7. Không Có Quality Gates (Cổng Chất Lượng)

```
Code tệ ──► Không ai review ──► Deploy thẳng lên production ──► 💥 Bug!
```

---

#### ✅ LỢI ÍCH KHI CÓ CI/CD

##### 1. Đảm Bảo Chất Lượng Tự Động (Automated Quality Assurance)

```yaml
# Mỗi lần push code, tự động chạy:
✅ TypeScript type checking
✅ ESLint (kiểm tra code style)
✅ Prettier (format code)
✅ Unit tests
✅ Integration tests
✅ Security scanning
```

##### 2. Phản Hồi Nhanh (Fast Feedback)

```
Push code ──► 5-10 phút ──► Biết ngay code có vấn đề hay không

Developer nhận được:
📧 Email thông báo
💬 Slack notification
🔔 GitHub notification
```

##### 3. Build Nhất Quán và Có Thể Tái Tạo (Consistent, Reproducible Builds)

```yaml
# Luôn build với cùng môi trường:
env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'

# Luôn dùng exact dependencies:
run: pnpm install --frozen-lockfile
```

##### 4. Giảm Rủi Ro Khi Deploy (Reduced Deployment Risk)

```
Code ──► Tests ──► Security Scan ──► Staging ──► Health Check ──► Production
         ▲           ▲                  ▲            ▲
         │           │                  │            │
      Fail sớm   Fail sớm          Fail sớm     Fail sớm

Nếu fail ở bất kỳ bước nào ──► KHÔNG deploy lên production
```

##### 5. Cải Thiện Collaboration (Hợp Tác Nhóm)

```
Developer A push code ──► CI chạy ──► Kết quả hiển thị trên PR
                                            │
Developer B review PR ──► Thấy CI pass ──► Yên tâm approve
                                            │
Code được merge ──► Tự động deploy ──► Mọi người đều biết
```

##### 6. Thời Gian Ra Thị Trường Nhanh Hơn (Faster Time to Market)

```
Trước CI/CD:
Feature hoàn thành ──► 2 tuần test thủ công ──► 1 tuần deploy ──► Ra mắt

Sau CI/CD:
Feature hoàn thành ──► 10 phút CI ──► Auto deploy ──► Ra mắt ngay!
```

##### 7. Khả Năng Rollback (Quay Lại Phiên Bản Cũ)

```
Deploy v2.0 ──► Phát hiện bug nghiêm trọng ──► Rollback về v1.9 trong 5 phút
```

##### 8. Pipeline as Code (Tài Liệu Hóa Quy Trình)

```yaml
# File ci-cd-pipeline.yml chính là tài liệu:
# - Ai cũng có thể đọc và hiểu quy trình deploy
# - Có version control (biết ai thay đổi gì, khi nào)
# - Có thể review và cải thiện
```

---

#### 🏢 TRONG THỰC TẾ DOANH NGHIỆP

##### 1. Tại Sao Google, Facebook, Amazon Deploy Hàng Trăm Lần Mỗi Ngày?

```
Amazon: ~23,000 deployments/ngày (2019)
Google: ~5,500 deployments/ngày
Facebook: ~1,000 deployments/ngày
Netflix: ~100 deployments/ngày

Bí quyết: CI/CD Pipeline hoàn chỉnh + Microservices
```

**Lợi ích:**
- Fix bug nhanh chóng
- Release feature liên tục
- A/B testing dễ dàng
- Rollback ngay khi có vấn đề

##### 2. CI/CD Hỗ Trợ Kiến Trúc Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices + CI/CD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Service A ──► Pipeline A ──► Deploy A (độc lập)               │
│   Service B ──► Pipeline B ──► Deploy B (độc lập)               │
│   Service C ──► Pipeline C ──► Deploy C (độc lập)               │
│                                                                  │
│   Mỗi service có thể deploy riêng, không ảnh hưởng service khác │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

##### 3. Tiết Kiệm Chi Phí So Với QA Thủ Công

```
QA Thủ Công:
- 5 QA engineers x $60,000/năm = $300,000/năm
- Thời gian test: 2-3 ngày/release
- Độ chính xác: 70-80% (con người mệt mỏi, bỏ sót)

CI/CD Tự Động:
- Chi phí server: ~$500/tháng = $6,000/năm
- Thời gian test: 10-15 phút/release
- Độ chính xác: 99%+ (máy không mệt)

Tiết kiệm: ~$294,000/năm + thời gian + độ chính xác cao hơn
```

##### 4. Compliance và Audit Trail (Tuân Thủ và Lịch Sử Kiểm Tra)

Trong các ngành như tài chính, y tế, CI/CD cung cấp:

```
✅ Ai deploy code gì, khi nào (audit trail)
✅ Code đã pass những test nào
✅ Security scan results
✅ Approval history
✅ Rollback history

Đây là yêu cầu bắt buộc cho: SOC 2, HIPAA, PCI-DSS, ISO 27001
```

##### 5. CI/CD Hỗ Trợ Agile/Scrum

```
Sprint 2 tuần với CI/CD:

Ngày 1-10: Developers code + push ──► CI chạy liên tục
Ngày 11-12: Code đã được test tự động, sẵn sàng demo
Ngày 13: Sprint review với sản phẩm hoạt động
Ngày 14: Deploy lên production

Không có CI/CD:
Ngày 1-10: Developers code
Ngày 11-13: Test thủ công, fix bug
Ngày 14: Vẫn chưa xong, delay sprint!
```

---

#### 💀 HẬU QUẢ NẾU KHÔNG CÓ CI/CD

##### 1. Ví Dụ Thực Tế Về Deployment Failures

**Knight Capital (2012):**
- Lỗi deploy thủ công khiến công ty mất $440 triệu trong 45 phút
- Công ty phá sản sau đó
- Nguyên nhân: Deploy code cũ lên một server, không có automated testing

**GitLab (2017):**
- Một kỹ sư xóa nhầm database production
- Mất 6 giờ dữ liệu của người dùng
- Nguyên nhân: Không có automated backup verification

**British Airways (2017):**
- Sự cố IT khiến hủy 726 chuyến bay
- Thiệt hại ~$100 triệu
- Nguyên nhân: Deployment thủ công không có rollback plan

##### 2. Technical Debt Tích Lũy

```
Không có CI/CD:

Tháng 1: Code chất lượng 80%
Tháng 3: Code chất lượng 60% (không ai kiểm tra)
Tháng 6: Code chất lượng 40% (bug chồng bug)
Tháng 12: Code không thể maintain được nữa!

Kết quả: Phải viết lại từ đầu (tốn 6-12 tháng)
```

##### 3. Developer Burnout (Kiệt Sức)

```
Không có CI/CD:
- Deploy thủ công vào cuối tuần
- Thức đêm fix bug production
- Stress vì sợ deploy
- Không dám refactor code

Có CI/CD:
- Deploy tự động, an toàn
- Bug được phát hiện sớm
- Tự tin khi deploy
- Dám cải thiện code
```

##### 4. Ảnh Hưởng Đến Khách Hàng

```
Bug đến tay khách hàng:
- Mất niềm tin
- Đánh giá 1 sao trên App Store
- Churn rate tăng
- Doanh thu giảm
- Đối thủ cạnh tranh hưởng lợi
```


---

## Phần 2: Phân Tích Chi Tiết Pipeline

### 2.1 Cấu Trúc Tổng Thể

Pipeline của Shopee Clone TypeScript bao gồm **7 jobs** chạy theo thứ tự và điều kiện cụ thể:

```mermaid
graph TD
    A[🔍 Detect Changes] --> B[🔍 Code Quality]
    A --> C[🛡️ Security]
    A --> D[🧪 Testing]
    B --> E[🏗️ Build]
    C --> E
    D --> E
    E --> F[🚀 Staging Deploy]
    E --> G[🚀 Production Deploy]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#ffebee
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#fff8e1
    style G fill:#e8eaf6
```

**Sơ đồ ASCII chi tiết:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🚀 Shopee Clone CI/CD Pipeline                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐                                                        │
│   │ 🔍 Detect       │                                                        │
│   │    Changes      │                                                        │
│   └────────┬────────┘                                                        │
│            │                                                                 │
│            ▼                                                                 │
│   ┌────────┴────────┬─────────────────┐                                     │
│   │                 │                 │                                      │
│   ▼                 ▼                 ▼                                      │
│ ┌─────────┐   ┌─────────┐   ┌─────────┐                                     │
│ │🔍 Code  │   │🛡️ Sec   │   │🧪 Test  │  ◄── Chạy song song                 │
│ │ Quality │   │  urity  │   │  Suite  │                                     │
│ └────┬────┘   └────┬────┘   └────┬────┘                                     │
│      │             │             │                                           │
│      └─────────────┼─────────────┘                                           │
│                    │                                                         │
│                    ▼                                                         │
│            ┌───────────────┐                                                 │
│            │ 🏗️ Build      │  ◄── Chờ tất cả jobs trên hoàn thành           │
│            │  Application  │                                                 │
│            └───────┬───────┘                                                 │
│                    │                                                         │
│         ┌─────────┴─────────┐                                               │
│         │                   │                                                │
│         ▼                   ▼                                                │
│   ┌───────────┐       ┌───────────┐                                         │
│   │🚀 Staging │       │🚀 Prod    │                                         │
│   │  Deploy   │       │  Deploy   │                                         │
│   │(develop)  │       │  (main)   │                                         │
│   └───────────┘       └───────────┘                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Biến Môi Trường Toàn Cục

```yaml
name: 🚀 Shopee Clone CI/CD Pipeline

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '9'
```

**Giải thích:**

| Biến | Giá trị | Lý do |
|------|---------|-------|
| `NODE_VERSION` | `'22'` | Node.js 22 là phiên bản LTS mới nhất (2024), có performance tốt hơn và hỗ trợ ES modules native |
| `PNPM_VERSION` | `'9'` | PNPM 9 nhanh hơn npm/yarn 3-5 lần, tiết kiệm disk space nhờ hard links |

**Tại sao định nghĩa global?**

```yaml
# ❌ Không tốt: Lặp lại ở mỗi job
jobs:
  job1:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '22'  # Phải sửa nhiều chỗ nếu muốn đổi version
  job2:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: '22'  # Dễ quên sửa

# ✅ Tốt: Định nghĩa một lần, dùng nhiều nơi
env:
  NODE_VERSION: '22'

jobs:
  job1:
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}  # Chỉ cần sửa 1 chỗ
```

---

### 2.3 Triggers (Kích Hoạt Pipeline)

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
```

**Giải thích chi tiết:**

| Trigger | Khi nào kích hoạt | Use case |
|---------|-------------------|----------|
| `push` to `main` | Khi merge PR vào main | Deploy lên production |
| `push` to `develop` | Khi merge PR vào develop | Deploy lên staging |
| `pull_request` to `main/develop` | Khi tạo/update PR | Kiểm tra code trước khi merge |
| `workflow_dispatch` | Khi click "Run workflow" trên GitHub | Deploy thủ công khi cần |

**Ví dụ luồng thực tế:**

```
1. Developer tạo branch feature/login
2. Developer push code ──► Không trigger (không phải main/develop)
3. Developer tạo PR vào develop ──► Trigger pull_request
4. CI chạy, pass ──► Merge PR
5. Code vào develop ──► Trigger push ──► Deploy staging
6. Test staging OK ──► Tạo PR từ develop vào main
7. CI chạy, pass ──► Merge PR
8. Code vào main ──► Trigger push ──► Deploy production
```

---

### 2.4 Concurrency Control (Kiểm Soát Đồng Thời)

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Giải thích:**

- `group`: Nhóm các workflow runs theo tên workflow + branch
- `cancel-in-progress: true`: Hủy run cũ nếu có run mới

**Ví dụ thực tế:**

```
Tình huống: Developer push 3 commits liên tiếp trong 5 phút

Không có concurrency control:
  Commit 1 ──► Run 1 (chạy 10 phút) ──► Tốn tài nguyên
  Commit 2 ──► Run 2 (chạy 10 phút) ──► Tốn tài nguyên
  Commit 3 ──► Run 3 (chạy 10 phút) ──► Chỉ run này có ý nghĩa

  Tổng: 30 phút compute time, 2 runs vô nghĩa

Có concurrency control:
  Commit 1 ──► Run 1 ──► Bị hủy
  Commit 2 ──► Run 2 ──► Bị hủy
  Commit 3 ──► Run 3 ──► Chạy hoàn thành

  Tổng: 10 phút compute time, tiết kiệm 66%!
```

**Lợi ích:**
- Tiết kiệm GitHub Actions minutes (có giới hạn free tier)
- Tránh deploy phiên bản cũ sau phiên bản mới
- Giảm tải cho CI server


---

### 2.5 Job 1: 🔍 Detect Changes (Phát Hiện Thay Đổi)

```yaml
jobs:
  changes:
    name: 🔍 Detect Changes
    runs-on: ubuntu-latest
    outputs:
      src: ${{ steps.filter.outputs.src }}
      tests: ${{ steps.filter.outputs.tests }}
      docs: ${{ steps.filter.outputs.docs }}
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

**Giải thích:**

Job này sử dụng `dorny/paths-filter` để phát hiện file nào đã thay đổi, từ đó quyết định chạy job nào.

**3 Output Categories:**

| Category | Files | Ý nghĩa |
|----------|-------|---------|
| `src` | `src/**`, `public/**`, `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json` | Code nguồn thay đổi → Cần build, test, deploy |
| `tests` | `test/**`, `vitest.setup.js`, `src/**/*.test.{ts,tsx}` | Test files thay đổi → Cần chạy lại tests |
| `docs` | `docs/**`, `*.md` | Documentation thay đổi → Không cần build/test |

**Tại sao cần change detection?**

```
Tình huống: Developer chỉ sửa file README.md

Không có change detection:
  ──► Chạy tất cả jobs (build, test, security, deploy)
  ──► Tốn 15-20 phút
  ──► Lãng phí tài nguyên

Có change detection:
  ──► Phát hiện chỉ docs thay đổi
  ──► Skip build, test, security, deploy
  ──► Hoàn thành trong 1 phút
  ──► Tiết kiệm 95% thời gian!
```

**Cách các job khác sử dụng output:**

```yaml
code-quality:
  needs: changes
  if: needs.changes.outputs.src == 'true'  # Chỉ chạy nếu src thay đổi

test:
  needs: changes
  if: needs.changes.outputs.src == 'true' || needs.changes.outputs.tests == 'true'
  # Chạy nếu src HOẶC tests thay đổi
```

---

### 2.6 Job 2: 🔍 Code Quality & Type Safety

```yaml
code-quality:
  name: 🔍 Code Quality & Type Safety
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

    - name: 📊 Upload ESLint Results
      if: always()
      uses: github/super-linter/slim@v5
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        VALIDATE_TYPESCRIPT_ES: true
        VALIDATE_TYPESCRIPT_STANDARD: true
```

**Giải thích từng step:**

| Step | Mục đích | Chi tiết |
|------|----------|----------|
| `Checkout Code` | Tải source code | Clone repository vào runner |
| `Setup PNPM` | Cài đặt package manager | PNPM nhanh hơn npm 3x |
| `Setup Node.js` | Cài đặt Node.js | Với cache để tăng tốc |
| `Install Dependencies` | Cài đặt packages | `--frozen-lockfile` đảm bảo exact versions |
| `TypeScript Type Check` | Kiểm tra types | Phát hiện lỗi type trước khi runtime |
| `ESLint Check` | Kiểm tra code style | Phát hiện bugs, bad practices |
| `Prettier Check` | Kiểm tra formatting | Đảm bảo code format nhất quán |
| `Super Linter` | Linting nâng cao | Kiểm tra thêm nhiều rules |

**Tại sao `--frozen-lockfile` quan trọng?**

```yaml
# ❌ Không có --frozen-lockfile
pnpm install
# Có thể cài version khác với local
# package.json: "react": "^18.0.0"
# Local: react@18.2.0
# CI: react@18.3.0 (mới hơn)
# → Kết quả khác nhau!

# ✅ Có --frozen-lockfile
pnpm install --frozen-lockfile
# Bắt buộc cài đúng version trong pnpm-lock.yaml
# Nếu lock file không khớp → Fail ngay
# → Đảm bảo reproducible builds
```

**Tại sao TypeScript type checking quan trọng?**

```typescript
// Lỗi này JavaScript không phát hiện được:
function addToCart(product: Product) {
  return product.price * product.quantiy; // Typo: quantiy thay vì quantity
}

// TypeScript phát hiện ngay:
// Error: Property 'quantiy' does not exist on type 'Product'.
// Did you mean 'quantity'?
```

**Giải thích `if: always()` trên super-linter:**

```yaml
- name: 📊 Upload ESLint Results
  if: always()  # Chạy ngay cả khi steps trước fail
```

Điều này đảm bảo kết quả linting luôn được upload, giúp developer biết tất cả lỗi cần sửa, không chỉ lỗi đầu tiên.


---

### 2.7 Job 3: 🛡️ Security Scanning

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

**Giải thích từng công cụ bảo mật:**

#### 1. PNPM Audit - Kiểm Tra Lỗ Hổng Dependencies

```bash
pnpm audit --audit-level moderate
```

**Mục đích:** Kiểm tra xem các packages đang dùng có lỗ hổng bảo mật đã biết không.

**Ví dụ output:**

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ moderate      │ Prototype Pollution in lodash                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ lodash                                                       │
│ Patched in    │ >=4.17.21                                                    │
│ Dependency of │ react-scripts                                                │
│ Path          │ react-scripts > webpack > lodash                             │
│ More info     │ https://npmjs.com/advisories/1673                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

**Các mức độ nghiêm trọng:**
- `low`: Ít nguy hiểm
- `moderate`: Trung bình (pipeline fail ở mức này)
- `high`: Nghiêm trọng
- `critical`: Cực kỳ nghiêm trọng

#### 2. TruffleHog - Phát Hiện Secrets Bị Lộ

**Tại sao TruffleHog CỰC KỲ QUAN TRỌNG?**

```javascript
// ❌ Developer vô tình commit secrets:
const API_KEY = "sk-1234567890abcdef";  // OpenAI API key
const DB_PASSWORD = "super_secret_123"; // Database password
const AWS_SECRET = "AKIAIOSFODNN7EXAMPLE"; // AWS credentials

// TruffleHog sẽ phát hiện và BLOCK commit này!
```

**Ví dụ thực tế về hậu quả:**

```
Năm 2019: Một developer của Uber commit AWS credentials lên GitHub public repo
Kết quả: Hacker truy cập được 57 triệu user records
Uber bị phạt $148 triệu

Năm 2021: Twitch bị leak 125GB source code
Nguyên nhân: Credentials bị commit trong code
```

**TruffleHog phát hiện:**
- API keys (OpenAI, Stripe, AWS, Google Cloud...)
- Database passwords
- SSH private keys
- JWT secrets
- OAuth tokens
- Và hơn 700 loại secrets khác

#### 3. CodeQL - Static Application Security Testing (SAST)

**CodeQL là gì?**

CodeQL là công cụ phân tích code tĩnh của GitHub, tìm kiếm các lỗ hổng bảo mật trong code mà không cần chạy ứng dụng.

**Các lỗ hổng CodeQL phát hiện:**

```typescript
// 1. SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`; // ❌ Vulnerable
// CodeQL: "Query built from user-controlled sources"

// 2. Cross-Site Scripting (XSS)
element.innerHTML = userInput; // ❌ Vulnerable
// CodeQL: "DOM text reinterpreted as HTML"

// 3. Path Traversal
const file = fs.readFileSync(`./uploads/${filename}`); // ❌ Vulnerable
// CodeQL: "Uncontrolled data used in path expression"

// 4. Insecure Randomness
const token = Math.random().toString(36); // ❌ Vulnerable
// CodeQL: "Insecure randomness"
```

**Tại sao SAST quan trọng?**

```
Phát hiện bug ở giai đoạn:
- Development: $100 để fix
- Testing: $1,000 để fix
- Production: $10,000 để fix
- After breach: $1,000,000+ (bao gồm phạt, mất uy tín, kiện tụng)

SAST phát hiện ở giai đoạn Development → Tiết kiệm rất nhiều!
```

---

### 2.8 Job 4: 🧪 Testing Suite

```yaml
test:
  name: 🧪 Testing Suite
  runs-on: ubuntu-latest
  needs: changes
  if: needs.changes.outputs.src == 'true' || needs.changes.outputs.tests == 'true'

  strategy:
    matrix:
      node-version: [20, 22]

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

**Giải thích Matrix Strategy:**

```yaml
strategy:
  matrix:
    node-version: [20, 22]
```

**Điều này có nghĩa:**

```
Job test sẽ chạy 2 lần song song:
├── test (Node 20) ──► Đảm bảo tương thích với Node 20 LTS
└── test (Node 22) ──► Đảm bảo tương thích với Node 22 LTS

Tại sao test trên nhiều Node versions?
- Một số packages có behavior khác nhau giữa các versions
- Đảm bảo app chạy được trên nhiều môi trường
- Phát hiện sớm breaking changes khi upgrade Node
```

**Các loại tests:**

| Loại Test | Mục đích | Ví dụ |
|-----------|----------|-------|
| Unit Tests | Test từng function/component riêng lẻ | Test hàm `formatPrice(1000)` trả về `"1.000đ"` |
| Integration Tests | Test nhiều components làm việc cùng nhau | Test flow thêm sản phẩm vào giỏ hàng |
| Snapshot Tests | Đảm bảo UI không thay đổi ngoài ý muốn | So sánh HTML output với snapshot đã lưu |
| Coverage | Đo lường % code được test | 80% coverage = 80% code có test |

**Codecov là gì?**

Codecov là dịch vụ theo dõi code coverage theo thời gian:

```
PR #123: Coverage 75% → 78% ✅ (+3%)
PR #124: Coverage 78% → 72% ❌ (-6%) → Cần thêm tests!
```


---

### 2.9 Job 5: 🏗️ Build Application

```yaml
build:
  name: 🏗️ Build Application
  runs-on: ubuntu-latest
  needs: [code-quality, security, test]
  if: always() && !cancelled() && needs.changes.outputs.src == 'true'

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
        npx vite-bundle-analyzer --analyzer-mode=json --report-filename=bundle-analysis.json

    - name: 💾 Upload Build Artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-assets
        path: |
          dist/
          bundle-analysis.json
        retention-days: 7

    - name: 📊 Comment Bundle Size
      if: github.event_name == 'pull_request'
      uses: github/super-linter/slim@v5
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Giải thích điều kiện `always() && !cancelled()`:**

```yaml
if: always() && !cancelled() && needs.changes.outputs.src == 'true'
```

**Phân tích:**

| Điều kiện | Ý nghĩa |
|-----------|---------|
| `always()` | Chạy ngay cả khi jobs trước fail |
| `!cancelled()` | KHÔNG chạy nếu workflow bị cancel |
| `needs.changes.outputs.src == 'true'` | Chỉ chạy nếu source code thay đổi |

**Tại sao dùng `always()`?**

```
Tình huống: Security scan fail vì có 1 warning nhỏ

Không có always():
  code-quality ✅ → security ❌ → test ✅ → build ⏭️ SKIPPED

  Vấn đề: Không biết build có pass không!

Có always():
  code-quality ✅ → security ❌ → test ✅ → build ✅

  Lợi ích: Vẫn biết build OK, chỉ cần fix security warning
```

**Bundle Analysis là gì?**

```bash
npx vite-bundle-analyzer --analyzer-mode=json --report-filename=bundle-analysis.json
```

Công cụ này phân tích kích thước của từng phần trong bundle:

```json
{
  "assets": [
    { "name": "index.js", "size": 245000 },
    { "name": "vendor.js", "size": 890000 },
    { "name": "react.js", "size": 120000 }
  ],
  "totalSize": 1255000
}
```

**Lợi ích:**
- Phát hiện dependencies quá lớn
- Theo dõi bundle size qua thời gian
- Tối ưu performance

**Artifacts là gì?**

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

Artifacts là files được lưu lại sau khi job hoàn thành:

```
Build job ──► Tạo dist/ folder ──► Upload artifact
                                        │
Deploy job ──► Download artifact ──► Deploy lên server
```

**`retention-days: 7`** nghĩa là artifacts sẽ bị xóa sau 7 ngày để tiết kiệm storage.

---

### 2.10 Job 6: 🚀 Deploy to Staging

```yaml
deploy-staging:
  name: 🚀 Deploy to Staging
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
  environment:
    name: staging
    url: ${{ steps.deploy.outputs.preview-url }}

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

**Staging Environment là gì?**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Môi Trường Triển Khai                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Development ──► Staging ──► Production                        │
│   (localhost)    (test)      (live)                             │
│                                                                  │
│   Staging là bản sao của Production để test trước khi go-live   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Điều kiện deploy staging:**

```yaml
if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
```

| Điều kiện | Ý nghĩa |
|-----------|---------|
| `github.ref == 'refs/heads/develop'` | Chỉ branch develop |
| `github.event_name == 'push'` | Chỉ khi push (không phải PR) |

**Health Check là gì?**

```bash
sleep 30  # Đợi 30 giây cho server khởi động
curl -f ${{ steps.deploy.outputs.preview-url }} || exit 1
```

- `sleep 30`: Vercel cần thời gian để deploy
- `curl -f`: Gửi HTTP request, fail nếu không nhận được response 2xx
- `|| exit 1`: Nếu curl fail → job fail

**Lighthouse CI là gì?**

Lighthouse là công cụ của Google đo lường chất lượng website:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lighthouse Scores                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Performance:    92/100  ████████████████████░░░░               │
│   Accessibility:  98/100  ████████████████████████░              │
│   Best Practices: 100/100 █████████████████████████              │
│   SEO:            95/100  ███████████████████████░░              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Các metrics quan trọng:**
- **Performance:** Tốc độ load trang
- **Accessibility:** Khả năng tiếp cận cho người khuyết tật
- **Best Practices:** Tuân thủ các best practices
- **SEO:** Tối ưu cho search engines


---

### 2.11 Job 7: 🚀 Production Deployment

```yaml
deploy-production:
  name: 🚀 Production Deployment
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment:
    name: production
    url: https://shopee-clone-typescript.vercel.app

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

**Sự khác biệt giữa Staging và Production:**

| Aspect | Staging | Production |
|--------|---------|------------|
| Branch | `develop` | `main` |
| Vercel flag | (không có) | `--prod` |
| URL | Preview URL (random) | Fixed URL |
| Smoke tests | Không | Có |
| Slack notification | Không | Có |

**`--prod` flag là gì?**

```yaml
vercel-args: '--prod'
```

- Không có `--prod`: Deploy lên preview URL (ví dụ: `shopee-clone-abc123.vercel.app`)
- Có `--prod`: Deploy lên production URL (ví dụ: `shopee-clone-typescript.vercel.app`)

**Smoke Tests là gì?**

```bash
curl -f https://shopee-clone-typescript.vercel.app
curl -f https://shopee-clone-typescript.vercel.app/login
curl -f https://shopee-clone-typescript.vercel.app/products
```

Smoke tests là các test cơ bản nhất để đảm bảo ứng dụng hoạt động:

```
Smoke Test = "Bật máy lên, có khói không?"

Nếu các trang chính load được → App cơ bản OK
Nếu không load được → Có vấn đề nghiêm trọng!
```

**Các routes được test:**
- `/` - Trang chủ
- `/login` - Trang đăng nhập
- `/products` - Trang danh sách sản phẩm

**Lighthouse trên Production:**

```yaml
urls: |
  https://shopee-clone-typescript.vercel.app
  https://shopee-clone-typescript.vercel.app/login
  https://shopee-clone-typescript.vercel.app/products
```

Test performance trên 3 routes quan trọng nhất để đảm bảo user experience tốt.

**Slack Notifications:**

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

**Tại sao cần Slack notifications?**

```
Tình huống: Deploy production lúc 2h sáng (scheduled)

Không có notification:
  - Không ai biết deploy thành công hay thất bại
  - Nếu fail, khách hàng phát hiện trước team
  - Mất thời gian debug vì không biết khi nào fail

Có notification:
  - Team nhận Slack message ngay lập tức
  - Nếu fail, on-call engineer được alert
  - Fix nhanh chóng, giảm downtime
```

---

## Phần 3: Secrets và Bảo Mật

### 3.1 Các Secrets Cần Thiết

Pipeline này sử dụng các secrets sau:

| Secret | Mục đích | Cách lấy |
|--------|----------|----------|
| `GITHUB_TOKEN` | Tự động cung cấp bởi GitHub | Không cần cấu hình |
| `VERCEL_TOKEN` | Xác thực với Vercel API | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ID của organization trên Vercel | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | ID của project trên Vercel | Vercel Dashboard → Project → Settings |
| `SLACK_WEBHOOK` | Gửi notifications đến Slack | Slack App → Incoming Webhooks |

**Cách thêm secrets vào GitHub:**

```
1. Vào GitHub Repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Nhập Name và Value
5. Click "Add secret"
```

### 3.2 Bảo Mật Trong Pipeline

**1. Secrets được bảo vệ như thế nào?**

```yaml
# Secrets KHÔNG bao giờ hiển thị trong logs
- name: Deploy
  run: echo ${{ secrets.VERCEL_TOKEN }}
  # Output: ***
```

GitHub tự động mask secrets trong logs, thay thế bằng `***`.

**2. Tại sao TruffleHog quan trọng?**

```
Tình huống: Developer vô tình commit API key

Không có TruffleHog:
  - Code được merge
  - API key bị lộ trên GitHub (public repo)
  - Hacker tìm thấy và sử dụng
  - Thiệt hại tài chính, mất uy tín

Có TruffleHog:
  - CI fail ngay lập tức
  - Developer được thông báo
  - Sửa trước khi merge
  - Không có thiệt hại
```

**3. Best Practices cho Secret Management:**

```
✅ Sử dụng GitHub Secrets cho CI/CD
✅ Rotate secrets định kỳ (3-6 tháng)
✅ Sử dụng least privilege (chỉ cấp quyền cần thiết)
✅ Không hardcode secrets trong code
✅ Sử dụng .env.example thay vì .env trong repo
✅ Thêm .env vào .gitignore
✅ Sử dụng secret scanning (TruffleHog)
```


---

## Phần 4: Chiến Lược Caching và Tối Ưu

### 4.1 PNPM Store Cache

```yaml
- name: 🟢 Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'  # ← Bật caching cho PNPM
```

**Caching hoạt động như thế nào?**

```
Lần chạy đầu tiên:
  pnpm install ──► Download packages (2-3 phút) ──► Save to cache

Lần chạy tiếp theo:
  pnpm install ──► Restore from cache (10 giây) ──► Chỉ download packages mới
```

**Hiệu quả:**

| Metric | Không cache | Có cache |
|--------|-------------|----------|
| Thời gian install | 2-3 phút | 10-30 giây |
| Bandwidth | ~500MB | ~10MB (chỉ diff) |
| Chi phí | Cao | Thấp |

### 4.2 Build Artifacts

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

**Artifact sharing giữa các jobs:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Artifact Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Build Job                                                      │
│   ├── pnpm run build:production                                 │
│   ├── Tạo dist/ folder                                          │
│   └── Upload artifact "build-assets"                            │
│                    │                                             │
│                    ▼                                             │
│   ┌────────────────┴────────────────┐                           │
│   │                                 │                            │
│   ▼                                 ▼                            │
│   Staging Deploy                Production Deploy                │
│   ├── Download "build-assets"   ├── Download "build-assets"     │
│   └── Deploy to Vercel          └── Deploy to Vercel --prod     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Tại sao không build lại ở mỗi deploy job?**

```
❌ Build lại ở mỗi job:
  - Build job: 3 phút build
  - Staging job: 3 phút build (lặp lại)
  - Production job: 3 phút build (lặp lại)
  - Tổng: 9 phút

✅ Dùng artifacts:
  - Build job: 3 phút build + upload
  - Staging job: 10 giây download
  - Production job: 10 giây download
  - Tổng: ~4 phút

Tiết kiệm: 55% thời gian!
```

**Retention Policy:**

```yaml
retention-days: 7
```

- Artifacts được giữ 7 ngày
- Sau 7 ngày tự động xóa
- Tiết kiệm storage
- Đủ thời gian để debug nếu cần

---

## Phần 5: Luồng Triển Khai (Deployment Flow)

### 5.1 Luồng Staging

```
┌─────────────────────────────────────────────────────────────────┐
│                    Staging Deployment Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Developer push to develop branch                               │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Detect Changes  │                                           │
│   └────────┬────────┘                                           │
│            │ src == true                                         │
│            ▼                                                     │
│   ┌────────┴────────┬─────────────────┐                         │
│   │                 │                 │                          │
│   ▼                 ▼                 ▼                          │
│ Code Quality    Security          Testing                        │
│   ✅              ✅                ✅                            │
│   │                 │                 │                          │
│   └─────────────────┼─────────────────┘                          │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │    Build    │                                     │
│              │     ✅      │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │   Staging   │                                     │
│              │   Deploy    │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │ Health Check│                                     │
│              │     ✅      │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │ Lighthouse  │                                     │
│              │   Audit     │                                     │
│              └─────────────┘                                     │
│                                                                  │
│   Result: Preview URL ready for testing                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Luồng Production

```
┌─────────────────────────────────────────────────────────────────┐
│                   Production Deployment Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Developer merge PR to main branch                              │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │ Detect Changes  │                                           │
│   └────────┬────────┘                                           │
│            │ src == true                                         │
│            ▼                                                     │
│   ┌────────┴────────┬─────────────────┐                         │
│   │                 │                 │                          │
│   ▼                 ▼                 ▼                          │
│ Code Quality    Security          Testing                        │
│   ✅              ✅                ✅                            │
│   │                 │                 │                          │
│   └─────────────────┼─────────────────┘                          │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │    Build    │                                     │
│              │     ✅      │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │ Production  │                                     │
│              │   Deploy    │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │ Smoke Tests │                                     │
│              │  (3 URLs)   │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│                     ▼                                            │
│              ┌─────────────┐                                     │
│              │ Lighthouse  │                                     │
│              │  (3 URLs)   │                                     │
│              └──────┬──────┘                                     │
│                     │                                            │
│         ┌──────────┴──────────┐                                 │
│         │                     │                                  │
│         ▼                     ▼                                  │
│   ┌───────────┐         ┌───────────┐                           │
│   │  Success  │         │  Failure  │                           │
│   │   Slack   │         │   Slack   │                           │
│   │    🎉     │         │    ❌     │                           │
│   └───────────┘         └───────────┘                           │
│                                                                  │
│   Result: Live at https://shopee-clone-typescript.vercel.app    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```


### 5.3 Sơ Đồ Tổng Thể Pipeline

```mermaid
flowchart TB
    subgraph Triggers["🎯 Triggers"]
        T1[Push to main]
        T2[Push to develop]
        T3[Pull Request]
        T4[Manual Dispatch]
    end

    subgraph Detection["🔍 Change Detection"]
        CD[Detect Changes]
        CD --> |src| SRC[Source Changed]
        CD --> |tests| TEST[Tests Changed]
        CD --> |docs| DOCS[Docs Changed]
    end

    subgraph Quality["✅ Quality Gates"]
        CQ[Code Quality]
        SEC[Security Scan]
        TST[Testing Suite]
    end

    subgraph Build["🏗️ Build"]
        BLD[Build Application]
        ART[Upload Artifacts]
    end

    subgraph Deploy["🚀 Deployment"]
        STG[Staging Deploy]
        PRD[Production Deploy]
    end

    subgraph Verify["✔️ Verification"]
        HC[Health Check]
        SM[Smoke Tests]
        LH[Lighthouse Audit]
    end

    subgraph Notify["📢 Notifications"]
        SL[Slack]
    end

    T1 & T2 & T3 & T4 --> CD
    SRC --> CQ & SEC & TST
    TEST --> TST
    CQ & SEC & TST --> BLD
    BLD --> ART
    ART --> |develop| STG
    ART --> |main| PRD
    STG --> HC --> LH
    PRD --> SM --> LH --> SL
```

---

## Phần 6: Best Practices và Bài Học

### 6.1 Những Điểm Tốt Của Pipeline Này

#### ✅ 1. Change Detection Optimization

```yaml
changes:
  outputs:
    src: ${{ steps.filter.outputs.src }}
    tests: ${{ steps.filter.outputs.tests }}
    docs: ${{ steps.filter.outputs.docs }}
```

**Lợi ích:**
- Không chạy build/test khi chỉ sửa docs
- Tiết kiệm 80-90% thời gian cho các thay đổi nhỏ
- Giảm chi phí GitHub Actions

#### ✅ 2. Multi-Version Testing

```yaml
strategy:
  matrix:
    node-version: [20, 22]
```

**Lợi ích:**
- Đảm bảo tương thích với nhiều Node versions
- Phát hiện sớm breaking changes
- Tăng độ tin cậy của ứng dụng

#### ✅ 3. Security-First Approach

```yaml
# 3 lớp bảo mật:
- pnpm audit          # Dependency vulnerabilities
- TruffleHog          # Secret detection
- CodeQL              # SAST scanning
```

**Lợi ích:**
- Phát hiện lỗ hổng trước khi deploy
- Ngăn chặn secrets bị lộ
- Tuân thủ security best practices

#### ✅ 4. Performance Monitoring

```yaml
- name: 💡 Lighthouse Performance Audit
  uses: treosh/lighthouse-ci-action@v9
```

**Lợi ích:**
- Theo dõi performance qua thời gian
- Phát hiện regression sớm
- Đảm bảo user experience tốt

#### ✅ 5. Notification System

```yaml
- name: 📢 Notify Success/Failure
  uses: 8398a7/action-slack@v3
```

**Lợi ích:**
- Team được thông báo ngay lập tức
- Giảm thời gian phản hồi khi có sự cố
- Tăng visibility cho deployment process

### 6.2 Có Thể Cải Thiện Thêm

#### 🔄 1. E2E Testing (Cypress/Playwright)

```yaml
# Thêm E2E tests để test user flows thực tế
- name: 🎭 E2E Tests
  run: |
    npx playwright install
    pnpm run test:e2e
```

**Lợi ích:**
- Test user flows end-to-end
- Phát hiện bugs mà unit tests bỏ sót
- Tăng độ tin cậy trước khi deploy

#### 🔄 2. Database Migration Checks

```yaml
# Kiểm tra migrations trước khi deploy
- name: 🗄️ Check Migrations
  run: |
    pnpm run db:migrate:check
```

**Lợi ích:**
- Tránh lỗi database khi deploy
- Đảm bảo schema consistency
- Rollback dễ dàng hơn

#### 🔄 3. Feature Flags

```yaml
# Sử dụng feature flags để deploy an toàn
- name: 🚩 Update Feature Flags
  run: |
    curl -X POST $FEATURE_FLAG_API \
      -d '{"feature": "new-checkout", "enabled": true}'
```

**Lợi ích:**
- Deploy code mà không enable feature
- Rollback bằng cách tắt flag
- A/B testing dễ dàng

#### 🔄 4. Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Blue-Green Deployment                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Load Balancer                                                  │
│        │                                                         │
│        ├──► Blue (v1.0) ◄── Current production                  │
│        │                                                         │
│        └──► Green (v2.0) ◄── New version (testing)              │
│                                                                  │
│   Khi Green OK → Switch traffic từ Blue sang Green              │
│   Nếu có vấn đề → Switch ngược lại Blue (instant rollback)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 🔄 5. Canary Releases

```
┌─────────────────────────────────────────────────────────────────┐
│                    Canary Release                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Traffic Distribution:                                          │
│                                                                  │
│   95% ──► v1.0 (stable)                                         │
│    5% ──► v2.0 (canary)                                         │
│                                                                  │
│   Monitor canary:                                                │
│   - Error rate OK? → Tăng lên 10%, 25%, 50%, 100%               │
│   - Error rate cao? → Rollback về 0%                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phần 7: Kết Luận

### 📚 Tóm Tắt Những Điểm Chính

1. **CI/CD là gì?**
   - CI (Continuous Integration): Tự động build và test mỗi khi có code mới
   - CD (Continuous Delivery/Deployment): Tự động deploy code đã pass tests

2. **Tại sao cần CI/CD?**
   - Giảm lỗi do con người
   - Phản hồi nhanh (biết ngay code có vấn đề)
   - Build nhất quán, reproducible
   - Tiết kiệm thời gian và chi phí

3. **Pipeline của Shopee Clone có 7 jobs:**
   - Detect Changes → Code Quality → Security → Testing → Build → Staging → Production

4. **Các công cụ quan trọng:**
   - `dorny/paths-filter`: Phát hiện file thay đổi
   - `pnpm audit`: Kiểm tra lỗ hổng dependencies
   - `TruffleHog`: Phát hiện secrets bị lộ
   - `CodeQL`: Static analysis security testing
   - `Lighthouse`: Performance monitoring
   - `Vercel`: Deployment platform

5. **Best practices:**
   - Change detection để tối ưu thời gian
   - Multi-version testing
   - Security-first approach
   - Artifact sharing giữa jobs
   - Notifications cho team

### 🎯 Tại Sao Mọi Developer Nên Hiểu CI/CD?

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lý Do Học CI/CD                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. Yêu cầu bắt buộc trong công việc                           │
│      - 95% công ty tech sử dụng CI/CD                           │
│      - Là kỹ năng cơ bản của DevOps/SRE                         │
│                                                                  │
│   2. Tăng năng suất cá nhân                                     │
│      - Tự động hóa công việc lặp đi lặp lại                     │
│      - Giảm stress khi deploy                                    │
│                                                                  │
│   3. Hiểu quy trình phát triển phần mềm                         │
│      - Từ code đến production                                    │
│      - Collaboration với team                                    │
│                                                                  │
│   4. Cơ hội nghề nghiệp                                         │
│      - DevOps Engineer: $100k-$180k/năm                         │
│      - SRE: $120k-$200k/năm                                     │
│      - Platform Engineer: $130k-$220k/năm                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🏆 Pipeline Này Thể Hiện DevOps Chuyên Nghiệp

Pipeline CI/CD của Shopee Clone TypeScript thể hiện các nguyên tắc DevOps chuyên nghiệp:

| Nguyên tắc | Cách thể hiện |
|------------|---------------|
| **Automation** | Tất cả đều tự động từ test đến deploy |
| **Continuous Improvement** | Lighthouse tracking performance |
| **Security** | 3 lớp security scanning |
| **Monitoring** | Health checks, smoke tests |
| **Communication** | Slack notifications |
| **Infrastructure as Code** | Pipeline defined in YAML |

---

> 📖 **Tài liệu này được tạo để giúp các developer hiểu rõ về CI/CD thông qua ví dụ thực tế từ dự án Shopee Clone TypeScript. Hy vọng nó sẽ hữu ích cho hành trình học tập của bạn!**

---

*Cập nhật lần cuối: Tháng 2, 2026*
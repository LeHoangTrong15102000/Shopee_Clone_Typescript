// **\*\*\*\***\*\*\*\***\*\*\*\***\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\***\*\*\*\***\*\*\*\***\*\*\*\***

> > > > > > > > > > > > > > > > > > > > > > Chương 25 Viết Unit test & Integration Test cho Project Clone Shopee

> 228 Cài vitest và test function\

- -> Chỉ cần sử dụng đuôi là `.test` thì thằng vistet nó sẽ đọc được và hiểu
- -> Ở cái hàm đầu tiên thì test nếu là axiosError thì trả về `true` còn không thì sẽ trả về `false`
- -> Dùng describe() trong file test -> `describe()`mô tả tập hợp ngữ cảnh hoặc đơn vị mà chúng ta cần test: Ví dụ function, component
- -> describe('isAxiosError', () => {}) -> Và khai báo 1 cái function như này
  -> import { describe, it , expect} from 'vitest' -> Phải import 3 cái function này từ vitest
  -> 1 đơn vị cần test ở đây là `isAxiosError`
  -> it() dùng để ghi chú trường hợp cần test -> thằng isAxiosError của chúng ta mong muốn trả về một kiểu boolean
  -> expect() dùng để mong đợi giá trị trả về

- -> expect(isAxiosError(new Error())) -> Nếu trả về một cái `error` bình thường thì chúng ta mong muốn nó trả về là false - thì thằng expect() nó có rất là nhiều method -> Dùng toBe() là mình muốn khi mà nó chạy expect(isAxosError(new Error())).toBe(false) thì nó sẽ phải trả về false
- -> Khi mà test `FAIL` thì sẽ có 2 trường hợp xảy ra là do test của chúng ta viết chưa đúng hoặc là code chúng ta bị sai
- -> Sau này nếu có một ai vào sửa `code` thì cũng phải có trách nhiệm sửa cả file test luôn --> Vì sửa code mà không sửa file test thì dẫn đến file test bị sai(test tham chiếu đến cái requirements cũ) vì thế chúng ta phải coi lại cái `code` của chúng ta
- -> Và ở đây chúng ta sẽ thêm một mong đợi nữa -> Nếu trả về lỗi liên quan đến `AxiosError` -> thì nó sẽ pass cái file test đó -> Lỗi liên quan đến `AxiosError` thì chúng ta import cái `AxiosError` vào là được
  -> Nếu truyền sai boolean vào thì nó sẽ báo `failed`

- -> isAxiosUnprocessableEntityError -> Mình mong muốn thằng isAxiosUnprocessableEntityError nó cũng trả về kiểu là boolean -> thì trong thầng axiosError() nó là một cái class trong đó chứa là một cái class -> cái chúng ta quan tâm là cái `response` trả về nó sẽ trả về `status` cho chúng ta -> Bên trong `Response` là một cái object có key là status

> 229 Chuyển sang môi trường jsdom và test các api browser

- -> Khi mà chúng ta test thì chúng ta gặp những cái case rất là khó test -> Ví dụ như các function có liên quan đến access_token trong file auth.ts

> 230 Test Axios và test refresh token

> 231 Thống kê coverage unit test

> 232 Test App Render và React Router

> 233 Test trang NotFound và mẹo debug unit test

> 234 Mẹo hay khi test React Router

> 235 Test lỗi required React Hook Form ở trang Login

> 236 Test lỗi nhập data không đúng định dạng form

> 237 Sử dụng MSW để test React Query

> 238 Cập nhật Mock Service Worker cho các Api còn thiếu

> 239 Test trang Profile cần authenticated

> 240 Kỹ thuật test snapshot

> > > > > > > > > > > > > > > > > > > > > > Chương 26 Storybook cho React

> 241 Storybook là gì và cài đặt storybook

> 242 Tạo storybook cho component

> 243 Tạo storybook cho layout và page

> > > > > > > > > > > > > > > > > > > > > > Chương 27 Quà tặng đặc biệt

> 244 Viết CV để đi xin fresher tại các công ty công nghệ

> > > > > > > > > > > > > > > > > > > > > > Chương 28 Bonus Update khóa học

> 245 Tạo dự án React Typescript với Webpack & Babel

> 246 Fix lỗi Input Min Max không bị reset khi nhấn xóa tất cả

> 247 Fix lỗi refresh page ra 404 khi deploy vercel

> 248 Phân tích generic type cho component Input

> 249 Tối ưu re-render trong react router dom

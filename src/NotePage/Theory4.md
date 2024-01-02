# Test ứng dụng React Vite với Vitest

## Chương 25 Viết Unit test & Integration Test cho Project Clone Shopee

### 228 Cài vitest và test function\

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

- -> Thường thì việc refresh_token thường sẽ thực hiện trong cái axios.response.use() nên chúng ta sẽ handle refresh_token trong đó luôn, khi mà chúng ta đặt private thì thằng http nó sẽ không thể chấm tới thằng method của chúng ta
- -> Lỗi Unauthorized (401) có rất nhiều trường hợp

  - Token không đúng
  - Không truyền token
  - Token hết hạn

- -> Khi token hết hạn thì nó sẽ trả về Data lỗi là
  //data: {
  message: 'token hết hạn'
  name: 'EXPIRES_TOKEN'
  }

- -> Đáng lẻ khi mà bị lỗi thì sau khi mà refreshToken rồi thì nó sẽ tiếp tục gọi lại APi của thằng req trước đó
- -> Ở phiển bản axios cũ thì cái thằng axios return this.instance(`{...config, headers: {...config.headers, authorization: access_token}}`)
- -> Sau khi đã thực hiện refreshtoken thành công thì chúng ta sẽ thực hiện việc show lỗi lên cho nó đúng -> Phân tích lỗi để show lỗi lên cho nó hợp lí

- -> Bây giờ những lỗi liên quan đến 401 thì chúng ta sẽ show message lên khi nào

- -> CÒn những trường hợp như là

  - Token không đúng
  - Không truyền token
  - Token hết hạn nhưng gọi refresh token bị failed
    -> lúc này sẽ tiền hành xóa localStorage và toast.message -> Do chúng ta không truyền vào generic type nên không tận dụng được typePredicate của thằng typescript

- -> generic type của kiểu error trả về của 401
- -> Khi mà refreshToken hết hạn và gọi refreshToken lại thì nó bị lỗi, khi mà toast lỗi lên thì nó vẫn còn khá là nhiều vấn đề
  -> + Mặc dù chúng ta đã hạn chế gọi refreshToken lại 2 lần, nhưng vẫn có một số trường hợp nó gọi lại 2 lần
  -> + Cái việc nó gọi 2 lần thì chúng ta chỉ có thể fix nó được một phần mà thôi

- -> Cơ chế refreshToken này hơi bị khoai lang nướng một tí
  -> Ví dụ sẽ xử lý như sau, trình tự sẽ theo như sau

  - Purchase: 1 - 3 được gọi trong khoảng thời gian này
  - getMe: 2 - 5 được gọi trong khoảng thời gian này
  - refreshToken cho purchase: 3 - 4 -> Do thằng này refreshToken hết sớm quá nên là những ở dưới nó không có kế thừa được
  - Gọi lại Purchase tại giây thứ 4 - 6
  - refreshToken cho getMe: refreshToken cho getMe tại giây thứ 5 - 7 -> nên chỗ này nó sẽ tạo refreshToken mới cho getMe
  - Gọi lại getMe tại giây số 6

  -> Do sau khi thằng Purchase nó gọi refreshToken xong thì nó set thằng refreshTokenRequest = null nên trong thời gian đó thằng getMe nó gọi `api` refreshToken cho `getMe` -> Nên lí do nó gọi 2 lần là như vậy

  -> Ở cái trường hợp này chúng ta có thể xử lý nó bằng 1 cái tips khá là đơn giản đó là chúng ta sẽ giữ refreshTokenRequest lại khoảng 3 - 5 giây -> để những Api nào nó cần gọi đến refreshTokenRequest thì nó sẽ gọi đến sau đó là cập nhật lại `refreshTokenRequest = null`

- -> Lấy ra reset để reset lại cái price_max
  -> Nếu như bên ngoài truyền vào value là undefined thì chúng ta

- Test bị fail thì có 2 trường hợp xảy ra là 1 là do test chung ta viết sai, 2 là code chúng ta viết chưa dúng

### 229 Chuyển sang môi trường jsdom và test các api browser

- -> Khi mà chúng ta test thì chúng ta gặp những cái case rất là khó test -> Ví dụ như các function có liên quan đến access_token trong file auth.ts

### 230 Test Axios và test refresh token

### 231 Thống kê coverage unit test

### 232 Test App Render và React Router

### 233 Test trang NotFound và mẹo debug unit test

### 234 Mẹo hay khi test React Router

### 235 Test lỗi required React Hook Form ở trang Login

### 236 Test lỗi nhập data không đúng định dạng form

### 237 Sử dụng MSW để test React Query

### 238 Cập nhật Mock Service Worker cho các Api còn thiếu

### 239 Test trang Profile cần authenticated

### 240 Kỹ thuật test snapshot

## Chương 26 Storybook cho React

### 241 Storybook là gì và cài đặt storybook

### 242 Tạo storybook cho component

### 243 Tạo storybook cho layout và page

## Chương 27 Quà tặng đặc biệt

### 244 Viết CV để đi xin fresher tại các công ty công nghệ

## Chương 28 Bonus Update khóa học

### 245 Tạo dự án React Typescript với Webpack & Babel

### 246 Fix lỗi Input Min Max không bị reset khi nhấn xóa tất cả

### 247 Fix lỗi refresh page ra 404 khi deploy vercel

- -> Đã fix được

### 249 Tối ưu re-render trong react router dom

- -> Tối ưu quá trình react router dom nó re-render
- -> Ví dụ thằng productList và productDetail dùng chung một thằng MainLayout -> Thì chúng ta sẽ sử dụng React.Memo để tối ưu nó thử
- -> Chúng ta thấy 3 thằng bên phía route dùng chung một MainLayout nên là chúng ta sẽ tối ưu nó bằng cách sẽ sử dụng Outlet bên trong route

- -> Sẽ note lại các trường hợp khi mà re-render

  -> /\*\* + Để tối ưu re-render thì nên ưu tiên dùng `<Outlet />` thay cho {children}

  - - Lưu ý là Outlet nên đặt ngày trong component `Element` thì mới có tác dụng tối ưu
  - - Chứ không phải đặt bên trong children của component `Element`
      \*/

            //  ✅ Tối ưu re-render

      // export default memo(function RegisterLayout({ children }: Props) {
      // return (
      // `<div>`
      // `<RegisterHeader />`
      // {children}
      //`<Outlet />`
      // `<Footer />`
      // `</div>`
      // )
      // })

      // ❌ Không tối ưu được vì `<Outlet />` đặt vào vị trí children
      // Khi `<Outlet />` thay đổi tức là children thay đổi
      // Dẫn đến component `RegisterLayout` bị re-render dù cho có dùng React.memo như trên
      // `<RegisterLayout>`
      // `<Outlet />`
      // `</RegisterLayout>`

- -> Chỗ này nó hơi khó một tí nên là chúng ta sẽ ngẫm lại nh iều lần và thực hiện nó -> Cũng có thể quăng cái `<RejectRouted />` nhưng muốn giữ nó như vậy thay thế những thằng bên trong -> Thì ở thằng children chúng ta thêm một cái object nữa
- -> Thì đây là cái trick nho nhỏ khi mà cần tối ưu sâu về mặt performance -> Ở cái MainLayout và UserLayout chúng ta có thể tối ưu nó được -> Với cái concept y như lúc nảy thì chúng ta vẫn có thể tối ưu được
- -> Lý dó mà nó vẫn re-render là do tụi nó không cùng level với nhau, nhưng dù sau chúng ta vẫn tối ưu được một phần ở các thành phần cùng level với nhau như là `<Profile />`, `<ChangePassword />`, `<HistoryPurchase />`

> 248 Phân tích generic type cho component Input

- -> Hướng dẫn phân tích generic type trong typescript

# Test ứng dụng React Vite với Vitest

## Chương 25 Viết Unit test & Integration Test cho Project Clone Shopee

### 228 Cài vitest và test function

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

- Khi mà tạo file test thì phải viết các hàm test vào không thì nó sẽ bị lỗi

### 229 Chuyển sang môi trường jsdom và test các api browser

- -> Khi mà chúng ta test thì chúng ta gặp những cái case rất là khó test -> Ví dụ như các function có liên quan đến access_token trong file auth.ts , lại do `localStorage` lại chỉ có trên trình duyệt `browser` mà thôi khó mà có thể test được trên `terminal` -> Thì thằng `Vitest` nó cho phép chúng ta chuyển môi trường để mà test

  - Thì chúng ta sẽ sử dụng thằng `Jsdom` vì thằng này nó chứa nhiều cái API của `browser`

- Đầu tiên chúng ta sẽ kiểm tra xem thằng hàm `setAccessTokenToLS` thì nó có thực sự set `access_token` vào `localStorage` hay không -> Thì đầu tiên là chúng ta sẽ cho chạy cái thằng này `setAccessTokenToLS` xong rồi mình sẽ kiểm tra bằng cách lấy `localStorage.getItem('access_token')` coi thử là nó có `set` được hay không -> Lỡ như có ai đó chơi chúng ta bằng cách sửa tên `access_token` thành `access_token1` thì đường nhiên là chúng ta không `getItem` được

- `toBe` chúng ta có thể thay thế bằng `toEqual` -> Nhưng mà `toEqual` nó sẽ hay hơn vì nó test được những `object nested` -> `toEqual` nó có thể kiểm tra các giá trị trong object bằng nhau thì nó sẽ bằng nhau còn thằng `toBe` thì không kiểm tra được như vậy

  - `toBe` có thể kiểm tra được về `tham chiếu` nhưng thằng `toEqual` nó có thể kiểm tra được `value thật` của các object

- Nên khi test trường hợp `getAccessTokenFromLS` thì đừng cho nó phụ thuộc vào `setAccessTokenToLS` nên là khi test trường hợp này thì nên cho chạy hàm `setAccessTokenToLS` trước khi test `getAccessTokenFromLS` cho nó thật sự chính xác và không phụ thuộc vào thằng kia

- Ngoài ra còn có thể sử dụng các `Teardown` như là `beforeEach` , `afterEach`, `beforeAll`, `afterAll` -> Có thể là các cái describe có thể bị ảnh hưởng lẫn nhau -> Ví dụ chúng ta set cái localStorage và lỡ chúng ta làm cái gì đó rồi thằng ở dưới lấy từ localStorage ra thì nó dẫn đến ảnh hưởng lẫn nhau vì thể làm cho các `test case` chạy không đúng

  - `beforeEach` đăng ký vào 1 cái `callback` nó sẽ chạy trước mỗi context cái ngữ cảnh -> Hiểu nôm na là nó sẽ chạy trước mỗi cái `describe` ->
  - Còn `beforeAll` thì nó sẽ gọi trước tất cả các hàm `describe()`

  - Ở đây chúng ta sẽ sử dụng `beforeEach` trước mỗi lần `describe()` nó chạy để reset lại `localStorage` -> Để mà test cái case cho nó chính xác nhất

### 230 Test Axios và test refresh token

- Test `Axios` và test `RefreshToken`

- Thằng `Vitest` nó rất là tương đồng với thằng `Jest` nên mà có những cái mà thằng `vitest` chúng ta kiếm không có ra thì có thể qua thằng `Jest` để mà search

- Trong `http.ts` thì có rất là nhiều trường hợp để mà test -> Như là viết unit gọi API thành công hay không, chúng ta muốn là cấu hình `config` đúng thì mới gọi được API(status là 200 thì gọi API thành công)

  - Test những cái request gọi `access_token`

- Viết code thì nhanh nhưng viết test lại thì lâu lắm

- Hầu hết trong thực tế nên có một account test riêng và một cái server test riêng -> Như vậy thì nó sẽ không ảnh hưởng đến server chính của chúng ta

- Không nên đụng đến thư mục Apis, vì chúng ta test riêng file http thì chỉ `nên` http mà thôi, vì lỡ như thư mục Apis có thay đổi gì đó(abcd-xyz gì đó trong cái thư mục Apis) thì cũng không ảnh hưởng đến cái file `test` của chúng ta -> Chỉ hạn chế thôi không phải là không được dùng hoàn toàn vì `hạn chế` cho nó đỡ ảnh hưởng lẫn nhau

- Sẽ test cái `refresh_token` => Sợ sau này có ông nào vào `change` cái code của chúng ta xong rồi làm cái `refresh_token` bị fail cái là toang luôn -> Để mà test cái refresh_token thì cần phải có `access_token` hết hạn và cái `refresh_token` còn hạn -> Thì sẽ đưa ra một cái trick

  - Để lấy access_token hết hạn thì chúng ta cần gọi Apis và config cái `access_token` thành 1s để cho nó hết hạn liền

  - Khi mà `comment` thằng `access_token` và `refresh_token` thì nó vẫn chạy đúng có nghĩa là có bug
  - Số lần gọi `request interceptor` không có gì khác -> Nhưng mà tại sao khi test function `refresh_token` không truyền vào `access_token` mà nó vẫn đúng -> À hoá ra là nó lấy giá trị từ `private accessToken` là giá trị mà mình `cache` trong `class http` -> Mặc dù là mình đã xoá `localStorage` rồi nhưng mà nó vẫn còn `cache` trong `class http` -> Làm thế nào để xoá cái `cache http` này đi khá là nan giải -> Nhưng mà thay vì nghĩ đến xoá nó đi vậy tại sao chúng ta không tạo ra một cái `http in  stance mới` dể cho nó độc lập với nhau và không ảnh hưởng lẫn nhau

    - Vậy chúng ta cần phải export cái `class http()` -> Vậy thì nó mắc công quá thay vào đó chúng ta có thể tạo 1 cái `function` để tạo ra 1 cái `instance` mới

    - Cái function mới sẽ tên là `handleNewHttp` -> Nhưng nếu mà làm như vậy thì nó cũng tham chiếu tới cái thằng `class Http` vậy thì cũng không được -> Nên chúng ta vẫn phải `export class Http` để tạo ra một `new http mới`

    - Sau khi đã tạo một `new http` mới thì tránh sử dụng `http cũ` từ file `http.ts`

    - Không cần phải tạo `new http` trong thầng `it('refresh_token')` mà thay vào đo là trước mỗi lần thằng `it('')` chạy thì chúng ta sẽ gán lại một `http` mới như sau `http = new Http().instance`

    - const http = new Http().instance
      // Không cần phải đăng nhập nữa -> Vì Chúng ta đã mock sẵn access_token rồi, vì khi mà đăng nhập lần nũa thì phải set lại refresh_token
      setAccessTokenToLS(access_token_1s)
      setRefreshTokenToLS(refresh_token_7days)
      const res = await http.get('me')
      console.log('Response get me >>>', res)
      expect(res.status).toBe(HTTP_STATUS_CODE.Ok)

    - Nếu mà làm như thế này thì nó sẽ bị lỗi ngay -> Vì sau khi chúng ta `clearLS` rồi chúng ta tạo mới lại một `http instance` thì lúc này cho dù có setAcceessTokenToLS và setRefreshTokenToLS() đi nữa thì nó vẫn lấy `http instance mới` mà lúc tạo mới này thì `access_token` và `refresh_token` chúng ta đều là `''` hết rồi

    - beforeEach(() => {
      // Mỗi lần trước khi chạy it() thì tạo mới thằng http() để reset cái http trước đó
      http = new Http().instance
      localStorage.clear()
      })

      -> Khi mà để thứ tự như này thì khi nó đi qua thằng `it('Auth Request')` thì nó đã lưu `access_token` và `refresh_token` mới vào rồi nên là lúc này để `test` đúng nhất là chúng ta xoá nó đi trước rồi mới tạo ra một cái `instance http mới`

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

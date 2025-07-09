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

- Khi mà viết `unit test` thì chúng ta phải cover hết các trường hợp có thể xảy ra -> Thì cái `unit test` đó mới đạt được hiệu quả cao
  - Sẽ demo coverage trong `unit test`

### 232 Test App Render và React Router

- Vào trang `testing library` để xem những cái coreAPi có rất là nhiều cái coreApi để chúng ta test những cái kiểu test mà chúng ta có thể tự nghĩ ra được luôn

- Vào phần React `testing library` để xem những cách test mới vì ngoài các kiến thức test trong video ra thì còn `rất rất` là nhiêu kiến thức khác về `testing` trong ứng dụng

  - Kiến thức trong video không thể nào bao quát hết được kiến thức trên `docs` của người ta được

- Có rất rất là nhiều kiến thức -> Có thê vào phần example coi cách `test` cho `react-router-dom`, `redux`, `react-hook-form`, `react-context`

- Test ở app thì test cái gì trước đây -> Thì đầu tiên app của chúng ta phải `render` và phải `chuyển trang` được cái đã

- Đầu tiên làm thế nào để chúng ta `render` ra được cái `component App` ở trong cái terminal thì chúng ta sẽ sử dụng hàm `render()` của thằng `@testing-library/react`,
  nhưng mà khi chạy thằng `render(<App />)` mà không có `options` thì nó sẽ báo lỗi vì thằng `routes` cho thằng `App` không nằm trong `Router` cha là `BrowserRouter`

- Khi viết unit test Router thì chúng ta không cần phải chuyển hết `Provider` bọc thằng `App` từ file main qua file App và sẽ để lại thằng `BrowserRouter` vì khi viết `unitTest` thì nó sẽ sử dụng `memoryRouter` để biến các đường dẫn `URL` thành một cái `Array` vì vậy chúng ta sẽ linh động và sẽ không chuyển cái `BrowserRouter` qua file App làm gì -> Vì vậy chúng ta sẽ linh động hơn

- Rồi bây giờ làm sao để nó biết `render()` ra cái `HTML` như thế nào -> Chỗ này hơi căng nhờ -> Làm sao để biết, thì ở đây cách mà để biết thì chúng ta sử dụng hàm `screen()` của `@testing-library/react` luôn -> Dùng `screen.debug()` nó sẽ in ra cho chúng ta thấy là nó `render` ra cái gì -> Nhưng mà nó chỉ in ra đến thẻ body mà thôi còn thẻ `<head>` thì nó không có in ra và vẫn đề nữa là nó giới hạn nội dung in ra của chúng ta bằng dấu `3 chấm` thì để fix vấn đề này -> Thì để mà cho nó lấy ra hết thì chúng ta sẽ lấy ra cả cái `<html>` - cú pháp `document.body.parentElement`

  - Ở đây chúng ta thấy rằng từ thằng `Header` rồi đến `Footer` nó không có thằng `Main - nội dung chính` ở giữa cho mình -> Nên là khi `render()` bùm một cái thì nó chửa `render()` ra đủ
  - Mặc định khi mà để cái route không thì nó sẽ nhảy vào trang `productList`
  - Và cái thằng `<head />` nó cũng chưa có thẻ `meta` cũng như là `title`

- Vậy thì chúng ta sẽ sử dụng một cái cách khác để biết là có `render` ra đủ hay không -> Bình thường thì `App` chúng ta đã được `render` ra bình thường rồi -> Ở đây chúng sẽ có cách để `test` đó là sử dụng thằng `waitFor()`

- Chúng ta mông đợi thằng `waitFor` nó lấy ra là cái title trong `head` và `title` có `nội dung` là `Trang chủ | Shopee Clone` -> Lúc nảy khi mà cái quá trình render của chúng ta nó chưa đủ thì `nội dung` của thằng `ProductList` nó chưa hiện ra khi mà đã `render` ra dủ rồi thì nó bắt đầu hiện ra -> Như thế này thì nó đã `verify` vào đúng `trang chủ` rồi -> Thì khi mở cái App lên thì phải vào đúng `trang chủ` chứ không phải vào trang `Login hay Register`

- Sẽ `verifyy` thêm một chút xíu nữa

- Những cái test ngoài việc chúng ta lấy ra từ cái requirement của dự án thì chúng ta cần phải sáng tạo ra thêm nữa, không có cái yêu cầu cụ thể nào cho việc này cả -> Bởi vì chúng ta là người `code` ra cái ứng dụng này nên là chúng ta sẽ hiểu cái `ứng dụng` này hoạt động ra làm sao

  - Những cái `testcase` ngoài việc chúng ta lấy ra từ cái `requirement` của dự án ra thì chúng ta cũng cần phải tự sáng tạo ra dựa trên cái suy luận của một `developer`

  - Khi mà render ra được trang chủ rồi để mà chuyển sang trang login thì chúng ta cần phải click vào thẻ `a` -> Để mà click vào được thì chúng ta sử dụng `userEvent`
  - Thầng `Click` trong `userEvent` thì nó trả về một `Promise` -> Vậy thì chúng ta cần dùng await để đợi nó click xong

  - Sau khi `click` vào trang `Login` thì thằng `title` của `head` nó vẫn chưa render ra kịp -> Nhưng mà nó vẫn chỉ có `Header` và `Footer` mà thôi và nó vẫn chưa `render` ra được nội dung bên trong của cái trang đó -> Nên là chúng ta vẫn phải đợi nó một tí

  - Nên là chúng ta sẽ sủ dụng thằng `waitFor()` và chạy cái `callback` đó một vài lần -> Để cho nó render ra giao diện

  - Mặc dù là chúng ta expect thằng queryByText("Bạn mới biết đến Shopee?") là `1s timeout` nhưng mới nửa giây thì nó đã trả về `true` rồi nên những cái khác như `title` của thẻ `head` thì nó `render` ra kịp -> Nên là mới nửa giây là nó đã `render` ra rồi -> Nên là thẻ `head - title` nó không `render` ra được vì vậy chúng ta sẽ expect đống thời của 2

    - expect(screen.queryByText('Bạn mới biết đến Shopee?')).toBeInTheDocument()
    - expect(document.querySelector('title')?.textContent).toBe('Đăng nhập | Shopee Clone')

    - VÌ nó phải đợi 2 thằng này phải `true` hết hoặc là hết cái `timeout` thì nó mới dừng được

### 233 Test trang NotFound và mẹo debug unit test

- Khi người dùng vào một trang không tồn tại thì chúng ta phải trả về là trang `NotFound` -> Thì làm sao để biết được là trang `NotFound` thì sẽ có đoạn `text` là `Page Not Found`

- Bình thường khi mà `render` như thế này `render(<App />,{ wrapper: BrowserRouter})` thì nó sẽ `render` vào `URL` là trang chủ -> Vậy thì ở đây chúng ta không thể sử dụng `BrowserRouter` được ở đây -> Vậy thì mình phải dùng thằng `MemoryRouter` thì chúng ta mới có thể truyền cái `URL` vào được, chứ thầng `BrowserRouter` không truyền `1 route` không tồn tại như `/some/bad/route` vào được

- Như lúc test ở thằng `login` -> Do sau khi `render()` xong thì nó không nhảy vào thằng `Login` nên chúng ta phải dùng `waitFor()` để `test`

- Vậy làm sao chỗ đó không cần `expect()` ra mà vẫn có thể hiển thị ở chỗ `debug` được không để chúng ta có thể `debug lỗi`

- Chúng ta sẽ sử dụng `testUtils` chỉ giành cho việc `test debug các thứ`

- Thì thằng delay cần phải có thời gian để nó log ra lỗi -> Thì chúng ta mong đợi là thằng logScreen nó phải là `true` thì thằng `test` mới không lỗi được -> Nhưng mà nó cùng cần phải có thời gian để `true` nếu mà `true` sớm quá thì nó sẽ `ngắt thời gian` `timeout` của chúng ta mất

  - `time = 1000` -> Khi mà đã gán là mặc định rồi thì không cấn cái type là `number` nữa `time: number = 1000`

- Do là hết `timeout` mà nó vẫn chưa `resolve` ra nên là chúng ta sẽ cho nó resolve sớm hơn một chút xíu

- Dùng hàm `logScreen()` để khi mà thằng nào nó render lâu quá thì chúng ta `log` nó ra

### 234 Mẹo hay khi test React Router

- Test trang Register, ở đây chung ta muốn rằng khi người dùng nhấn vào đường đẫn `localhost:4000/register` thì nó vào thẳng trang `register` cho chúng ta luôn

- Mỗi lần `render` ra trang `Login` hay `Register` thì nó sẽ lặp đi lặp lại đoạn code -> Ở đây chúng ta không cần sử dụng `MemoryRouter` mà vẫn có thể test được dẫn `testCase` liên quan đến `Router`

- Thì Cái `window.history.pushState({} 'Test page', path.register)` thì viết nó vào cái `file Utils` để tiện cho việc sử dụng -> Đưa nó vào `file utils` để tái sử dụng lại những cái hàm này

- Hàm `render` nó sẽ return về một cái `object` nó sẽ có một số trong đó

### 235 Test lỗi required React Hook Form ở trang Login

- Test lỗi `Required React Hook Form` khi chúng ta validate dữ liệu từ trang `Login`

- Chúng ta test React hook form không cần phải test `render` nữa -> Vì khi `test validate` thành công có nghĩa là `test render` thành công

- Nếu chỉ component không thôi thì nó sẽ báo lỗi -> Thì thôi khi chúng ta đã khai báo cái utils `renderWithRouter` rồi thì chúng ta dùng luôn

- Khi mà không nhập vào trường `Email` mà chúng ta nhấn `submit` thử -> Thì có khá nhiều cách để nhấn vào nút `submit` trong môi trường `terminal`

- Khi mà chúng ta đã làm ra được cái `logScreen` rồi thì debug nó khá là dễ -> Sau khi đã debug xong rồi thì chạy `test` nó

### 236 Test lỗi nhập data không đúng định dạng form

- Để mà chặt chẽ hơn thì mỗi lần thằng `test()` nó chạy thì chúng ta sẽ cho chạy cái thằng `callback` trong `beforeEach()` trước để `render` lại thằng `Router`

- Giờ đây chúng ta không cần thằng user từ `userEvent` để lấy sự kiện `click` nữa -> Chúng ta có thể sử dụng thằng `fireEvent` từ `@testing-library/react`

- Bây giờ sẽ dùng `fireEvent` để input vào cái ô `Email`'

- Khi mà nhấn `submit` thì nó chạy cái hàm `expect()` nhưng mà nó sẽ không `show ra` ngay mà nó cần phải có `await` một tí xíuu thì nó mới showw -> Thì lúc này nó đã render ra mất tiu -> Nên cần phải có `await` để đợi nó chút nên là chúng ta sẽ sử dụng `await waitFor`

- Lỗi Multiple Email là do cái thằng `beforeEach()` nó render 2 lần cái `placeholder="email"` nên trên cái UI trên `terminal` của chúng ta nó có 2 cái `UI` chồng lên nhau luôn nên nó bị lỗi -> Bởi vì mỗi thằng `test()` nó sẽ `render` trước một lần -> Nên chúng ta sẽ chuyển sang dùng `beforeAll()` để chạy trước tất cả các hàm `test()`

- Cuối cùng cũng đã fix được testcase không nhận vào giá trị trong input

- Vậy những trường hợp chúng ta tìm không ra lỗi khi nhập vào `form` thì chỉ cần(dùng logScreen() để mà debug) rồi `expect()` nó là -> Chỗ này dùng `queryByText` thì nó trả về `lỗi` -> Còn nếu mà chúng ta sử dụng `getByText/findByText` thì nó trả một `promise` -> Khi mà nó tìm không ra thì nó sẽ `throw` ra một cái lỗi (Vì promise khi mà bị rejject thì nó sẽ throw ra một lỗi) làm cho cái unit test bị lỗi theo -> Dùng `query-[function]` trong trường hợp chứng minh là tìm ra hay là không ra -> Nó sẽ tiện hơn khi dùng `findByText/getByText`

  - queryByAllText return về một cái `Array`
  - queryByText return về một cái `HTMLElement`

  - Dùng vơi `await waitFor()` vẫn đem lại lợi ích thích hợp cho chúng ta, khi mà render thì nó sẽ hiện ra -> Còn mà khi dùng thằng `async/await` khi mà tìm không ra thì nó sẽ quăng ra lỗi rất là khó chịu -> Nên dùng `waitFor()` vẫn thấy dễ chịu

### 237 Sử dụng MSW để test React Query

- Test `React Query` với `MSW` -> Là một Mock Service Worker

- `Mock` một cái `API` để thực hiện `giai đoạn nhấn submit` -> Khi mà nhấn `submit` thì sẽ `gọi API` thông qua thằng `ReactQuery` -> Nên là chúng ta cần phải biết cách `React Query` và `cách test Mock API`

  - Khi mà làm một cái `Unit Test` thì không nên `đụng đến API thật` mà hãy tạo ra một `Mock Api`

- Nên tạo `Mock API` để nó không phụ thuộc vào `server bên ngoài` gì nữa mà nó chỉ nằm trong `code` của chúng ta mà thôi -> Có thể gọi một cái `HTTP request` nhưng mà nó nằm trong code của chúng ta và nó không phụ thuộc bên ngoài -> Thì sử dụng `Mock Service Worker` thì thằng này nó sẽ `mock một cái API` cho chúng ta -> Thay vì phải làm Mock API bằng `JSON server` hoặc là `Promise setTimeut` gì đó -> Dùng cái này nó sẽ thay thế URL của chúng ta luôn

  - Lên phần `Mocking` của `vitest` nó sẽ hướng đẫn chúng ta tạo ra cái `mock service` để test -> Và chúng ta sẽ đọc phần `Mock Request`

  - Bởi vì `Vitest` nó chạy trong môi trường Node, nên việc `mocking network requests` thì rất là khó khăn, những cái `API` thì nó không có sẵn trên môi trường `Node` -> Nên là sử dụng `Mock Service Worker` nó thực hiện được cho cả `REST API và GraphQL`

  - `restHandler` thì chúng ta sẽ khai báo các cái `mock Api` của chúng ta -> Ví dụ như chúng ta `Login` thì chúng ta dùng `method` là `POST`
  - Khi chúng ta gọi đến đường dẫn API `https://api-ecom.duthanhduoc.com/` ->Và khi gọi nó trên môi trường `NodeJS` thì nó sẽ được thay thế bằng `Mock Service Worker`

  - Thì khii chúng ta gọi API(trên môi trường NodeJS) cụ thể là khi API để thực hiện cái `UnitTest` thì nó sẽ chạy cái `restHandlers` thay vì nó gọi đến cái `server` `https://api-ecom.duthanhduoc.com/`

- Tạo ra testUtils và Wrap cái App này lại bằng `testUtils` của mình -> Để tắt cái retry 3 lần của thằng `ReactQuery`

  - Sẽ để thằng `QueryClientProvider` ra bên ngoài để cho cái `App` có custom `QueryClientProvider` trong môi trường test rất là `easy`

  - Về mặt logic thì vẫn giữ nguyên mà thôi, nhưng như thế này thì vẫn thuận tiện cho việc `testing` hơn

- Khi mà dùng `screen.queryByText` thì dùng kết hợp với `await` và `waitFor()` -> Còn khi dùng `findbyText` hoặc là `getByText` thì nó trả về một `promise` khi mà có lỗi thì nó log ra `cái lỗi` cho chúng ta luôn nhưng mà chúng ta không muốn dùng cái đó thì dùng `queryByText`

- Khi mà chúng ta test thì cần nên có một `Mock Server` để test những cái API -> Và tạo ra những cái `Endpoint` để khi mà nó có thì nó sẽ nhảy vào còn không thì không cho nó nhảy vào(Còn không có thì show ra lỗi) để tránh trường hợp nó `tác động` đến cái `API thật` của chúng ta

- Và khi test với React Query thì nên tạo ra cái file `testUtils` để trong đó khai báo các hàm `wrapper` để chúng ta `disabled` những cái `retry` trên mỗi trường `unit test`(Khi mà test API đôi khi nó sẽ có lỗi) -> Nên khi mỗi lần `test API` bị lỗi thì nó cứ `retry` thì sẽ rất là mệt

### 238 Cập nhật Mock Service Worker cho các Api còn thiếu

- `StructuredClone` nó dùng để `Deep Copy` với những `object` lòng sâu nhiều cấp

- Khi mà sử dụng `MSW` thì khi mà test những thứ liên quan đến `getMe` hoặc là `refreshToken` sẽ bị thằng `MSW` nó đè lên

- Sẽ tiến hành `Mock API Service` cho thằng `Login`

### 239 Test trang Profile cần authenticated

// `https://drive.google.com/drive/folders/1cu9U7UivcMEEdRyOYpd9ktTg65YBnhXB`

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

- Làm tới phần này

### 247 Fix lỗi refresh page ra 404 khi deploy vercel

- -> Đã fix được

### 248 Phân tích generic type cho component Input

- Chúng ta nhận ra rằng khi mà `Controller` truyền vào `control` thì thằng `name` tự được sinh ra dựa vào cái `control` truyền vào -> Thì cái thằng `Input custom` của chúng ta cũng khá là tương đồng khi cái `Input` truyền `register` thì cái `name` được sinh ra dựa vào thằng `register`

- Vậy chúng ta sẽ đi phân tích cái `Controller` nó làm như nào để chúng ta áp dụng vào `dự án` của chúng ta

- Ý tưởng là như thế bây giờ chúng ta cùng thử xem nó có ra cái gì không

- Cái Input, khi mà vào click `UseFormRegister` thì chúng ta có thể thấy cái biến truyền vào nó phải kế thừa từ cái `FieldValues` thì nó mới chấp nhận

- Bây giờ thì cái thằng `name` và `register` đã có cùng điểm chung đó là điều có `Generic Type` chung đó là `TFieldValues`

- Sau khi `custom` `Generic Type` cho thằng `Component Input` thì cuối cùng nó đã gợi ý rồi

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

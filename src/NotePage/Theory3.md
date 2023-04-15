// **\*\*\*\***\*\*\*\***\*\*\*\***\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\*\*\***\*\***\*\*\*\***\*\*\*\***\*\*\*\***

> > > > > > > > > > > > > > > > > > > > > > Chương 23 Clone Shopee trang nâng cao - Performance
> > > > > > > > > > > > > > > > > > > > > > `
> > > > > > > > > > > > > > > > > > > > > > 219 Thêm 404 Page Not Found

> 220 Thêm ErrorBoundary Component

- - Thêm ErrorBoudary cho trang web của chúng ta
- - Trong trường hợp nó bị lỗi trắng xóa thì chúng ta sẽ sử dụng ErrorBoundary để tranh trường hợp cái App của chúng ta nó bị crash
- -> Ít ra lỗi t hì của phải show lỗi cho người dùng biết, Trong trongwf hợp người dùng vào cái trang nó có tồn tại mà chúng ta xử lý nó bị sai làm cho cái trang chúng ta nó bị lỗi nó crash cả cái app của chúng ta luôn
- -> Ví dụ chúng ta lấy cái params nó không có thực, ví dụ cái params `productId` nó không có mà chúng ta tưởng rằng là nó có tồn tại và chúng ta xử lý một số thứ trong Component

- const \_value = productId.value // Trong trường hợp thằng này k có mà chúng ta lấy ra giá trị undefined của nó thì no sẽ bị crash cái app của chúng ta
- -> Tạo 1 cái component `ErrorBoundary` để thực hiện việc tranh trường hợp app bị trắng xóa
- -> ErrorBoundary bao bọc chỗ nào thì nó sẽ try-catch chỗ đó -> Nếu có lỗi từ trong cái App thì ErrorBoundary nó sẽ return về cho chúng ta 1 cái UI dự phòng
- -> Có thể cho thanh Header nhưng mà khi mà lỗi thì cái thành đường Link trong thành Header nó cũng không có chạy được nên là cứ cho nó cái lỗi đơn giản vậy thôi là được không cần phải thành Header

- -> Thêm React Portal vào cho project -> Bình thường thì modal có thể nằm ở component nào đấy nhưng cũng có thể nằm ở ngoài cái Root luôn

> 221 Lazyload component với react lazy và reacrt router

- -> Đôi lúc chúng ta code nhiều mà chúng ta quên đi một vấn đề rằng là khi build thì nó như thế nào, build là dùng để desploy lên product
- -> Lazyload là kỹ thuật sử dụng trang nào thì tải trang đó -> chứ nó không tải toàn bộ cái `App` của chúng ta làm gì -> làm cho cái app chúng ta nhanh hơn -> `User` sử dụng cảm thấy thoải mái hơn
- -> Chúng ta sẽ Lazyload hết tất cả các page của chúng ta, điểm thuận lời của việc tải hết tất cả mọi thứ alf khi chuyển trang thì nó không có bị giật lag
- -> Suspense nó còn có một thuộc tính là fallbackUI -> khi mà cái trang chúng ta chưa load ra thì nó sẽ load tạm cái gì đấy

- -> Nếu mà không có lazyload thì mới vào thì nó sẽ tải hết tất cả mỗi thứ

- -> CreatePortal giúp chúng ta đưa các <Element /> chúng ta ra bất kì vị trí nào mà chúng ta mong muốn

  > 222 Kỹ thuật phân tích và tối ưu kích thước file build cho production

- -> Bên vite nó cũng có một công cụ để phân tích file build product của chúng ta -> Công cụ đó có tên là `Rollup Plugin Visualizer` -> thằng `vite` được build dựa trên thằng `Rollup Plugin Visualizer`
- -> Ngoài những video hướng dẫn thì cũng nên tự động document của thằng vite xem nó có những -> mình muốn thêm những gì cho thằng production của mình -> Chỉ có đọc `document` mới có thể nâng cao được kiến thức của chúng ta

- -> Thằng lodash nó chiếm khá là nhiều dung lượng do là nó không có tính năng tree-shaking -> Bây giờ làm thế nào để mà fix cái vấn đề này -> Chỉ dùng mỗi `omit` hoặc một vài method nhất định

> 223 Thực hiện chức năng refresh token

- -> `Refresh_token` là bài giảng cực kì là khó nên phải xem đi xem lại nhiều và tự mình thực hiện lại việc `refresh_token`

> 224 Đa ngôn ngữ trong Reactjs với I18Next

- -> Dùng thư viện i18next và thư viện reactI18next để handle việc này, handle việc đa ngôn ngữ trong Reacjs
- -> Import hook useTranslation từ react-i18next -> sẽ destruc cho chúng ta một cái object
- -> Khi mà chuyển sang tiếng anh thì chỗ navheader nó cũng phải hiện là English -> Để rõ ràng hơn thì 'vi' thì chúng ta phải ghi gõ ra là Vietnamese và 'en' là English -> Thì khi mà khai báo như vậy thì thằng typescript nó sẽ cảnh báo chúng ta rằng cái `i18next.language` có thể không phải là key locales cho dù nó có là string đi chăng nữa , chắc gì nó đã là key của `locales` -> nên chúng ta chắc chắn là nó có thì chúng ta có thể ép kiểu nó -> Chúng ta biết chắc thằng này kiểu gì nó cũng là 'vi' và 'en' nên ta ép kiểu nó như vậy -> Đây là cái `trick` nhỏ
- -> Nếu mà 'vi' mà không có key và value thì nó sẽ lấy giá trị 'key' của 'en' để vào giá trị cho 'vi'

- => Trong thực tế thì cái `app` chúng ta có rất là nhiều `pages ` -> Và thường người ta sẽ chia ra thành nhiều file JSON khác nhau và người ta sẽ import nó vào file i18next -> Tạo folder `locales` trong thư mục src -> Chúng ta có thể nestesd nó với nhau nữa
- => Ví dụ có thêm file là product.json
- -> Thì ở đây chúng ta sẽ không sử dụng cái translation trong i18next => // Khi mà khai báo namespace trong resource thì chúng ta cũng nên khai báo ở dưới đây -> Và chúng ta cũng khai báo thêm default nameSpace nữa -> thằng `defaultNS` có công dụng khi mà chúng ta không có truyền `namespace` vào trong những thằng -> Ví dụ chúng ta gọi không không như thế này mà chúng ta ko có truyền `namespace` thì nó sẽ lấy cái `defaultNS` -> Nếu mà truyền như cách cũ hồi nảy thì nó sẽ lấy `namespace` là translation -> Còn bây giờ mà chúng ta không truyền gì cả thì nó sẽ lấy `namespaceDefault`
- -> Chúng ta sẽ khai báo bằng cách dùng nested trong i18next cho thằng `aside filter` --> Cú pháp của chúng ta nó sẽ như này
- -> // Trong trường hợp ko khai báo gì thì chúng ta đang sử dụng namespace mặc định -> Nếu mà sử dụng một namespace khác không phải là namespace mặc định thì nó sẽ báo lỗi -> Nên ở các page chúng ta nên khai báo cái `namespace` của chúng ta muốn dùng trong hook `useTranslation` này -> Ví dụ trong cái file `AsideFilter.tsx` => Nếu mà dùng `home` thì thì ghi `useTranslation('home')` còn trong trường hợp cái page của chúng ta sử dụng rất là nhiều cái `namespace` thì chúng ta chỉ cần đưa cho nó 1 cái array là được.

- -> Hướng dẫn cách chúng ta handle về mật `typescript` nảy giờ chúng ta dùng typescript mà { t } = useTranslation() nó không có gợi ý cho chúng ta -> Nó nên gợi ý các `key` trong `namespace` -> Như vậy thì nó sẽ mất đi cái tính hay trong typescript -> Về cách handle thì lên trang chủ `i18next` và chọn mục `typescript`
- -> Đầu tiên nó sẽ tạo 1 cái folder là `@types` và file là `i18next.d.ts` trong cai file này chúng ta sẽ khai báo 1 số thứ
- -> Trong trường hợp sử dụng 1 cái array namespace như thế này ['home'] -> Thì khi khai báo cho nó thì chúng ta sẽ khai báo như này `t('home:all categories')`
- -> Cuối cùng để tăng tính chặt chẽ cho cái giá trị const của chúng ta thì chúng ta nên khai báo thêm `as const` để những cái `Hằng số - const` của chúng ta chỉ có thể được đọc không thể thay đổi được.

> Sử dụng useDebounce để thực hiện cho logic seasrch tìm kiếm sản phẩm

- -> Cách khắc phục khi mà search là nên biết là khi nào thì ngta sẽ gõ xong `từ khóa - search key` trong ô `tìm kiếm` thì lúc đó mới bắn đi một cái `request` về phía server -> Thì cái này có một cái thuật ngữ nói về cái tên kĩ thuật này nó gọi là `debounce` -> Khi mà gặp tình thế là cái chuỗi hành động xảy ra liên tục thì chúng ta chỉ muốn thực hiện 1 cái hành động cuối cùng khi mà nó ngừng lại mà thôi -> Thì hãy nghĩ đến `debounce` -> Tạo ra 1 cái custom hook

- -> Viết tippy đổ ra kết quả tìm kiếm của chúng ta ở dưới cái tooltip -> Sẽ control cái show/hide của cái tippy sẽ không để mặc định là hover vào nữa -> Tìm sản phẩm sẽ là mảng danh sách các sản phẩm được tìm kiếm, Sau này sẽ handle bằng cách khi mà nó có kết quả trả về thì sẽ hiển thị ra -> sử dụng `interactive` sẽ làm chúng ta hover vào được cái thằng tippy

- -> Khi mà có từ khóa tìm kiếm thì chỗ ô search nó sẽ có phần tippy hiện ra danh sách Search tối đa là 9 phần tử -> Khi mà xóa giá trị trong ô search đi thì nó cũng sẽ xóa kết quả tìm kiếm trong ô search đi -> Khi mà đang search mà chúng ta outFocus ra ngoài thì kết quả tìm kiếm sẽ được ẩn đi -> Khi mà focus vào lại ô input thì kết quả tìm kiếm sẽ được hiện lại -> Khi đi làm cũng phải phân tích được như vậy thì nó mới đúng nghiệp vụ được thì mới hoàn thành được công việc công ty giao cho
- -> Sẽ dựa vào cái state `searchValue` thay đổi để quyết định là có hiển thị ô tìm kiếm hay không -> Điều kiện để nó hiển thị kết quả tìm kiếm là điều kiện đầu tiên `searchValue` phải có giá trị và ô input phải được `focus` vào -> Tạo cái state thể hiện việc `focus` vào ô input hay đang `focus` ra ngoài -> tạo state `showResult` để mà biết ô input có được `focus` hay không nếu mà có `focus` và có searchValue thì mới cho show kết quả còn không thì sẽ ẩn kết quả đi
- -> Nếu mà đúng cả 2 điều kiện thì sẽ cho hiển thị cái kết quả tìm kiếm ra: showValue(true) && searchResult.length > 0 -> Thì mới cho hiển thị kết quả tìm kiếm -> Nên để là true bởi vì lần đầu khi mà vào trang `searchResult` nó chưa trả về giá trị nên nó chưa hiển thị ra kết quả tìm kiếm
- -> Thì ở trong thằng tippy nó có method là `onClickOutside` nên khi click ra ngoài thì nó sẽ thực thi cái hàm bên trong

      {/*  onSubmit={onSubmitSearch} */}
            <!-- <form className=' col-span-9'>
              <div className='flex rounded-sm bg-white p-1'>
                <input
                  ref={inputRef}
                  value={searchValue}
                  onChange={handleChangeInput}
                  type='text'
                  className='flex-grow border-none bg-transparent px-3 py-2 text-sm text-[rgba(0,0,0,.95)] outline-none'
                  placeholder='Đăng ký và nhận voucher bạn mới đến 70k!'
                  {...register('name')}
                /> -->

                <button
                  type='submit'
                  className='flex-shrink-0 rounded-sm bg-[linear-gradient(-180deg,#f53d2d,#f63)] py-2 px-6 hover:opacity-90'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                    />
                  </svg>
                </button>
              </div>
            </form>

- -> Chỉ cần tìm thấy được chữ trong cai queryString là `name=''` có kết quả thì nó sẽ trả về cái mảng cho chúng ta
- -> Mỗi khi mà `searchValue` có nghĩa là người dùng đang gõ vào ô input -> Viết logic search Product trong `useSearchProducts` rồi qua phần Header lấy ra để lập ra hiển thị ra phần `tippy`

> Cải thiện Logic search cho shopee clone

- -> Trước tiên cải thiện một tí về phần `Popover` khi mà rê chuột vào khoảng không giữa `content chính` và `popover` -> Nên chúng ta sẽ tạo 1 cái lớp giả phía sau để nó không bị mất đi -> Dùng `before` và `after` để thực hiện việc này

- -> Sử dụng `useDebounce` để hạn chế số lần request API khi mà search sản phẩm -> giúp cho App chạy mượt mà hơn, máy chủ hạn chế được những request không cần thiết
- -> Cách khắc phục là biết khi nào người dùng sẽ gõ thành công thì lúc đấy chúng ta mới bắn đi 1 cái `request` lên server để gọi Api -> Khi mà người ta ngừng gõ khoảng 500ms hoặc 800ms thì chúng ta xem là người ta đã ngừng gõ tại thời điểm đó -> Thì lúc đó chúng ta sẽ bắn 1 cái `request` lên server ->
  -> const debounced = useDebounce(searchValue, 500) // khi người dùng ngừng gõ 500ms thì giá trị debounced mới được update bằng giá trị của searchValue
  -> Nếu searchValue được gán vào cho debounced thì sẽ được `cache` lại khi mà chúng ta gõ giống từ khóa tìm kiếm đó thì nó sẽ trả về luôn -> Nôm na là ở lần render tiếp theo nó sẽ lấy giá trị đã được `cache` ra cho chúng ta và không cần phải tính toán lại giá trị mới

> Bug còn tồn đọng trong dự án

- -> Sau khi thêm vào giỏ hàng theo chức năng `Mua Ngay` thì khi checked được bỏ mà chúng ta nhấn tăng sản phẩm khác thì checked của `Sản phẩm trước` nó sẽ được checked lần nữa
- -> Về số lượng của một sản phẩm còn tồn động trong kho -> Khi mà trong giỏ hàng đang có 17 sản phẩm mà chúng ta lại thêm số lượng sản phẩm tùy thích < 17 từ trang productDetail thì nó sẽ cộng đồn sản phẩm lên -> Sai với logic khi mà số lượng sản phẩm chúng ta chọn phải < số lượng sản phẩm tồn kho

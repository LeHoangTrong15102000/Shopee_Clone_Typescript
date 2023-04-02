> > > > > > > > > > > > > > > > > > > > > > Chương 22 Clone shopee trang thông tin user

> 205 Xử lý lỗi khi token hết hạn

    + Sẽ bắt đầu xử lý lỗi khi token hết hạn

    + Ở đây mình phải xử lý trường hợp khi mà access_token hết hạn thì chúng ta phải logout ra khỏi trang web -> Chúng ta phải handle cái việc đấy -> để giả sử cái access_token chúng ta hết hạn thì chúng ta sẽ thêm 1 kí tự bất kì vào trong access_token -> thì lúc này Api nó sẽ trả về là 401 -> Khi mà nó trả về 401 thì chúng ta sẽ xóa access_token và logout ra khỏi app
        -> Xóa acccess_token và profile trong localStorage và remove ra khỏi contextApi
        -> Cái state isAuthenticated thì phải reset nó về false và cái profile cũng phải xóa nó đi luôn
      -> Khi mà access_token hết hạn thì cũng logout ra không được
      -> Đầu tiên sẽ disabled cái retry 3 lần
      -> Khi mà Api trả về 401 thì se xóa localStorage
        -> Chúng ta sẽ vào http để check cái vấn đề ở phần { error } của responseInterceptor -> Nhưng mà khi clearLS() rồi mà chúng ta vẫn còn đăng nhập là do chúng ta mới chỉ clear trên localStorage thôi vẫn chưa clear trên contextApi -> Nên phải clear trong ContextApi nữa -> Trường hợp dễ nhất là khi chúng ta F5 - refresh lại trang web thì cái contextApi nó lấy từ trong localStorage ra -> Thì lúc này localStorage đã bị xóa(do access_token) hết hạn thì contextApi cũng không còn -> Thì nó sẽ có được trang thái là chưa đăng nhập như này
            -> Dùng window.location.reload() -> nó sẽ F5 lại khi mà access_token của chúng hết hạn -> Cách này thì cũng được nhưng mà nó chưa được hay -> điều này làm cho trang web chúng ta nó mất đi cái tính SPA đặc trưng của React là không reload lại trang

      -> Có 1 cách hay hơn khi mà access_token của chúng ta hết hạn là sử dụng -> EventTarget() -> lên trang MDN để đọc nhưng chúng ta sẽ được demo dễ hơn -> dùng cái EventTarget() này thì chúng ta sẽ xuất ra cái event thì ở một nơi nào đó chúng ta sẽ lắng nghe cái event này
            -> Ví dụ khi mà chúng ta clearLS() -> Thì mình sẽ xuất ra cái event là 'Tôi đã clearLS rồi' -> Thì ở trong cái nơi nào đấy mình sẽ lắng nghe cái event ấy -> Ví dụ lắng nghe trong component App => Chúng ta sẽ lắng nghe cái event là ClearLS -> Sau khi mà bên kia clear thì bên này sẽ lắng nghe -> Bên này lắng nghe rồi thì mình sẽ set lại cái state isAuthenticated(setIsAuthenticated), set lại extendedPurchases, set lại profile -> set mấy thằng này lại giá trị khởi tạo
      -> Sẽ demo EventTarget trong localStorage -> new EventTarget() là một constructor 1 api có sẵn trong trình duyệt -> Hầu như các trình duyệt hiện này nó đều có hỗ trợ việc này rồi nên là chúng ta cứ dùng không sợ việc gì cả
      -> khi mà xóa localStorage mình dispatchEvent(), tạo ra một cái Event(là một APi có sẵn trên trình duyệt luôn) bắt buộc phải truyền vào một cái type(string ) -> để đưa vào dispatchEvent()

      -> Qua thằng App.tsx để lắng nghe cái type ấy -> Khi mà chúng ta sử dụng cái siteEffect để muốn lắng nghe cái gì đấy thì chúng ta sẽ dùng trong cái useEffect() -> sẽ bắt đầu lắng nghe cái sự kiện , trong addEventListener() chúng ta sẽ lắng nghe sự kiện nó sẽ,
      -> Tạo cái function reset bên AppContext sau đó sẽ gọi bên phía App.tsx

      -> Chúng ta có thể cải thiện nó thêm 1 tí xíu nữa => khi mà chúng ta lắng nghe 1 cái sự kiện gì trong useEffect() thì chúng ta cũng nên clear nó khi mà componet của chúng ta nó không còn hoạt động nữa , nó bị destroy đi -> Thì khi mà thằng AppContext nó bị reset() thì thằng App nó sẽ bị ngắt khỏi DOM -> bị xóa => Truyền cái reset như vậy là được vẫn đảm bảo không bị rò gỉ bộ nhớ

    -> ở trong cái bài này chỉ thực hiện access_token khi mà hết hạn -> thì ở trong những chương tiếp sẽ thực hiện refresh_token nó sẽ khó hơn

> 206 Chia nes thì ted route cho layout profile\

    + Bài này sẽ chia Nested route cho lauout profile
    + Trong phần User chúng ta sẽ tạo ra cái layout dùng chung

    + User chỉ là folder thôi trong đó chúng ta sẽ tạo ra các pages chứa các trang con
        + Phần ở giữa chúng ta sẽ sử dụng Outlet hoặc là children cũng được
    + Chúng ta nhận thấy cái layout chỉ sử dụng trong phần User của chúng ta mà thôi -> Nhưng cái layout mà sử dụng ở ngoài là dùng cho nhiều nơi

    + Có thể khai báo là cùng cấp với các  route khác khi mà phải xác thực người dùng rồi thì mới cho phép người ta vào -> Do nó cũng nằm trong cái MainLayout nên có thể khai báo cùng cấp
                  {
              path: path.profile,
              element: (
                <MainLayout>
                  <UserLayout>
                    <Profile />
                  </UserLayout>
                </MainLayout>
              )
            },
            {
              path: path.changePassword,
              element: (
                <MainLayout>
                  <UserLayout>
                    <ChangePassword />
                  </UserLayout>
                </MainLayout>
              )
            }
      -> Khai báo như thế này thì cũng được nhưng mà nó sẽ lặp lại code
      -> Với lại nhìn vào cấu trúc chúng ta đã hình thành như vậy thì chúng ta sẽ không biết được là nó thuộc cái cấu trúc của thằng User component
      => Nên là chúng ta sẽ làm cái nested route như cái thằng ở trên

      => element của những cái nested route nên có cái outlet thì nó mới cho phép -> Khi mà chúng ta dùng với children trong MainLayout, thì cái children nó không phù hợp để đặt vào cái element này đâu, -> bởi những thằng element đại diện cho cái layout -> Nên trong những thằng này phải để cái component là Outlet vào
      -> thì chỗ này không thích đặt element cũng được chúng ta sẽ đặt children: [] cho cái nested routes

      -> Nếu muốn dùng element thì những thằng con phải là Outlet thì mới có thể sử dụng được element -> Muốn dùng element: <MainLayout /> thì những thằng con phải là Outlet

      -> Nhưng mà để ngắn gọn hơn thì nên chuyển cái UsetLayout từ children sang Outlet -> Khi mà dùng Outlet rồi thì không có truyền vào trong <UserLayout /> nữa
      -> Và bây giờ <UserLayout /> chỉ được dùng theo kiểu react-router-dom mà thôi

             {
          path: path.user,
          children: [
            {
              path: path.profile,
              element: (
                <MainLayout>
                  <UserLayout>
                    <Profile />
                  </UserLayout>
                </MainLayout>
              )
            },
            {
              path: path.changePassword,
              element: (
                <MainLayout>
                  <UserLayout>
                    <ChangePassword />
                  </UserLayout>
                </MainLayout>
              )
            },
            {
              path: path.historyPurchases,
              element: (
                <MainLayout>
                  <UserLayout>
                    <HistoryPurchases />
                  </UserLayout>
                </MainLayout>
              )
            }
          ]
        }

        ->

        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          // cái children trong router dùng để khai báo cho những thằng Outlet nằm bên trong UserLayout
          children: [
            {
              path: path.profile,
              element: <Profile />
            },
            {
              path: path.changePassword,
              element: <ChangePassword />
            },
            {
              path: path.historyPurchases,
              element: <HistoryPurchases />
            }
          ]
        }

        -> Thì cách này nhìn tối ưu hơn những cách kia rất là nhiều

> 207 Code UI User SideNav

    + Code UI cho trang User SideNav

    + 2 Cái avatar và tên và icon sửa hồ sơ điều là thẻ <Link>

> 208 Code UI trang profile

    + Code UI cho trang profile
    + Để bắt đầu code UI trang profile

    + Ở desktop thì cái avatar nó sẽ nằm bên phải còn khi lên mobile thì nó sẽ nằm lên trên

    + Cái form ở trong cái trang profile này chúng ta sẽ thực hiện một cách đơn giản -> Nhưng trong những bài tới sẽ làm khó lên hơn để khi mà đi làm chúng ta gặp được những cái case về form nó khó vẫn có thể control được

      + Ví dụ như khi mà đi làm sẽ gặp được một số cái case khó như là -> chúng ta có cái form ở trang 1 xong rồi chúng ta next sang trang 2 vẫn có 1 cái form => Form nó có từ trang 1 trang 2 trang 3 luôn -> Khi chúng ta `submit` thì chúng ta phải validate hết tất cả các form từ trang 1 đến trang 3 -> Những cái form nhiều trang với nhau -> Khi mà gặp tình trang đấy -> Sẽ sử dụng useFormContext của thằng React-hook-form

      + Chỗ ngày sinh sẽ tự động generate ra chứ không thể nào mà gõ ra hết được

      + Trong cái Avatar có cái button và input type là file -> nhưng mà cái input file này nó bị ẩn đi -> Khi mà chúng ta nhấn vào cái button thì nó onChange cái input file cho chúng ta -> Thay vì để cái input file ở ngoài thì nó rất là xấu -> Nên sẽ cho nó ẩn vào và khi onChange cái button thì sẽ gọi đến cái input file đó

> 209 Khai báo và test API cho phần profile

    + Khai báo và test Api cho phần profile

    + Khai báo những Api liên quan đến User người dùng
    + Cập nhật lại type date_of_birth là string(do Api trả về), và thêm trường là Avatar vào type
    + Thêm vào 2 Api là /me và /upload-avatar và update-user
    + Method put update thì thường Api nó sẽ set theo method Put -> Vì thằng update thông tin người dùng có cả trường password và comfirm_password -> Thôi thì chúng ta sẽ kế thừa từ cái cũ và thêm vào thêm những trường mới -> Sẽ Omit<>('id', 'role', 'createAt', 'updateAt') sẽ omit đi cả 4 thằng này -> thì đây là những cái chúng ta sẽ không có truyền lên Api
    + Nó sẽ trả về cho chúng ta cái response tương tự như là get profile của người dùng => <SuccessResponseApi<User>>

    + Nếu chúng ta không chắc chúng ta khai báo Api như này là đúng hay chưa -> thì sẽ test bằng cách tạo 1 cái biến -> chúng ta bỏ luôn cái `Email` vì thằng email nó không thay đổi được

    + Sẽ khai báo luôn cái Api là uploadAvatar -> uploadAvatar thì truyền lên body là kiểu FormData -> uploadAvatar sẽ trả về đoạn string 'url' ->
        -> type FormData là một type có sẵn của thằng typescript
        -> Và nhớ khi mà sử dụng Api uploadAvatar thì chúng ta phải truyền lên thêm cho nó 1 cái header có dạng -> 'Content-Type': 'multipart/form-data'
        -> Ảnh sẽ gửi lên sever là FormData với item có key là image

> 210 Hiển thị data profile lên Form P1

    + Hiển thị data profile lên Form p1, để lấy ra data để hiển thị lên trang profile của người dùng

    + Sẽ tiến vào học cách để gửi dữ liệu khi mà có 2 3 trang liên tục đều có sử dụng Form -> Case khó đi làm -> Học để có thể biết cách để control điều này

    + Do thằng thay đổi avatar cũng nằm trong cài form nên chúng ta sẽ cho vào chung với thằng form -> Để khi mà lưu cái thay đổi thì sẽ thay đổi luôn thằng avatar
    + Sẽ sử dụng useFormContext để control vấn đề này -> Cũng sẽ thực hiện message error lên Form để hiện ra ngoài
    + Mở qua cái Api document của chúng ta để phân tích cái Form một chút xíu -> chúng ta có 3 cái select option nhưng cái api của chúng ta chỉ yêu cầu 1 cái trường là dateOfBirth mà thôi -> Vậy thì làm sao chúng ta setting cho nó phù hợp bây giờ -> Sẽ đặt 1 cái trường là dateOfBirth sẽ đại diện cho 3 thằng selecOption trong field `Ngày Sinh` -> Chứ chúng ta không đặt là day-month-year xíu gửi lên server chúng ta phải convert nó lại khá là mệt -> Nên chúng ta nghĩ là cho 3 cái selectOption thành 1 cái component xong rồi cái component này mình sẽ dùng cái thằng controller để mình truyền cái dateOfBirth vào nó sẽ tiện hơn là nếu mình để cho từng cái là `name` `sodienthoai` `giớitinh` `day-month-year` rồi chút gửi lên sv lại chuyển nó lại rồi get từ Api về lại chia nó ra -> Nên cho nó vào cái component để truyền vào controller vào từng thằng cho nó dễ -> Nếu mà làm như thế thì nó sẽ tiện hơn về mặt schema nữa

    + Sẽ mở cái file rules để khai báo schema khác bởi vì cái schema chúng ta nó hơi đặc biệt một tí (trong schema bthuong có thằng name của product) -> Sẽ tạo 1 cái schema có tên là UserSchema -> Tạo cái schema mới nhưng vẫn kế thừa được những cái thuộc tính của schema cũ -> Coi lại cái của thằng Api để khai báo cho nó chính xác
    + Chỉ nên khai báo 1 trường là date_of_birth cho `Ngay Sinh` -> Phải gom cả 3 ông lại (lấy được value cả 3 thằng) tính ngày rồi mới có thể validate cho trường date_of_birth -> Custom 1 cái yup validate rất là khổ -> Trong khi khai bao date_of_birth cho nó là một kiểu yup.date() thì validate rất là dễ và nó có sẵn validate cho chúng ta -> Chúng ta cho giá trị lớn nhất của cái day_of_birth là giá trị hiện tại (người dùng không thể nhập ngày lớn hơn ngày hiện tại) -> yup.date().max(new Date(), '') => Khỏi phải tạo 1 cái function gì cho nó phức tạp cả
      -> Còn khi nào gửi lên Api thì chuyển cái date_of_birth thành ISOString -> date().ISOString là dược

    + Về trường password và new_password chúng ta sẽ kế thừa từ thằng schema đã có sẵn
    + Sẽ thêm confirmPassword vào để xử lý trong cái form confirmPasword
    + userSchema không có isRequired() ở trường thay đổi thông tin
    + Trước khi khai báo cái form chúng ta sẽ dùng cái useQuery() để get cái profile ra đã

      -> () => userApi.getProfile() khai báo như này thì nó cũng trả về cho chúng ta 1 cái callback mà cái callback thì nó gọi thằng userApi.getProfile() thì trả khác gì chúng ta khai báo như này -> userApi.getProfile (thì nó cũng đảm bảo trả về cho chúng ta một cái callback)

      ******************************************************************
          -> nên 2 queryFn: () => userApi.getProfile() và queryFn: userApi.getProfile thì nó đều tương đương nhau


    + Nên chọn là key Pick của typescript vì trong tương lai thằng userSchema nó có thể phình to ra nên dùng method `Pick` của typescript là phù hợp nhất
    + Nên có defaultValue trong useForm cho nó chặt chẽ hơn
    + // giá trị khởi tạo là Date() nên khởi tọa theo như vậy
        -> Sẽ là như này date_of_birth: new Date(1990, 0 , 1) -> tháng 1 sẽ bắt đầu từ index thứ 0 -> cho tới tháng 12 là index 11 -> Thì sẽ bắt đầu bằng yyyy/mm/dd -> Kiểu định dạng của new Date()

    + Field phone để cho nó chặt chẽ thì nên sử dụng là InputNumber -> Nên để onChange của thăng InputNumber ở phía dưới vì field nó cũng generate ra onChange nên để phía dưới cho nó ghi đè lên giá trị onChange của field

    + Lấy giá trị của field `Ngày Sinh` thì như đã nói cả cụm Ngày Sinh sẽ được cho thành component để nó xuất ra 1 cái date_of_birth theo cái kiểu định dạng là date().ISOString thay vì từng thành phần nhỏ là dayd-monthm-yearyyy -> Tại vì chúng ta đã khai báo cái Type userSchema thì cái date_of_birth chỉ có 1 trường duy nhất.
    + Phải quy định chặt chẽ cho type trong thằng button -> Để khi mà upload file mà nó submit form luôn là không ổn
    + Chúng ta khi mà getProfile thành công rồi làm sao để chúng ta đổ cái dataProfile vào formProfile -> để cái form hiển thị lên trên những cái Input và InputNumber -> Thì đổ nó thì rất là đơn giản chúng ta sẽ dùng useEffect() vì chúng ta biết khi nào mà cái profileData nó sẽ có dữ liệu nên sẽ cho vào cái dependency -> Khi nào mà profile có data thì chúng ta sẽ set vào cái form

    -> Nên là sử dụng useEffect() chứ không nên để useForm() ở phía dưới thằng getProfile() để khi mà getProfile thành công thì chúng ta sẽ set cái dataProfile vào trong useForm(defaultValues: {}) vào defaultValues của useForm() => Và trường hợp này nó chỉ set duy nhất khi mà component render lần đầu tiên mà thôi -> Nên là đưa profileData(cần vài giây để get Api) vào trong cái useForm() là không được -> trừ khi mà chúng ta có sẵn trong cái useContext lấy 1 cái context hoặc 1 cái props có sẵn thì nó mới có dữ liệu còn không thì nó sẽ undefined hoài

    -> Tóm lại là sẽ sử dụng useEffect() khi nào mà getProfile thành công thì chúng ta sẽ set vào cái formProfile -> Để set value vào trong form thì chúng ta sẽ sử dụng thuộc tính setValue của useForm()

    // ********************************************* Xử lý Date cho formProfile
    -> / date_of_birth nó sẽ có định dạng string kiểu ISO8601 -> sv sẽ trả vè cho chúng ta định dạng string ISO8601 -> Nhưng mà cái form của chúng ta nó chỉ cần cái Date() mà thôi , ISO8601 chuyển sang cái Date cực kì đơn giản -> Thì chúng ta sẽ kiểm tra - Ví dụ như mà cái date_of_birth từ trên sv trả về mà có bởi vì sv đâu có đảm bảo lúc nào cũng trả về date_of_birth đâu
        -> Thì chúng ta sẽ kiểm tra nếu mà có date_of_birth thì sẽ tạo ra 1 cái kiểu Date -> profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0 , 1) (Còn không thì sẽ lấy giá trị mặc định)
        -> Thì chúng ta truyền (ISO8601 - new Date().toISOString() -> sẽ trả về ISO8601) vào cái new Date('ISO8601') -> Thì nó sẽ cho ra 1 cái kiểu Date
              -> truyền ISO8601 vào new Date('2023-04-01T11:33:25.887Z') nó sẽ cho ra kiểu Date: Sat Apr 01 2023 18:33:25 GMT+0700 (Giờ Đông Dương)

> 211 Hiển thị data profile lên Form P2

    + Hiển thị data lên form phần 2

    + name trong event chính là cái name chúng ta truyền trong những thẻ mà chịu ảnh hưởng của onChange

    + Khi mà đã lấy được cái name và value rồi thì sẽ tạo ra cái const newDate - sẽ lấy cái ngày cũ và overwrite lại mấy trường -> Nên đặt tên name của mấy cái Select/option trùng với cái state chúng ta gán giá trị cho chúng khi mà onChange
    + Bây giờ newDate sẽ là cái ngày mới khi mà chúng ta thay đổi cái Select này -> Sau khi ghi đè xon chúng ta sẽ set lại giá trị cho setDate() => setDate({...date, [name]: value})
    + // Kiểm tra nếu mà có onChange từ bên ngoài truyền vào, và truyền giá trị date vào
        -> Bởi vì date chúng ta truyền vào có dạng là ISO8601 nên chúng ta phải đưa nó vào new Date(ISO8601) để format nó lại thành Sat Apr 01 2023 18:33:25 GMT+0700 (Giờ Đông Dương)

    + Cái giá trị value từ trên Props truyền xuống thì nếu có chúng ta sẽ lấy giá trị từ props còn không thì sẽ lấy giá trị mặc định đã được gán sẵn trong state
        -> Và như đã nói thì cách này chỉ có hiệu quả ngay lần đầu tiên thằng DateSelect nó render thôi
              // value?.getDate() giá trị khởi tạo
              const [date, setDate] = useState({
                date: value?.getDate() || 1,
                month: value?.getMonth || 0,
                year: value?.getFullYear || 1990
              })
            -> Tại lần render đầu tiên thì giá trị khởi tạo nó mới có tác dụng -> nếu mà chúng ta thay đổi liên tục các kiểu thì cái chỗ state này nó không có thay đổi đâu

        -> Ở thẻ <Select/> cũng cần phải có giá trị value nữa -> để khi mà ở ngoài truyền vào thì chúng ta cần phải show ra -> Nếu có giá trị ở ngoài thì chúng ta cần phải ưu tiên giá trị ở ngoài | còn không thì sẽ lấy giá trị localState
        -> Chúng ta vẫn ưu tiên giá trị bên ngoài truyền vào
      -> Một đều phải nhớ là khi dùng onChange thì chúng ta phải truyền value nó vào, value thì chúng ta ưu tiên từ bên ngoài truyền vào -> Ưu tiên giá trị bên ngoài truyền vào sau đó lấy giá trị từ localState

    + Thì component DateSelect phải dùng Controller để quản lí nó rồi => Tại vì thằng register không hỗ trợ cho React-Select cũng như là các component Select custom nên vì thế chúng ta phải sử dụng Controller để bao bọc bên ngoài component DateSelect này
    *****************************************
        -> Thì cái onChange ở thằng dateSelect - bình thường field.onChange thì onChange truyền vào cái event(Ngoài cái event ra thì khi truyền value vào thì nó vẫn hiểu vì bình thường cái event là object event) nhưng mà ở đây component DateSelect nó không xuất ra cái event nó chỉ xuất ra cái value -> Chúng ta vẫn có thể truyền cái value vào được -> Đây là một cái hay của thằng RHF nó giúp chúng ta linh động xử lý - nó giúp chúng ta handle cái việc đấy luôn
        -> Do cái DateSelect của chúng ta là component bình thường không thể truyền vào một cái Ref -> Nhưng mà {...field} nó bao gồm cả thằng Ref trong đó
        -> Hoặc là chuyển DateSelect thành 1 cái component ReactForwardRef -> thì lúc này DateSelect nó mới nhận vào 1 cái Ref

    + Chúng ta vừa thấy hiện tượng là khi chúng ta chọn năm hoặc ngày hoặc tháng thì trường còn lại nó tự động reset() lại giá trị khởi tạo -> Coi lại component DateSelect và tiến hành Debug bằng extendtions `Component` trên google
        -> Ban đầu khi mà chưa chọn ngày tháng thì khi change `năm sinh` thì nó sẽ thay đổi cái `Ngày Sinh` và `Năm Sinh` khi mà thay đổi `Ngày Sinh` và `Tháng Sinh` rồi khi change cái `Năm Sinh` lại thì nó không còn change 2 thằng `Ngày Sinh` và `Năm Sinh` nữa

> 212 Fix lỗi component DateSelect và thực hiện cập nhật profile

    + Fix lỗi Component DateSelect và thực hiện chức năng cập nhật profile -> Khi mà change cái date thì ngày Sinh và tháng Sinh sẽ bị thay đổi và ngược lại -> Chúng ta sẽ tiến hành fix cái lỗi này
    + Cái value của thằng DateSelect(props truyền vào là value có sự thay đổi) -> Ban đầu khi mà component Profile render lần đầu tiên -> nó sẽ lấy cái date_of_birth của giá new Date() trả về - Khi mà getProfile nó chưa gọi về thành công -> Xong rồi nó sẽ truyền vào cho thằng DateSelect -> và value sẽ lấy là Date(1, 1, 1990) -> Và sau đó Api getProfile nó thực hiện xong nó cập nhật lại cái formValue -> Và lúc này cái valueDate của chúng ta nó cũng được cập nhật
      -> Value của thằng date_of_birth nó được cập nhật (từ 1/01/1990 thành 28/05/2000) , nhưng mà thằng DateSelect nó không được cập nhật -> nó chỉ chạy 1 lần duy nhất khi mà chúng ta khởi tạo component -> Nên dùng cho cái value thay đổi đi chăng nữa thì cái thằng state `date` của DateSelect nó cũng không thay đổi
      -> Do khi thay đổi thằng Năm Sinh mà cái value từ Profile truyền xuống không nhận được nên là khi change Năm Sinh thì 2 thằng Ngày Sinh và Tháng Sinh nó sẽ lấy giá trị của localState trong DateSelect
          ->  // Khi mà change cái năm sinh thì nó sẽ reset lại 2 cái thằng ngày sinh và tháng sinh, Do {...date} giá trị nó lấy là giá trị khởi tạo -> Không thay đổi khi mà getProfile thành công nên là nó sẽ lấy giá trị khởi tạo

    -> Do nguyên nhân là như thế nên chúng ta có thể dễ dàng fix được -> thay vì lấy cái `date` từ trong cái state ra nó khống có đồng bộ
        -> Nên chỗ này thay vì khai báo {...date}, chúng ta sẽ khai báo từ từ ra -> và lấy giá trị từ value
              date: value?.getDate() || date.date,
              month: value?.getMonth() || date.month,
              year: value?.getFullYear() || date.year,
            -> Ban đầu nếu mà User chưa cập nhật date_of_birth thì nó sẽ lấy giá trị mặc định

> 213 Thực hiện chức năng upload ảnh

> 214 Validate khi upload ảnh

> 215 Active NavLink cho UserSideNav và tách component InputFile

> 216 Cách dùng useFormContext trong React Hook Form

> 217 Code logic đổi mật khẩu

> 218 Code chức năng đơn mua

> Video 152

    + Tạo folder layouts chứa những layout của chúng ta, folder pages chứa những trang của chúng ta

> Video 153

    + Code UI cho trang register , sử dụng tailwindcss để UI
        + Tailwindcss là mobile first, nên là sẽ code mobile trước rồi desktop sau

> video 155 validate Register form với React-hook-form

    +/**

register sẽ return về một object như này { onChange: ChangeHandler;
onBlur: ChangeHandler;
ref: RefCallBack;
name: TFieldName;
min?: string | number;
max?: string | number;
maxLength?: number;
minLength?: number;
pattern?: string;
required?: boolean;
disabled?: boolean;
}
\*/

    + Validate lên client để chúng ta giảm thiểu tải lên server, Nếu mà email bắt buộc nhập thì truyền vào cái function register, nhận vào tham số thứ 2 là một cái object {}, do cái form chưa đúng nên cái function nó không chạy,
    + Khi nào cái function register re-render lại thì cái errors của chúng ta nó sẽ log ra(khi nhấn submit thì nó sẽ re-render)
    + Làm sao để chúng ta biết [register] nhận vào những cái rules gì thì chúng ta lên docs của nó đọc

    + Chúng ta đã hiểu được xử lý lỗi trong react hook form rồi bây giờ chúng ta sẽ xử lý một cách chuyên nghiệp hơn

    + Những cái rules chúng ta validate nó nhiều dẫn đến nó hơi rườm rà và chúng ta không có kế thừa nó được -> recommend nên tạo một file riêng

    + rules.email là truyền kiểu option của {...register} nên khai báo kiểu cho nó để nó chặc chẽ hơn trong việc khai báo biến -> options trong register nó có type là RegisterOptions

    + Ban đầu khi chưa nhấn đăng ký thì clg(errors) nó không có log ra nhưng mỗi lần mà nhấn đăng ký component Register sẽ re-render, và sao đó khi mà nhập liệu vào ô <Input /> change cái (error validate) thì clg(errors) nó lại re-render -> thì đây là behaviors của react-hook-form -> `behavior`(hành vi) nó re-render theo cái cơ chế là nó cảm thấy tối ưu nhất cho cái UX người dùng -> để khi mà implement ko cần phải suy nghĩ nhiều(khi nào nên re-render khi nào không)

    +// func handleSubmit nó sẽ không chạy khi mà cái formState chúng ta không đúng

      const onSubmit = handleSubmit(
      (data) => {
      // handleSubmit return về một callback là onValid khi mà Submit không có lỗi
      // console.log(data)
      },
      (data) => {
      const password = getValues('password') // getValues được lấy khi mà onSubmit cái formState
      console.log(password)
      }
      )
      // console.log({ errors })
      // const email = watch('password') nếu không nhận vào giá trị thì nó sẽ watch cả form

> video 156

    + Những type password nên có autocomplete attribute để cho nó tốt về mặt UX
    + Muốn lấy được thằng password đối chiếu thì mở docs phần APi(useForm) và đọc method watch(method này lắng nghe input change và re-render lại component của chúng ta), khi gõ trên email và password thì component ko re-render

    + Khi mà chỉ có watch mỗi cái email thì chỉ có email là re-render, nên sẽ dùng method watch để lấy ra value là password, dùng watch thì mỗi lần chúng ta lắng nghe cái input nó change thì mỗi lần nó change thì component lại re-render làm cho chúng ta không thích -> không recommend cách này, lỡ đâu nó không tốt về mặt performance -> bây giờ nó cung cấp cho chúng ta một method là getValues(method này dùng không làm cho component re-render) -> getValues này get dựa vào sự kiện nào đấy

    + method handleSubmit() -> nhận vào 2 tham số (onValid, onInvalid) -> onValid sẽ chạy khi mà cài formState chúng ta đúng(không có lỗi validate trả về) -> onInvalid (chạy khi formData có lỗi) trong handleSubmit có cũng được không có cũng được -> khi mà formData chúng ta không đúng nhưng ta vẫn có thể làm cho onInvalid chạy được
    + -> khi lấy ra được giá trị password thì chúng ta tìm hiểu xem có cách nào chúng ta validate với confirm_password -> có thể đùng validate(method | object) của register method đẻ custom lại -> truyền vào func so sánh cái value hiện tại (truyền vào func validate cho thằng confirm_password) ->(positive method (v(value của thằng đang validate) => parseInt(v) > 0 || 'string lỗi')  return về true(không dính vào cái lỗi) || string(còn không return về lỗi cho chúng ta)).

    + logic code {
                      if (value === getValues('password')) {
                        return true
                      }
                      return 'Nhập lại password không khớp'
                    }
    + Nhưng vẫn chưa hài lòng lắm khi mà truyền ko quy định nó hết vào ở mục rules.ts
    + getValues thì mình phải truyền sao mà getValues ngta ko truyền vẫn dùng được mà truyền vẫn dùng được(dùng ?:)

> 158 Custom class container bằng cách tạo

    + Recommend config lỗi trong tailwind.config

> 159 Tạo component input để rút gọn code

    + <div className='mt-2'>
                <input
                  type='password'
                  className='w-full rounded-sm border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500'
                  placeholder='Password'
                  autoComplete='on'
                  {...register('password', rules.password)} // cái giá trị thứ 2 của options là đưa về những cái RegisterOptions để validate cái form (như string() max() min() ,...)
                />
                {/* cho m-height để khi mà không có lỗi thì nó vẫn chiếm được vị trí ở đó */}
                <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errors.password?.message}</div>
              </div>
              <div className='mt-2'>
                <input
                  type='password'
                  className='w-full rounded-sm border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500'
                  placeholder='Confirm Password'
                  autoComplete='on'
                  {...register('confirm_password', {
                    ...rules.confirm_password
                  })}
                />
                <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{errors.confirm_password?.message}</div>
              </div>

> 160 sử dụng Yup để validation cho react-hook-form, học thì nên chủ động -> đọc thêm các nguồn tài liệu

    + Hướng dẫn có thể không cần tạo FormData interface mà có thể kế thừa nó từ Yup, tức là yup chúng ta khai báo kiểu như nào thì chúng ta có thể xuất ra kiểu interface cho kiểu đó luôn
    + Trong yup có schema là oneOf([]) -> có nghĩa là sẽ là một trong những giá trị này để đối chiếu với password có đúng hay không thì cú pháp sẽ là oneOf([yup.ref('password')]) -> sẽ tham chiếu đến giá trị của password
    + Thằng yup có cung cấp cho chúng ta 2 method là Omit và Fixed khi mà chỉ muốn lấy 2 3 giá trị trong schema tổng thôi

    + // const rules = getRules(getValues) // Do có sử dụng yup rồi nên chúng ta sẽ không dùng rules

> 161 setup Axios và react-query

> 162 Khai báo interface thực hiện gọi api với register

    + chứa interface hoặc là những cái type liên quan đến việc login, register cái kết quả trả về liên quan đến phần authenticate thì sẽ chứa trong này
    + trong utils.ts sẽ chứa những  interface hoặc là type tiện ích
    + Khi mà register thì nó sẽ trả về cho chúng ta một cái 'access_token' , 'expires' và object 'User'
    + Api trả về nhiều nhưng mà chúng ta không dùng thì có thể xóa
    + UserResponse sẽ trả về khi mà lấy thông tin người dùng ->

    + Sẽ gọi registerAccount khi mà onSubmit không còn lỗi nữa

        // func handleSubmit nó sẽ không chạy khi mà cái formState chúng ta không đúng
        const onSubmit = handleSubmit(
        (data) => {
        // handleSubmit return về một callback là onValid khi mà Submit không có lỗi
        // console.log(data)
        },
        (data) => {
        const password = getValues('password') // getValues được lấy khi mà onSubmit cái formState
        console.log(password)
        }
        )
        // console.log({ errors })
        // const email = watch('password') nếu không nhận vào giá trị thì nó sẽ watch cả form

        // {
        //   email: string
        //   password: string
        //   confirm_password: string // đối với những form submit lên data thì nó sẽ dùng tên biến có dấu (_) để tiện gửi lên sv
        // }

    + Do serve chúng ta chỉ nhận vào 2 tham số nên có truyền 10 tham số lên thì nó vẫn chỉ nhận 2 tham số => nhưng để cho nó tối ưu hơn thì chúng ta sẽ làm chuẩn hơn

    + Hàm handleSubmit trong useForm thì nó sẽ trả về data nếu (data) -> là những giá trị trong form khi mà chúng ta truyền vào(nếu không có lỗi validate từ client)

    +// sử dụng thư viện Omit để bỏ confirm_password

    + onSuccess() tham số đầu tiên trả về là data khi mà gọi Api thành công, tham số thứ 2 là biến định danh của api đó

    + Trong method còn có trả về một mutateOptions đó là onSuccess, onError, onSettled(giải quyết)

> 163 xử lý lỗi 422 từ server trả về

    + Type predicate để handle lỗi từ form trả về
    + Khi mà đăng kí với một email đã tồn tại thì cần show lỗi lên để handle lỗi(lỗi 422 xảy ra với form)
    + Nếu như nó nhảy vào AxiosError và status là 422 thì show cái lỗi ra -> thì show lỗi lên bằng cách dùng `setError` do thằng react-hook-form cung cấp -> khi mà chúng ta lấy được ra lỗi thì chúng ta sẽ setError vào RHF và show ra lỗi đó
    + Những lỗi liên quan đến form status bằng 422 thì mới cho nó show lên còn những lỗi không liên quan đến form thì cho nó toast lên màn hình

    + // Tạo 1 cái utils kiểm tra lỗi xem có phải liên quan đến form hay không -> kiểm tra xem lỗi có phải liên quan đến axiosError hay không -> Nếu lỗi liên quan đến axiosError thì error sẽ có lỗi là AxiosError
    + Ban đầu error có kiểu là unknown khi mà đúng là do axios gây ra lỗi thì nó sẽ có kiểu là AxiosError -> do mình muốn khi là lỗi của axiosError thì mình sẽ đưa nó type chung là AxiosError
    + và check thêm 1 cái function nữa là có phải là lỗi 422 hay không -> isAxios

    + isAxiosUnprocessableEtityError<responseType> -> truyền vào kiểu trả về của data lỗi -> có kiểu {data: {email: 'email đã tồn tại'}, message: 'lỗi'}

    +++ setError(của RHF) thì tham số thứ 2 là một errorOption(errorOption là một object) chứa message và type(nó sẽ gợi ý chúng ta một số kiểu type mặc định RHF) nhưng mà type này là do server trả về nên ko lấy type của RHF được

    +++ Nếu trong thực tế có cả chục trường thì không thể nào clean code được hết nếu cứ (if - if - if - if ... liên tục nhiều trường) -> nên trong trường hợp này sẽ dừng vòng lặp -> Object.keys(formError)(lấy ra tất cả các key trong object và chuyển vào thành từng phần tử trong mảng và dùng forEach để lặp).forEach
      ++ Để lấy ra những cái key không phải lấy ra object thì: key as keyof Omit<FormData, 'confirm_password'>

> 164 Xử lý lỗi message đơn thuần với Axios interceptor

    + Xử lý lỗi đơn thuần từ server trả với việc cấu hình axios interceptor -> dùng interceptor.response để xử lý các lỗi trả về
    + Bình thường chúng ta mong muốn data trả về là object nhưng mà khi xử lý lỗi với đường dẫn thì nó trả về cho chúng ta cái data là một mã HTML thì chúng ta không mong muốn điều đó -> mong muốn trả về { "message": "Lỗi do abcxyz" }, đôi lúc server bị lỗi trả về data không có mesasge thì chúng ta cũng handle cái đó luôn

> 165 Xử lý logic trang login

    + Đôi khi là lỗi thì chúng ta phải biết handle lỗi -> ở dây do chúng ta lấy cái schema(có confirm_password) nên nó báo là cần phải truyền vào một confirm_password -> fix là bỏ cái field đó ra khỏi schema của loginAcocunt

> 166 Code UI header thuộc MainLayout

    + Sau khi đăng nhập xong thì server sẽ trả về cho chúng ta một cái access_token -> tiến hành lưu access_token vào localStorage -> redirect sang trang chủ cho người dùng

> 167 Dùng floating UI và framer motion để tạo popover

    + Animation nên dùng thư viện Frammer motion để handle cho dễ
    + Khi mà Z-index bị chồng chéo thì thằng popover có thể bị ẩn dưới những item khác do cái z-index
    + Nên để popover ở thằng root hoặc là ở dưới thẻ <body></body> càng tốt để nó có thể đè lên trên hết như thế thì nó mới chuẩn được -> nó sẽ hiển thị ngang cấp với thằng có id="main"
    + phải tự tính chính xác làm sao để nó hiển thị dưới ngay cái thẻ tên User một cách chính xác(postion: top, right, left) -> sử dụng thư viện để tính toán cho nó -> sử dụng thư viện React Popper (V2 thư viện cũ), Floating UI(thư viện mới)-> nhiệm vụ của Floating UI là tính chính xác position để hiển thị tooltip, popover (có thằng shift() tự động tính cho chúng ta luôn)

    + Những thư viện code UI low level -> floating UI(căn chỉnh position), headless UI, framer motion, heroicons(icon)

    + flex-shrink-0 để cho nó không bị co lại
    + items-end nó cũng ăn vào grid và ăn vào với flex-direction là columns

> 168 Tạo component Popover

    + Framer motion(handle animation),Popover(handle việc position cho element)
    + Mình muốn là cho cái tooltip hiển thị luôn ở bên trong thẻ root hoặc là dưới thẻ <body>
    + Đừng đặt điều kiện bên ngoài FloatingPortal và để nó bao quanh tooltips
    + thằng floatingUI gọi {arrow} là middleware-> tạo middleware rồi thì dưa nó vào ref={} của một thẻ

    + middlewareShift giúp chúng ta show popover đúng không để bị lố qua
    + Nếu chúng ta thấy cái arrow nó đâm qua chữ Tiếng Việt quá thì có thể dùng offset
    + Về animation thì chúng ta thấy nó phóng to thu nhỏ tại vị trí arrow -> chủ yếu dùng opacity và scale và chúng ta sẽ tìm vị trí mà chúng ta muốn phóng to thu nhỏ thì chúng ta sẽ set cái transform/origin tại vị trí đấy là được
    +  dùng <AnimatePresence></AnimatePresence> bao bọc lấy câu lệnh điều kiện của popover

    + Gặp vấn đề bug nữa là khi mà đưa con chuột ra khỏi thẻ div thì cái popover nó sẽ tắt ngay và mình không muốn điều đó -> nên để thẻ FloatingPortal thì khi đưa con chuột ra ngoài thì nó sẽ tắt ngay(thì chúng ta không muốn điều này)

    + TransformOrigin: thì để biết dược vị trí mũi tên thì nó chính là middlewareArrow?.x -> thì nó là vị trí mà khi mũi tên thu lại thì nó sẽ vào đó

    + nên tạo 1 component dùng riêng cho các thằng đó
    + Nên tạo 1 component riêng để dễ cho việc tái sử dụng -> component
    + truyền vào popover từ children
    + renderPopover bên trong Popover thì {'tài khoản của tôi' , 'Đơn mua'} là những thẻ link còn {button-'Đăng xuất'} không phải là thẻ link
    + Chúng ta muốn mỗi popover sẽ có 1 id riêng thì phải truyền vào id cho nó -> sử dụng useId mỗi lần ID chạy ra thì nó sẽ gán cho chúng ta một cái id mới -> Mỗi lần popover nó chạy thì nó sẽ render ra 1 cai id mới ->
    + khi mà padding nhiều mà cỡ chữ không co thì nó sẽ làm cái block chứa chữ nó to lên

    + Nếu như người ta muốn  popover là một thẻ span thì ta có thể custom được cho người dùng -> ElementType của React, phải dùng tên chữ cái đầu viết hoa thì mới thay thế được cái thẻ mà custom được -> tăng tính custom người dùng

    -> Video đã handle được việc tách riêng ra một cái popover để tái sử dụng

> 169 Code UI cho popover cart

    + Container là 400px, padding-left là pl-2

    + title cho nó flex-grow để cho nó phình to ra, flex-shrink-0 để cho nó đừng có co lại
    + tailwind nó có 1 class là truncate để ẩn đoạn text đi khi mà nó quá là dài

    + Popover căn về phía bên phải và tránh tình trạng tràn ra khỏi container -> sử dụng placement -> muốn nó nằm ở phía dưới và ở cuối cùng thì là 'bottom-end'

    + Shift() giúp chúng ta tính toán những cái popover đúng ko để bị lố màn hình -> và nó sẽ tự chuyển placement khi mà popover bị lố ra khỏi màn hình

> 170 Setup Protected Route và Rejected Route trong React Router

    + Thực hiện chức năng bảo vệ Route khi mà người dùng chưa đăng nhập vào thì không cho người dùng vào các đường dẫn Route chúng ta đã set(cài đặt cho trang web)
    + Sử dụng cơ chế Outlet để thực hiện chức năng này -> tương tự như là chilren -> những component được khai báo bên trong thằng cha thì sẽ được hiển thị ra

    + ProtectedRoute -> // đã login rồi thì cho tiếp tục đi vào còn chưa login thì đá qua trang khác
    + RejectedRoute -> khi mà người dùng đã login rồi thì sẽ không cho người dùng vào lại trang login -> nếu mà người dùng vẫn cố truy cập vào trang login thì chúng ta sẽ navigate người dùng qua trang khác


    + 2 trang login và register route thì khi mà người dùng login rồi thì chúng ta sẽ không cho người dùng vào nữa -> thì khi mà đã đang nhập rồi thì không thể vào lại login và register -> thì để mà vào được 2 ông con thì phải vào qua ông cha trước

    + Khi mà đã đăng nhập rồi thì sử dụng -> RejectedRoute cho 2 trang /login và /register, khi mà chưa đăng nhập thì bảo vệ các trang như /productList, /profile(bắt buộc user phải đăng nhập rồi thì mới vào được)

    + Để thằng react Router nhận điện được thằng nào là thằng chính thì chó nó 1 cái thuộc tính là -> index: true -> cần phải set thuộc tính này cho thằng route chính của chúng ta. -> thì lúc đó những thằng nào nhận trị trong value thì nó sẽ nhận ra là Context vừa truyền giá trị mới và nó sẽ re-render lại -> Khi mà được bao bọc bởi React.memo nhưng mà nó vẫn re-render vì cái context của nó thay đổi -> Sử dụng useMemo(() => {
      return {theme, onChangeTheme}
    },[]) , Nhưng mà khi mà component chúng ta re-render thì cái onChangeTheme nó cũng được báo là một function mới thì cái valueText(của contextApi cũng là giá trị mới) thì nó sẽ làm những thằng con sử dụng valueText re-render lại

> 171 Hoàn Thiện authentication module, trick hay giúp tăng tốc độ truy xuất bộ nhớ

    + Hoàn thiện chức năng của authentication -> muốn quản lí được authentication thì phải quản lí được access_token --> lưu access_token vào trong localStorage, cùng với đó nên có một stateGlobal là `isAuthenticated` để quản lí việc đăng nhập, đăng xuất(để biết được là cái app chúng ta đã login thay là chưa) -> tạo biến global để dễ setState mỗi khi login/logout(từ profile khi logout nó sẽ navigate về productList) -> dùng contextAPi có thể share các state với nhau
    + Không được gì thì mà ,

    + 1 cách để cải thiện performance khi mà dùng contextAPi là không nên truyền vào thuộc tính value trong <Provider></Provider> một cái object bởi vì khi mà conponent re-render thì nó sẽ tạo ra một object instance mới

    + Tạo 1 folder chứa các biến context trong quá trình code có thể có nhiều context khác nhau được chứa trong folder Context

    + isAuthenticate ban đầu sẽ cho nó lấy ra từ localStorage -> khi mà localStorage có access_token thì cho nó là {true} còn không thì nó là {false} -> sẽ khai báo 1 file trong folder utils để lưu access_token => những method lấy access_token trong localStorage thường xuyên dùng nên sẽ khai báo nó trong một file riêng

    + Xử lý việc khi mà login vào handle localStorage như nào, thì ở đấy sẽ xử lý ở tầng axios -> Lưu access_token vào localStorage và dùng cái này gửi lên cái header với những cái roles nào cần cái Authenticated -> Để lưu vào localStorage và xử lý những vấn đề đấy thì dùng interceptor

    + Sẽ check accessToken bên trong interceptor.response xem đã có chưa, sao đó sẽ gán access_token === response.data.data.access_token(ở đây thì thằng res.data.data) nên ở đây mình sẽ ép kiểu cho no là res.data: AuthResponse
    + Nên change cái ResponseApi thành 2 thằng -> ErrorResponse, SuccessResponse

    + Xử lý interceptor với request với những cái api mà nó cần cái access_token để có thể truy cập vào
    + Gửi cái key authorizaion lên với cái access_token, key authorization là key mà server yêu cầu chúng ta gửi lên headers

    + Lưu access_token(trong class) là nó lưu trên RAM nên việc lấy access_token nó sẽ nhanh hơn là lấy access_token trong localStorage(ổ cứng), đọc dữ liệu trên RAM lúc nào cũng nhanh hơn trên ổ cứng cả

    + Nếu chung ta đang ở trang productList mà logout thành công thì vẫn cho nó ở trang productList, còn khi mà đang ở profile logout thành công thì sẽ cho nó nhảy qua lại trang login

> 172 Ngăn chặn người dùng spam submit button

    + Ngăn chặn người dùng spam
    + Nếu mà người dùng cứ nhấn đăng nhập liên tục thì nó sẽ gọi APi /login liên tục, điều này không thề tốt chút nào về mặt UX -> Check nếu mà là -> sẽ thấy là trang đăng ký/ đăng nhập nó có cũng button riêng nên sẽ xử lý chung cho nó
    + Muốn cái button nhận vào các thuộc tính của thẻ <button></button> thì truyền vào -> cách đơn giản nhất là cho nó kế thừa ButtonHTMLAttributes<HTMLButtonElement>(truyền vào cho nó 1 generic type nữa là được)

    + Khi mà disable button thì chúng ta sẽ cho button của chúng ta là className là cursor-not-allowed

> 173 Cải thiện path và xử lý profile user sau khi người dùng login/register

    + Cải thiện profile user sau khi login/register
    + Gom các pathName Route vào một file cho dễ xử lý

    + Handle việc render ra email khi mà login thành công -> lưu username vào localStorage

    + Profile: thì khi chúng ta đăng nhập rồi thì lấy cái gì set lại giá trị profile cho nó(vừa chạy App thì nó lấy từ LS mà lấy giá trị null) -> nên chỗ này sẽ cho nó một giá trị là setProfile để set lại profile khi mà đã đăng nhập thành công

> > > > > > > > > > > > > > > > > > > > > > Chương 19 Clone shopee trang danh sách sản phẩm

> 174 Code UI AsideFilter

    + Code UI cho trang AsideFilter thôi
    + Nhận thấy là asideProductList chỉ sử dụng cho trang ProductList thôi nên là sẽ tạo phần này bên trong page productList luôn -> nên là quản lí như vậy luôn cho dễ -> Chỉ khi nào mà component dùng chung cho cả trang web thì hãy nên tạo ở bên trong folder component ->

    + Sửa lại component Input để dễ dầng tái sử dụng ở các page khác

> 175 Code UI cho SortProductList component

    + flex-wrap dùng để khi mà tăng chiều rỗng của trình duyệt thì các item nằm trong container sẽ không bị nhảy khỏi hàng
    + flex-box thì nó vẫn có thuộc tính wrap nên vẫn có thể dùng được

    + Nên tự code lại mấy cái giao diện như này cho nó nhuần nhuyễn thôi, phải tăng tốc thôi không còn thời gian để ngồi làm việc riêng rồi

> 176 Code UI Product Component

    + Code UI cho product component
    + Sử dụng padding-top:100% và position để có được tấm ảnh chiều dài và chiều rộng bằng nhau(hình vuông) -> nên sử dụng cách này thay vì sử dụng thẻ /img 1 cách thông thường

    + nên min-h-2rem để khi mà có sản phẩm text ngắn thì nó không bị thụt cái thẻ chứa sản phẩm lên

    + Sửa cái selecte.Option từ value => defaultValue(khi mà không có onChange) -> sao này có onChange thì không cần nữa

> 177 Khai báo interface và Api cho product

    + Khai báo interface cho product và khai báo APi cho product, axios có thể truyền param vào
    + Cái params sẽ có kiểu dữ liệu là productList config

    + Products trong queryKey dựa vào config nên chúng ta sẽ truyền thêm vào cho nó 1 cái queryConfig, chúng ta sẽ lấy những cái config này ở đây để chúng ta truyền vào queryKey(useQuery) của chúng ta -> chúng ta sẽ lấy những cái này ở trên thành URL -> dùng useSearchQuery hoặc là query-string để lấy.

    + Ví dụ khi mà nhấn  chuyển sang categories khác hoặc là nhấn vào sortProduct thì chỉ cần thay đổi đường dẫn URL, thằng productList nó sẽ lắng nghe được sự t hay đổi trên URL-> cái queryParams thay đổi -> làm cho cái useQuery() gọi lại và chúng ta sẽ có được data mới

    + Tạo 1 cái hook useSearchQuery để lấy ra params trên thanh URL,
    + Phải truyền queryParams vào queryKey để khi mà queryParams nó thay đổi thì cái useQuery() sẽ chạy lại và trả về data mới -> cập nhật lại data và render lại giao diện

    +  Thêm 2 const của sort_by và order trong ProductListConfig để thuận tiện cho việc xử lý tránh trường hợp gõ sai

> 178 Hiển thị product và format number với Intl

    + Sẽ thực hiện render ra giao diện với danh sách sản phẩm
    + Sửa tên type Product để tránh trường hợp trùng với component Product
    + Giá sản phẩm nó sẽ convert theo hàng ngàn và chúng ta sẽ tạo function để convert nó sau
    + social number styles -> có kiểu k-> ngàn, b-> tỉ , t-> ngàn tỉ, m-> triệu => dùng regex để format cái number, hoặc có thể dùng phương thức là toLocaleString() để nó format chữ số cho chúng ta, hoặc có thể dùng Intl.NumberFormat

    + Format giá tiền của sản phẩm sẽ là
        - new Intl.NumberFormat('de-DE').format('giá tiền') -> ví dụ điền vào 16000 -> 16.000 (Kiểu của Đức nó sẽ chuẩn với kiểu chúng ta cần dùng)
    + Format số lượt bán được là
        - new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 2}).format('giá trị').replace('.',',') -> ví dụ 4500 -> 4,5k(chúng ta quy định maximumFractionDigist là 2 chữ số thập phân trả về)

> 179

    + Code render ra 5 ngôi sao đánh giá chất lượng sản phẩm của app, trong vòng lặp thì nó không cho viết chú thích vào đó

    + Có 1 cái thuật toán nhẹ chỗ này
        + Nếu rating là 3.4 thì thuật toán ở đây sẽ là
            - 1(ngôi sao đầu tiên - số thứ tự) <= 3.4 => 100% width
            - 2 <= 3.4 => 100% width
            - 3 <= 3.4 => 100 width
            - 4 > 3.4 => 40% (4 - 3.4 < 1) -> số thứ tự phải lớn hơn rating và stt - rating < 1
            - 5 > 3.4 => 0% (5 - 3.4 > 1)

    + Tạo 1 func handle width rating(params là order -> số thứ tự: number) -> thì dùng Math.floor(để làm tròn xuống) -> return rating - Math.floor(rating)

> 180

    + Phân tích thuật toán và code chức năng phân trang

    + Cai pagination không đơn thuần chỉ là việc có bao nhiêu cái page thì mình sẽ render bấy nhiêu cái button(không lẻ 100 page thì chúng ta sẽ render ra 100 button) -> không như thế thì không tốt cho lắm, cái button của chúng ta sẽ thông minh hơn một tí

    + Thì chúng ta sẽ tìm hiểu kiểu pagination đang rất phổ biến hiện nay như sau

        + Với range = 2 sẽ áp dụng cho khoảng cách đầu, cuối và xung quang current_page

                [1] 2 3 ...... 19 20 -> range là 2 kể từ thằng số 4 trở đi thì sẽ show là dấu 3 chấm
                 1 [2]3 4 .... 19 20
                 1  2[3]4 5 ...19 20
                 1  2 3[4]5 6....19 20
                 1  2 3 4[5]6 7...19 20 -> range 2 kể từ thằng page  đầu cuối
                 .............................
                1 2 18 19 [20]
            -> Thì đây là cách phân trang đang được sử dụng phổ biến hiện nay -> học lẹ thôi không còn thời gian nữa rồi -> Cách này để người dùng biết là trang của chúng ta có bao nhiêu cái page -> Thì kiểu phân page như này nó khá là hông minh cho các trang web hiện nay

    + Bắt đầu tạo một cái component để code thuật toán phân trang thôi
    + Khi mà chuyển trang thì nhấn vào cái đường link thay đổi URL thì khi mà thay đổi URL thì cái queryParams nó sẽ thay đổi làm gọi lại useQuery và render lại UI cho người dùng -> Nhưng mà trước tiên dùng cái button để check cái thuật toán trước đã sau đó thay đổi sang thẻ <Link> sau

    + Thì cái pagination có rất nhiều logic nên sẽ tạo 1 function riêng để tiện xử lý logic hơn là xử lý ở trong jsx

    + Sẽ chia ra làm 3 trường hợp:
        + Trường hợp đầu tiên dấu 3 chấm (...) ở phía sau current_page
        + Trường hợp thứ hai dấu 3 chấm ở trước và sau luôn current_page
        + Trường hợp thứ 3 dấu 3 chấm ở phía trước current_page

      -> Chia ra làm 3 trường hợp và code dần từng trường hợp mà thôi

    - page ở đây chính là cái current_page của chúng ta

        + Code trường hợp 1: page <= RANGE * 2 + 1(current_page <= 5 là thỏa mãn trường hợp 1) && pageNumber > page + RANGE(ví dụ 7 > page(4) + 2) thì hiện dấu 3 chấm && pageNumber < pageSize - RANGE - 1 -> (đã clear)
            - bởi vì dấu 3 chấm chúng ta chỉ show có 1 lần, nên chúng ta sẽ kiểm tra
            - Chúng ta sẽ check isActive pagination

        - Tạo ra 2 hàm render

> 181 Code phân trang productList và đồng bộ hóa URL

    + Apply cái logic chuyển trang vào pagination, hiện tại trang productList quản lí những cái trạng thái về cái filter thông qua cái URl  chứ không phải quản lí thông qua state nằm trong React -> Bởi vì khi mà quản lí với URL thì cái URL nó filter ra các kiểu khi copy cái URL(có filter) đưa cho người khác sẽ có được cái filter hiện tại của bạn như thế thì nó sẽ rất là ok hơn là khi quản lí cái filter và page chỉ ở trang chúng ta mà cái filter nó không thay đổi thì khi người khác mở lên thì nó chả có cái filter gì cả -> làm vậy thì nó không tốt cho UX của User -> thì thế đây là lợi ích của việc đồng bộ hóa giữa cái việc đồng bộ state trên React với cái việc quản lí thông qua cái URl

    + Ở đây khi mà chúng ta vào một cái trang nó có URL(?page=1&) -> mình sẽ tạo ra 1 cái object(không phải lúc nào mình cũng lấy mỗi thứ trên cái queryParams), nếu mà nó có thêm những giá trị tầm bậy mà người dùng nhập vào thì chúng ta sẽ filter nó ra(sau /?page=1&value=12 -> những giá trị phía sau page= mình sẽ filter nó ra), lấy ra những giá trị mà chúng ta nghĩ chungta cần cho Api thôi -> Tạo ra cái biến để filter ra từ cái queryParams(filter những giá trị không cần thiết cho cái Api) -> Tạo ra biến queryConfig:

    + Chỉ gửi lên cái Api những cái cần thiết(queryConfig)

    + queryConfig as ProductListConfig chúng ta có thể ép kiểu chỗ này, nhưng mà cho nó chuẩn về mặt logic thì nên thêm type string
    + queryConfig thì nó có thể trả về undefined thì chúng ta ko muốn điều này nên chúng ta muốn lọc bớt những giá trị undefined -> Sử dụng thư viện Lodash để lọc bớt -> Sủ dụng 2 function trong thư viện Lodash đó là omitBy() và isUndefined()
          + omitBy() => loại bỏ bớt những thành phần nào mà nó thỏa mã cái điều kiện của chúng ta -> Loại bỏ những cái key nào mà cái value của nó là undefined(thì sử dụng isUndefined)
          + isUndefined() kiểm tra xem thuộc tính đó có phải là undefined hay không

          + Ở một vài trường hợp thì chúng ta sẽ tạo cái state và useEffect để mỗi lần URL thay đổi thì sẽ setState lại cái URL(nhưng việc đó nó không cần thiết)
              useEffect(() => {
                setQueryParams
              }, [queryParams])
            -> Thật sự không cần thiết phải tạo 1 cái state khi mà chúng ta có những cái giá trị phụ thuộc vào giá trị khác -> có thể suy ra từ giá trị khác không cần thiết phải tạo 1 cái state



    + Truyền luôn cả queryConfgi vào trong cái props là page là bởi vì khi mà chúng ta nhấn chuyển page không chỉ giá trị page thay đổi mà lỡ nếu có thêm 1 queryParams khác thì nó vẫn giữ cái queryParams đó mà chỉ thay đổi giá trị page(*ví dụ: /?page=1&sort_by=asc -> /page=2&sort_by=asc ) -> chúng ta sẽ truyền luôn cả queryConfig vào props page

    + Trong function render ra pagination sẽ lấy ra cái page -> và format cái proper page trong queryConfig thành lại là number, vì page trong queryConfig là string
    + Thẻ render ra dấu 3 chấm thì chúng ta sẽ chuyển nó thành thẻ <span></span>
    + trong thuộc tính to={} của thẻ Link nó có thuộc tính là pathname nhận vào 1 cái object -> pathname bắt đầu với url có dấu /, thuộc tính thứ 2 của thẻ Link là queryString, có thể dùng như thế này

          + {
             pathname: path.home,
             search: '?page=1&sort' -> search nó sẽ có dạng như thế này, nhưng mà cái queryConfig của chúng ta có là một cái object, thì chúng ta cần phải chuyển cái object thành cái đoạn string
          },
          + Thì thằng react-router-dom có hỗ trợ chúng ta cái method là createSearchParams({}) truyền vào cho method này một cái object, thì thằng createSearchParams nó nhận vào một string hoặc một record(có thể hiểu là một object có key: string value: string hoặc là string[])
          + Thì pageNumber type là number thì phải convert nó sang kiểu là string -> Dùng toString()
          + Thằng createSearchParams() khi mà nó return thì nó sẽ trả về URLSearchParams là một cái string thì, proper search(trong object {to} phải trả về cái string)

          + Để hoàn thiện hơn thì chúng ta sẽ handle phần Prev và phần Next button,
          + CreateSearchParams thì khi truyền vào thì nó sẽ nhận vào cái pathname xong rồi mới tạo ra các searchQuery (ví dụ như: /?page=1&sort_by=asc)
          + pathname trong đường dẫn to={} có tùy thuộc vào từng project không nhất thiết phải là pathname: path.home


    + Set trong useQuery khi mà chuyển trang sẽ giữ lại dữ liệu ban đầu sau khi chuyển trang thành công thì mới cập nhật lại data của trang mới(nó sẽ cập nhật lại chứ nó sẽ không set thành undefined rồi mới render lại data khác) nên sẽ đỡ giật hơn


    -> Qua video này chúng ta học được cách xử lý filter ở trong 1 cái page là chúng ta xử lý trên thanh URL của app -> Việc xử lý trên thanh URL để khi mà chúng ta đưa đường dẫn URL cho ng khác thì ng khác sẽ có được cái kết quả như kq mà chúng ta đang thấy
    -> Biết 1 cái cách mà để handle việc truyền cái search khi mà chúng ta navigate(không cần dùng thư viện gì bên ngoài chỉ cần dùng method có sẵn )

> 182 Code logic cho sortProductList component

    + handle phần filterSortProductList -> Thường sẽ ưu tiên thẻ <Link /> hơn là <Button></Button> gắn function navagite, mấy cái sortProductList như 'Phổ biến', 'Bán chạy' thường sử dụng button(gắn fn navigate vào để điều hướng URL nào đấy) là được
    + Còn những cái điều hướng qua trang sản phẩm thì thường dùng thẻ <Link /> -> dùng thẻ Link khi mà hover vào thì sẽ thấy được cái URL(có thẻ click chuột open link in new tab)
    + Còn dùng những cái button xử lý Navigate thì thường nó sẽ không có cái behavior đấy ->  thường button xử lý JS thường áp dụng với những cái filter sản phẩm -> ít khi handle mấy cái filter mà sử dụng thẻ <Link />

    + Phải handle việc isActive trước, chúng ta làm sao biết được cái buttot(sortProduct) đang được active -> thì chúng ta phải dựa vào cái sort từ queryConfig truyền vào -> mặc định sort_by api trả về là createAt
    + Nếu mà sort_by không có giá trị trên cái queryConfig(URL) thì mặc định chúng ta sẽ lấy là 'createAt'
    + Sẽ dùng cái function để check Active tiện thể check luôn button 'Mới Nhất' , 'Bán Chạy'
    + Params sortByValue của function isActiveSortBy thì sẽ có type là ProductConfig trừ ra giá trị undefined thì sẽ dùng như sau(Exclude<ProductConfig['sort/_by', undefined]>) 'Exclude' là method liên quan đến kiểu của bên typescript

    + Active khi mà sort_by(lấy từ queryConfig) === sortByValue(params truyền vào trong hàm isActiveBySort)

        + Phổ biến là sort_by.view,
        + Bán chạy là sold
        + Mới nhất createdAd

    +  Tiếp theo sẽ handle sự kiện khi mà chúng ta click vào cái <button></button>, khi mà click vào button thì chúng ta sẽ chuyển trang bằng javascript

        + Navigate có thể nhận được một cái object hoặc là một cái string


    + Nhưng mà chỗ sortProductList nó có một cái vấn đề
    + Value trong thẻ <Select></Select> sẽ lấy thằng 'order' trong queryConfig, thằng order mặc định sẽ là 'desc'
    + Ban đầu nếu mà không có order thì sẽ show option `Giá`
    + Viết 1 hàm onChange cho thẻ <Select></Select>, tạo hàm function riêng để xử lý onChange(), chúng ta sẽ không dùng lại cái hàm handleSortNavigate vì cái `Select` nó sẽ khác biệt một tí,
    + Khi mà click vào thẻ option có giá trị tương ứng với 'asc' và 'desc' thì nó sẽ làm render lại UI của productList
        + Nó sẽ bảo cái đối số chúng ta truyền vào là string nó sẽ không chi tiết bằng 'asc' và 'desc' nên chúng ta sẽ ép kiểu nó đi ép cho nó thành như này: (event.target.value as Exclude<ProductList['order'], undefined>) bởi vì chúng ta biết chắc kiểu gì nó cũng nằm trong 2 giá trị đó

    + Sẽ có một cái vấn đề nữa là khi mà sort theo 'asc' và 'Phổ biến' -> thì phải sort theo 'Phổ biến' nhất rồi mới tới ít 'Phổ biến' có nghĩa là cái order phải là 'desc' -> Có nghĩa là nó sẽ sắp xếp theo cái <button></button> được mình Active gần nhất (cái order nếu mà Active 'Phổ biến' hoặc là không truyền gì lên luôn, nếu có truyền thì phải truyền là 'desc')

    + Thì ở hàm handleSortNavigate() trong cái options search chúng ta loại bỏ ông `order` đi -> sử dụng omit() của thư viện Lodash -> loại bỏ order thì đưa [] truyền order vào _.omit({
      ...queryString,
      sort_by: sortByValue
    }, ['order']).toString()

> 183 Code logic filter theo category cho AsideFilter

    + Khai báo read Categories cho danh sách AsideProduct
    + Khai báo queryConfigProductList

        + CategoryId: Lọc sản phẩm theo Category -> Khai báo thêm trong queryConfigProductList

    + Read Categories -> Khai báo APi cho AsideProduct
    + Truyền Category vào AsideProduct -> có  2 cách để kiểm tra có phải undefined không để render ra
        + 1 là check nếu CategoriesData = true thì mới trả về dữ liệu cho Categories
        + 2 là check nếu CategoriesData là undefined thì chúng ta sẽ lấy cái array rỗng -> []

    + Thằng categoriesData cũng cần có queryConfig vì khi mà đang ở mục 'Bán chạy' mà chúng ta AsideProduct theo 'Điện thoại' thì nó sẽ filter theo cả danh mục 'Điện thoại và Bán chạy'

    + Handle active aside filter -> handle giống việc handle sortProductList
    + Cái danh mục 'Tất cả danh mục' mới vào khi mà chưa có queryParams thì chúng ta sẽ cho nó active

> 184 Code logic filter theo khoảng giá

    + Code chức năng filter theo khoảng giá
    + Không cần phải khai báo Placeholder(extend từ InputElementAttr) nữa có thể dùng ở ngoài kia rồi tự động Input vào cho chúng ta

    + Sẽ tạo 1 cái component InputNumber là component này chỉ nhập được number mà thôi còn chữ hay kí tự sẽ không được nhập vào
    + Component InputNumber do là sẽ custom onChange(handleChange) nên là sẽ không kế thừa từ thằng <Input /> là sẽ không kế thừa cái register này (vì kế thừa Input thì phải truyền register) nhưng component InputNumber khi mà gõ phải handle cái onChange nên là không thể truyền cái register vào
    + Sẽ giới thiệu chúng ta 1 cách dùng khác, 1 cái cách dùng sẽ handle với những cái component mà nó không nhận vào cái props là register, ví dụ sau này làm vieẹc với những cái component React MUI, React antd chẳng hạn thì mấy cái thằng đó nó đâu có nhận register props đâu, nó không nhận register thì chúng ta phải có cách để handle điều đó, còn cái component <Input /> handle bằng việc nhận register thì nó quá là đơn giản.

    + Sẽ custom lại thằng InputNumber
    + Nếu value là Number thì mình sẽ dùng Regex để mình kiểm tra, nếu nó là số hoặc là rỗng và có onChange truyền vào

    + Nó là một component nhưng mà không nhận vào register thì làm sao nó được quản lí bởi React hook form được -> Thì vẫn có cách quản lí(mấy cái thư viện UI như antd thẻ input không hỗ trợ register nhưng vẫn có cách sử dụng react-hook-form để quản lí ), ban đầu không truyền vào thì defaultValue có thể là undefined

    + Controller nó có một cái props là render nhận vào cái callBack, thì trong callBack của thằng render chúng ta có thể destruc để lấy ra thằng field

        + trong thằng field sẽ có là onChange, onBlur, value , name , ref
    + // Ở đây chúng ta xuất ra cái event thì onChange bên ngoài nhận vào cái event(value thì nhận vào cái value), onChange(event) nhận vào giá trị event trong đầy là đúng rồi

    + React Hook có thể quản lí được InputNumber của mình mặc cho cái InputNumber không hỗ trợ register -> sử dụng Controller trong RHF để quản lí những thư viện UI ko hỗ trợ register.
    + value={field.value} -> là RHF có thể quản lí được InputNumber component của mình
    + Nếu không set defaultValue thì ban đầu nó sẽ ra ọbject rỗng và 2 giá trị price_min và price_max sẽ là undefined -> kiểu vậy thì nó sẽ không hay cho lắm -> nên cho defaultValues vào cho nó chặt chẽ hơn
    + Khi mà nhập chữ không được thì cái component InputNumber của chúng ta đã có tác dụng(effect)

    + Tiếp theo sẽ handle Validate cái khoảng giá(thì nó sẽ hơi đặc biệt một tí xíu)

      - Rules Validate
          + Nếu có price_min và price_max thì price_max >= price_min
          + Còn không thì có price_min thì không có price_max và ngược lại(không có 1 trong 2 thằng)
          + Nếu mà nhập giá trị price_min và price_max không đúng thì nó sẽ báo lỗi

    + Để handle cái rules cho InputNumber thì chúng ta cũng sử dụng yup(mặc dầu là InputNumber nhưng sẽ truyền vào là string)
    + Sẽ dùng test() trong yup để custom lại validate của chúng ta
        test({
          + name: nó sẽ có một cái name() sẽ là một cái rules để test
          + message: 'Giá không phù hợp'
          + test: trong đây sẽ có một cái test(là 1 function) -> lấy ra value của thằng price_min/price_max
          + Chúng ta có thể lấy giá trị của thằng price_max trong func của price_min thông qua object cha của 2 thằng(lấy từ parent) với cú pháp như sau
            + const { price_max } = this.parent
        })
    + Nếu chúng ta return về true được trong cái function test() thì có nghĩa nó đã pass qua được cái validate của InputNumber, còn nếu return về false thì không pass qua được cái func test() thì nó sẽ báo lỗi

    + Khi mà dùng controller của ReactHookForm thì nên truyền cái ref vào để chúng ta có được những method nó khá là hay ví dụ như Focus()

    + Dùng forwardRef<HTMLInputElement> đầu tiên truyền vào kiểu ref, 2 là type của props, nếu dùng annonymouse fucntion thì thằng eslint nó sẽ báo lỗi
    + ref của thẻ input phải có forwardRef truyền vào thì chúng ta mới có thể dùng giá trị đó ở các components (<input ref={ref} />)
    + ShouldFocusError là hủy tự động focus vào lỗi khi có lỗi xảy ra -> behavior mặc định  của nó là focus nên chúng ta phải set lại cho nó thành false(shouldFocusError: false) mặc định nó là true và chỉ có hiệu nghiệm khi mà chúng ta truyền ref vào cho thẻ <input />
    + Mặc định khi dùng register trong RHF thì nó sẽ tự động generate ra cái ref cho chúng ta, còn khi mà chúng ta thẻ Input từ các thư viện UI thì chúng ta cần phải handle bằng cách sử dụng Controller và forwardRef(để tạo ref cho thẻ input đó)

    + Show lỗi lên InputNumber component -> sẽ chỉ show 1 lỗi duy nhất, chỉ show lỗi của price_min hoặc là price_max
    + Mặc đù nhập price_max nhưng price_min nó vẫn không reset lỗi -> đây là cơ chế của thằng RHF -> có nghĩa là khi onChange 1 cái input nào đấy thì nó chỉ validate cái Input đấy thôi(Input còn lại là price_min/price_max thì nó không validate), vd ban đầu khi mà onChang cái price_max thì nó chỉ validate thằng price_max mà thôi còn thằng price_min nó không validate -> đáng lẻ ra price_min cũng phải không còn lỗi -> chúng ta vẫn còn lỗi của thằng price_min đáng lẻ ra price_min nó không có lỗi thì mới đúng

    + Xử lý cái lỗi khi mà onChange price_max mà price_min vẫn không validate ->

      + Xử lý lỗi -> sử dụng trigger từ useForm sẽ làm cho form chúng ta validate lại

        + Nếu chúng ta trigger() nó sẽ validate hết tất cả các thằng trong cái form của chúng ta, còn nếu trigger('price_min') thì nó chỉ validate mỗi giá trị đó trong form của chúng ta
        + price_min thì chúng ta trigger đến thằng price_max và ngược lại

      + Chỗ này có thể làm gọn tí được bằng cách thay vì phải ghi như này:

        + value={field.value}, ref={field.ref} onChange={field.onChange} thì chúng ta sẽ viết gọn lại bằng cách {...field} nó sẽ hiểu là  value={field.value}, ref={field.ref} onChange={field.onChange} và chúng ta muốn ghi đè thuộc tính nào thì chỉ cần

    + Tiếp theo sẽ handle đến phần filter,
    + APi yêu cầu chuyển lên searchParams là price_max và price_min, nếu chỉ nhập price_min thôi thì đừng truyền price_max làm gì
    + Một là dùng như này để ép kiểu nó khi mà nó lỗi thông báo kiểu as QueryConfig, 2 là ép kiểu trực tiếp các thuộc tính chính trong đó as { price_min: string, price_max: string}
    + Do 2 field price_max và price_min chúng ta không .required() nên có nó sẽ có thể có undefined -> vì InputNumber của chúng ta là động có thể có price_max hoặc price_min nên chỗ này chúng ta sẽ xử lý -> cần 1 cách gì đấy loại bỏ undefined trong mỗi cái key này
    + => Sẽ tạo 1 cái type trong file utils.type.ts => sẽ tạo 1 cái utils giúp chúng ta loại bỏ được cái undefined

    + NonNullable là một utils của thằng typescript nó sẽ loại bỏ đi giá trị undefined của một cái

    + Có thể rút gọn đọn function test() ở đây bằng cách tạo 1 cái function rút gọn

    => Trong video này chúng ta học được là tạo một cái InputNumber chỉ nhập được số không nhập được text , xử lý cái InputComponent(có thể dùng UI Lib) mà nó không nhận vào register bằng cách sử dụng Controller của RHF, học được yup.test() để custom được cái validate, và cách tạo ra cái Type loại bỏ giá trị undefined

> 185 Xử lý logic RatingStars và xóa filter

    + Code logic RatingStars và xử lý xóa filter button
    + Xử lý 5 loại ngôi sao, 1 ngôi sao, 2 ngôi, 3 ngôi, 4 ngôi sao, 5 ngôi sao, theo đánh giá của sản phẩm
    + Tạo 1 Component RatingStars để xử lý filter bằng stars

    + Ở đây chúng ta có một cái thuật toán đơn giản như này

    /**
        index 0: có 5 cái màu vàng tương ứng từ indexStar 0 - 4 đều màu vàng
        index 1: có 4 cái màu vàng tương ứng từ indexStar 0 - 3 đều màu vàng
        index 2: có 3 cái màu vàng tương ứng từ indexStar 0 - 2 đều màu vàng
        index 3: có 2 cái màu vàng tương ứng từ indexStar 0 - 1 đều màu vàng
        index 4: có 1 cái màu vàng tướng ứng từ indexStar 0 chỉ có màu vàng

        Chúng ta nhận ra là indexStar < 5 - 1 => ngôi sao màu vàng

      return về ngôi sao màu vàng chưa có return về ngôi sao màu trắng
     */

     + Index = 0 thì ngôi sao là 5 nên sẽ truyền vào bằng cách => handleFilterStar( 5 - index)
     + Thường là những sự kiện như onClick thì Eslint nó bắt các thẻ để click nên là button,..., Lỗi về Eslint thì chúng ta có thể fix sau cũng được -> cái thẻ div được coi là non-interactive element -> Thêm vào là aria-hidden=true

     + Những cái mà chúng ta có thể click có thể tương tác mà không có tab được thì gg nó đánh giá web chúng ta ko có thân thiện -> nên cho tabIndex={0} role='button' vào luôn thẻ div

    + handle luôn button xóa tất cả các filter trong queryConfig chỉ xóa các filter trong AsideProduct -> xóa Categories , xóa Price , xóa RatingStars -> dùng omit của lodash

> > > > > > > > > > > > > > > > > > > > > > Chương 20 Clone shopee trang chi tiết sản phẩm

> 186 Code UI ProductDetail và phòng chống tấn công XSS

    + Thì trong produtDetail chúng ta thấy rằng trên URL của shopee/-{title}-i.{productID}, - tên sản phẩm -i. Id của sản phẩm -> Vậy nên nó sẽ dựa vào cái ID như vậy để nó get API, thằng title nó chỉ thêm vào để cái URL nó đẹp hơn, chứ thật ra thì nó chỉ có dựa vào thằng Id để nó call Api mà thôi
    + Thêm vào Product component đường dẫn `${path.home}${product._id}` để lấy được cái đường dẫn trên thanh URL (thẻ Link thì to tự sinh ra đường dẫn trên URL)

    + Vào dược trang productDetail rồi thì tiến hành code UI trang productDetail -> chia grid làm 12 cột thì 1 thằng hình ảnh chiếm 5 cột, thằng thông tín sản phẩm thì chiếm 7 cột
    + Khi mà đưa ':id' thì có thể dùng useParams để lấy ra id trên thành URL, mình sẽ ép kiểu id vì mình biết id lúc nào cũng có

    + Array Image cho chúng ta dùng cái slider(description là dạng HTML)
    + Cái kỹ thuật mà cho relative và pt-[100%] để tấm hình có chiều cao và chiều rộng bằng nhau

    + Vì product có thể là undefined nên sẽ kiểm tra là có product thì mới render ra sản phẩm -> if(!product) return null -> nếu đó chạy qua được cái hàm if thì nó sẽ có dữ liệu(trong flex-box của có thể set gap-[] cho thẻ div)
    + 2 bên sliderProduct đều có button , lấy 5 tấm ảnh thì slice(0,5) là lấy từ index thứ 0 đến index thứ 4 -> return về element của bức ảnh

    + Slider nó có active khi mà nhấn vào thì nó sẽ có một cái border, nếu mà dùng border bình thường thì nó sẽ làm tấm ảnh chúng ta thu nhỏ lại -> chúng ta sẽ dùng cái thẻ div để chồng lên cái hình ảnh, thẻ div của chúng ta sẽ trong suốt vào có cái border bao quanh tấm ảnh

    + Code tiêu đề cho sản phẩm, component productRating sẽ được custom lại để chúng ta có thể sử dụng được ở các nơi
        + Thêm thuộc tính activeClassName cho component mặc định giá trị là 'fill-yellow-300 text-yellow-300'

    + Xử lý hình ảnh cho sản phẩm như dã nói để mà chiều dài và chiều rộng được bằng nhau thì chúng ta cho pt-[100%] relative ở thẻ con thì cho absolute và điều chỉnh cho nó ngay với thẻ cha

    + Thông tin chi tiết sản phẩm của productDetail là dạng HTML chúng ta không thể render theo kiểu là JSX được -> khi mà render thì cái JSX nó không có hiểu -> đây là cách là cách mà JSX nó chống lại tấn công XSS -> Vậy làm sao để chúng ta có render HTML lên JSX, thì chúng ta có 1 cách khá là easy -> sử dụng thuộc tính dangerouselySetInnerHTML -> khi mà chúng ta render như vậy lỡ đâu website của chúng ta chứa các đoạn mã JS thì website chúng ta sẽ gặp nguy hiểm nó có thể bị tấn công XSS vì thế React nó mới có thuộc tính là dangerouslySetInnerHTML(những đoạn code nằm trong đây thì nó rất là nguy hiểm)

    + Nếu như HTML trong cái đoạn mã này từ nguồn nào không đáng tin cậy đi, ví dụ như từ người submit lên thì website chúng ta rất dễ bị hack rât dễ bị tấn công, nó có thể lấy đi cái access_token của chúng ta => Vấn đề này có thể được giải quyết rất là dễ bằng cách cài thư viện `dompurify` -> giúp chúng ta loại bỏ đi những doạn mã JS trong chuỗi string của chúng ta

> 187 Code Slider cho ảnh sản phẩm

    + Tiến hành code logic của cái Slider ảnh -> khi mà click thì thay đổi Index -> index ảnh ban đầu là 0 - 4 khi click thì nó sẽ thay đổi thành 1 - 5(vẫn đẩm bảo là 5 ảnh)

    + Xử lý phần indexImage thì nên tạo ra 1 cái state currentIndexImage để quản lí việc slider click -> khi mà click next hay prev thì chúng ta sẽ set lại cái state

    + Sẽ tạo thêm một biến nữa là currentImage sẽ được generate ra dựa trên currentIndexImage -> do currentImage nó phụ thuộc vào currentIndexImage nên chúng ta ko cần phải tạo state có thể tính toán currentImage dựa vào state currentIndexImage

    + currentImage phụ thuộc vào product.image.slice(...currentIndexImage), nhưng mà mỗi component ProductDetail nó re-render thì currentImage của chúng ta lại tính toán lại -> sử dụng useMemo, Nếu vẫn là dữ liệu product của một sản phẩm và currentImage thay đổi thì chúng ta sẽ cho Component re-render lại

    + Khi mà hover vào thì nó sẽ có border và nó sẽ set lại tấm ảnh sản phẩm trên giao diện -> tạo 1 cái state để quản lí việc này khi mà hover vào thì sẽ đổi sang ảnh khác và sẽ có 1 vòng tròn đỏ active

    + activeImage ban đầu là một cái string rỗng '', nhưng khi mà nó đã có Api rồi thì cho activeImage là thằng Image đầu tiên -> useEffect(() => {
      // nhưng nó vẫn có rủi ro khi mà product có mà images nó là một [] rỗng thì nó sẽ trả về undefined, nên phải check thêm là nó có length > 0
      if(product) {
        setActiveImage
      }
    }, [])

    + Sau khi đã tạo state cho activeImage rồi thì bây giờ chúng ta sẽ xử lý chuyện hover vào thì activeImage nó xử lý -> thay đổi hình ảnh -> khi hover vào thì activeImage thành ảnh sản phẩm chính

    + Sau khi đã xử lý hover rồi thì giờ xử lý phần slider, khi click vào mũi tên Next hoặc Prev thì sẽ setState lại cho cái currentIndexImage thì thằng currentImage nó tính toán lại -> thì chúng ta sẽ có 1 cái slider mới -> khi mà currentIndexImage mà đạt tới giới hạn rồi thì chúng ta sẽ không cho nó Next hoặc Prev nữa (currentIndexImage[1] < product.images.length) -> Chỉ khi mà nó bé hơn độ dai của images.length thì ta mới có thể cho nó Next đi hết độ dài của images.length(ban đầu chỉ cho slider lấy 5 tấm ảnh từ images mà thôi nhưng mà khi click thì vẫn cho nó Next tới hết độ dài của images)

    + Còn ô ở trên (product.images.length) ổ báo lỗi là sở dĩ nó có thể là undefined nhưng mà mình biết chắc là nó không thể undefined được -> Nếu mà nó undefined thì nó sẽ return null nếu mà nó return null thì làm gì có imagesSlider cho chúng ta click -> Cũng có thể cần useCallback để chặn re-render khi component cha re-render

    + Nếu currentIndexImages thay đổi mà  chúng ta ko đê trong dependency thì cái useMemo nó không nhận biết được là currentIndexImages thay đổi nên nó sẽ không tính toán lại

    + Phải cài eslint-plugin-react-hooks thì khi mà truyền thiếu dependencies hay là thiếu cái gì đó thì eslint nó sẽ thông báo

> 188 Code logic di chuột thì zoom ảnh

    + Code logic di chuột thì zoom ảnh

    + Thì chúng ta thấy khi mà hover vào thẻ div có relative thì cái div absolute thì nó sẽ set lại cái top và left còn height và width nó sẽ tính dựa trên chiều cao nguyên bản của thằng image(chiều rỗng và chiều cao nguyên bản của image là 1920 x 1080)

    + Thì chúng ta thấy đặt cái sự kiện 'di chuyển' con trỏ chuột vào thẻ div relative thì chúng ta sẽ set div absolute to lên(set height và width, top , left to lên so với thằng nguyên bản)

    + Khi di chuyển con trỏ chuột thì chúng ta sẽ sử dụng sự kiện là onMouseMove() -> khi di con trỏ chuột thì thẻ div absolute set cho nó chiều cao và chiều rỗng trở về nguyên bản -> thì để có thể set nó chúng ta cho nó 1 cái style rồi setStyleState rồi cho nó một cái style={setStyleState} vừa mới set -> Hoặc là chúng ta có thể làm theo cách này sẽ tốt hơn về mặt performance(nhưng mà nhiều cái thì rất khó để quản lí) -> sử dụng useRef và chúng ta sẽ DOM theo kiểu js truyền thống sẽ dùng ref để DOM

    + Image của mình có thể là null nhưng mình biết chắc image không thể là null được vì mình đã kiểm tra trước khi xử lý sự kiện rồi, nên đã hover vào được thì image không thể là null được nên chúng ta sẽ ép kiểu nó luôn -> const image = imageRef.current as HTMLImageElement
        + image.style.width = giá trị mặc định của cái image -> thì làm thể nào để lấy được giá trị mặc định của cái image và giá trị(khi đổi kích thước app) -> thì để lấy được giá trị này thì chúng ta sử dụng thuộc tính naturalHeight/Width của thẻ <img />

        + / cộng thêm px cho nó khỏi lỗi , // vì nó yêu cầu là string

        + Cái image mình nếu to về cái chiều cao cũng nên to về cái chiểu rỗng(nhưng nó bị max-width: 100% của thẻ img giới hạn) -> nên là mình sẽ reset cái maxWidth(do thẻ img tự sinh ra) khi mà mình hover vào -> nó sẽ tràn ra ngoài cái relative luôn nên sẽ overflow: hidden -> Khi  mà nó đã hiện đúng trong cái relative rồi thì công việc của chúng ta còn lại sẽ là di chuyển cái position làm sao cho nó chuẩn là được

        + khi mà đã biết được thông số của thẻ div thì chúng ta sẽ lấy ra chiều cao và chiều rộng của cái thẻ div -> dùng cái getBoundingClientRect() -> event.currentTarget.getBoundingClientRect()

        + Cách 1:

        + Bây giờ làm sao để mà chúng ta có thể tính được cái top và cái left -> chúng ta có cái công thức như này ->
            - Top thì nó sẽ tính dựa trên offsetY, left thì nó sẽ tính dựa trên offsetX
            + const top = offsetY * ( 1 - naturalHeight / react.height)
            + const left = offsetX * ( 1 - naturalWidth / react.width)

                + offsetX vị trí x con trỏ chuột trong cái element của chúng ta
                + offsetY vị trí y con trỏ chuột trong cái element của chúng ta


        + Làm sao để mình lấy được offsetX và offsetY -> event.nativeEvent.offsetX/offsetY -> đã có được tọa độ con trỏ chuột rồi -> Bây giờ chỉ cần áp dụng công thức cho cái thằng style -> Nhưng khi mà thay đổi rồi thì chúng ta sẽ thấy nó rất là giật(Là do hiện tượng event bubble) -> Event bubble là sự kiện event nó chồng chéo lên nhau

          + Event bubble: là khi hover (sự kiện js khác) vào  element con thì cũng đồng nghĩa đang hover vào element cha
          + Bubble Event đôi khi sẽ làm event.target của chúng ta bị lẫn lộn lúc thì cha lúc thì con

          -> offsetX/Y con trỏ chuột của chúng ta sẽ bị thay đổi

        -> Để fix vấn đề này thì chúng ta làm sao cho nó không hover vào cái image này -> Đơn giản chỉ cần set 1 cái CSS là: 'pointer-events-none' -> Là thẻ <img /> nó sẽ không nhận cái sự kiện vào

        -> Có thể cải thiện tí là khi hover vào cho nó cái cursor-zoom-in, còn khi mà hover ra thì reset cái ảnh lại như ban đầu -> tạo 1 hàm reset sự kiện

      + Đặt 1 cái sự kiện vào thẻ div khi mà zoom out hover ra bên ngoài

      + Cách 2:

          + event.pageX: Tọa độ x trỏ chuột theo trang web (không thể âm)
          + event.pageY: Tọa độ y trỏ chuột theo trang web (không thể âm)

          + Window.ScrollX: Tọa độ Page scroll theo chiều X
          + Window.ScrollY: Tọa độ page scroll theo chiều y

          -> Công thức sẽ như sau:

             + offsetX: event.pageX - ( rect.x + window.scrollX )
             + offsetY: event.pageY - ( rect.y + window.scrollY )

        -> Cách này dùng khi mà có cái component CSS cho nó thì chúng ta mới sử dụng cách này

> 189 Xử lý URL thân thiện với SEO

      + Xử lý URL thân thiện với SEO -> xử lý URL productDetail làm sao cho nó tương tự với thằng shopee -> làm cho cái App chúng ta thân thiện với người dùng -> Phần đầu tiên là cái name, phần thứ 2 là id

        -> Thì chúng ta sẽ cắt cái đoạn string ra để lấy cái id -> rồi dùng cái id để gọi API -> URL tên sản phẩm chỉ để người dùng nhìn vào biết đầy là sản phẩm gì mà thôi
        -> Không phải cái gì chúng ta cũng đưa lên URL bởi vì cái name /Điện-thoại-Apple-Iphone-12-64GB--Hàng-chính-hãng-VNA-i-60afb1c56ef5b902180aacb8 mà có dấu gạch chéo đầu dòng thì nó đã biến thành cái đường đẫn khác rồi -> Nên là chúng ta sẽ loại bỏ các kí tự đặc biệt
        -> Cái dấu cách không được để trên URL

      + Cũng nên tạo 1 cái func để get cái id từ URL -> dùng cú pháp split('') cái chuỗi ra

    + Sẽ xử lý cái đường dẫn URL productDetail ở component <product /> thay đổi đường dẫn cái productItem trong productDetail

    + Lấy từ paramsUrl xuống là cái nameId chứ không còn là Id nữa, và tạo ra cái id bằng hàm getIdFromNameId -> lấy ra Id xong rồi call APi lại

    + Thì khi mà F5 lại thì cái app chúng ta nó gặp hiện tượng lạ đó là nó không tìm thấy cái app của chúng ta -> lỗi là do thằng vite nó không cho sử dụng dấu chấm trên thanh URL

    + Có thể cài thêm cái plugin nó fix từ dev server không lấy được dấu chấm trên URL -> plugin
        + yarn add vite-plugin-rewrite-all -D

    + Khi mà đã fix được lỗi URL rồi thì nhìn cái URL của chúng ta nó rất là thân thiện

> 190 Fix lỗi tailwind CSS IntenlliSense không gợi ý class

    + Thêm đoạn mã gợi ý tailwindcss vào bên trong file setting.json

> 191 Code chức năng tìm kiếm sản phẩm

    + Khi mà search thì nó sẽ giữ cái category, cái RatingFilter thì bị xóa, subCategory thì cũng giữ nốt -> giữ cái nào va xóa cái nào thì đây là bussiness modal của doanh nghiệp

    + Khi mà người dùng submit thanh search thì chúng ta thay đổi cái URL và redirect đến trang cái productList của cái sản phẩm chúng ta vừa search -> trang productList nó checking được queryParams và nó sẽ gọi Api lại

    + Làm thế nào để minh truyền cái queryConfig vào bên trong cái header để Header biết được có những cái filter nào để mà có thể giữ cái filter đấy -> Cái này nó rất là easy(Mentor nói như vậy :D) -> Tạo một cái custom hooks useQueryConfig thì cái custom hooks này thì nó sẽ lấy từ cái URL ra, nó sẽ coi thử có bao nhiêu cái config thì nó sẽ lấy ra xong rồi ở trong Header chúng ta cũng có thể lấy được mà trong ProductList chúng ta cũng có thể lấy được -> Thì như thế chúng ta có thể sử dụng mà không cần phải truyền từ productList sang Header
        -> Tạo 1 custom hook dùng chung cho 2 ông
        -> Có gặp những trường hợp tương tự như vậy(2 component khác nhau, khó truyền qua lại) thì nên tạo 1 cái custom hooks để dễ sử dụng ở các component khác nhau

    + sẽ quản lí thanh search bằng RHF -> form của thanh search không cần show lỗi -> nhưng sẽ validate bên phía front-end khi mà người dùng không nhập gì thì không cho ngươi ta 'enter' để search sản phẩm

    + Nhưng mà chúng ta phải khai báo 1 số cái -> ví dụ như cái schema

    + Khi mà nhập đấu cách thì nó log ra -> dùng trim() trong yup() để cắt các kí tự khoảng trắng trong form khi submit(submit mà ko có chữ mà khoảng trắng không) nó sẽ trim() trước và sau giá trị nhập vào
    + Gõ phải có đấu

    + Phân tích business chúng ta một chút xíu, ví dụ người dùng đang ở gia cao - thấp -> thì khi mà nhập search  thì phải quay về trạng thái mới nhất -> còn các sort_by khác khi nhập search vẫn giữ nguyên
        -> omit 'order' và omit luôn cả thằng 'sort_by = price '

        -> Sẽ check queryConfig có chứa order và price hay không nếu có thì sẽ xóa nó đi khỏi queryConfig, và sẽ quay trở lại active filter sort_by = createdAt

    + Khi mà đang trong productDetail search tìm kiếm sản phẩm thì nó sẽ redirect về trong productList sản phẩm ngay

    + Vẫn để giá trị name trong thanh search và không bị xóa đi

> 192 Code chức năng hiển thị các sản phẩm tương tự

    + Hiển thị các sản phẩm khác dựa vào categoryId -> Thì chúng ta sẽ getProductList và filter theo categoryId và show lên thôi -> nó cũng đơn giản
    + Thì bên productDetail chúng ta cũng gọi useQuery tương tự productList

    + QueryConfig bên phía productDetail thì chúng ta không cần config theo giống với productList(sort_by, order, price_max, price_min)
    + Nên là cái queryConfig thì chúng ta chỉ cần lấy ra cái categoryId của sản phẩm là được :

      -> sẽ làm queryConfig productDetail như này  + queryConfig = {limit: '20' , page: '1' , category: product?.category._id}

    + Thì bây giờ sẽ có vấn đề đó là -> Đó là nếu bên productList đã fetch API của các danh mục sản phẩm rồi nhưng mà khi chúng ta qua trang productDetail thì lại fetchAPI thêm lần nữa(useQuery() sẽ gọi và fetch APi ngầm  vì nó cho rằng cái APi productList đã cũ)

    + Chúng ta sẽ có 1 ví dụ như này, ban đầu khi nhấn vào thì chúng ta sẽ fetch cái APi đồng hồ nhưng mà khi nhấn vào 1 cái sản phẩm đồng hồ cụ thể thì nó sẽ fetch lại APi category Api đồng hồ -> điều này là không cần thiết

        + Có 1 vấn đề nữa là khi mà nhấn vào sản phẩm đồng hồ cụ thể  là nó sẽ fetch 2 cái API
          + 1 cái API không có category chỉ có `limit='20' và page='1'`
          + 1 cái API nữa là có cả category `limit=20 page=1  và categoryId='...'`

        + Sẽ fix cái vấn đề tại sao nó gọi 2 cái APi, là do ban đầu cái productDetail chưa có(bị undefined nhưng nó vẫn nhảy vào cái getProducts nó gọi) nên nó mới trả về cái APi ko có category trong queryConfig -> Chúng ta có thể sử dụng thuộc tính enable trong react-query khi mà getProductsDetail nó có thì chúng ta mới getApi còn không thì thôi
            enabled: Boolean(product) // khi mà product nó có data thì cái useQuery này mới được chạy

        + Sẽ fix làm sao cho nó không gọi lại cái API trong productDetail nữa vì trước đó người dùng đã gọi cùng 1 cái API trong productList(categoryId như nhau) rồi -> sẽ thêm vào cái staleTime để App biết là cái APi này nó chưa có bị cũ
        + Thì chúng ta phải set thêm staleTime bên productDetail nữa -> Nên cách easy nhất là set staleTime 2 bên bằng nhau

        -> Bây giờ sẽ show ra bên mục có thể bạn cũng thích -> Chúng ta sẽ lấy lại phần code của trang productList
        -> Trong bài này chúng ta học được cái cách cache data như trong react-query , cách tư duy, có thể trong bài này chúng ta sẽ nghĩ là lưu data ở trong redux, context API, hoặc là một nơi nào đấy rồi qua trang productDetail chúng ta lấy thì cái này chúng ta không cần -> mấy cái này chúng ta có thể sử dụng react-query để lấy ra
        -> Trong trường hợp chúng ta muốn lưu data vĩnh viễn, chỉ fetch lại khi mà người dùng F5 lại trang web thì set nó thành infinity thì nên set cả 2 component luôn cho nó đồng bộ (tùy vào mục đích doanh nghiệp là gì thì chúng ta sẽ set theo như vậy)

> 193 Tách component QuantityController

    + Tách riêng ra thành component QuantityController thành 1 cái component riêng -> Vì nó có sử dụng ở nhiều nơi nên sẽ tách riêng nó ra
      + Nó sẽ có 1 cái input và 2 button
      + Cái input nó sẽ có giá trị tối đa, nếu mà nhập quá giá trị sản phẩm còn trong kho thì không được

      + Sẽ k được nhập quá giới hạn trong kho -> Khi mà nhập quá số lượng thì sẽ tự động reset sản phẩm về
      + Khai báo props cho thằng InputNumber, nên kế thừa inputProps của thằng InputNumber

      + Chúng ta sẽ thêm các thuộc tính props cho các sự kiện nữa (increase, descrease, ontype) -> Tại sao chúng ta lại cho 3 cái sự kiện, chúng ta có thể setting 1 cái sự kiện onChange cũng được (tăng giảm thay đổi giá trị) -> nhưng mà khi sử dụng 3 cái sự kiện sẽ tăng tính custom cho cái component của chúng ta -> Khi mà chi có 1 cái sự kiện onChange thì khi change cái input là nó update liên tục -> còn khi mà sử dụng cái sự kiện riêng thì khi mà chúng ta outfocus thì nó mới update(click ra ngoài) dễ dàng custom được những trường hợp nó đặc biệt như thế này

      + Tại sao hàm onIncrease ta lại truyền vào arg là value chứ không phải làm event -> Đồng ý là khi dùng input truyền onChange thì lấy được cái value còn ở đây là button tăng và giảm số lượng vậy làm sao để lấy được value khi mà tryền event vào nên ở đây chúng ta sẽ truyền vào value thay vì event

            + onIncrease: (value: number) => void -> truyền event làm sao lấy được value
            + Để tăng tính custom cho component chúng ta thêm classNameWrapper cho component của chúng ta

      + classNameWrapper: sẽ đặt mặc định là 'flex items-center' vì 2 thằng này lúc nào cũng có và 'ml-10'

      + Khi mà chúng ta inputchange cái component InputNumber thì chúng ta sẽ gọi đến cái function là handleChagne
      + Sẽ phân tích 1 tí xíu component InputNumber -> Khi mà chúng ta nhập chữ thì nó sẽ không gọi onChagne props của InputNumber đâu
      + Và chúng ta sẽ kiểm tra luôn nếu giá trị max(maxValue) có và nó khác undefined và _value > maxValue thì chúng ta sẽ reset cái value bằng giá trị maxValue, Nếu value người dùng nhập < 1 thì chúng ta sẽ reset = 1 -> khi mà onChange trên InputNumber thì chúng ta sẽ goi tới onType
      + value={value} sẽ là value từ bên ngoài truyền vào, nó giống như cái cách chúng ta sử dụng InputNumber value cũng từ bên ngoài truyền vào(value sẽ được quản lí từ cái state ngoài chứ không phải state trong component InputNumber) -> value sẽ từ component cha truyền vào(ở đây là QuantityController truyền vào) -> value cuối cùng sẽ là số lượng sản phẩm từ component QuantityController(có thể sẽ tạo giá trị value khởi đầu, ban đầu có thể cho là 1 và không được lớn hơn tổng số lượng trong kho)

      + const increase = () => {
           let _value = Number(value) // cái value này sẽ là cái value khi mà InputNumber được onChange
        }

      + Vẫn nhập chữ được là do chúng ta chưa truyền những cái function bên ngoài value bên ngoài vào -> Ở đây do chỉ có 1 cái Input thôi nên không cần dùng RHF làm gì -> Nên chúng ta sẽ tạo 1 cái state để quản lí điều đó, mặc định giá trị này sẽ cho nó là 1
      + Rồi sẽ khai báo cái function handleBuyCount -> hàm này nó sẽ nhận vào value là cái Number -> hàm handleBuyCount này sẽ truyền increase và decrease vào
      + Thì trong component <QuantityController /> thì sẽ truyền 3 cái sự kiện vào thì cái onIncrease và onDecrease thì sẽ truyền vào handleBuyCount() và onType cũng truyền vào handleBuyCount mục đích là khi mà thay đổi giá trị trên QuantityController nó sẽ setState lại buyCount(số lượng)
      + Như đã nói thì value của QuantityController được quản lí bởi thằng cha của nó là ProductDetail()

> 194 Phân tích và khai báo API purchases

    + Sẽ phân tích và khai báo 2 cái API của addToCart và ReadPurchases
    + Khi mà thêm 1 cái sản phẩm vào giỏ hàng thì chúng ta sẽ gửi lên server đó 1 cái số lượng và id của sản phẩm đó là được(method post)
    + Read purchases nó làm rất là nhiều nhiệm vụ(khi gửi cái queryParams khác nhau): status là -1 thì nó có thể show những sản phẩm trong giỏ hàng

    + AddToCart là một method vì thế nó gửi lên một cái body -> body nó sẽ có 2 thuộc tính là {'product_id', 'buy_count'}

    + Sẽ gửi lên server là URL params là status thì truyền cho nó cái config {params: {status} }, status sẽ có kiểu là PurchaseListStatus
    + Cũng nên khai báo const liên quan đến mấy ô status -> để sử dụng không bị nhầm lẫn

> 195 Thực hiện chức năng thêm sản phẩm vào giỏ hàng

    + Thực hiện chức năng giỏ hàng
    + Nhưng mà chúng ta sẽ phân tích một chút xíu về cái Add-to-cart, khi mà addToCart thì gửi cái method Api addToCart và gửi sản phẩm và số lượng sản phẩm lên
    + Có nhiều cách để dùng useMutation
        + Cách 1: useMutation({
          mutationFn: (body) => purchaseApi.addToCart(body)
        })

        + Cách 2: useMutation((body) => purchaseApi.addToCart(body)) -> Cách này cũng vẫn được
        + Cách 3: useMutation(purchaseApi.addToCart) -> Cách này thì cũng được

    + Khi mà thêm sản phẩm vào giỏ hàng và hiển thị lên Cart thì chúng ta gọi APi là purchaseList của chúng ta(sử dụng status là -1 để thêm vào giỏ hàng)
    + Trong cái queryKey của purchases thì nên có 1 object định danh cho nó -> Tiếp theo queryFn trả về một cái promise

    + Chỗ useQuery của getPurchase nó sẽ có 1 vấn đề như thế này -> sử dụng cái useEffect() có cleanup function để giải thích hiện tượng như thế này
    + Khi mà đang ở component ProductList mà nhảy qua ProductDetail thì clg("header") nó được gọi lại mặc dù 2 component nó không liên quan gì đến nhau -> Nhưng đây là cái thông minh của thằng react-router-dom V6 -> Nếu đúng logic thì nó sẽ làm <MainLayout /> unmount rồi mount lại -> Nhưng như đã nói thì react-router-dom nó thấy 2 component dùng chung cái <MainLayout /> nên là nó không unmount nó chỉ re-render lại thôi -> nên là cái useQuery nó sẽ không bị gọi lại mặc dù component re-render và chúng ta không set staleTime -> và chỉ gọi lại khi params truyền vào là đúng hoặc là component bị unmount rồi mount lại
        -> Tất nhiên là trừ trường hợp logout rồi nhảy sang RegisterLayout rồi nhảy vào lại, nên các query này sẽ không bị inactive(bị inactive khi mà không có component nào subcribes đến cái query này nữa -> khi mà bị inactive thì nó sẽ bắt đầu tính cái thời gian nó bị xóa khỏi cache) -> Không bị gọi lại nên không cần set staleTime là infinity

    + PurchaseInCartData sẽ render ra tại khu vực của popover cart -> khi mà không có sản phẩm thì nên render ra 1 cái layout khác
    + Khi mà trong có sản phẩm giống nhau thì nó chỉ hiển thị giá tiền một sản phẩm thôi chứ nó không nhân lên với số lượng mua trong đó là gì
    + Làm sao để cho thằng APi trong header biết được khi nào thêm sản phẩm thành công thì cập nhật lại giỏ hàng -> sử dụng invalidateQueries khi mà mình thêm mới sản phẩm thì sẽ báo hiệu cho headerCart biết được và cập nhật lại
    + Khi mà add thành công thì gọi cái queryClient ra và sử dụng invalidateQueries({}) truyền vào queryKey mà chúng ta muốn invalidate(fetch lại APi đó) -> nó sẽ có dạng như này invalidateQueries({queryKey: ['purchases', {status: purchaseStatus.inCart}]}), Do api addToCart() gọi xong thì nó sẽ bị stale liền nên khi mà invalidateQueries thì nó sẽ gọi lại APi ngay lập tức -> Và cái giỏ hàng chỉ render ra được có 5 sản phẩm được thêm vào gần nhất(còn những sản phẩm cũ đã thêm thì ko được hiện lên) => Chỉ nên hiển thị 5 sản phẩm và các sản phẩm còn lại sẽ hiển thị bên dưới góc trái -> Trên cái Cart sẽ có 1 cái path nhỏ chứa số lượng giỏ hàng có trong giỏ,
    + Lấy 5 thằng product thì chỉ cần slice() ra 5 thằng đầu tiên là được
    + Cái thành phần {number} thêm vào giỏ hàng thì lấy cái length của purchaseCart - MAX_PURCHASE -> Nhưng mà phải tính toán trong trường hợp là nó lớn hơn 5 thì mới trừ ra còn không thì thôi
    + purchasesInCart lúc nào gọi APi cũng có nhưng là một [] rỗng -> nên phải kiểm tra xem độ dài của cái mảng đó phải lớn hơn 0

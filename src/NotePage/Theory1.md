> > > > > > > > > > > > > > > > > > > > > > Chương 21 Clone shopee trang giỏ hàng

> 196 Cập nhật InputNumber và QuantityController với local state component

    + Bài giảng này sẽ cập nhật InputNumber và QuantityController với local state component
    + Trước khi làm UI trang Cart thì chúng ta có một số cái update cho componet InputNumber của chúng ta -> thì mình nhận thấy cái component InputNumber khi mà mình không có truyền value và onChange thì cái component nó không hoạt động đúng như mình mong muốn -> ở đây chúng ta mong muốn dù cho người dùng không truyền onChange và value vào thì nó vẫn hoạt động đúng với những gì mình đã setup logic trong đấy -> Nói chung thì nó vẫn hoạt động đúng chức năng của nó mặc cho người dùng không có truyền cái gì vào hết

    + Thì chúng ta sẽ để yên cái InputNumber và không truyền gì vào(không value và onChange) sẽ sử dụng `state` của component InputNumber -> tạo 1 localState, 1 cái state cục bộ -> để quản lí khi mà người dùng chưa nhập vào giá trị

    + Nếu người dùng có truyền vào value vào từ props thì chúng ta sẽ lấy giá trị value đó làm giá trị khởi tạo -> Giá trị khởi tạo chỉ có hiệu nghiệm duy nhất 1 lần(Nếu value hay đổi thì nó sẽ không có làm cho giá trị khởi tạo thay đổi) -> chỉ có hiệu nghiệm trong lần render đầu tiên dù cho du cho value có thay đổi trong quá trình render đi chăng nữa thì localValue nó sẽ không có cập nhật lại được

    + Xử lý logic localValue trong khu vực handleChange -> thực thi onChange callback từ bên ngoài truyền vào props mục đích để handle callback liên quan đến react-hook-form

    + Quản lí luôn thằng QuantityController khi mà người dùng chưa truyền value vào thì lấy value từ localState -> khi mà người dùng chưa truyền vào hàm handleChangeInput thì nó vẫn có thể tăng giảm được
    + Tăng giảm giá trị không được là do chúng ta chưa truyền vào cho cái giá trị max(khi mà chúng ta custom lại ban đầu chưa truyền vào value và các onChange trong hàm) -> Nếu value mà không có thì cho thêm số 0 vào giá trị cho localValue
    + Ban đầu khi mà không truyền value và onChange thì cũng nên cho giá trị _value trong các increase và decrease 1 giá trị cụ thể, cụ thể có thể là số 0 -> Debug thì cứ mở tab Component trên trình duyệt là được
    => let _value = Number(value || localValue) + 1 -> chỗ này không phải lấy số 0 mà là lấy localValue -> Bây giờ component chúng ta nó đa năng hơn người dùng không cần truyền props thì vẫn có thể nhập vào QuantityController và onChange sự kiện được

    => Mục đích bài này chỉ để đă năng hơn trong việc nhập giá trị của code

> 197 Sử dụng useController để tạo ra InputV2

    + Sử dụng useController trong RHF để tạo ra InputV2
    + Edit lại component input thường để muốn giữ để sau này xem lại biết nó còn có những biến thể như thế nào
    + InputV2 không phải dùng được trong mỗi trường hợp , còn cái Input thì dùng được trong mỗi trường hợp luôn -> InputV2 này sẽ bị hạn chế và chỉ sử dụng được với RHF mà thôi

    + Đầu tiên chúng ta sẽ có 1 cái function là Hexa() -> sẽ xem ví dụ để có thể hiểu được cái InputV2 tạo ra để làm gì -> chúng ta muốn thằng name phải có giá trị giống lastName tức là thằng name nhập giá trị gì thì lastName phải có giá trị đấy(lastName nó phải gợi ý khi mà chúng ta đã truyền vào giá trị name) giống như controller của React hook form -> Chúng ta muốn mô phỏng lại giống như vậy -> ví dụ dễ thì thằng name: T(kiểu T) thì thằng lastName cũng phải kiểu T (name: T , lastName: T) -> muốn như vậy thì chúng ta phải cho generic type là T
    + Chúng ta mong muốn lastName sẽ là giá trị return của thằng getName: TFunc(giá trị return của function getName) -> // Mình mong muốn thằng lastName nhận vào giá trị return của func getName: TFunc -> Nếu mà truyền TFunc vào cho lastName thì không được bởi vì nó muốn nhận vào cái () => 'Trong' nhưng mình muốn chỉ là giá trị return của cái hàm này thôi -> thì chỗ này typescript nó cho phép chúng ta sử dụng kiểu type của nó là ReturnType<TFunc> -> Nhưng mà nó sẽ báo lỗi vì nó thấy TFunc(generic type) nó có thể là string hoặc number, ... Nên để quy định rõ chỗ này chúng ta có thể làm như sau (TFunc quy định cho nó là một cái func kế thừa từ func và return về một string) <TFun extends () => string> -> Học thêm được một kiến thức mới khá là hay

    + Nhưng chỗ này chúng ta sẽ làm cho nó phức tạp thêm 1 tí nữa là lần này lastName sẽ cho nó có một cái TLastName như này(lastName: TLastName) nên lúc này phía dưới nó sẽ không gợi ý cho chúng ta nên lúc này chúng ta sẽ khai báo genericType như này:
        -> <TFunc extends () =>  string, TLastName extends ReturnType<TFunc>>(props: {person: Gen<TFunc>, lastName: TLastName})

    -> Vậy là chúng ta đã biết truyền vào person và lastName nó tự generate ra dựa trên giá trị ta truyền vào từ bên(person) -> kiểu của props B được suy ra từ kiểu của props A
    -> Sắp tới chúng ta sẽ làm cái InputV2 nó sẽ hơi nhứt đầu một tí nhưng nó tương tự kiến thức vừa mới được học ở trên
    -> Tóm lại ở cái component Hexa chúng ta có dùng TFunc, TLastName nên chúng ta phải khai báo nó ở generic type


    + Tiến hành tìm về useController để áp dụng tạo ra cái InputV2 -> Cái InputV2 này chúng ta muốn nó dùng được cho cả number và cả text luôn,
    + Muốn cho thằng props: UseControllerProps có cái type thì chúng ta kế thừa từ thằng InputNumberProps -> Lấy cái type từ thằng props ra để check điều kiện -> numberCondition khi mà người dùng truyền vào type là number cùng với đó là điều kiện để chỉ có thể truyền vào là số
    + Nếu nó rơi vào trường hợp này if(numberCondition || type !== 'number') thì đầu tiên sẽ là set lại localValue

        + // cập nhật localValue state để phòng thờ người dùng không truyền vào thì compo vẫn hoạt đông đúng
        + errorMessage không cần lấy từ bên ngoài truyền vào -> có thể lấy từ cái fieldState
        + Nếu như bên ngoài truyền vào cái value thì chúng ta sẽ lấy cái value còn không thì sẽ lấy cái localValue
        + Không cần phải truyền vào ref={ref} vì trong react hook form nó đã có cái ref: refCallback(ref của RHF) => nên chỗ này chỉ cần lấy ra các trường còn lại bên useController {...field}
        + Phải đặt giá trị {...field} lên trên cùng với các trường các thuộc tính có sử dụng trường field nên để ở phía trước để cho onChange ,... nó overwritten lại
        + UseControllerProps<any> -> không truyền generic type vào thì nó sẽ báo lỗi -> nên tạm thời chúng ta sẽ truyền any vào
    + Nhưng sẽ có một cái vấn đề, mặc dù cái InputV2 được khai báo gắn hơn -> nhưng vấn đề là InputV2 nó dính kèm với RHF luôn -> khi dùng RHF thì phải truyền control vào -> Vấn đề nữa là cái thz name nó không gợi ý ra cho chúng ta -> để fix được vấn đề price_max nó không gợi ý thì giống như bài học đầu video

        + Khi mà props lastName phụ thuộc vào giá trị truyền vào của props person thì chúng ta phải dùng generic type
        + Thì sẽ tham chiếu vào trong vấn đề hiện tại khi mà props name='' nó phụ thuộc cái gi trị control truyền vào

    + UseControllerProps nó yêu cầu truyền vào 2 generic type thì chúng ta cũng phải truyền vào 2 generic type cho nó(có thể tạo tên bất kì cũng được không nhất thiết phải là TFieldValues - TName)

    ********

    + Cuối cùng props nhận vào type là InputNumberProps<TFieldValues,TName> nhận vào 2 generic Type nên phải khai bao cho nó < TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>

    -> Vậy là đã hoàn thành việc tạo một InputV2
    -> Chúng ta đã hiểu được cái cách, cái cơ chế chúng ta tạo ra một cái type mà nó phụ thuộc vào cái type khác
    -> Cũng handle được useController, 1 kiểu mới , 1 cái option mới -> Nhưng mà phải truyền 'control' vào không thì nó sẽ giành cho cái formProvider
    -> Cái InputV2 chỉ dùng kết hợp với RHF, còn dùng bình thường thì không thể dùng được

-> Compoment InputNumber, Input dùng trường hợp nào cũng được -> nó đa dụng hơn nhiều

> 198 Khai báo APi purchases và fix lỗi logout chưa clear data trên React Query

    + Khai báo APi purchase và fix lỗi logout chưa clear data trên React Query -> và khai báo những APi liên quan đến Purchase
    + Khi mà đăng xuất thì sản phẩm trên giỏ hàng nó phải bị clear khỏi localStorage, và khi logout ra rồi nó vẫn gọi Api getPurchases()
        -> Vấn đề logout có thể fix bằng AppContext của chúng ta thì nó chỉ gọi Api getPurchases khi mà nó isAuthenticated

    + Muốn clear một cái Queries thì thằng react-query có hỗ trợ cho chúng ta queryClient.removeQueries() -> Thì mình sử dùng phương thức này ở khu vực /logout -> Thì mình muốn remove getPurchases() trong function logoutMutation thì viết như sau -> queryClient.removeQueries({queryKey: ['purchases', {status: purchasesStatus.inCart }], exact: true}) , exact: true là chính xác đường dẫn

    + buy-products dùng cho trường hơp nhấn vào nút mua hàng ở bên trong Cart thì lúc này không thể cập nhật số lượng đơn hàng được nữa -> chỉ có thể cập nhật đơn hàng khi mà đơn hàng vẫn còn trong giỏ hàng, nên nút 'Thêm Vào Giỏ Hàng' và 'Mua Ngay' trong productDetail đều là phương thức add-to-cart

    + Delete sẽ nhận vào các mảng purchase_id và trả về cái mảng rỗng -> Nó nhận vào 1 mảng các id string -> Khi mà đùng delete với axios thì truyền cho nó 1 cái object với data: purchaseIds -> Nó sẽ như sau
        + ('/purchases', {
          data: purchaseIds // Đây là phần config trong cái delete của axios
        })
        + Sau khi xóa thì nó trả về trạng thái như sau:
        {
          "message": "Xoá 2 đơn thành công",
          "data": {
              "deleted_count": 2
          }
        }

    + Route trang Cart cũng được bảo vệ bởi ProtectedRoute

> 199 Code UI trang Cart

    + Code UI trang Cart -> Trước khi code UI gọi cái purchasesList luôn để khởi tạo mock data làm gì cả
        +overflow-auto: khi mà màn hình nhỏ sẽ xuất hiện thanh scroll ngang

    + Chỗ danh mục sản phẩm thì nó giống cái table nhưng chúng ta sẽ thiết kế theo grid
        + Cho nó min-w-[1000px]
        + Chia giao diện trong cart giỏ hàng thành 2 phần:
          + Phần ảnh sản phẩm và tên
          + Phần từ đơn giá trở về sau
        + Ô Input sẽ cho là một cái thẻ input bọc bên ngoài là một cái thẻ div
        + flex-shrink-0 cho nó đừng có co lại, flex-grow-1 cho nó phình to ra

    + Mục sản phẩm yêu thích cũng nên khai báo thành một cái component riêng để tái sử dụng đi sử dụng lại
    + Trong cái phần giá tiền trở về sau sẽ được chia làm 5 cột và sẽ có tiêu đề chiếm 2 cột

    + Code tiếp tục phần controller -> nó sẽ là position sticky
        + Có 2 cái button là chọn tất cả và xóa
    + Chỗ Tổng thanh toán đã hiểu vì sao mà không để vào flex flex-col justify-end rồi vì đã có ml-auto nên khi thằng thẻ div thứ 2 không có diện tích để hiện lên thì nó sẽ nhảy xuống và justify-end của nó khiến nó sẽ hụt lùi vào

    + Bây giờ sẽ kiểm tra xem tại sao cái sticky nó lại không ăn -> À thì ra là chúng ta vừa kiểm tra là do có overflow-auto -> Nếu như có overflow-auto hoặc overflow-hidden nằm trong thằng cha của sticky thì nó sẽ làm cho position: sticky nó không hoạt động -> nên là chúng ta phải tắt nó đi -> Đưa ra ngoài thì nó sẽ không có được cái thanh scroll ngang khi mà chúng ta responsive

    + Khi mà mobile thì thằng ở trên sẽ là scroll, thằng bên dưới sẽ là 2 hàng

> 200 Xử lý checked state trong Cart với immerjs

    + Bài này sẽ xử lý checked state trong cart với thư viện immerJs(thư viện này dùng cho redux/toolkit), sẽ checked và unChecked trong cart component

    + Cái việc checked này chúng ta cần phải có 1 cái state để quản lí việc mà item chúng ta có checked hay là không, và cái state(checked) nó sẽ có cấu trúc giống như purchaseInCart -> Thì cái state sẽ là một cái Array chứa các phần tử sản phẩm có trong giỏ hàng --> Trong mỗi phần tử sản phẩm sẽ có thêm thuộc tính là checked -> khi click vào item số 1 thì chúng ta sẽ checked cái thằng index: 0 là true -> Chúng ta có thể tái sử dụng lại cái thằng purchasesInCart(Cart) và phải chuyển cái thằng này vào trạng thai state và thêm cho nó là thuộc tính checked
    + Với lại chỗ QuantityController thì khi tăng hoặc là giảm thì cái QuantityController nó sẽ disabled -> lúc này Api nó đang được gọi trong lúc nó đang được gọi thì chúng ta không được thao tác gì trên cái sản phẩm đó được -> Nên có 1 cái state là disabled nữa để khi mà chúng ta đang gọi Api đang thao tác trên cái item này thì chúng ta sẽ disabled cái item
    -> Tóm lại sẽ có thêm cái thuộc tính trong cái state được kế thừa từ thằng purchasesInCart đó là: disabled: boolean, checked: boolean
    -> Sẽ suy ra 1 cái state từ giá trị purchasesInCart , bình thường trong khóa học chúng ta sẽ tự hỏi bản thân là có cần thiết để tạo 1 cái state hay không -> Trong trường hợp này thì cần vì cái state chúng ta phụ thuộc vào purchasesInCart và có sự thao tác trên các sản phẩm trong cart -> Mỗi khi chúng ta thao tác trên UI thì chúng ta phải change state -> Vì thể là chúng ta cần phải tạo ra 1 cái state riêng biệt

    + Generic type sẽ kiểu mở rộng của Purchase[] -> Sẽ khai báo 1 cái type mới cho nó
    + Khi mà vào trang cart useQuery() gọi APi xong thì chúng ta sẽ setExtendedPurchase() -> dùng vòng lặp tạo ra một object với 2 thuộc tính mới là disabled và isChecked -> Nó bị lỗi là do trong trường hợp này purchaseInCart nó có thể là undefined -> Trong trường hợp mà nó là undefined thì mình sẽ lấy giá trị là một cái array rỗng
    -> Sau đó sẽ dùng extendedPurchase để render ra chứ không dùng purchaseInCart nữa, sau đó sẽ xử lý đến phần checked trong input của Cart
    -> Mỗi lần onChange trên 1 cái item thì chúng ta phải biết chúng ta đang onChange trên vị trí item nào, index của nó ở vị trí nào -> để chúng ta set lại giá trị cho isChecked -> Biết được index thì mới sửa lại được checked trong index là 2
    -> Nên sẽ viết hàm onChange nhận vào cái index -> nên sẽ sử dụng phương pháp currying -> Ở đây sẽ có 1 cái vấn đề đó cái object của chúng ta có thể dùng cú pháp map để mà tìm ra được cái sản phẩm đó rồi thay đổi cái isChecked -> Ở đây muốn giới thiệu đến cho chúng ta thư viện có tên là immerjs(reduxtoolkit nó có dùng thư viện này để đơn giản hóa vấn đề change state) -> 1 cái thư viện rất là hay tại sao chúng ta không dùng -> Trong cái docs của immerjs thích thì chúng ta có thể cài thêm useImmer

    -> Thì ở đây cách nhanh nhất để change cái statae extendedPurchases mà không cần tìm đến cái index đấy (bằng cách dùng hàm map()) khỏi bị tham chiếu này nọ thì dùng produce của immerjs -> gọi cái produce() trong này nó sẽ có một cái callback nhận vào tham số là một cái draft(tham số) sẽ đại diện cho extendedPurchasesPrev -> sẽ handle giá trị trong này ví dụ: setExtendedPurchases(produce(draft => {})) -> mặc dù mutate trong React là sự cấm kị nhưng chúng ta vẫn thay đổi được thông qua thư viện immerjs rất là easy mà không làm ảnh hưởng đến logic code

    + Nếu mà có product trong Cart đã được checked thì khi nhấn chọn tất cả sẽ chọn tất cả kể cả những sản phẩm đã được checked rồi -> Và ngược lại khi click bỏ chọn tất cả thì nó sẽ bỏ chọn hết tất cả các sản phẩm


    //*********************************** */
    + Thì để biết là nó đang được chọn tất cả hay không thì mình sẽ tạo 1 cái biến -> thì cái biến này có thể tự suy ra được từ cái `state` đã có sẵn nên khỏi phải tạo state để làm gì -> Thì tạo 1 cái biến isAllChecked(có đang được checked hay không) -> Thì dùng extendedPurchase và phương thức every() để xem có đang được checked hay không
        -> const isAllChecked = extendedPurchase.every(purchase => purchase.checked)
        -> Thì nếu khi mỗi sản phẩm dều được checked thì nó sẽ trả về true còn không thì false

    + Handle tiếp sự kiện khi chúng ta click vào chọn tất cả thì nó sẽ như thế nào -> sẽ tạo hàm xử lý check all các sản phẩm -> thì sẽ set lại ExtendedPurchase -> thì sẽ duyệt qua cái array extendedPurchases và phủ đinh lại cái isAllChecked -> nó sẽ như sau
        -> const handleCheckedAll = () => {
          setExtendedPurchases(prev => prev.map(purchase => ({
            ...purchase,
            checked: !isAllChecked
          })))
        }
        -> Thay đổi input thì chỉ có thể dùng onChange -> không thể dùng onClick

> 201 Xử lý update đơn hàng trong Cart

    + Xử lý update đơn hàng trong Cart

    + Để ý rằng mỗi khi tăng  thì nó sẽ gọi Api và disabled cái sản phẩm đang được gọi APi đi, và cũng lưu ý rằng khi mà nhập input thì nó cũng ko gọi Api chỉ khi nhập số xong và outFocus ra khởi ô Input thì nó sẽ gọi Api -> Nên chúng ta sẽ handle theo kiểu như vậy luôn
    + Dùng useMutation gọi và xử lý update product Cart
    + Nhưng mà ở đây sẽ có 1 cái vấn đề đó là khi mà update thành công thì phải gọi lại cái Api getPurchases để cho nó cập nhật lại số lượng của một sản phẩm trong cart

    + Hàm xử lý số lượng trong Cart thì để biết đang change cái Quantity của sản phẩm nào thì chúng ta cũng đưa vào cái purchaseIndex và cái arg là value -> Lấy ra cái sản phẩm cụ thể
        + const purchase = extendedPurchases[purchaseIndex] -> lấy ra cái purchase cụ thể
        + Cái value khi mà tăng giảm sẽ có được cái value
    + Khi bắt đầu gọi cái Api change cái purchase của mình thì chúng ta phải disabled cái thằng <input /> không cho người dùng tăng nữa khi mà đang gọi Api, khi mà gọi xong
    + Khi nhấn mà vẫn disabled là do minh nhấn chuyển thành true xong mà mình không reset nó lại -> thì để mà reset nó lại khi mà chúng ta callApi xong thì chúng ta phải set nó lại hoặc là sẽ có cái cách này
        + ********* Khi mà Gọi Api xong thì mình sẽ refetch lại cái query getPurchases() để cho nó reset cái disabled lại thành false
        -> sử dụng queryClient.invalidateQueries({queryKey: }) -> call lại Api getPurchases() -> Khi  mà thằng này gọi lại thì chúng ta có thể reset cái checked
    + Nhưng bây giờ refetch() nó sẽ gặp vấn đề về checked còn cái disabled thì nó sẽ reset về lại false rồi -> còn cái checked thì khi mà chúng ta checked rồi tăng số lượng thì sau khi tăng số nó sẽ gọi lại Api getPurchases thì nó sẽ set lại cái checked: false -> Nên chúng ta sẽ fix cái lỗi này -> Thì chúng ta sẽ sử dụng cái Boolean() để kiểm tra cái draft[purchaseIndex] nếu nó đang checked thì phải giữ nguyên còn không thì thôi -> Hông lẻ mỗi lần tăng giảm QuantityPurchase tìm ra thằng purchase nào đang thay đổi thì giữ nguyên thuộc tính checked -> Làm như vậy sẽ mắc công -> Trong thư viện lodash có hỗ trợ chúng ta phương thức để tìm ra cho nhanh
        -> Trong lodash sẽ có method là keyby -> Chúng ta sẽ keyby theo cái purchaseId(sẽ lấy trị của purchasesId ra làm cái key value sẽ là các object của từng purchase trong array) thì mình sẽ tìm được cái purchase mà mình đang thao tác là thằng nào
        -> Bây giờ mình muốn tìm một thằng nào dựa vào cái _id thì rất là dễ -> Ví dụ muốn lấy ra giá trị checked của thằng có _id 2 số cuối là ....47 thì chỉ cần extendedPurchasesObject[purchase._id] là sẽ ra cái object của thằng _id dấy đi rồi chỉ cần .isChecked là nó sẽ trả ra giá trị của isChecked
        -> Chỗ isChecked: chúng ta sẽ dùng Boolean() cho nó chắc chắn bởi vì extendedPurchasesObject nhiều khi có thể là undefined
        -> Đôi khi cái extendedPurchasesObject nó chưa được kế thừa từ purchasesInCart nên đôi khi nó sẽ không có thuộc tính là isChecked -> Nên đôi khi mà chúng ta gọi cái isChecked mà có giá trị là undefined thì nó sẽ bị lỗi ngay
              -> Nên phải viết như này thì nó mới sẽ không bị lỗi
                  -> Boolean(extendedPurchasesObject[purchase._id]?.isChecked)
        -> Ban đầu thì thằng extendedPurchasesObject nó sẽ không có bởi vì ban đầu chúng ta chưa thao tác đến QuantityController nên thằng getPurchases() nó sẽ chưa có gọi lại -> Chỉ sau khi thao tác với Quantity thì thằng getPurchases() nó sẽ được gọi lại thì lúc này extendedPurchasesObject nó đã có giá trị rồi thì sẽ thực hiện được theo đúng logic như trong code
              -> Khi có giá trị rồi mới có thể thực hiện được đoạn code này
                  ->? isChecked: Boolean(extendedPurchasesObject[purchase._id]?.isChecked) -> Dù bỏ dấu ? ra không có lỗi nhưng cũng phải bỏ vào cho nó chắc và dùng thêm cú pháp Boolean lờ như nó có undefined khu vực đó thig cũng chuyển nó thành false

      + Chúng ta sẽ tạo ra nhiều vấn đề, để mn biết rằng cái bài toán chúng ta không hề đơn giản

        -> Thì ở đây chúng ta thấy khi mà Quantity đang ở số lượng là 1 mà chúng ta click giảm nữa thì nó vẫn gọi Api updatePurchase mặc dù giá trị vẫn là 1 mà không bị giảm xuống là 0 nhưng api nó vẫn gọi lại hoặc là Quantity ở giá trị max rồi thì không cho tăng nữa
        -> Thì để xử lý vấn đề đấy thì chúng ta sẽ handle trong hàm handleQuantity thì trong hàm này mình sẽ truyền thêm cái arg là enabled -> khi mà enabled là true thì mới thực thi các hành dộng

        -> Ở Increase thì chỉ khi value < max thì mới  cho chạy handleQuantity, còn Decrease thì value > 1

      + Về phần onType khi mà chúng ta outFocus khỏi ô input thì sẽ gọi APi, chứ vừa nhập input vừa gọi APi thì nó dở quá -> Nên chõ này chúng ta sẽ dùng sự kiện là onBlur để thao tác -> Nhưng mà component QuantityController hiện tại nó không cho phép sử dụng onBlur -> Nên là chúng ta sẽ tạo thêm 1 cái props để cho nó hỗ trợ vấn đề này -> Sẽ tạo thêm 1 props là onFocusOut nó cũng giống mấy cái props event khác(onType, onIncre, onDecre)

      + Sẽ xử lý onType và onFocusOut sẽ tạo ra hàm handleTypeQuantity để xử lý onChange và  onFocusOut sẽ sử dụng lại logic hàm handleQuantity

> 202 Xử lý xóa đơn hàng và mua sản phẩm

    + Xử lý xóa đơn hàng và mua sản phẩm ở trong Cart -> Sẽ thực hiện xóa đơn hàng và mùa sản phẩm

    + Đầu tiên sẽ xử lý việc xóa sản phẩm trong cart trước

    + Tạo cái method handleDelete dùng để xóa 1 sản phẩm hoặc xóa nhiều sản phẩm -> Dùng currying để thực hiện việc này

        + Muốn xóa sản phẩm nào thì đầu tiên phải lấy cái purchaseId của sản phẩm muốn xóa đó
        + Như vậy để delete nhiều purchase thì chúng ta cần phải lấy ra cái mảng nên tạo ra thêm cái
        + Tạo ra cái biến để những thằng được checked thì sẽ được xóa cùng một lúc -> tạo ra biến checkedPurchases để lưu các purchase được checked -> mục đích dùng để xóa hết các purchase được checked
            -> const checkedPurchases = extendedPurchases.filter(purchase => purchase.checked) -> lấy ra các purchase checked là true
        + Và lấy ra độ dài các checkedPurchases -> để render ra cái thanh tổng thành toán

    + Tạo cái hàm hoặc là biến tính tổng giá tiền của purchase khi đã được checked và 1 cái hàm hoặc biến tính giá tiết kiệm được là bao nhiêu

    + Tạo hàm handleBuyPurchase -> Thì mình sẽ kiểm tra nếu checkedPurchase là true(ít nhất phải là một sản phẩm được checked) thì chúng ta mới cho phép người dùng nhấn vào nút Mua Ngay -> checkedPurchase.length > 0  thì mới cho phép người ta nhấn vào nút 'Mua Ngay'
        -> Chúng ta sẽ map() nó ra -> mục đích của việc map() là mình sẽ lấy ra cái array chứa các object chỉ có 2 thuộc tính là product_id và buy_count
    -> Và cũng nên có thuộc tính disabled để mà khi người dùng đang mua hàng thì chúng ta sẽ disabled cái nút đó đi -> khi nào mua hàng thành công thì sẽ hiện nút đó lại -> sẽ lấy ra gia trị `isLoading` của buyPurchasesMutation
    -> Fix tí giao diện -> chỗ cart không có đơn nào  thì nên xóa nó đi -> Thì cái extendedPurchases.length nó luôn luôn là cái purchase chứ nó không phải nên không cần chấm hỏi vào `?.length`

> 203 Code UI Cart layout và custom hook useSearchProducts

    + Sẽ code UI Cart layout và custom hook useSearchProducts
    + Phần header có thể kế thừa từ thằng header register
    + Thanh search cũng có thể kế thừa cái logic từ thanh search bên header -> giao diện có thể code mới lại tí

    + Thì sẽ đưa cái header của Header component vào trong vào component riêng để dùng đi dùng lại được
    + Component dùng di dùng lại ở nhiều chỗ khác nhau thì nên tạo 1 cái component riêng -> Còn component chỉ dùng trong 1 cái page thì nên tạo component trong page đó thôi
    + Sẽ tạo 1 cái component dành riêng cho thằng Cart -> đặt tên cho nó là CartHeader -> Sẽ tiến hành code layout của CartHeader , nó có cái border-b phía dưới

    + Thật ra chúng ta có thể kế thừa từ cái MainLayout hoặc là RegisterLayout -> 2 thằng này chỉ khác nhau là Header thôi -> Nên có thể tạo ra 1 cái layout duy nhất -> Xong rồi truyền component động vào dưới dạng 1 cái props
    + Chúng ta không nên can hiệp vào cái màu của thằng Header -> nên tạo một cái thẻ div bên ngoài để thêm màu vào
    + Tiếp tục code logic của thằng search

    -> Tạo ra hook useSearchProducts để tái dùng đi dùng lại logic search ra sản phẩm
    -> Thiếu cả onSubmitSearch và register{...} cho CartHeader nên trong cái custom hook useSearchProducts chúng ta sẽ return về cái đấy -> Chúng ta sẽ return về một cái object

> 204 Phân tích và làm chức năng mua ngay tương tự shopee

    + Sẽ phân tích và làm chức năng mua ngay tương tự Shopee
    + Khi mà chúng ta đang ở trang productDetail thì khi nhấn 'Mua Ngay' thì nó sẽ vào trang Cart và tự động click vào checked của cái sản phẩm đó -> Phải có gì đó giao tiếp giữa page trước và page sau -> Để cái page sau này biết được là thằng này vừa được chọn ở page trước
    + Thì ở đây sẽ có một số options để giao tiếp như sau
        + Chúng ta có thể dùng state để giao tiếp giữa các trang
        + Dùng contextApi để giao tiếp giữa các trang
        + Hoặc ở đây có thể dùng cách đơn giản hơn -> giao tiếp giữa các trang trong React -> Có thể dùng bằng các state của router -> đã học cái bài navigate giữa các trang dùng state -> Chuyển cái state từ page productDetail chuyển sang cái page Cart của chúng ta -> Khi nhấn vào button 'Mua Ngay' sẽ add cái product đó vào cái giỏ hàng -> Sau khi thêm vào giỏ hàng thành công thì chúng ta sẽ có cái purchaseId -> Xong rồi sẽ tiếp tục navigate từ cái trang productDetail qua trang Cart kèm với cái state là purchaseId đó -> Khi mà qua được cái trang giỏ hàng rồi chúng ta sẽ render cái getPurchases ra và chúng ta sẽ kiểm tra coi thử có cái state purchaseId từ bên cái router hay không nếu có thì chúng ta sẽ checked cái purchase đó
        -> Có 1 cái vấn đề nữa là khi chúng ta F5 lại thì cái state trên router vẫn còn -> Vậy nên công việc của chúng ta khi chúng ta F5 lại thì cái state đó chúng ta phải clear đi

    + handleBuyNow cũng là addToCart

        + Trong cái option của navigate thì chúng ta sẽ truyền vào cái state của cái purchase đó là một cái object có purchaseId
            -> Nó sẽ có kiểu như này {purchaseId: purchase._id}
        + Sau khi lưu cái state trên router thì chúng ta sẽ dùng useLocation() để lấy cái state đó ra từ bên cái page đã được diều hướng
          -> Trừ khi chuyển trang quay lại thì nó mới mất, còn khi F5 lại thì cái state đó vẫn còn -> Nên chúng ta sẽ xử lý điều đó -> chúng ta sẽ clear cái state đó khi mà chúng ta F5 lại
          => location.state nó sẽ kiểu là any -> nhưng chúng ta không muốn điều đó chúng ta muốn cho nó có kiểu nhất định
          => Chúng ta sẽ truyền vào cái useEffect() => để khi page chúng ta vừa load nó gọi Api xong thì có cái purchaseInCart để chúng ta set -> Thì chúng ta sẽ checked chỗ này(Trong lúc set cái purchaseInCart -> extendedPurchase)

          => Nên chỗ này chúng ta sẽ return
              + Sẽ kiểm tra thử xem có purchaseChoosenPurchase được chọn từ bên productDetail hay không
              + Khi nhấn vào nút 'Mua Ngay' thì nó sẽ add thêm 1 sản phẩm mới vào giỏ hàng rồi nó navigate qua trang giỏ hàng đó(đồng thơi có gửi kèm theo cái state có dạng như sau) `{stata: {purchaseId: purchase._id}}`

        + Và xử lý khi F5 lại sẽ mất cái checked đó -> Chúng ta sẽ xóa cái state trong router -> thì cái này người ta hay gọi là xóa cái state trong history
              + Thời xưa khi dùng react-router V5 nó có cái useHistory -> Còn qua bên react-routet V6 thì nó hơi khác một tí nó không còn cái history nữa thay vào đó chúng ta có thể sử dụng Api có sẵn trong trình duyệt luôn
                  -> Cú pháp là History.replaceState()
                  => History.replaceState() sẽ nhận vào 3 tham số (stateObj ,unused, url)
                        + stateObj: chúng ta có thể set nó thành null của cái Url nào đấy
                        + únused: cái parameter tồn tại vì mục đích là lịch sử thôi -> Thường người ta sẽ truyền vào một cái string rỗng
                        + url là một cái option =-> Url thường sẽ không cần truyền

              + Cái logic chúng ta sẽ là khi mà chúng ta F5 lại thì chúng ta sẽ xóa cái state trên router đi

            -> Thì chúng ta sẽ sử dụng cái này trong clean up function của useEffect -> chúng ta sẽ dùng hẳn
        + Chúng ta sẽ làm behavior như là shopee
              + Khi mà chúng ta checked rồi mình chuyển sang trang thì rồi vào lại Cart thì cái purchase nó vẫn được checked
              + Nếu chúng ta lưu cái những cái state checked này vào trong cái component Cart của chúng ta và chúng ta rời khỏi cái component Cart này thì cái state của chúng ta sẽ bị reset lại ngay -> Nhưng mà cái logic của thằng shopee nó không bị reset -> nó chỉ bị reset lại khi mà chúng ta F5 lại thôi -> thì chúng ta nghĩ cái này nó sẽ lưu vào state redux hoặc là trong cái globalState để khi mà chúng ta F5 lại thì nó biến mất, khi mà chuyển trang bình thường thì nó vẫn còn
              => Dự án chúng ta dùng ContextApi nên chúng ta sẽ lưu những cái này vào contextApi hay vì chúng ta lưu những thằng này trong component Cart(chi tiết hơn là page Cart)

        + Hay vì chúng ta lưu extendedPurchase trong cái page Cart -> Thì chúng ta sẽ lưu nó trong contextApi của dự án
        + Nếu mà chúng ta thấy trong đây nhiều quá thì chúng ta có thể khai báo thêm cái object Cart => Trong cái object Cart sẽ chứa 2 thằng extendedPurchases và setExtendedPurchases -> Thì cái Object Cart đó sẽ giành riêng cho thằng Cart -> Cứ để chung vào thôi vì chúng ta đã dùng React-query thì nó handle rất tốt cái việc chúng ta lưu vào globalState
          -> Nên chúng ta giao tiếp không cần dùng globalState nữa, chúng ta dùng cái react-query giao tiếp nó rất là tốt rồi

        + cắt cái type ExtendedPurchases rồi qua bên purchase.type.ts để khai báo -> Nên dùng AppContext áp dụng cho những state global của chúng ta
            -> Sau khi đã làm được cái behavior như shopee rồi -> sẵn tiện improve một chút về cái performance
            -> Thì cái Cart chúng ta nó tính toán khá là nhiều ở những cái biến có method every(), some() , filter()
            -> Chúng ta dùng những cái useMutation() hoặc là useQuery() chằng hạn nó có rất là nhiều trạng thái như isLoading, isFetching, true, false ,... các kiểu nó sẽ làm cho component của chúng ta re-render lại hoài -> Mỗi lần nó re-render thì nó lại tính toán lại cái thằng Cart -> Thì sẽ dùng useMemo() nhưng sẽ dùng đúng và đủ cái dependency -> Truyền không đúng thì nó sẽ bị lỗi ngay
            -> Những thằng mà nó return về thì nó mới tính toán lại, còn những thằng lấy ra cái thuộc tính thì nó không có tính toán lại
                -> Biến thì dùng useMemo(), function thì dùng useCallback() , vì biến return về giá trị, còn function return về hàm(callback)

        + Chúng ta sẽ làm luôn mục khi mà giỏ hàng còn trống thì nó sẽ không hiển thị ra gì hết -> ba đầu purchasesInCart là một cái arr rỗng, thì Boolean([]) luôn luôn là true nên phải cho cái length của nó > 0 thì mới render ra
        + Mình thì  thích cái thẻ div bao quanh bức ảnh hơn ->

> > > > > > > > > > > > > > > > > > > > > > Chương 23 Clone shopee nâng cao & performance

> > > > > > > > > > > > > > > > > > > > > > Chương 24 SEO cho react

> > > > > > > > > > > > > > > > > > > > > > Chương 25 unit Test & Integration Test cho project Clone Shopee

> > > > > > > > > > > > > > > > > > > > > > Chương 26 Storybook cho React

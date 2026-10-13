// ===================== ตัวแปรเก็บข้อมูล =====================

// ตะกร้าสินค้า เก็บเป็น array ของ object เช่น
// { id: "1", name: "มาม่ารสหมูสับ", price: 8, quantity: 2 }
let cart = [];

// ===================== ดึง element จากหน้าเว็บมาเก็บไว้ในตัวแปร =====================
const searchInput    = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const products       = document.querySelectorAll(".product");   // สินค้าทุกชิ้น
const noResult       = document.getElementById("no-result");

const cartCount  = document.getElementById("cart-count");
const emptyCart  = document.getElementById("empty-cart");
const cartTable  = document.getElementById("cart-table");
const cartBody   = document.getElementById("cart-body");
const totalPrice = document.getElementById("total-price");
const clearBtn   = document.getElementById("clear-btn");

const checkoutForm = document.getElementById("checkout-form");
const orderMessage = document.getElementById("order-message");


// ===================== ส่วนที่ 1: ค้นหาและกรองสินค้า =====================

function filterProducts() {
    const keyword  = searchInput.value.toLowerCase();   // คำค้นหา (แปลงเป็นตัวพิมพ์เล็ก)
    const category = categorySelect.value;              // หมวดหมู่ที่เลือก
    let foundCount = 0;                                 // นับจำนวนสินค้าที่ตรงเงื่อนไข

    // วนลูปตรวจสินค้าทีละชิ้น
    products.forEach(function (product) {
        const name = product.dataset.name.toLowerCase();
        const productCategory = product.dataset.category;

        // เงื่อนไข 1: ชื่อสินค้าต้องมีคำที่ค้นหา
        const matchName = name.includes(keyword);
        // เงื่อนไข 2: หมวดหมู่ตรงกัน (หรือเลือก "ทุกหมวดหมู่")
        const matchCategory = (category === "all") || (productCategory === category);

        if (matchName && matchCategory) {
            product.classList.remove("hidden");   // แสดงสินค้า
            foundCount++;
        } else {
            product.classList.add("hidden");      // ซ่อนสินค้า
        }
    });

    // ถ้าไม่เจอสินค้าเลย ให้แสดงข้อความ "ไม่พบสินค้า"
    if (foundCount === 0) {
        noResult.classList.remove("hidden");
    } else {
        noResult.classList.add("hidden");
    }
}

// เรียกใช้ filterProducts ทุกครั้งที่พิมพ์ หรือเปลี่ยนหมวดหมู่
searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);


// ===================== ส่วนที่ 2: เพิ่มสินค้าลงตะกร้า =====================

function addToCart(id, name, price) {
    // ค้นหาว่ามีสินค้านี้อยู่ในตะกร้าแล้วหรือยัง
    const item = cart.find(function (i) {
        return i.id === id;
    });

    if (item) {
        item.quantity++;   // มีแล้ว -> เพิ่มจำนวน
    } else {
        // ยังไม่มี -> เพิ่มสินค้าใหม่เข้า array
        cart.push({ id: id, name: name, price: price, quantity: 1 });
    }

    renderCart();   // อัปเดตการแสดงผลตะกร้า
}

// ผูกเหตุการณ์คลิกให้ปุ่ม "เพิ่มลงตะกร้า" ทุกปุ่ม
document.querySelectorAll(".add-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        // button.parentElement คือ <article> ที่ครอบปุ่มนี้อยู่
        const product = button.parentElement;

        const id    = product.dataset.id;
        const name  = product.dataset.name;
        const price = Number(product.dataset.price);   // แปลงข้อความเป็นตัวเลข

        addToCart(id, name, price);
    });
});


// ===================== ส่วนที่ 3: แสดงผลตะกร้า =====================

function renderCart() {
    cartBody.innerHTML = "";   // ล้างแถวเก่าออกก่อน แล้วสร้างใหม่ทั้งหมด
    let total = 0;             // ราคารวม
    let count = 0;             // จำนวนชิ้นรวม

    cart.forEach(function (item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        count += item.quantity;

        // สร้างแถวของตาราง 1 แถวต่อสินค้า 1 รายการ
        // data-id เก็บรหัสสินค้าไว้ให้ปุ่มอ่านตอนถูกกด
        cartBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>
                    <button class="minus-btn" data-id="${item.id}">-</button>
                    ${item.quantity}
                    <button class="plus-btn" data-id="${item.id}">+</button>
                </td>
                <td>${subtotal}</td>
                <td><button class="remove-btn" data-id="${item.id}">ลบ</button></td>
            </tr>
        `;
    });

    // อัปเดตตัวเลขต่าง ๆ บนหน้าเว็บ
    totalPrice.textContent = total;
    cartCount.textContent = count;

    // ถ้าตะกร้าว่าง ให้แสดงข้อความ ถ้ามีสินค้าให้แสดงตาราง
    if (cart.length === 0) {
        emptyCart.classList.remove("hidden");
        cartTable.classList.add("hidden");
    } else {
        emptyCart.classList.add("hidden");
        cartTable.classList.remove("hidden");
    }
}


// ===================== ส่วนที่ 4: ปุ่ม + - ลบ ในตะกร้า =====================

// ปุ่มในตะกร้าถูกสร้างใหม่ทุกครั้งที่ renderCart()
// จึงผูกเหตุการณ์ไว้ที่ cartBody แทน แล้วดูว่าปุ่มไหนถูกกด
cartBody.addEventListener("click", function (event) {
    const button = event.target;        // element ที่ถูกคลิกจริง ๆ
    const id = button.dataset.id;       // รหัสสินค้าของปุ่มนั้น

    if (!id) return;   // ถ้าไม่ได้คลิกที่ปุ่ม ให้จบการทำงาน

    // หาสินค้านั้นในตะกร้า
    const item = cart.find(function (i) {
        return i.id === id;
    });

    if (button.classList.contains("plus-btn")) {
        item.quantity++;
    } else if (button.classList.contains("minus-btn")) {
        item.quantity--;
        if (item.quantity === 0) {
            removeFromCart(id);   // ลดจนเหลือ 0 ให้ลบออกจากตะกร้า
        }
    } else if (button.classList.contains("remove-btn")) {
        removeFromCart(id);
    }

    renderCart();
});

function removeFromCart(id) {
    // filter เก็บเฉพาะสินค้าที่ id ไม่ตรงกับที่ต้องการลบ
    cart = cart.filter(function (i) {
        return i.id !== id;
    });
}

// ปุ่มล้างตะกร้า
clearBtn.addEventListener("click", function () {
    cart = [];
    renderCart();
});


// ===================== ส่วนที่ 5: ยืนยันการสั่งซื้อ =====================

checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();   // ป้องกันหน้าเว็บรีโหลดตอนกดส่งฟอร์ม

    // ถ้าตะกร้าว่าง ไม่ให้สั่งซื้อ
    if (cart.length === 0) {
        alert("กรุณาเลือกสินค้าลงตะกร้าก่อนสั่งซื้อ");
        return;
    }

    const name  = document.getElementById("name").value;
    const total = totalPrice.textContent;

    // แสดงข้อความแจ้งผลการสั่งซื้อ
    orderMessage.textContent = "ขอบคุณคุณ " + name + " ที่สั่งซื้อ ยอดชำระทั้งหมด " + total + " บาท";
    orderMessage.classList.remove("hidden");

    // เคลียร์ตะกร้าและฟอร์มหลังสั่งซื้อเสร็จ
    cart = [];
    renderCart();
    checkoutForm.reset();
});


// ===================== เริ่มต้นการทำงาน =====================
renderCart();   // แสดงตะกร้าครั้งแรก (ตอนนี้ยังว่างอยู่)
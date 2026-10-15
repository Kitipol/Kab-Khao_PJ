// ===================== ค่าตั้งต้น =====================
const STORAGE_KEY = "pumpuang_cart";   // ชื่อที่ใช้เก็บตะกร้าในเบราว์เซอร์
const FREE_FROM   = 200;               // ซื้อครบเท่านี้ส่งฟรี
const DELIVERY_FEE = 20;               // ค่าส่งถ้ายังไม่ครบ
const REQUIRE_LOGIN = true;            // true = ต้องล็อกอินก่อนกดสั่งซื้อ / false = สั่งได้เลย

// ตะกร้า: array ของ { id, name, price, unit, img, quantity }
let cart = loadCart();

// ===================== ดึง element =====================
const searchInput    = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const products       = document.querySelectorAll(".product");
const noResult       = document.getElementById("no-result");

const openCartBtn  = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const drawer       = document.getElementById("cart-drawer");
const overlay      = document.getElementById("overlay");

const cartCount    = document.getElementById("cart-count");
const itemCount    = document.getElementById("item-count");
const cartList     = document.getElementById("cart-list");
const emptyCart    = document.getElementById("empty-cart");
const checkoutArea = document.getElementById("checkout-area");
const clearBtn     = document.getElementById("clear-btn");

const checkoutForm = document.getElementById("checkout-form");
const dialog       = document.getElementById("confirm-dialog");
const orderMessage = document.getElementById("order-message");

const baht = (n) => "฿" + n.toLocaleString("th-TH");


// ===================== ส่วนที่ 1: ค้นหาและกรองสินค้า =====================
function filterProducts() {
    const keyword  = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    let foundCount = 0;

    products.forEach(function (product) {
        const matchName = product.dataset.name.toLowerCase().includes(keyword);
        const matchCategory = category === "all" || product.dataset.category === category;

        if (matchName && matchCategory) {
            product.classList.remove("hidden");
            foundCount++;
        } else {
            product.classList.add("hidden");
        }
    });

    noResult.classList.toggle("hidden", foundCount > 0);
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);


// ===================== ส่วนที่ 2: เก็บ/โหลดตะกร้า =====================
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}


// ===================== ส่วนที่ 3: เพิ่มสินค้าลงตะกร้า =====================
function addToCart(product) {
    const item = cart.find((i) => i.id === product.id);

    if (item) {
        item.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();

    // เด้งตัวเลขบนปุ่มตะกร้าให้รู้ว่าเพิ่มแล้ว
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;          // รีสตาร์ทแอนิเมชัน
    cartCount.classList.add("bump");
}

document.querySelectorAll(".add-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        const p = button.closest(".product");
        addToCart({
            id:    p.dataset.id,
            name:  p.dataset.name,
            price: Number(p.dataset.price),
            unit:  p.dataset.unit || "ชิ้น",
            img:   p.querySelector("img").getAttribute("src")
        });
    });
});


// ===================== ส่วนที่ 4: แสดงผลตะกร้า =====================
function renderCart() {
    let subtotal = 0;
    let count = 0;

    cartList.innerHTML = cart.map(function (item) {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        count += item.quantity;

        return `
        <li class="item" data-id="${item.id}">
            <img class="item__img" src="${item.img}" alt="">
            <div>
                <h3 class="item__name">${item.name}</h3>
                <p class="item__price">${baht(item.price)} / ${item.unit}</p>
            </div>
            <div class="item__total">${baht(lineTotal)}</div>
            <div class="item__controls">
                <div class="qty" role="group" aria-label="จำนวน ${item.name}">
                    <button type="button" data-action="dec" aria-label="ลดจำนวน">−</button>
                    <span class="qty__num">${item.quantity} ${item.unit}</span>
                    <button type="button" data-action="inc" aria-label="เพิ่มจำนวน">+</button>
                </div>
                <button type="button" class="item__remove" data-action="remove">เอาออก</button>
            </div>
        </li>`;
    }).join("");

    const isEmpty = cart.length === 0;
    const delivery = (isEmpty || subtotal >= FREE_FROM) ? 0 : DELIVERY_FEE;

    emptyCart.classList.toggle("hidden", !isEmpty);
    checkoutArea.classList.toggle("hidden", isEmpty);

    cartCount.textContent = count;
    itemCount.textContent = cart.length;
    document.getElementById("sum-subtotal").textContent = baht(subtotal);
    document.getElementById("sum-delivery").textContent = delivery === 0 ? "ฟรี" : baht(delivery);
    document.getElementById("total-price").textContent  = baht(subtotal + delivery);

    const missing = FREE_FROM - subtotal;
    document.getElementById("delivery-hint").textContent =
        isEmpty ? "" : (missing > 0 ? "ซื้ออีก " + baht(missing) + " ส่งฟรี" : "ได้ส่งฟรีแล้ว");

    saveCart();
}


// ===================== ส่วนที่ 5: ปุ่ม + - เอาออก ในตะกร้า =====================
// ปุ่มถูกสร้างใหม่ทุกครั้งที่ renderCart() จึงฟังเหตุการณ์ที่ cartList แทน
cartList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.closest(".item").dataset.id;
    const item = cart.find((i) => i.id === id);
    const action = button.dataset.action;

    if (action === "inc") item.quantity++;
    if (action === "dec") item.quantity--;
    if (action === "remove") item.quantity = 0;

    cart = cart.filter((i) => i.quantity > 0);   // เหลือ 0 = ลบออก
    renderCart();
});

clearBtn.addEventListener("click", function () {
    if (confirm("ล้างสินค้าทั้งหมดในตะกร้า?")) {
        cart = [];
        renderCart();
    }
});


// ===================== ส่วนที่ 6: เปิด/ปิดหน้าต่างตะกร้า =====================
function openCart() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
    closeCartBtn.focus();
}

function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.add("hidden");
    document.body.classList.remove("no-scroll");
    openCartBtn.focus();
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("btn-shop").addEventListener("click", function () {
    closeCart();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
});


// ===================== ส่วนที่ 7: ยืนยันการสั่งซื้อ =====================
checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (cart.length === 0) return;

    // ยังไม่ล็อกอิน -> ไปหน้าเข้าสู่ระบบ (ตะกร้าไม่หาย เพราะเก็บไว้ในเบราว์เซอร์)
    if (REQUIRE_LOGIN && !getCurrentUser()) {
        alert("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ ตะกร้าของคุณจะยังอยู่ครบ");
        window.location.href = "login.html";
        return;
    }

    const name  = document.getElementById("name").value;
    const total = document.getElementById("total-price").textContent;

    // TODO: ส่งข้อมูลไปหลังบ้านตรงนี้ (cart, ชื่อ, เบอร์, ที่อยู่, หมายเหตุ)

    orderMessage.textContent =
        "ขอบคุณคุณ " + name + " ที่สั่งซื้อ ยอดชำระทั้งหมด " + total +
        " รถพุ่มพวงจะนำของไปส่งตามที่อยู่ที่แจ้งไว้";

    cart = [];
    renderCart();
    checkoutForm.reset();
    fillUserInfo();
    closeCart();
    dialog.showModal();
});

document.getElementById("dialog-close").addEventListener("click", function () {
    dialog.close();
});


// ===================== ส่วนที่ 8: สถานะล็อกอิน =====================
const loginLink = document.getElementById("login-link");
const userMenu  = document.getElementById("user-menu");

// สลับระหว่าง "เข้าสู่ระบบ" กับ "สวัสดี คุณ... ออกจากระบบ"
function updateAuthUI() {
    const user = getCurrentUser();
    loginLink.classList.toggle("hidden", !!user);
    userMenu.classList.toggle("hidden", !user);
    if (user) {
        document.getElementById("user-name").textContent = user.name;
    }
}

// ใส่ชื่อ เบอร์ ที่อยู่ ในฟอร์มสั่งซื้อให้อัตโนมัติ
function fillUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById("name").value    = user.name;
    document.getElementById("phone").value   = user.phone;
    document.getElementById("address").value = user.address || "";
}

document.getElementById("logout-btn").addEventListener("click", function () {
    logout();
    checkoutForm.reset();
    updateAuthUI();
});


// ===================== เริ่มต้นการทำงาน =====================
updateAuthUI();
fillUserInfo();
renderCart();
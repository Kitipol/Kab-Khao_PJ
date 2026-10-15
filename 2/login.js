// ===================== ดึง element =====================
const tabLogin     = document.getElementById("tab-login");
const tabRegister  = document.getElementById("tab-register");
const loginForm    = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const message      = document.getElementById("message");

const PHONE_PATTERN = /^0\d{8,9}$/;   // เบอร์ไทย 9-10 หลัก ขึ้นต้นด้วย 0

// ล็อกอินอยู่แล้ว ไม่ต้องมาหน้านี้ ส่งกลับหน้าร้าน
if (getCurrentUser()) {
    window.location.href = "index.html";
}

// ===================== สลับแท็บ =====================
function showTab(which) {
    const isLogin = which === "login";
    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    tabLogin.setAttribute("aria-selected", isLogin);
    tabRegister.setAttribute("aria-selected", !isLogin);
    showMessage("");
}

function showMessage(text) {
    message.textContent = text;
    message.classList.toggle("hidden", !text);
}

tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));
document.querySelectorAll("[data-go]").forEach(function (btn) {
    btn.addEventListener("click", () => showTab(btn.dataset.go));
});

// ไปหน้าร้านหลังสำเร็จ
function goHome() { window.location.href = "index.html"; }

// ===================== เข้าสู่ระบบ =====================
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const phone    = document.getElementById("login-phone").value.trim();
    const password = document.getElementById("login-password").value;
    const button   = loginForm.querySelector("button[type='submit']");

    button.disabled = true;
    const result = await loginUser(phone, password);
    button.disabled = false;

    if (result.ok) {
        goHome();
    } else {
        showMessage(result.error);
    }
});

// ===================== สมัครสมาชิก =====================
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name     = document.getElementById("reg-name").value.trim();
    const phone    = document.getElementById("reg-phone").value.trim();
    const address  = document.getElementById("reg-address").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm  = document.getElementById("reg-confirm").value;

    // ตรวจข้อมูลก่อนสมัคร
    if (!PHONE_PATTERN.test(phone)) {
        showMessage("กรุณากรอกเบอร์โทร 9-10 หลัก ขึ้นต้นด้วย 0 เช่น 0812345678");
        return;
    }
    if (password.length < 6) {
        showMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
        return;
    }
    if (password !== confirm) {
        showMessage("รหัสผ่านสองช่องไม่ตรงกัน");
        return;
    }

    const button = registerForm.querySelector("button[type='submit']");
    button.disabled = true;
    const result = await registerUser({ name, phone, address, password });
    button.disabled = false;

    if (result.ok) {
        goHome();
    } else {
        showMessage(result.error);
    }
});
/* =========================================================
   auth.js — ระบบสมาชิกแบบจำลอง (ใช้ได้ทั้ง login.html และ index.html)
   เก็บข้อมูลสมาชิกใน localStorage ของเบราว์เซอร์ ยังไม่ได้ต่อฐานข้อมูลจริง
   ========================================================= */

const USERS_KEY   = "pumpuang_users";     // รายชื่อสมาชิกทั้งหมด
const SESSION_KEY = "pumpuang_session";   // สมาชิกที่ล็อกอินอยู่ตอนนี้

// เข้ารหัสรหัสผ่านก่อนเก็บ (ไม่เก็บรหัสผ่านตัวจริง)
async function hashPassword(password) {
    if (window.crypto && crypto.subtle) {
        const bytes = new TextEncoder().encode(password);
        const buffer = await crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    return password;   // เบราว์เซอร์ที่ไม่รองรับ (เช่น เปิดแบบไม่ปลอดภัย)
}

function readJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
        return fallback;
    }
}

function getUsers() { return readJSON(USERS_KEY, []); }

// สมาชิกที่ล็อกอินอยู่ (ไม่มี = null)
function getCurrentUser() { return readJSON(SESSION_KEY, null); }

function startSession(user) {
    // เก็บเฉพาะข้อมูลที่ต้องใช้ ไม่เก็บรหัสผ่าน
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        name: user.name, phone: user.phone, address: user.address
    }));
}

function logout() { localStorage.removeItem(SESSION_KEY); }

// สมัครสมาชิก: สำเร็จคืน { ok: true } / ไม่สำเร็จคืน { ok: false, error: "..." }
async function registerUser({ name, phone, address, password }) {
    const users = getUsers();
    if (users.some((u) => u.phone === phone)) {
        return { ok: false, error: "เบอร์โทรนี้สมัครสมาชิกไว้แล้ว ลองเข้าสู่ระบบแทน" };
    }
    const user = { name, phone, address, passwordHash: await hashPassword(password) };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    startSession(user);
    return { ok: true };
}

// เข้าสู่ระบบด้วยเบอร์โทร + รหัสผ่าน
async function loginUser(phone, password) {
    const user = getUsers().find((u) => u.phone === phone);
    const hash = await hashPassword(password);
    if (!user || user.passwordHash !== hash) {
        return { ok: false, error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" };
    }
    startSession(user);
    return { ok: true };
}
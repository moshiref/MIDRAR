/**
 * Stand-in for the real auth API. There is no backend yet, so
 * `loginRequest`/`registerRequest` just simulate network latency and
 * resolve with a fixed "not wired up yet" message — no data is stored,
 * no user is checked against anything, nothing is persisted.
 *
 * The two call sites (LoginPage's handleLogin, RegisterPage's
 * handleRegister) already `await` these as if they were real requests,
 * so swapping the bodies below for real calls later —
 *   fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
 *   fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
 * — is a drop-in change. No page component needs to change shape.
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginRequest(_credentials) {
  await delay(1000);
  return { ok: true, message: 'سيتم تفعيل تسجيل الدخول عند ربط النظام بالخادم.' };
}

export async function registerRequest(_payload) {
  await delay(1000);
  return { ok: true, message: 'تم التحقق من البيانات. سيتم تفعيل إنشاء الحساب عند ربط النظام بالخادم.' };
}

/**
 * Frontend-only validation for the auth forms (Login/Register). Every
 * function returns an empty string when the value is valid, or an
 * Arabic error message otherwise — so a field's error state is just
 * `Boolean(errors.email)`.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{8,15}$/;

export function validateEmail(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'يرجى إدخال البريد الإلكتروني';
  if (!EMAIL_PATTERN.test(trimmed)) return 'يرجى إدخال بريد إلكتروني صحيح';
  return '';
}

export function validateRequired(value, message) {
  return (value ?? '').trim() ? '' : message;
}

export function validatePhone(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return 'يرجى إدخال رقم الهاتف';
  if (!PHONE_PATTERN.test(trimmed)) return 'يرجى إدخال رقم هاتف صحيح';
  return '';
}

export function validatePassword(value, { minLength } = {}) {
  if (!value) return 'يرجى إدخال كلمة المرور';
  if (minLength && value.length < minLength) return `يجب أن تتكون كلمة المرور من ${minLength} أحرف على الأقل`;
  return '';
}

export function validateConfirmPassword(value, password) {
  if (!value) return 'يرجى تأكيد كلمة المرور';
  if (value !== password) return 'كلمتا المرور غير متطابقتين';
  return '';
}

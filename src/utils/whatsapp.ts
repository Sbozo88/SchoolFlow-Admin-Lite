export function normalizePhoneForWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("27")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `27${digits.slice(1)}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

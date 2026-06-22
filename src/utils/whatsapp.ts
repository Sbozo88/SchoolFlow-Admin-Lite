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

export const WhatsAppTemplates = {
  absence: (parentName: string, learnerName: string, programme: string, date: string) => 
    `Good day ${parentName}, hope you are well. Kindly note that ${learnerName} was absent from ${programme} on ${date}. Please confirm if everything is okay. Thank you.`,

  late: (parentName: string, learnerName: string, programme: string, date: string) => 
    `Good day ${parentName}, hope you are well. Kindly note that ${learnerName} was late for ${programme} on ${date}. Thank you.`,

  unpaid_fees: (parentName: string, learnerName: string, amount: number, month: string) =>
    `Good day ${parentName}, hope you are well. This is a gentle reminder that the fees of R${amount} for ${learnerName} for ${month} are currently unpaid. Please let us know if you have made payment. Thank you.`,

  partial_payment: (parentName: string, learnerName: string, balance: number, month: string) =>
    `Good day ${parentName}, hope you are well. Thank you for your recent payment. Please note there is an outstanding balance of R${balance} for ${learnerName} for ${month}. Thank you.`,

  payment_reminder: (parentName: string, learnerName: string, month: string) =>
    `Good day ${parentName}, hope you are well. This is a quick reminder regarding ${learnerName}'s fees for ${month}. Thank you.`,

  missing_info: (parentName: string, learnerName: string) =>
    `Good day ${parentName}, hope you are well. We are updating our records and seem to be missing some information for ${learnerName}. Could you please send us the missing details? Thank you.`,

  weekly_reminder: (parentName: string, learnerName: string, programme: string, date: string) =>
    `Good day ${parentName}, hope you are well. This is a reminder for ${learnerName}'s ${programme} class on ${date}. See you there!`,

  general_update: (parentName: string, learnerName: string, update: string) =>
    `Good day ${parentName}, hope you are well. Here is an update regarding ${learnerName}: ${update}. Thank you.`,

  report_summary: (parentName: string, learnerName: string) =>
    `Good day ${parentName}, hope you are well. ${learnerName}'s latest report is now available. Please let us know if you would like a copy. Thank you.`,
};

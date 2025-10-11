// Chuyển giá trị từ <input type="datetime-local"> (YYYY-MM-DDTHH:mm) thành ISO string (UTC hoặc local)
export function datetimeLocalToIso(dtLocal: string): string {
  // dtLocal không có timezone, hiểu là local time → tạo Date local rồi toISOString
  const d = new Date(dtLocal);
  return d.toISOString();
}

// Hiển thị từ ISO về datetime-local cho form edit (nếu cần)
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  // cắt giây/millis để hợp lệ với input
  const pad = (n: number) => `${n}`.padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

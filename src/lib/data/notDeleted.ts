/** Filter soft-deleted operational records from list UIs. */
export function notDeleted<T extends { status?: string }>(records: T[]): T[] {
  return records.filter((row) => row.status !== "deleted");
}

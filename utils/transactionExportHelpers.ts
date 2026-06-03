export type ExportFormat = "pdf" | "xlsx";

export const toYmd = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getLocalDateString = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString.substring(0, 10);
  }
};

export const formatDisplayDate = (d: Date): string =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const filterByDateRange = (
  transactions: any[],
  startDate: Date,
  endDate: Date,
): any[] => {
  const start = toYmd(startDate);
  const end = toYmd(endDate);
  const min = start <= end ? start : end;
  const max = start <= end ? end : start;

  return transactions.filter((tx) => {
    const key = getLocalDateString(tx.date);
    return key >= min && key <= max;
  });
};

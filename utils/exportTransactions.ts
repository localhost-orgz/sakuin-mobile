import { documentDirectory, writeAsStringAsync, EncodingType } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import XLSX from "xlsx-js-style";

export type ExportFormat = "pdf" | "xlsx";

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

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

type ExportRow = {
  date: string;
  name: string;
  category: string;
  type: string;
  amount: string;
  wallet: string;
  description: string;
};

const normalizeType = (type: string) => {
  const t = (type || "expense").toLowerCase();
  if (t === "income") return "Income";
  if (t === "transfer") return "Transfer";
  return "Expense";
};

const formatAmountForExport = (tx: any): string => {
  const amt = Number(tx.amount) || 0;
  const type = (tx.type || "expense").toLowerCase();
  if (type === "income") return `+${formatRupiah(amt)}`;
  if (type === "transfer") return formatRupiah(amt);
  return `-${formatRupiah(amt)}`;
};

const buildExportRows = (transactions: any[]): ExportRow[] =>
  [...transactions]
    .sort((a, b) => getLocalDateString(b.date).localeCompare(getLocalDateString(a.date)))
    .map((tx) => ({
      date: getLocalDateString(tx.date),
      name: tx.name || "-",
      category: tx.category_id?.name || "Other",
      type: normalizeType(tx.type),
      amount: formatAmountForExport(tx),
      wallet: tx.wallet_id?.name || "Wallet",
      description: tx.description?.trim() || "-",
    }));

const buildFileName = (format: ExportFormat, start: Date, end: Date) => {
  const ext = format === "pdf" ? "pdf" : "xlsx";
  return `sakuin-transactions-${toYmd(start)}_${toYmd(end)}.${ext}`;
};

const writeAndShare = async (
  base64: string,
  fileName: string,
  mimeType: string,
) => {
  if (!documentDirectory) {
    throw new Error("Document directory is not available.");
  }

  const fileUri = `${documentDirectory}${fileName}`;
  await writeAsStringAsync(fileUri, base64, {
    encoding: EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: "Export Transactions",
    UTI: mimeType,
  });
};

const exportPdf = async (
  rows: ExportRow[],
  startDate: Date,
  endDate: Date,
  fileName: string,
) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text("Sakuin — Transaction Report", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Period: ${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)} · ${rows.length} transactions`,
    14,
    23,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 28,
    head: [["Date", "Name", "Category", "Type", "Amount", "Wallet", "Description"]],
    body: rows.map((r) => [
      r.date,
      r.name,
      r.category,
      r.type,
      r.amount,
      r.wallet,
      r.description,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 191, 113], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 246, 250] },
    margin: { left: 14, right: 14 },
  });

  const dataUri = doc.output("datauristring");
  const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
  await writeAndShare(base64, fileName, "application/pdf");
};

const exportXlsx = async (
  rows: ExportRow[],
  startDate: Date,
  endDate: Date,
  fileName: string,
) => {
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "00BF71" } },
    alignment: { horizontal: "center" },
  };

  const sheetData = [
    ["Sakuin — Transaction Report"],
    [`Period: ${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`],
    [`Total: ${rows.length} transactions`],
    [],
    ["Date", "Name", "Category", "Type", "Amount", "Wallet", "Description"],
    ...rows.map((r) => [
      r.date,
      r.name,
      r.category,
      r.type,
      r.amount,
      r.wallet,
      r.description,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
  ];

  const headerRow = 4;
  ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
    const ref = `${col}${headerRow + 1}`;
    if (ws[ref]) ws[ref].s = headerStyle;
  });

  ws["!cols"] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 28 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  await writeAndShare(
    base64,
    fileName,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
};

export async function exportTransactionsFile(
  transactions: any[],
  format: ExportFormat,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const inRange = filterByDateRange(transactions, startDate, endDate);
  const rows = buildExportRows(inRange);

  if (rows.length === 0) {
    return 0;
  }

  const fileName = buildFileName(format, startDate, endDate);
  if (format === "pdf") {
    await exportPdf(rows, startDate, endDate, fileName);
  } else {
    await exportXlsx(rows, startDate, endDate, fileName);
  }

  return rows.length;
}

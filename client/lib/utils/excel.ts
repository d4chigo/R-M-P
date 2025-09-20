"use client";
import { utils, writeFile } from 'xlsx';

export interface ExcelExportOptions {
  /** The name of the sheet in the Excel file (default: 'Sheet1') */
  sheetName?: string;
  /** The name of the file to download (without extension, default: 'export') */
  filename?: string;
  /** Optional date format for date columns (e.g., 'YYYY-MM-DD') */
  dateFormat?: string;
}

export interface HeaderConfig {
  /** The key in the data object */
  key: string;
  /** The header text to display */
  header: string;
  /** Optional formatter function */
  format?: (value: any) => string | number;
}

/**
 * Exports data to an Excel file with customizable headers and formatting
 * @param data The array of objects to export
 * @param headers Array of header configurations or simple key strings
 * @param options Export options including filename and sheet name
 */
export const exportToExcel = (
  data: any[],
  headers: (HeaderConfig | string)[],
  options: ExcelExportOptions = {}
) => {
  const {
    sheetName = 'Sheet1',
    filename = 'export',
  } = options;

  // Convert simple header strings to HeaderConfig objects
  const headerConfigs = headers.map(h => 
    typeof h === 'string' ? { key: h, header: h } : h
  );

  // Prepare the rows with headers as first row and formatted data
  const rows = [
    // Header row
    headerConfigs.map(h => h.header),
    // Data rows
    ...data.map(row => 
      headerConfigs.map(h => {
        const value = row[h.key];
        if (h.format) {
          return h.format(value);
        }
        // Handle dates
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value ?? '';
      })
    )
  ];

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(rows);

  // Add the worksheet to the workbook
  utils.book_append_sheet(wb, ws, sheetName);

  // Save the file
  writeFile(wb, `${filename}.xlsx`);
};
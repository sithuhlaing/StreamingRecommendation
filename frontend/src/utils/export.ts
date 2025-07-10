// src/utils/export.ts

/**
 * Export data to CSV format
 */
export const exportToCsv = (
  data: Record<string, any>[],
  filename: string = 'export.csv',
  options: {
    includeHeaders?: boolean;
    delimiter?: string;
    encoding?: string;
  } = {}
): void => {
  const { includeHeaders = true, delimiter = ',', encoding = 'utf-8' } = options;
  
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  // Get all unique keys from the data
  const headers = Array.from(
    new Set(data.flatMap(row => Object.keys(row)))
  );
  
  // Create CSV content
  let csvContent = '';
  
  // Add headers if requested
  if (includeHeaders) {
    csvContent += headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter) + '\n';
  }
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCsvValue(value, delimiter);
    });
    csvContent += values.join(delimiter) + '\n';
  });
  
  // Create and download the file
  downloadFile(csvContent, filename, 'text/csv', encoding);
};

/**
 * Export data to PDF format (requires jsPDF)
 */
export const exportToPdf = async (
  data: Record<string, any>[],
  filename: string = 'export.pdf',
  options: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter' | 'legal';
    fontSize?: number;
    margin?: number;
  } = {}
): Promise<void> => {
  // Check if jsPDF is available
  if (typeof window === 'undefined' || !(window as any).jsPDF) {
    throw new Error('jsPDF library is not available. Please include it in your project.');
  }
  
  const { 
    title = 'Data Export',
    orientation = 'portrait',
    pageSize = 'a4',
    fontSize = 10,
    margin = 20
  } = options;
  
  const jsPDF = (window as any).jsPDF;
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });
  
  // Set font
  doc.setFontSize(fontSize);
  
  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, margin, margin);
    doc.setFontSize(fontSize);
  }
  
  // Calculate table dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const availableWidth = pageWidth - (margin * 2);
  
  if (data.length === 0) {
    doc.text('No data to display', margin, margin + 20);
  } else {
    // Get headers
    const headers = Object.keys(data[0]);
    const columnWidth = availableWidth / headers.length;
    
    let yPosition = margin + (title ? 30 : 10);
    
    // Add headers
    doc.setFontSize(fontSize + 2);
    headers.forEach((header, index) => {
      doc.text(header, margin + (index * columnWidth), yPosition);
    });
    
    yPosition += 10;
    doc.setFontSize(fontSize);
    
    // Add data rows
    data.forEach((row, rowIndex) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      headers.forEach((header, colIndex) => {
        const value = String(row[header] || '');
        const truncatedValue = value.length > 20 ? value.substring(0, 17) + '...' : value;
        doc.text(truncatedValue, margin + (colIndex * columnWidth), yPosition);
      });
      
      yPosition += 8;
    });
  }
  
  // Save the PDF
  doc.save(filename);
};

/**
 * Export data to Excel format (requires SheetJS)
 */
export const exportToExcel = (
  data: Record<string, any>[],
  filename: string = 'export.xlsx',
  options: {
    sheetName?: string;
    includeHeaders?: boolean;
  } = {}
): void => {
  // Check if XLSX is available
  if (typeof window === 'undefined' || !(window as any).XLSX) {
    throw new Error('SheetJS (XLSX) library is not available. Please include it in your project.');
  }
  
  const { sheetName = 'Sheet1', includeHeaders = true } = options;
  const XLSX = (window as any).XLSX;
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data, { 
    header: includeHeaders ? undefined : [],
    skipHeader: !includeHeaders 
  });
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Write and download the file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export data to JSON format
 */
export const exportToJson = (
  data: any,
  filename: string = 'export.json',
  options: {
    pretty?: boolean;
    encoding?: string;
  } = {}
): void => {
  const { pretty = true, encoding = 'utf-8' } = options;
  
  const jsonContent = pretty 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);
  
  downloadFile(jsonContent, filename, 'application/json', encoding);
};

/**
 * Export campaign performance report
 */
export const exportCampaignReport = (
  campaigns: any[],
  format: 'csv' | 'pdf' | 'excel' | 'json' = 'csv',
  filename?: string
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `campaign-report-${timestamp}`;
  
  // Transform campaign data for export
  const exportData = campaigns.map(campaign => ({
    'Campaign Name': campaign.name,
    'Status': campaign.status,
    'Start Date': new Date(campaign.start_date).toLocaleDateString(),
    'End Date': new Date(campaign.end_date).toLocaleDateString(),
    'Budget': `$${campaign.budget.toLocaleString()}`,
    'Spend': `$${campaign.spend.toLocaleString()}`,
    'Impressions': campaign.impressions_served.toLocaleString(),
    'Clicks': campaign.clicks.toLocaleString(),
    'Conversions': campaign.conversions.toLocaleString(),
    'CTR': `${((campaign.clicks / campaign.impressions_served) * 100).toFixed(2)}%`,
    'CPC': `$${(campaign.spend / campaign.clicks).toFixed(2)}`,
    'Advertiser': campaign.advertiser?.name || 'Unknown'
  }));
  
  switch (format) {
    case 'csv':
      exportToCsv(exportData, filename || `${defaultFilename}.csv`);
      break;
    case 'pdf':
      exportToPdf(exportData, filename || `${defaultFilename}.pdf`, {
        title: 'Campaign Performance Report',
        orientation: 'landscape'
      });
      break;
    case 'excel':
      exportToExcel(exportData, filename || `${defaultFilename}.xlsx`, {
        sheetName: 'Campaign Report'
      });
      break;
    case 'json':
      exportToJson(campaigns, filename || `${defaultFilename}.json`);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Export analytics dashboard data
 */
export const exportAnalytics = (
  analyticsData: {
    summary: Record<string, any>;
    campaigns: any[];
    metrics: any[];
  },
  format: 'csv' | 'excel' | 'json' = 'excel',
  filename?: string
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `analytics-${timestamp}`;
  
  switch (format) {
    case 'csv':
      // Export campaigns as CSV
      exportCampaignReport(analyticsData.campaigns, 'csv', filename || `${defaultFilename}.csv`);
      break;
      
    case 'excel':
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        throw new Error('SheetJS (XLSX) library is not available.');
      }
      
      const XLSX = (window as any).XLSX;
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = Object.entries(analyticsData.summary).map(([key, value]) => ({
        Metric: key,
        Value: value
      }));
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Campaigns sheet
      const campaignSheet = XLSX.utils.json_to_sheet(analyticsData.campaigns);
      XLSX.utils.book_append_sheet(workbook, campaignSheet, 'Campaigns');
      
      // Metrics sheet
      if (analyticsData.metrics.length > 0) {
        const metricsSheet = XLSX.utils.json_to_sheet(analyticsData.metrics);
        XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
      }
      
      XLSX.writeFile(workbook, filename || `${defaultFilename}.xlsx`);
      break;
      
    case 'json':
      exportToJson(analyticsData, filename || `${defaultFilename}.json`);
      break;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Helper functions

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
const escapeCsvValue = (value: any, delimiter: string = ','): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains the delimiter, quotes, or newlines, wrap it in quotes
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  
  return stringValue;
};

/**
 * Download a file with the given content
 */
const downloadFile = (
  content: string,
  filename: string,
  mimeType: string,
  encoding: string = 'utf-8'
): void => {
  const blob = new Blob([content], { type: `${mimeType};charset=${encoding}` });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Share data using Web Share API (if available)
 */
export const shareData = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: copy to clipboard
      const shareText = `${data.title || ''}\n${data.text || ''}\n${data.url || ''}`.trim();
      return await copyToClipboard(shareText);
    }
  } catch (error) {
    console.error('Failed to share data:', error);
    return false;
  }
};
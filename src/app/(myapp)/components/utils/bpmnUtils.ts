/**
 * Utility functions for BPMN operations
 */

export interface BpmnDownloadOptions {
  filename?: string;
  format?: 'xml' | 'svg' | 'png';
  quality?: number;
}

/**
 * Download a file with the given content
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate if a file is a valid BPMN XML file
 */
export const validateBpmnFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        // Basic validation - check if it contains BPMN elements
        const isValid =
          content.includes('bpmn:') ||
          content.includes('bpmn2:') ||
          content.includes('http://www.omg.org/spec/BPMN/');

        resolve(isValid);
      } catch {
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};

/**
 * Generate a filename based on process information
 */
export const generateFilename = (
  processKey: string,
  processName: string,
  extension: string,
): string => {
  const sanitizedKey = processKey.replace(/[^a-zA-Z0-9-_]/g, '_');
  const sanitizedName = processName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${sanitizedKey}_${sanitizedName}.${extension}`;
};

/**
 * Show a user-friendly error message
 */
export const showError = (message: string, error?: Error): void => {
  console.error(message, error);
  alert(message);
};

/**
 * Show a success message
 */
export const showSuccess = (message: string): void => {
  // You can replace this with a toast notification system
  console.log(message);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

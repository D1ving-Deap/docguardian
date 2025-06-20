import { createWorker, OEM } from 'tesseract.js';

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentAnalysis {
  documentType: 'id' | 'income' | 'bank_statement' | 'tax_return' | 'unknown';
  extractedFields: ExtractedField[];
  overallConfidence: number;
  processingTime: number;
  rawText: string;
}

export interface FieldMapping {
  [key: string]: {
    patterns: RegExp[];
    labels: string[];
    validation?: (value: string) => boolean;
  };
}

// Field mappings for different document types
const FIELD_MAPPINGS: Record<string, FieldMapping> = {
  id: {
    'full_name': {
      patterns: [/name[:\s]*([A-Za-z\s]+)/i, /([A-Za-z]+\s+[A-Za-z]+)/],
      labels: ['Full Name', 'Name'],
      validation: (value) => /^[A-Za-z\s]{2,50}$/.test(value)
    },
    'date_of_birth': {
      patterns: [/birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, /dob[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i],
      labels: ['Date of Birth', 'DOB', 'Birth Date'],
      validation: (value) => /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value)
    },
    'ssn': {
      patterns: [/ssn[:\s]*(\d{3}-\d{2}-\d{4})/i, /(\d{3}-\d{2}-\d{4})/],
      labels: ['Social Security Number', 'SSN'],
      validation: (value) => /^\d{3}-\d{2}-\d{4}$/.test(value)
    },
    'address': {
      patterns: [/address[:\s]*([A-Za-z0-9\s,.-]+)/i, /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd))/i],
      labels: ['Address', 'Residence Address'],
      validation: (value) => value.length > 10 && value.length < 200
    },
    'license_number': {
      patterns: [/license[:\s]*([A-Z0-9]+)/i, /dl[:\s]*([A-Z0-9]+)/i],
      labels: ['Driver License Number', 'License Number'],
      validation: (value) => /^[A-Z0-9]{6,15}$/.test(value)
    }
  },
  income: {
    'employer_name': {
      patterns: [/employer[:\s]*([A-Za-z\s&]+)/i, /company[:\s]*([A-Za-z\s&]+)/i],
      labels: ['Employer Name', 'Company Name'],
      validation: (value) => value.length > 2 && value.length < 100
    },
    'annual_income': {
      patterns: [/income[:\s]*\$?([0-9,]+)/i, /salary[:\s]*\$?([0-9,]+)/i, /annual[:\s]*\$?([0-9,]+)/i],
      labels: ['Annual Income', 'Salary', 'Yearly Income'],
      validation: (value) => /^\$?[0-9,]+$/.test(value)
    },
    'position': {
      patterns: [/position[:\s]*([A-Za-z\s]+)/i, /title[:\s]*([A-Za-z\s]+)/i, /job[:\s]*([A-Za-z\s]+)/i],
      labels: ['Job Title', 'Position', 'Role'],
      validation: (value) => value.length > 2 && value.length < 50
    },
    'employment_date': {
      patterns: [/employed[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, /start[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i],
      labels: ['Employment Date', 'Start Date'],
      validation: (value) => /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value)
    }
  },
  bank_statement: {
    'account_number': {
      patterns: [/account[:\s]*(\d{4}[\s-]*\d{4}[\s-]*\d{4}[\s-]*\d{4})/i, /acct[:\s]*(\d{4}[\s-]*\d{4}[\s-]*\d{4}[\s-]*\d{4})/i],
      labels: ['Account Number', 'Account #'],
      validation: (value) => /^\d{4}[\s-]*\d{4}[\s-]*\d{4}[\s-]*\d{4}$/.test(value)
    },
    'balance': {
      patterns: [/balance[:\s]*\$?([0-9,]+\.?\d{0,2})/i, /total[:\s]*\$?([0-9,]+\.?\d{0,2})/i],
      labels: ['Account Balance', 'Current Balance'],
      validation: (value) => /^\$?[0-9,]+\.?\d{0,2}$/.test(value)
    },
    'bank_name': {
      patterns: [/bank[:\s]*([A-Za-z\s&]+)/i, /institution[:\s]*([A-Za-z\s&]+)/i],
      labels: ['Bank Name', 'Financial Institution'],
      validation: (value) => value.length > 2 && value.length < 100
    }
  },
  tax_return: {
    'tax_year': {
      patterns: [/year[:\s]*(\d{4})/i, /tax year[:\s]*(\d{4})/i],
      labels: ['Tax Year', 'Year'],
      validation: (value) => /^\d{4}$/.test(value) && parseInt(value) > 2010 && parseInt(value) <= new Date().getFullYear()
    },
    'adjusted_gross_income': {
      patterns: [/adjusted gross income[:\s]*\$?([0-9,]+)/i, /agi[:\s]*\$?([0-9,]+)/i],
      labels: ['Adjusted Gross Income', 'AGI'],
      validation: (value) => /^\$?[0-9,]+$/.test(value)
    },
    'total_income': {
      patterns: [/total income[:\s]*\$?([0-9,]+)/i, /gross income[:\s]*\$?([0-9,]+)/i],
      labels: ['Total Income', 'Gross Income'],
      validation: (value) => /^\$?[0-9,]+$/.test(value)
    }
  }
};

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(loggerCallback?: (m: any) => void) {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng', OEM.DEFAULT, {
        workerPath: '/tesseract/tesseract-worker.js',
        corePath: '/tesseract/tesseract-core.wasm',
        logger: loggerCallback,
      });
      this.isInitialized = true;
      console.log('OCR worker initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed. Check console for details.');
    }
  }

  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    const startTime = Date.now();

    try {
      // Convert file to image data
      const imageData = await this.fileToImageData(file);
      
      // Perform OCR
      const { data: { text, confidence } } = await this.worker.recognize(imageData);
      
      // Determine document type
      const documentType = this.detectDocumentType(text, file.name);
      
      // Extract and label fields
      const extractedFields = this.extractFields(text, documentType);
      
      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(extractedFields, confidence);
      
      const processingTime = Date.now() - startTime;

      return {
        documentType,
        extractedFields,
        overallConfidence,
        processingTime,
        rawText: text
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Document analysis failed');
    }
  }

  private async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          resolve(imageData);
        } else {
          reject(new Error('Failed to get image data'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private detectDocumentType(text: string, fileName: string): DocumentAnalysis['documentType'] {
    const lowerText = text.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    // Check for ID documents
    if (lowerText.includes('driver license') || lowerText.includes('state id') || 
        lowerText.includes('identification') || lowerFileName.includes('id') ||
        lowerFileName.includes('license') || lowerFileName.includes('passport')) {
      return 'id';
    }

    // Check for income documents
    if (lowerText.includes('pay stub') || lowerText.includes('w-2') || 
        lowerText.includes('employment') || lowerText.includes('salary') ||
        lowerFileName.includes('income') || lowerFileName.includes('paystub') ||
        lowerFileName.includes('w2')) {
      return 'income';
    }

    // Check for bank statements
    if (lowerText.includes('bank statement') || lowerText.includes('account statement') ||
        lowerText.includes('checking account') || lowerText.includes('savings account') ||
        lowerFileName.includes('bank') || lowerFileName.includes('statement')) {
      return 'bank_statement';
    }

    // Check for tax returns
    if (lowerText.includes('form 1040') || lowerText.includes('tax return') ||
        lowerText.includes('irs') || lowerText.includes('adjusted gross income') ||
        lowerFileName.includes('tax') || lowerFileName.includes('1040')) {
      return 'tax_return';
    }

    return 'unknown';
  }

  private extractFields(text: string, documentType: string): ExtractedField[] {
    const fields: ExtractedField[] = [];
    const mapping = FIELD_MAPPINGS[documentType];

    if (!mapping) {
      return fields;
    }

    for (const [fieldKey, fieldConfig] of Object.entries(mapping)) {
      for (const pattern of fieldConfig.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          
          if (fieldConfig.validation && !fieldConfig.validation(value)) {
            continue;
          }
          
          fields.push({
            label: fieldConfig.labels[0],
            value: value,
            confidence: 100
          });
          break; 
        }
      }
    }
    return fields;
  }

  private calculateOverallConfidence(fields: ExtractedField[], ocrConfidence: number): number {
    if (fields.length === 0) {
      return ocrConfidence / 2;
    }
    
    const averageFieldConfidence = fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length;
    return (ocrConfidence + averageFieldConfidence) / 2;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  getFieldSuggestions(documentType: string): string[] {
    const mapping = FIELD_MAPPINGS[documentType];
    return mapping ? Object.values(mapping).map(config => config.labels[0]) : [];
  }

  validateExtractedData(fields: ExtractedField[], documentType: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFields = this.getRequiredFields(documentType);
    const providedLabels = fields.map(f => f.label);

    for (const required of requiredFields) {
      if (!providedLabels.includes(required)) {
        errors.push(`Missing required field: ${required}`);
      }
    }

    for (const field of fields) {
      const mapping = FIELD_MAPPINGS[documentType];
      if (mapping) {
        const fieldKey = Object.keys(mapping).find(k => mapping[k].labels.includes(field.label));
        if (fieldKey && mapping[fieldKey].validation && !mapping[fieldKey].validation!(field.value)) {
          warnings.push(`Invalid format for ${field.label}: ${field.value}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private getRequiredFields(documentType: string): string[] {
    switch (documentType) {
      case 'id': return ['Full Name', 'Date of Birth', 'Address'];
      case 'income': return ['Employer Name', 'Annual Income'];
      case 'bank_statement': return ['Bank Name', 'Account Number', 'Account Balance'];
      case 'tax_return': return ['Tax Year', 'Total Income'];
      default: return [];
    }
  }
}

export default OCRService;

// Export types for use in components
// Import from implementation files
import { performOCR } from './tesseractOCR';
import { extractFieldsFromText } from './fieldExtraction';
import { analyzeForIssues } from './issueAnalysis';

// Import from types file
import type { 
  OCRResult, 
  ExtractedFields, 
  DocumentIssue, 
  ProcessedDocument, 
  DocumentType,
  OCRMetadata,
  IssueSeverity
} from './types/ocrTypes';

// Re-export types
export type {
  OCRResult,
  ExtractedFields,
  DocumentIssue,
  ProcessedDocument,
  DocumentType,
  OCRMetadata,
  IssueSeverity
};

// Re-export implementation functions
export {
  performOCR,
  extractFieldsFromText,
  analyzeForIssues
};

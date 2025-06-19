import { DocumentType } from './types/ocrTypes';

// Document patterns for automatic classification
interface DocumentPattern {
  type: DocumentType;
  keywords: string[];
  patterns: RegExp[];
  confidence: number;
}

const DOCUMENT_PATTERNS: DocumentPattern[] = [
  {
    type: 'mortgage_application',
    keywords: ['mortgage application', 'loan application', 'borrower', 'lender', 'property address', 'purchase price'],
    patterns: [
      /mortgage\s+application/i,
      /loan\s+application/i,
      /borrower.*name/i,
      /property.*address/i,
      /purchase\s+price/i
    ],
    confidence: 0.9
  },
  {
    type: 'income_proof',
    keywords: ['pay stub', 'paystub', 'payroll', 'salary', 'wages', 'gross pay', 'net pay', 'year to date'],
    patterns: [
      /pay\s*stub/i,
      /payroll/i,
      /gross\s+pay/i,
      /net\s+pay/i,
      /year\s+to\s+date/i,
      /ytd/i,
      /earnings/i
    ],
    confidence: 0.85
  },
  {
    type: 'bank_statement',
    keywords: ['bank statement', 'account statement', 'balance', 'deposit', 'withdrawal', 'transaction'],
    patterns: [
      /bank\s+statement/i,
      /account\s+statement/i,
      /beginning\s+balance/i,
      /ending\s+balance/i,
      /transaction/i,
      /deposit/i,
      /withdrawal/i
    ],
    confidence: 0.8
  },
  {
    type: 'identification',
    keywords: ['drivers license', 'driver license', 'passport', 'identification', 'date of birth', 'license number'],
    patterns: [
      /driver.*license/i,
      /passport/i,
      /identification/i,
      /date\s+of\s+birth/i,
      /license.*number/i,
      /id.*number/i
    ],
    confidence: 0.9
  },
  {
    type: 'tax_document',
    keywords: ['tax return', 'notice of assessment', 'T4', 'T1', 'employment income', 'total income'],
    patterns: [
      /tax\s+return/i,
      /notice\s+of\s+assessment/i,
      /t4.*employment/i,
      /t1.*general/i,
      /total\s+income/i,
      /employment\s+income/i
    ],
    confidence: 0.85
  }
];

/**
 * Automatically categorize document based on OCR text content
 */
export const categorizeDocument = (text: string, filename?: string): {
  type: DocumentType;
  confidence: number;
  reasons: string[];
} => {
  const lowerText = text.toLowerCase();
  const lowerFilename = filename?.toLowerCase() || '';
  
  const scores: Array<{
    type: DocumentType;
    score: number;
    reasons: string[];
  }> = [];

  for (const pattern of DOCUMENT_PATTERNS) {
    let score = 0;
    const reasons: string[] = [];

    // Check keywords
    let keywordMatches = 0;
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword) || lowerFilename.includes(keyword)) {
        keywordMatches++;
        reasons.push(`Found keyword: "${keyword}"`);
      }
    }
    score += (keywordMatches / pattern.keywords.length) * 0.6;

    // Check regex patterns
    let patternMatches = 0;
    for (const regex of pattern.patterns) {
      if (regex.test(text) || regex.test(filename || '')) {
        patternMatches++;
        reasons.push(`Matched pattern: ${regex.source}`);
      }
    }
    score += (patternMatches / pattern.patterns.length) * 0.4;

    if (score > 0) {
      scores.push({
        type: pattern.type,
        score: score * pattern.confidence,
        reasons
      });
    }
  }

  // Find the highest scoring type
  if (scores.length === 0) {
    return {
      type: 'generic',
      confidence: 0.1,
      reasons: ['No specific document pattern detected']
    };
  }

  scores.sort((a, b) => b.score - a.score);
  const bestMatch = scores[0];

  return {
    type: bestMatch.type,
    confidence: Math.min(bestMatch.score, 1.0),
    reasons: bestMatch.reasons
  };
};

/**
 * Get required fields for a document type
 */
export const getRequiredFields = (documentType: DocumentType): string[] => {
  const fieldMap: Record<DocumentType, string[]> = {
    'mortgage_application': ['applicantName', 'sin', 'address', 'employer', 'income'],
    'income_proof': ['income', 'employer', 'statementDate'],
    'bank_statement': ['accountNumber', 'balance', 'statementDate'],
    'identification': ['name', 'dateOfBirth', 'idNumber', 'address'],
    'tax_document': ['income', 'year', 'sin'],
    'generic': []
  };

  return fieldMap[documentType] || [];
};

/**
 * Validate extracted fields against required fields
 */
export const validateExtractedFields = (
  extractedFields: Record<string, any>,
  documentType: DocumentType
): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} => {
  const requiredFields = getRequiredFields(documentType);
  
  if (requiredFields.length === 0) {
    return {
      isComplete: true,
      missingFields: [],
      completionPercentage: 100
    };
  }

  const missingFields = requiredFields.filter(field => 
    !extractedFields[field] || extractedFields[field] === ''
  );

  const completionPercentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage: Math.round(completionPercentage)
  };
};

export default {
  categorizeDocument,
  getRequiredFields,
  validateExtractedFields
};
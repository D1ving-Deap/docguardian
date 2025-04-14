import { DocumentType, ExtractedFields } from './types/ocrTypes';

// Extract structured fields from OCR text based on document type
export const extractFieldsFromText = (text: string, docType: string): ExtractedFields => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const extractedFields: Record<string, string | number> = {};
  
  if (docType.toLowerCase().includes('income') || docType.toLowerCase().includes('pay')) {
    // Extract financial information
    const incomeRegex = /\$?(\d{1,3}(,\d{3})*(\.\d{2})?)/g;
    const incomeMatches = text.match(incomeRegex);
    
    if (incomeMatches && incomeMatches.length > 0) {
      extractedFields.income = incomeMatches[0];
    }
    
    const dateRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
    const dateMatches = text.match(dateRegex);
    
    if (dateMatches && dateMatches.length > 0) {
      extractedFields.statementDate = dateMatches[0];
    }
    
    // Extract employment information
    const employerRegex = /employer|company|organization|workplace/i;
    for (const line of lines) {
      if (employerRegex.test(line)) {
        const parts = line.split(/:\s*|,\s*/);
        if (parts.length > 1) {
          extractedFields.employer = parts[1].trim();
          break;
        }
      }
    }
  } 
  else if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('license')) {
    // Extract personal identification information
    for (const line of lines) {
      if (line.toLowerCase().includes('name:')) {
        extractedFields.name = line.split(':')[1]?.trim() || '';
        break;
      }
    }
    
    const dobRegex = /\b(0?[1-9]|1[0-2])[\/](0?[1-9]|[12]\d|3[01])[\/](19|20)\d{2}\b/g;
    const dobMatches = text.match(dobRegex);
    
    if (dobMatches && dobMatches.length > 0) {
      extractedFields.dateOfBirth = dobMatches[0];
    }
    
    const idRegex = /\b[A-Z0-9]{6,15}\b/g;
    const idMatches = text.match(idRegex);
    
    if (idMatches && idMatches.length > 0) {
      extractedFields.idNumber = idMatches[0];
    }
    
    // Extract address information
    const addressRegex = /\b\d+\s+[A-Za-z0-9\s,\.]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Ln|Rd|Blvd|Dr|St)\.?/i;
    const addressMatches = text.match(addressRegex);
    
    if (addressMatches && addressMatches.length > 0) {
      extractedFields.address = addressMatches[0];
    }
  }
  else if (docType.toLowerCase().includes('mortgage') || docType.toLowerCase().includes('application')) {
    // Extract applicant information
    const nameRegex = /(?:applicant|name):\s*([A-Za-z\s]+)/i;
    const nameMatch = text.match(nameRegex);
    if (nameMatch && nameMatch[1]) {
      extractedFields.applicantName = nameMatch[1].trim();
    }
    
    // Extract SIN
    const sinRegex = /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/;
    const sinMatch = text.match(sinRegex);
    if (sinMatch) {
      extractedFields.sin = sinMatch[0];
    }
    
    // Extract marital status
    const maritalRegex = /(?:marital|status):\s*(single|married|common[-\s]law|divorced|separated|widowed)/i;
    const maritalMatch = text.match(maritalRegex);
    if (maritalMatch && maritalMatch[1]) {
      extractedFields.maritalStatus = maritalMatch[1].trim();
    }
    
    // Extract address
    const addressRegex = /(?:address|residence):\s*([A-Za-z0-9\s,\.]+)/i;
    const addressMatch = text.match(addressRegex);
    if (addressMatch && addressMatch[1]) {
      extractedFields.address = addressMatch[1].trim();
    }
    
    // Extract employment info
    const employerRegex = /(?:employer|company):\s*([A-Za-z0-9\s,\.]+)/i;
    const employerMatch = text.match(employerRegex);
    if (employerMatch && employerMatch[1]) {
      extractedFields.employer = employerMatch[1].trim();
    }
  }
  
  // Add metadata as stringified JSON
  extractedFields.metadata = JSON.stringify({
    processed: new Date().toISOString(),
    confidence: Math.floor(Math.random() * 100),
    edited: Math.random() < 0.2
  });
  
  return extractedFields as ExtractedFields;
};

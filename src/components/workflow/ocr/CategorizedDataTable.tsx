
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExtractedFields } from '@/utils/types/ocrTypes';

interface CategorizedDataTableProps {
  extractedFields: ExtractedFields;
  documentType: string;
}

interface CategoryColumn {
  key: string;
  label: string;
  type: 'text' | 'date' | 'amount' | 'id';
}

const CategorizedDataTable: React.FC<CategorizedDataTableProps> = ({ 
  extractedFields,
  documentType
}) => {
  // Define columns based on document type
  const getColumnsForDocType = (docType: string): CategoryColumn[] => {
    if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('license')) {
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'idNumber', label: 'ID Number', type: 'id' },
        { key: 'address', label: 'Address', type: 'text' }
      ];
    }
    
    if (docType.toLowerCase().includes('income') || docType.toLowerCase().includes('pay')) {
      return [
        { key: 'employer', label: 'Employer', type: 'text' },
        { key: 'statementDate', label: 'Statement Date', type: 'date' },
        { key: 'income', label: 'Income Amount', type: 'amount' }
      ];
    }
    
    if (docType.toLowerCase().includes('mortgage') || docType.toLowerCase().includes('application')) {
      return [
        { key: 'applicantName', label: 'Applicant Name', type: 'text' },
        { key: 'sin', label: 'SIN', type: 'id' },
        { key: 'maritalStatus', label: 'Marital Status', type: 'text' },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'employer', label: 'Employer', type: 'text' }
      ];
    }
    
    // Generic columns for any document type
    return [
      { key: 'name', label: 'Name/Title', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'amount' },
      { key: 'identifier', label: 'ID/Reference', type: 'id' }
    ];
  };
  
  const columns = getColumnsForDocType(documentType);
  
  // Get confidence level of extracted data
  const getConfidence = (): string => {
    try {
      const metadata = extractedFields.metadata as string;
      if (metadata) {
        const parsed = JSON.parse(metadata);
        return parsed.confidence ? `${Math.round(parsed.confidence)}%` : 'N/A';
      }
    } catch (e) {
      console.error('Error parsing metadata:', e);
    }
    return 'N/A';
  };
  
  // Get badge color based on field type
  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'date':
        return 'secondary';
      case 'amount':
        return 'default';
      case 'id':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Format value based on type
  const formatValue = (value: string | undefined, type: string): string => {
    if (!value) return 'N/A';
    
    if (type === 'amount' && !value.includes('$')) {
      if (!isNaN(Number(value))) {
        return `$${Number(value).toFixed(2)}`;
      }
    }
    
    return value;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Categorized Data</h3>
        <Badge variant="outline">Confidence: {getConfidence()}</Badge>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="font-medium">
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    <Badge variant={getBadgeVariant(column.type)} className="text-xs">
                      {column.type}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {columns.map((column) => {
                const value = extractedFields[column.key] as string | undefined;
                return (
                  <TableCell key={column.key}>
                    {formatValue(value, column.type)}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CategorizedDataTable;

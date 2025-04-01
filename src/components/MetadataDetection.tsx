
import React, { useState } from "react";
import { Upload, AlertCircle, AlertTriangle, CheckCircle, XCircle, FileCheck, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ScrollReveal from "./ScrollReveal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PDFDocument } from 'pdf-lib';

interface MetadataItem {
  name: string;
  value: string;
  severity: "red" | "yellow" | "green" | "neutral";
  explanation: string;
}

const MetadataDetection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }
      setFile(selectedFile);
      setMetadata([]);
      setAnalysisComplete(false);
    }
  };

  const extractPdfMetadata = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const producer = pdfDoc.getProducer() || "Unknown";
      const creator = pdfDoc.getCreator() || "Unknown";
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();
      const author = pdfDoc.getAuthor() || "Unknown";
      const title = pdfDoc.getTitle() || "Untitled";
      const subject = pdfDoc.getSubject() || "Unknown";
      const keywords = pdfDoc.getKeywords() || "None"; // Fixed: getKeywords returns a string, not an array

      const now = new Date();
      const simulatedMetadata: MetadataItem[] = [
        {
          name: "Producer",
          value: producer,
          severity: producer.toLowerCase().includes("photoshop") ? "red" : "green",
          explanation: producer.toLowerCase().includes("photoshop") ? "Created with image editing software - suspicious" : "Produced with standard software"
        },
        {
          name: "Creator",
          value: creator,
          severity: "neutral",
          explanation: "The application that originally created the document"
        },
        {
          name: "CreationDate",
          value: creationDate ? creationDate.toISOString().split('T')[0] : "Unknown",
          severity: creationDate && (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24) < 7 ? "yellow" : "neutral",
          explanation: creationDate && (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24) < 7 ? "Recently created document - check for freshness" : "Creation date appears reasonable"
        },
        {
          name: "ModDate",
          value: modificationDate ? modificationDate.toISOString().split('T')[0] : "Unknown",
          severity: "neutral",
          explanation: "Date the document was last modified"
        },
        {
          name: "Author",
          value: author,
          severity: ["unknown", "user", "admin"].includes(author.toLowerCase()) ? "yellow" : "green",
          explanation: ["unknown", "user", "admin"].includes(author.toLowerCase()) ? "Generic or missing author info" : "Author field is specific"
        },
        {
          name: "Title",
          value: title,
          severity: "neutral",
          explanation: "Document title metadata"
        },
        {
          name: "Subject",
          value: subject,
          severity: "neutral",
          explanation: "Describes what the document is about"
        },
        {
          name: "Keywords",
          value: keywords,
          severity: "neutral",
          explanation: "Keywords associated with this document"
        }
      ];

      setMetadata(simulatedMetadata);
      setAnalysisComplete(true);

      const redFlags = simulatedMetadata.filter(item => item.severity === "red").length;
      const yellowFlags = simulatedMetadata.filter(item => item.severity === "yellow").length;

      if (redFlags > 0) {
        toast.error(`${redFlags} critical issues detected in document metadata`, { duration: 4000 });
      } else if (yellowFlags > 0) {
        toast.warning(`${yellowFlags} suspicious elements found - review recommended`, { duration: 3000 });
      } else {
        toast.success("Document metadata appears legitimate", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to analyze document metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    extractPdfMetadata();
  };

  const getSeverityIcon = (severity: MetadataItem["severity"]) => {
    switch (severity) {
      case "red": return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "yellow": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "green": return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: MetadataItem["severity"]) => {
    switch (severity) {
      case "red": return <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Red Flag</div>;
      case "yellow": return <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">Warning</div>;
      case "green": return <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Authentic</div>;
      default: return <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Info</div>;
    }
  };

  return (
    <ScrollReveal>
      <section id="document-verification" className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Document Verification</h2>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Upload a PDF document to verify its authenticity through metadata analysis.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Document Metadata Analysis
              </CardTitle>
              <CardDescription>
                Upload a PDF file to analyze its metadata for signs of tampering or fraud.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label
                    htmlFor="pdf-upload"
                    className="flex-1 cursor-pointer bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 px-6 py-8 flex flex-col items-center justify-center text-center transition-colors"
                  >
                    <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-1">Click to upload PDF</h3>
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "PDF files only (max 10MB)"}
                    </p>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || isLoading}
                    className="sm:self-end"
                  >
                    {isLoading ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <FileCheck className="mr-1" /> Analyze Document
                      </>
                    )}
                  </Button>
                </div>

                {isLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-center">
                      <p className="text-muted-foreground">Analyzing document metadata...</p>
                    </div>
                  </div>
                )}

                {analysisComplete && metadata.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Analysis Results</h3>
                    
                    {metadata.filter(item => item.severity === "red").length > 0 && (
                      <Alert variant="destructive" className="border-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Potential fraud detected</AlertTitle>
                        <AlertDescription>
                          This document contains metadata that suggests it may have been tampered with or fraudulently created.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {metadata.filter(item => item.severity === "yellow").length > 0 && 
                     metadata.filter(item => item.severity === "red").length === 0 && (
                      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="text-amber-600 dark:text-amber-400">Suspicious elements found</AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          Some metadata elements require additional verification. Proceed with caution.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {metadata.filter(item => item.severity === "red").length === 0 && 
                     metadata.filter(item => item.severity === "yellow").length === 0 && (
                      <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <AlertTitle className="text-green-600 dark:text-green-400">Document appears legitimate</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          No suspicious metadata was detected in this document.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4">Property</TableHead>
                          <TableHead className="w-1/4">Value</TableHead>
                          <TableHead className="w-1/6">Risk Level</TableHead>
                          <TableHead>Analysis</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metadata.map((item, index) => (
                          <TableRow key={index} className={cn(
                            item.severity === "red" && "bg-red-50 dark:bg-red-900/20",
                            item.severity === "yellow" && "bg-amber-50 dark:bg-amber-900/20",
                            item.severity === "green" && "bg-green-50 dark:bg-green-900/20"
                          )}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="font-mono text-xs break-all">{item.value}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getSeverityIcon(item.severity)}
                                {getSeverityBadge(item.severity)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{item.explanation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                <p>Disclaimer: This analysis is algorithmic and should be verified by an expert for critical documents.</p>
              </div>
              {analysisComplete && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setMetadata([]);
                    setAnalysisComplete(false);
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" /> Clear Results
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default MetadataDetection;

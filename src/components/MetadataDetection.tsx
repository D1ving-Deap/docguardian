
import React, { useState } from "react";
import { Upload, AlertCircle, AlertTriangle, CheckCircle, XCircle, FileCheck, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import ScrollReveal from "./ScrollReveal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a production environment, this is where you would use a PDF parsing library
      // like pdf.js, pdf-parse, or a backend API to extract real metadata
      // For this demo, we're showing a simulation with placeholder data
      
      // Example metadata items that would be extracted from a real PDF
      const simulatedMetadata: MetadataItem[] = [
        {
          name: "Producer",
          value: "Adobe Acrobat Pro DC 22.001.20085", 
          severity: "green",
          explanation: "Created with official document software - typically legitimate"
        },
        {
          name: "CreationDate",
          value: new Date().toISOString().split('T')[0],
          severity: "neutral",
          explanation: "Creation date matches expected timeline"
        },
        {
          name: "ModDate",
          value: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          severity: "neutral",
          explanation: "Last modified 2 days ago - reasonable for recent documents"
        },
        {
          name: "Author",
          value: "Financial Authority",
          severity: "green",
          explanation: "Specific institutional author increases document credibility"
        },
        {
          name: "Title",
          value: file.name.replace('.pdf', ''),
          severity: "neutral",
          explanation: "Document title matches filename"
        },
        {
          name: "Subject",
          value: "Official Documentation",
          severity: "green",
          explanation: "Subject field properly completed with relevant information"
        },
        {
          name: "Keywords",
          value: "official, verified, 2024",
          severity: "green",
          explanation: "Keywords match expected document type"
        },
        {
          name: "PDF Version",
          value: "1.7",
          severity: "neutral",
          explanation: "Standard PDF version, no concerns"
        }
      ];
      
      setMetadata(simulatedMetadata);
      setAnalysisComplete(true);
      
      // Count issues by severity
      const redFlags = simulatedMetadata.filter(item => item.severity === "red").length;
      const yellowFlags = simulatedMetadata.filter(item => item.severity === "yellow").length;
      
      if (redFlags > 0) {
        toast.error(`${redFlags} critical issues detected in document metadata`, {
          duration: 4000,
        });
      } else if (yellowFlags > 0) {
        toast.warning(`${yellowFlags} suspicious elements found - review recommended`, {
          duration: 3000,
        });
      } else {
        toast.success("Document metadata appears legitimate", {
          duration: 3000,
        });
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
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "red":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "yellow":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "green":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "red":
        return (
          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            Red Flag
          </div>
        );
      case "yellow":
        return (
          <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
            Warning
          </div>
        );
      case "green":
        return (
          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Authentic
          </div>
        );
      default:
        return (
          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Info
          </div>
        );
    }
  };
  
  return (
    <ScrollReveal className="my-16">
      <Card className="bg-white overflow-hidden border border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Document Metadata Detection</CardTitle>
              <CardDescription className="text-foreground/70">
                Identify fraudulent documents through metadata analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Demonstration Mode</AlertTitle>
            <AlertDescription className="text-xs text-blue-700">
              This is a simulation of metadata extraction. In a production environment, this would use 
              a PDF parsing library to extract and analyze real document metadata.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-lg border-2 border-dashed border-primary/20 p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
                <p className="text-sm text-foreground/70 mb-4">
                  Upload a PDF document to analyze its metadata for potential fraud indicators
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="pdf-upload" 
                      className="cursor-pointer flex items-center justify-center gap-2 rounded border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground w-full"
                    >
                      <FileCheck className="h-4 w-4" />
                      Select PDF File
                    </label>
                    <input 
                      id="pdf-upload" 
                      type="file" 
                      accept="application/pdf" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {file && (
                    <div className="text-sm bg-secondary/50 p-2 rounded">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-foreground/60">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!file || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Analyzing..." : "Analyze Metadata"}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg bg-secondary/30 p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Privacy Notice
                </h3>
                <p className="text-xs text-foreground/70">
                  Document processing happens in your browser. Files are not stored or transmitted
                  to any server for security and privacy reasons.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-3 bg-white rounded-lg">
              <div className={cn(
                "h-full flex items-center justify-center text-center p-6 transition-all",
                !analysisComplete && "opacity-50"
              )}>
                {!file && !analysisComplete && (
                  <div className="text-foreground/60">
                    <XCircle className="h-12 w-12 mx-auto mb-3 text-foreground/30" />
                    <p>No document selected</p>
                    <p className="text-xs mt-1">Upload a PDF to analyze its metadata</p>
                  </div>
                )}
                
                {file && !analysisComplete && (
                  <div className="text-foreground/60">
                    <div className={cn(
                      "h-12 w-12 rounded-full border-4 border-t-primary border-primary/20 mx-auto mb-3",
                      isLoading && "animate-spin"
                    )}></div>
                    <p>{isLoading ? "Analyzing document..." : "Ready to analyze"}</p>
                    <p className="text-xs mt-1">{file.name}</p>
                  </div>
                )}
                
                {analysisComplete && (
                  <div className="w-full">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Metadata Analysis Results</h3>
                      <div className="flex gap-2">
                        {metadata.filter(m => m.severity === "red").length > 0 && (
                          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{metadata.filter(m => m.severity === "red").length}</span>
                          </div>
                        )}
                        {metadata.filter(m => m.severity === "yellow").length > 0 && (
                          <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{metadata.filter(m => m.severity === "yellow").length}</span>
                          </div>
                        )}
                        {metadata.filter(m => m.severity === "green").length > 0 && (
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{metadata.filter(m => m.severity === "green").length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metadata.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="font-mono text-sm">{item.value}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(item.severity)}
                                {getSeverityBadge(item.severity)}
                              </div>
                              <div className="text-xs text-foreground/70 mt-1">
                                {item.explanation}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/20 border-t border-border/20 flex flex-col sm:flex-row gap-2 justify-between">
          <div className="text-sm text-foreground/70">
            <span className="font-medium text-foreground">VerifyFlow</span> uses AI to detect document tampering through metadata analysis
          </div>
          <div className="flex gap-2">
            <div className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1">
              <span className="rounded-full w-2 h-2 bg-red-600"></span>
              Red Flags
            </div>
            <div className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <span className="rounded-full w-2 h-2 bg-amber-500"></span>
              Warnings
            </div>
            <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
              <span className="rounded-full w-2 h-2 bg-green-600"></span>
              Authentic
            </div>
          </div>
        </CardFooter>
      </Card>
    </ScrollReveal>
  );
};

export default MetadataDetection;

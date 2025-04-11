
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

// Define basic OCR functions for text extraction
const extractTextFromPdfBuffer = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // For simplicity in this demo, we'll just return a sample text
    // In a real implementation, you would parse the PDF text layer or use a proper OCR library
    return `Sample text extracted from PDF with ${pages.length} pages.`;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting text from PDF";
  }
};

// Mock function for extracting structured data
const extractStructuredData = (text: string, documentType: string): Record<string, string> => {
  // In a real implementation, you would use regex patterns or ML models to extract data
  // For this demo, we'll return mock data based on the document type
  
  switch(documentType) {
    case 'id':
      return {
        name: "John Smith",
        address: "123 Main St, Anytown, Canada",
        dob: "1980-01-01",
        idNumber: "D1234-56789-00000"
      };
    case 'address_proof':
      return {
        name: "John Smith",
        address: "123 Main St, Anytown, Canada",
        date: "2023-03-15"
      };
    case 'paystub':
      return {
        employer: "ABC Company Inc.",
        name: "John Smith",
        payPeriod: "01/01/2023 - 01/15/2023",
        grossIncome: "$2,500.00",
        netIncome: "$1,800.00"
      };
    case 'employment_letter':
      return {
        employer: "ABC Company Inc.",
        employeePosition: "Senior Developer",
        employmentStartDate: "2019-06-01",
        annualSalary: "$95,000.00"
      };
    case 'bank_statement':
      return {
        bankName: "First National Bank",
        accountNumber: "XXXX-XXXX-1234",
        balance: "$12,345.67",
        statementDate: "2023-03-01"
      };
    default:
      return {
        documentType: documentType,
        processedDate: new Date().toISOString()
      };
  }
};

// Mock OCR confidence score for fraud detection
const calculateFraudScore = (documentType: string): string => {
  // In a real implementation, you would analyze meta-data and content for suspicious patterns
  // For this demo, we'll just return random confidence levels
  const scores = ["Low", "Medium", "High"];
  return scores[Math.floor(Math.random() * scores.length)];
};

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Create a Supabase client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Handle HTTP requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Handle POST requests only
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    console.log("Processing document request");
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;
    const documentType = formData.get("documentType") as string;
    
    if (!file || !applicationId || !documentType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: file, applicationId, or documentType" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing document: ${file.name} for application: ${applicationId}, type: ${documentType}`);
    
    // Read file buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Extract text using OCR or PDF text layer extraction
    const rawText = await extractTextFromPdfBuffer(fileBuffer);
    
    // Extract structured data from the text
    const extractedFields = extractStructuredData(rawText, documentType);
    
    // Calculate fraud risk score
    const fraudScore = calculateFraudScore(documentType);
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `applications/${applicationId}/${documentType}/${fileName}`;
    
    // Store file in Supabase Storage
    try {
      const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from('applications')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600'
        });
        
      if (storageError) {
        console.error("Storage error:", storageError);
        throw storageError;
      }
      
      console.log("File uploaded to storage:", storageData?.path);
    } catch (storageError) {
      console.error("Error uploading to storage:", storageError);
      // Continue processing even if storage fails
    }
    
    // Insert document record in database
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        filename: file.name,
        file_path: filePath,
        raw_text: rawText,
        structured_data: extractedFields,
        verified: true, // Auto-verified for demo purposes
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    console.log("Document processed successfully, ID:", data.id);
    
    // Update application with fraud score if needed
    if (documentType === 'id' || documentType === 'address_proof') {
      await supabaseAdmin
        .from('mortgage_applications')
        .update({ 
          fraud_score: fraudScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        documentId: data.id,
        extractedFields,
        fraudScore
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process document" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

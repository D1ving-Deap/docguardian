
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Extract text from PDF if it contains selectable text
async function extractTextFromPDF(pdfBytes: Uint8Array): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    let fullText = '';

    // This is a simplified approach - pdf-lib doesn't have direct text extraction
    // In a production app, you'd use a more robust library like pdf.js or pdfjs-dist
    // For now, we'll simulate text extraction with a message
    
    fullText = `[PDF LOADED: ${pages.length} pages]
This is simulated text extraction. In a production environment, 
you would use a library with proper text extraction capabilities.
Sample extracted data:
- Name: John Smith
- Address: 123 Main St, Anytown, USA
- Income: $85,000
- Document Date: 2023-04-15`;

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return `Error extracting text: ${error.message}`;
  }
}

// Structure the extracted text into an object with relevant fields
function structureExtractedText(text: string): Record<string, any> {
  // This is a simplified approach - in a real app, you'd use NLP or regex patterns
  // to extract specific fields based on the document type
  
  const structured: Record<string, any> = {
    extractedFields: {}
  };
  
  // Simple pattern matching for demonstration
  const nameMatch = text.match(/Name:\s*([^\n]+)/);
  if (nameMatch) structured.extractedFields.name = nameMatch[1].trim();
  
  const addressMatch = text.match(/Address:\s*([^\n]+)/);
  if (addressMatch) structured.extractedFields.address = addressMatch[1].trim();
  
  const incomeMatch = text.match(/Income:\s*([^\n]+)/);
  if (incomeMatch) structured.extractedFields.income = incomeMatch[1].trim();
  
  const dateMatch = text.match(/Document Date:\s*([^\n]+)/);
  if (dateMatch) structured.extractedFields.documentDate = dateMatch[1].trim();
  
  return structured;
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body as FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !applicationId || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, applicationId, or documentType' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process the PDF file
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const extractedText = await extractTextFromPDF(fileBytes);
    const structuredData = structureExtractedText(extractedText);

    // Generate a unique file path in storage
    const timestamp = new Date().getTime();
    const filePath = `${applicationId}/${timestamp}_${file.name}`;

    // Store the file in Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, fileBytes, {
        contentType: file.type,
        upsert: true
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage', details: storageError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Store document metadata and extracted data in the documents table
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        filename: file.name,
        file_path: filePath,
        document_type: documentType,
        raw_text: extractedText,
        structured_data: structuredData
      })
      .select()
      .single();

    if (documentError) {
      console.error('Database error:', documentError);
      return new Response(
        JSON.stringify({ error: 'Failed to store document metadata', details: documentError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the application progress based on document upload
    const { data: appData, error: appError } = await supabase
      .from('mortgage_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (!appError && appData) {
      // Simple logic to increment progress by 10% for each document
      const newProgress = Math.min(appData.progress + 10, 100);
      
      // Update stage if progress reaches certain thresholds
      let newStage = appData.stage;
      if (newProgress >= 30 && newProgress < 60) {
        newStage = 'Income Verification';
      } else if (newProgress >= 60 && newProgress < 90) {
        newStage = 'Property Appraisal';
      } else if (newProgress >= 90) {
        newStage = 'Final Approval';
      }
      
      await supabase
        .from('mortgage_applications')
        .update({ 
          progress: newProgress,
          stage: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
    }

    // Return success response with extracted data
    return new Response(
      JSON.stringify({
        success: true,
        documentId: documentData.id,
        extractedFields: structuredData.extractedFields
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

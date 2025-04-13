
// Follow Deno and Supabase best practices
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Handle OPTIONS requests for CORS preflight
const handleOptionsRequest = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// URL of your local OCR server - replace with your actual local server IP and port
// You'll need to update this with your local machine's IP address
const OCR_SERVER_URL = "http://YOUR_LOCAL_IP:3000/process-document"

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the FormData from the request
    const formData = await req.formData()
    const file = formData.get('file') as File
    const applicationId = formData.get('applicationId') as string
    const documentType = formData.get('documentType') as string
    const filePath = formData.get('filePath') as string

    if (!file || !applicationId || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, applicationId, or documentType' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    console.log(`Processing document for application ${applicationId}, type: ${documentType}`)

    // Create a new FormData to send to the OCR server
    const ocrFormData = new FormData()
    ocrFormData.append('file', file)
    ocrFormData.append('applicationId', applicationId)
    ocrFormData.append('documentType', documentType)

    // Forward the request to the local OCR server
    console.log(`Forwarding request to OCR server: ${OCR_SERVER_URL}`)
    const ocrResponse = await fetch(OCR_SERVER_URL, {
      method: 'POST',
      body: ocrFormData,
    })

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text()
      console.error('OCR server error:', errorText)
      throw new Error(`OCR processing failed: ${errorText}`)
    }

    // Parse the OCR server response
    const ocrResult = await ocrResponse.json()
    console.log('OCR processing completed successfully')

    // Generate a document ID if not provided by OCR server
    const documentId = ocrResult.documentId || crypto.randomUUID()

    // Store document information in the database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        application_id: applicationId,
        document_type: documentType,
        filename: file.name,
        file_path: filePath,
        raw_text: ocrResult.rawText || '',
        structured_data: ocrResult.extractedFields || {}
      })
      .select()

    if (docError) {
      console.error('Error storing document metadata:', docError)
      throw new Error(`Database error: ${docError.message}`)
    }

    // Return the processed data
    return new Response(
      JSON.stringify({
        documentId,
        extractedFields: ocrResult.extractedFields,
        message: 'Document processed successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})

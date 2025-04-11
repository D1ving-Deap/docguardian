
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

    // Generate a temporary document ID
    const documentId = crypto.randomUUID()

    // Get file text (simplified mock extraction)
    const fileText = `This is extracted text from ${file.name}`

    // Mock extracted fields for demo purposes
    // In a real implementation, this would use a PDF parsing library
    const mockExtractedFields = {
      name: 'John Doe',
      address: '123 Main St, Anytown, CA 12345',
      income: '$85,000',
      dateOfBirth: '1980-01-01'
    }

    // Store document information in the database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        application_id: applicationId,
        document_type: documentType,
        filename: file.name,
        file_path: filePath,
        raw_text: fileText,
        structured_data: mockExtractedFields
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
        extractedFields: mockExtractedFields,
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

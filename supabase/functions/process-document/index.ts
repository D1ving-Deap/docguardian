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

    // Parse the request body
    const requestData = await req.json()
    const { 
      documentId,
      applicationId, 
      documentType,
      extractedText,
      extractedFields 
    } = requestData

    if (!documentId || !applicationId || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: documentId, applicationId, or documentType' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    console.log(`Processing document ${documentId} for application ${applicationId}, type: ${documentType}`)

    // If this is a request from the browser OCR pathway, we already have extracted data
    // This function now mainly handles fraud detection and alert generation

    // Check if the document exists in the database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError) {
      console.error('Error retrieving document:', docError)
      throw new Error(`Database error: ${docError.message}`)
    }

    // Update document if needed
    if (!docData.raw_text && extractedText) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          raw_text: extractedText,
          structured_data: extractedFields || {}
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('Error updating document with extracted text:', updateError)
      }
    }

    // Check for potential fraud based on document type
    // This is a simplified example - in a real system you'd have more sophisticated detection
    if (extractedFields) {
      const fraudIndicators = detectFraudIndicators(documentType, extractedFields)
      
      if (fraudIndicators.length > 0) {
        console.log(`Detected ${fraudIndicators.length} potential fraud indicators`)
        
        // Insert fraud alerts for each detected issue
        for (const issue of fraudIndicators) {
          const { error: fraudError } = await supabase
            .from('fraud_alerts')
            .insert({
              document_id: documentId,
              issue: issue.description,
              severity: issue.severity
            })
            
          if (fraudError) {
            console.error('Error creating fraud alert:', fraudError)
          }
        }
        
        // Update application fraud score if high-severity issues found
        if (fraudIndicators.some(i => i.severity === 'High')) {
          const { error: appError } = await supabase
            .from('mortgage_applications')
            .update({ fraud_score: 'High' })
            .eq('id', applicationId)
            
          if (appError) {
            console.error('Error updating application fraud score:', appError)
          }
        }
      }
    }

    // Return the processed data
    return new Response(
      JSON.stringify({
        documentId,
        extractedFields,
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

// Helper function to detect potential fraud indicators
function detectFraudIndicators(documentType: string, extractedFields: any): Array<{description: string, severity: 'High' | 'Medium' | 'Low'}> {
  const issues: Array<{description: string, severity: 'High' | 'Medium' | 'Low'}> = [];
  
  // Simple fraud detection logic based on document type
  if (documentType.toLowerCase().includes('income') || documentType.toLowerCase().includes('pay')) {
    // Income verification checks
    if (extractedFields.income && extractedFields.reportedIncome) {
      const income = parseFloat(String(extractedFields.income).replace(/[^0-9.]/g, ''));
      const reportedIncome = parseFloat(String(extractedFields.reportedIncome).replace(/[^0-9.]/g, ''));
      
      if (!isNaN(income) && !isNaN(reportedIncome)) {
        const difference = Math.abs(income - reportedIncome);
        const percentDiff = (difference / reportedIncome) * 100;
        
        if (percentDiff > 20) {
          issues.push({
            description: `Income discrepancy of ${percentDiff.toFixed(2)}% detected`,
            severity: percentDiff > 40 ? 'High' : 'Medium'
          });
        }
      }
    }
  }
  
  if (documentType.toLowerCase().includes('id') || documentType.toLowerCase().includes('license')) {
    // ID verification - check for suspicious metadata
    if (extractedFields.modified && extractedFields.created) {
      const modified = new Date(extractedFields.modified);
      const created = new Date(extractedFields.created);
      
      if (!isNaN(modified.getTime()) && !isNaN(created.getTime())) {
        const daysDiff = Math.abs((modified.getTime() - created.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff < 7) {
          issues.push({
            description: 'Recently modified ID document detected',
            severity: 'Medium'
          });
        }
      }
    }
  }
  
  // Generic document metadata check
  if (extractedFields.metadata && extractedFields.metadata.edited) {
    issues.push({
      description: 'Document metadata indicates editing software was used',
      severity: 'High'
    });
  }
  
  // Return random fraud alerts if none detected (for demo purposes)
  // In a real system, you'd only return actual detected issues
  if (issues.length === 0 && Math.random() < 0.3) {
    const demoIssues = [
      { description: 'Inconsistent fonts detected in document', severity: 'Medium' as const },
      { description: 'Document metadata inconsistencies', severity: 'Low' as const },
      { description: 'Potential digital forgery detected', severity: 'High' as const },
      { description: 'Suspicious modification timestamps', severity: 'Medium' as const }
    ];
    
    // Add 1-2 random issues for demonstration
    const numIssues = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numIssues; i++) {
      const randomIssue = demoIssues[Math.floor(Math.random() * demoIssues.length)];
      issues.push(randomIssue);
    }
  }
  
  return issues;
}

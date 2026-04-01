import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'resources', 'sample-questions.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'PDF not found at ' + pdfPath
      });
    }

    // Dynamic require to avoid pdf-parse loading test files at build time
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);
    
    // Extract first 500 characters for preview
    const textPreview = data.text.substring(0, 500);
    
    return NextResponse.json({
      success: true,
      message: 'PDF found and parsed',
      pages: data.numpages,
      textPreview,
      pdfSize: pdfBuffer.length
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let pdfParse;
try {
  pdfParse = require('pdf-parse/lib/pdf-parse.js');
} catch (e) {
  console.error('PDF parse import error:', e);
}

export async function POST(req: NextRequest) {
  try {
    const sampleQuestionsPath = path.join(process.cwd(), 'public', 'resources', 'sample-questions.pdf');
    
    if (!fs.existsSync(sampleQuestionsPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sample questions PDF not found. Please place it at public/resources/sample-questions.pdf' 
      });
    }

    const pdfBuffer = fs.readFileSync(sampleQuestionsPath);
    const data = await pdfParse(pdfBuffer);
    
    // Extract questions from PDF text
    const extractedQuestions = extractQuestionsFromText(data.text);
    
    return NextResponse.json({
      success: true,
      message: `Extracted ${extractedQuestions.length} sample questions`,
      questions: extractedQuestions.slice(0, 5), // Preview first 5
      total: extractedQuestions.length
    });

  } catch (error: any) {
    console.error('Error processing sample questions:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}

function extractQuestionsFromText(text: string) {
  // This needs to be customized based on your PDF format
  // Common patterns for MCQs:
  const questionPattern = /(\d+\.?\s*.+?\?)\s*\n\s*([a-d]\).*?)\s*\n\s*([a-d]\).*?)\s*\n\s*([a-d]\).*?)\s*\n\s*([a-d]\).*?)/gi;
  
  const questions = [];
  let match;
  
  while ((match = questionPattern.exec(text)) !== null) {
    questions.push({
      id: questions.length + 1,
      question: match[1].trim(),
      options: [
        match[2].replace(/^[a-d]\)\s*/, '').trim(),
        match[3].replace(/^[a-d]\)\s*/, '').trim(),
        match[4].replace(/^[a-d]\)\s*/, '').trim(),
        match[5].replace(/^[a-d]\)\s*/, '').trim()
      ],
      keywords: extractKeywords(match[1]), // Extract from question text
      correct: 0 // You'll need to identify correct answers
    });
  }
  
  return questions;
}

function extractKeywords(questionText: string): string[] {
  return questionText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5); // Take top 5 keywords
}

export async function GET() {
  try {
    const sampleQuestionsPath = path.join(process.cwd(), 'public', 'resources', 'sample-questions.pdf');
    
    if (!fs.existsSync(sampleQuestionsPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sample questions PDF not found. Please place it at public/resources/sample-questions.pdf' 
      });
    }

    const pdfBuffer = fs.readFileSync(sampleQuestionsPath);
    const data = await pdfParse(pdfBuffer);
    
    const extractedQuestions = extractQuestionsFromText(data.text);
    
    return NextResponse.json({
      success: true,
      message: `Extracted ${extractedQuestions.length} sample questions`,
      questions: extractedQuestions.slice(0, 5),
      total: extractedQuestions.length
    });
  } catch (error: any) {
    console.error('Error processing sample questions:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

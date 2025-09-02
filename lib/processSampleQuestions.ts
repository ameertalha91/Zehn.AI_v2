import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');
import { db } from './db';

interface SampleQuestion {
  question: string;
  options: string[];
  correct: number;
  keywords: string[];
  category: string;
}

export async function processSampleQuestions() {
  const pdfPath = path.join(process.cwd(), 'public', 'resources', 'sample-questions.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    throw new Error('Sample questions PDF not found');
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(pdfBuffer);

  // Process PDF content and extract questions
  const questions = extractQuestionsFromText(data.text);

  // Store in database
  for (const question of questions) {
    await db.sampleQuestion.create({
      data: question
    });
  }

  return questions;
}

function extractQuestionsFromText(text: string): SampleQuestion[] {
  // Implement question extraction logic based on your PDF format
  // This will need to be customized based on how your sample questions are formatted
  const questions: SampleQuestion[] = [];
  
  // Example extraction logic - modify based on your PDF structure
  const sections = text.split(/\d+\.\s+/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length < 5) continue; // Question + 4 options minimum
    
    questions.push({
      question: lines[0].trim(),
      options: lines.slice(1, 5).map(l => l.replace(/^[a-d]\)\s*/i, '').trim()),
      correct: 0, // You'll need logic to determine correct answer
      keywords: extractKeywords(lines[0]),
      category: 'Pakistan Affairs' // Add proper categorization logic
    });
  }
  
  return questions;
}

function extractKeywords(text: string): string[] {
  // Basic keyword extraction - enhance based on your needs
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
}

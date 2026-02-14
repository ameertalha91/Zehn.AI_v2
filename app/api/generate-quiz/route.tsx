// app/api/generate-quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Fix the pdf-parse import - use the same method that works in process-document
let pdfParse: ((data: Buffer) => Promise<{ text: string }>) | undefined;
try {
  pdfParse = require('pdf-parse/lib/pdf-parse.js');
  console.log('PDF parse module loaded successfully');
} catch (e) {
  console.error('PDF parse import error:', e);
  pdfParse = undefined;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory cache for sample questions
let sampleQuestions: any[] = [];

export async function POST(req: NextRequest) {
  console.log('API route hit');
  
  try {
    const body = await req.json();
    const { videoTime, videoId, keywords, videoTitle } = body;
    console.log('Request data:', { videoTime, videoId, keywords, videoTitle });

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No keywords provided' 
      }, { status: 400 });
    }

    console.log('Attempting to load sample questions...');
    if (sampleQuestions.length === 0) {
      await loadSampleQuestions();
    }
    
    console.log(`Using ${sampleQuestions.length} sample questions`);

    // Find matching sample questions based on keywords
    const matchingQuestions = findMatchingQuestions(keywords);
    console.log(`Found ${matchingQuestions.length} matching sample questions`);

    // Use sample questions to inform AI generation
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are creating CSS exam questions for Pakistan Studies. Use the provided sample questions as reference but create variations based on the keywords. You must respond with ONLY valid JSON in this exact format: {\"questions\": [{\"id\": \"1\", \"question\": \"Question text?\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correct\": 0}]}"        },
        {
          role: "user", 
          content: `Video: "${videoTitle || 'Pakistan Studies'}"
Keywords: ${keywords.join(', ')}

Sample questions for reference:
${matchingQuestions.slice(0, 5).map(q => `Q: ${q.question}\nOptions: ${q.options.join(', ')}`).join('\n\n')}

Create 3 new CSS exam-style questions that:
1. Are inspired by the sample questions but not identical
2. Focus on the keywords: ${keywords.join(', ')}
3. Have accurate historical facts and correct answers
4. Follow the same format as the sample questions`
        }
      ],
      temperature: 0.8,
      max_tokens: 1200
    });

    const content = response.choices[0].message.content;
    console.log('AI response:', content);
    
    // Clean the response to handle any markdown formatting
    let cleanContent = (content ?? '').trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const parsedResponse = JSON.parse(cleanContent);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('AI did not return questions in expected format');
    }
    
    return NextResponse.json({
      success: true,
      timeStamp: videoTime || 0,
      questions: parsedResponse.questions || []
    });

  } catch (error: any) {
    console.error('Full error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function loadSampleQuestions() {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'resources', 'sample-questions.pdf');
    console.log('Checking PDF path:', pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
      console.log('Sample questions PDF not found at:', pdfPath);
      sampleQuestions = [];
      return;
    }

    if (!pdfParse) {
      throw new Error('PDF parser not initialized');
    }

    console.log('PDF file exists, attempting to read...');
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF buffer size:', pdfBuffer.length);
    
    console.log('Attempting to parse PDF...');
    const data = await pdfParse(pdfBuffer);
    console.log('PDF parsing successful, text length:', data.text?.length || 0);
    console.log('First 200 chars:', data.text?.substring(0, 200));
    
    // Extract questions from the PDF text
    sampleQuestions = extractQuestionsFromText(data.text);
    console.log(`Loaded ${sampleQuestions.length} sample questions from PDF`);
  } catch (error) {
    console.error('Detailed error loading sample questions:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    sampleQuestions = [];
  }
}

function extractQuestionsFromText(text: string) {
  const questions = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for numbered questions (e.g., "1.", "2.", etc.)
    if (line.match(/^\d+\./)) {
      // Combine multiple lines to form complete question
      let questionText = line;
      let j = 1;
      
      // Continue reading lines until we find options or another question
      while (i + j < lines.length) {
        const nextLine = lines[i + j].trim();
        
        // Stop if we find another numbered question or options
        if (nextLine.match(/^\d+\./) || nextLine.match(/^[a-dA-D][\)\.]/)) {
          break;
        }
        
        // Add to question text if it's content
        if (nextLine.length > 0) {
          questionText += ' ' + nextLine;
        }
        j++;
      }
      
      // Look for options starting from where we stopped
      const options = [];
      while (i + j < lines.length && options.length < 4) {
        const optionLine = lines[i + j].trim();
        
        // Check for option patterns: a), b), c), d) or A), B), C), D)
        if (optionLine.match(/^[a-dA-D][\)\.]\s*/)) {
          options.push(optionLine.replace(/^[a-dA-D][\)\.]\s*/, '').trim());
        } else if (optionLine.match(/^\d+\./)) {
          // Stop if we hit another question
          break;
        }
        j++;
      }
      
      // Add question if we found at least 2 options
      if (options.length >= 2) {
        questions.push({
          id: `q${questions.length + 1}`,
          question: questionText,
          options: options.length === 4 ? options : [...options, ...Array(4 - options.length).fill('Additional option')],
          keywords: extractKeywords(questionText),
          correct: 0
        });
        
        console.log(`Extracted question ${questions.length}: ${questionText.substring(0, 50)}...`);
      }
      
      // Skip ahead to avoid re-processing
      i += j - 1;
    }
  }
  
  console.log(`Total questions extracted: ${questions.length}`);
  return questions;
}

function extractKeywords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'whose', 'whom', 'this', 'that', 'these', 'those'].includes(word))
    .slice(0, 5); // Take first 5 keywords
}

function findMatchingQuestions(keywords: string[]) {
  return sampleQuestions
    .map(question => {
      let score = 0;
      keywords.forEach(keyword => {
        // Higher score for direct matches in question text
        if (question.question.toLowerCase().includes(keyword.toLowerCase())) {
          score += 3;
        }
        
        // Score for keyword matches
        question.keywords.forEach((qKeyword: string) => {
          if (qKeyword.toLowerCase().includes(keyword.toLowerCase()) || 
              keyword.toLowerCase().includes(qKeyword.toLowerCase())) {
            score += 1;
          }
        });
      });
      return { ...question, score };
    })
    .filter(q => q.score > 0)
    .sort((a, b) => b.score - a.score);
}
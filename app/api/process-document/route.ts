export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let pdfParse;
try {
  pdfParse = require('pdf-parse/lib/pdf-parse.js');
  console.log('PDF parse module loaded successfully');
} catch (e) {
  console.error('PDF parse import error:', e);
}

interface Chunk {
  content: string;
  start: number;
  end: number;
  score: number;
  context?: string;
}

function calculateRelevanceScore(chunk: string, searchTerms: string[]): number {
  const chunkLower = chunk.toLowerCase();
  let score = 0;
  
  // Check for exact phrase matches (higher weight)
  const originalQuery = searchTerms.join(' ');
  if (chunkLower.includes(originalQuery.toLowerCase())) {
    score += 10;
  }
  
  // Check individual term frequency and context
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    const matches = (chunkLower.match(new RegExp(termLower, 'g')) || []).length;
    score += matches * 2;
    
    // Bonus for terms appearing in meaningful contexts (not just headers)
    const sentences = chunk.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(termLower) && sentence.length > 50) {
        score += 3; // Bonus for substantial sentences
      }
    });
  });
  
  // Penalty for very short chunks (likely headers/TOC)
  if (chunk.length < 100) {
    score *= 0.3;
  }
  
  // Bonus for chunks with substantive content
  const wordCount = chunk.split(/\s+/).length;
  if (wordCount > 100) {
    score += Math.min(wordCount / 20, 5); // Cap bonus at 5
  }
  
  return score;
}

function extractMeaningfulChunks(text: string, chunkSize: number = 1500, overlap: number = 300): Chunk[] {
  const chunks: Chunk[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  let currentStart = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      // Create chunk
      chunks.push({
        content: currentChunk.trim(),
        start: currentStart,
        end: currentStart + currentChunk.length,
        score: 0
      });
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + ' ' + sentence;
      currentStart = currentStart + currentChunk.length - overlapText.length - sentence.length - 1;
    } else {
      if (currentChunk === '') {
        currentStart = text.indexOf(sentence, currentStart);
      }
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      start: currentStart,
      end: currentStart + currentChunk.length,
      score: 0
    });
  }
  
  return chunks;
}

function filterOutTableOfContents(chunks: Chunk[]): Chunk[] {
  return chunks.filter(chunk => {
    const content = chunk.content.toLowerCase();
    
    // Common TOC patterns
    const tocPatterns = [
      /^(chapter|unit|lesson)\s*\d+/i,
      /^\d+\.\d+/,
      /page\s*\d+/i,
      /contents|index|table of contents/i,
      /^[a-z\s]+\.\.\.\.\d+$/im // Pattern like "Introduction......5"
    ];
    
    // Check if chunk is mostly numbers and dots (page numbers)
    const dotsAndNumbers = (content.match(/[.\d\s]/g) || []).length;
    const totalChars = content.length;
    
    if (dotsAndNumbers / totalChars > 0.7) {
      return false;
    }
    
    // Check TOC patterns
    for (const pattern of tocPatterns) {
      if (pattern.test(content)) {
        return false;
      }
    }
    
    // Keep substantial content
    return chunk.content.split(/\s+/).length > 20;
  });
}

export async function POST(req: NextRequest) {
  console.log('POST request received at:', new Date().toISOString());

  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { action, query } = body;

    const pdfPath = path.join(process.cwd(), 'public', 'books', 'pakistan-studies.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ success: false, error: 'PDF not found' });
    }

    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      
      if (!pdfParse) {
        throw new Error('PDF parser not initialized');
      }

      const data = await pdfParse(pdfBuffer);
      console.log('Parse successful:', { pages: data.numpages });

      if (action === 'search' && query) {
        const pdfText = data.text;
        
        // Create more intelligent chunks
        let chunks = extractMeaningfulChunks(pdfText);
        
        // Filter out table of contents and similar non-content
        chunks = filterOutTableOfContents(chunks);
        
        // Search and score chunks
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        
        const scoredChunks = chunks.map(chunk => ({
          ...chunk,
          score: calculateRelevanceScore(chunk.content, searchTerms)
        })).filter(chunk => chunk.score > 0);
        
        // Sort by relevance and take top results
        const topChunks = scoredChunks
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        
        // Add context information
        const enrichedChunks = topChunks.map(chunk => {
          // Try to identify what section this might be from
          const lines = chunk.content.split('\n');
          const firstMeaningfulLine = lines.find(line => line.trim().length > 10);
          
          return {
            ...chunk,
            context: firstMeaningfulLine?.substring(0, 100) + '...'
          };
        });
        
        console.log(`Found ${enrichedChunks.length} relevant chunks for query: "${query}"`);
        console.log('Top chunk scores:', enrichedChunks.map(c => c.score));
        
        return NextResponse.json({
          success: true,
          hasRelevantContext: enrichedChunks.length > 0,
          chunks: enrichedChunks,
          message: `Found ${enrichedChunks.length} relevant sections`,
          debug: {
            totalChunks: chunks.length,
            searchTerms: searchTerms,
            topScore: enrichedChunks[0]?.score || 0
          }
        });
        
      } else if (action === 'parse') {
        return NextResponse.json({
          success: true,
          message: 'PDF parsed successfully',
          pages: data.numpages
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'PDF parsed successfully',
          pages: data.numpages
        });
      }

    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: `Parse error: ${parseError.message}` 
      });
    }
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Type definitions for enhanced stream sessions
interface StreamSession {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  instructor: string;
  pathwayId: string;
  category: string;
  description: string;
  duration: string;
  objectives: string[];
  keyTopics: string[];
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  sessionOrder: number;
  thumbnail: string;
  uploadDate: string;
  views?: number;
  completionRate?: number;
}

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  students: number;
  difficulty: string;
  sessions: StreamSession[];
  outcomes: string[];
  prerequisites: string[];
  thumbnail: string;
}

// Path to data storage (will be replaced with database later)
const DATA_PATH = join(process.cwd(), 'data');
const PATHWAYS_FILE = join(DATA_PATH, 'learning-pathways.json');

// Ensure data directory exists
function ensureDataDirectory() {
  if (!existsSync(DATA_PATH)) {
    require('fs').mkdirSync(DATA_PATH, { recursive: true });
  }
}

// Load existing pathways data
function loadPathways(): LearningPathway[] {
  ensureDataDirectory();
  
  if (!existsSync(PATHWAYS_FILE)) {
    // Initialize with default pathways if file doesn't exist
    const defaultPathways: LearningPathway[] = [
      {
        id: 'css-excellence-pathway',
        title: 'CSS Excellence Mastery Pathway',
        description: 'Comprehensive preparation for Pakistan Civil Services examination with focus on constitutional development, political evolution, and governance structures.',
        category: 'Pakistan Studies',
        instructor: 'Dr. Ahmed Hassan Khan',
        duration: '180 hours',
        students: 245,
        difficulty: 'Advanced',
        sessions: [],
        outcomes: [
          'Master constitutional development timeline',
          'Analyze political evolution patterns',
          'Understand governance structures',
          'Apply analytical thinking to policy questions'
        ],
        prerequisites: [
          'Basic knowledge of Pakistan history',
          'Understanding of political systems',
          'Critical analysis skills'
        ],
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      },
      {
        id: 'diplomatic-mastery-track',
        title: 'Diplomatic Intelligence Mastery Track',
        description: 'Advanced curriculum covering international relations, diplomatic protocols, and foreign policy analysis for aspiring diplomats.',
        category: 'International Relations',
        instructor: 'Ambassador Sarah Malik',
        duration: '150 hours',
        students: 189,
        difficulty: 'Advanced',
        sessions: [],
        outcomes: [
          'Understand international law frameworks',
          'Analyze diplomatic strategies',
          'Master negotiation techniques',
          'Apply foreign policy analysis'
        ],
        prerequisites: [
          'International relations basics',
          'Understanding of global politics',
          'Research and analysis skills'
        ],
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      },
      {
        id: 'current-affairs-intelligence',
        title: 'Current Affairs Intelligence Journey',
        description: 'Dynamic learning pathway focusing on contemporary issues, policy analysis, and strategic thinking for competitive examinations.',
        category: 'Current Affairs',
        instructor: 'Prof. Muhammad Ali Shah',
        duration: '120 hours',
        students: 312,
        difficulty: 'Intermediate',
        sessions: [],
        outcomes: [
          'Stay updated with current developments',
          'Analyze policy implications',
          'Develop strategic thinking',
          'Master exam-style responses'
        ],
        prerequisites: [
          'Basic awareness of current events',
          'Reading comprehension skills',
          'Analytical mindset'
        ],
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      }
    ];
    
    writeFileSync(PATHWAYS_FILE, JSON.stringify(defaultPathways, null, 2));
    return defaultPathways;
  }
  
  const data = readFileSync(PATHWAYS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save pathways data
function savePathways(pathways: LearningPathway[]) {
  writeFileSync(PATHWAYS_FILE, JSON.stringify(pathways, null, 2));
}

// Generate unique ID for stream sessions
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['videoUrl', 'title', 'instructor', 'pathwayId', 'category', 'description', 'duration'];
    for (const field of requiredFields) {
      if (!sessionData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Load existing pathways
    const pathways = loadPathways();
    
    // Find the target pathway
    const pathwayIndex = pathways.findIndex(p => p.id === sessionData.pathwayId);
    if (pathwayIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Learning pathway not found' },
        { status: 404 }
      );
    }
    
    // Create new stream session
    const newSession: StreamSession = {
      id: generateSessionId(),
      videoId: sessionData.videoId,
      videoUrl: sessionData.videoUrl,
      title: sessionData.title,
      instructor: sessionData.instructor,
      pathwayId: sessionData.pathwayId,
      category: sessionData.category,
      description: sessionData.description,
      duration: sessionData.duration,
      objectives: sessionData.objectives || [],
      keyTopics: sessionData.keyTopics || [],
      difficultyLevel: sessionData.difficultyLevel || 'Intermediate',
      sessionOrder: sessionData.sessionOrder || 1,
      thumbnail: sessionData.thumbnail,
      uploadDate: sessionData.uploadDate,
      views: 0,
      completionRate: 0
    };
    
    // Add session to pathway
    pathways[pathwayIndex].sessions.push(newSession);
    
    // Sort sessions by order
    pathways[pathwayIndex].sessions.sort((a, b) => a.sessionOrder - b.sessionOrder);
    
    // Save updated pathways
    savePathways(pathways);
    
    return NextResponse.json({
      success: true,
      message: 'Stream session created successfully',
      session: newSession,
      pathway: pathways[pathwayIndex].title
    });
    
  } catch (error) {
    console.error('Error creating stream session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathwayId = searchParams.get('pathwayId');
    
    const pathways = loadPathways();
    
    if (pathwayId) {
      // Return sessions for specific pathway
      const pathway = pathways.find(p => p.id === pathwayId);
      if (!pathway) {
        return NextResponse.json(
          { success: false, error: 'Learning pathway not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        sessions: pathway.sessions,
        pathway: {
          id: pathway.id,
          title: pathway.title,
          category: pathway.category
        }
      });
    } else {
      // Return all sessions across all pathways
      const allSessions: (StreamSession & { pathwayTitle: string })[] = [];
      
      pathways.forEach(pathway => {
        pathway.sessions.forEach(session => {
          allSessions.push({
            ...session,
            pathwayTitle: pathway.title
          });
        });
      });
      
      // Sort by upload date (newest first)
      allSessions.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      
      return NextResponse.json({
        success: true,
        sessions: allSessions,
        totalSessions: allSessions.length,
        pathwaysCount: pathways.length
      });
    }
    
  } catch (error) {
    console.error('Error fetching stream sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, updates } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const pathways = loadPathways();
    let sessionFound = false;
    
    // Find and update the session
    for (const pathway of pathways) {
      const sessionIndex = pathway.sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        pathway.sessions[sessionIndex] = { ...pathway.sessions[sessionIndex], ...updates };
        sessionFound = true;
        break;
      }
    }
    
    if (!sessionFound) {
      return NextResponse.json(
        { success: false, error: 'Stream session not found' },
        { status: 404 }
      );
    }
    
    savePathways(pathways);
    
    return NextResponse.json({
      success: true,
      message: 'Stream session updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating stream session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const pathways = loadPathways();
    let sessionFound = false;
    
    // Find and remove the session
    for (const pathway of pathways) {
      const sessionIndex = pathway.sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        pathway.sessions.splice(sessionIndex, 1);
        sessionFound = true;
        break;
      }
    }
    
    if (!sessionFound) {
      return NextResponse.json(
        { success: false, error: 'Stream session not found' },
        { status: 404 }
      );
    }
    
    savePathways(pathways);
    
    return NextResponse.json({
      success: true,
      message: 'Stream session deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting stream session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

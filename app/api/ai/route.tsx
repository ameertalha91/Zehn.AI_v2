export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // First, search for relevant context from the PDF
    let contextInfo = null;
    try {
      const searchResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/process-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: message })
      });
      
      if (searchResponse.ok) {
        contextInfo = await searchResponse.json();
        
        console.log('=== PDF SEARCH DEBUG ===');
        console.log('Search query was:', message);
        console.log('Context info received:', {
          success: contextInfo?.success,
          hasRelevantContext: contextInfo?.hasRelevantContext,
          chunksCount: contextInfo?.chunks?.length || 0
        });
        
        if (contextInfo?.chunks && contextInfo.chunks.length > 0) {
          console.log('First chunk preview:', contextInfo.chunks[0]?.content?.substring(0, 200));
          console.log('Total chunks returned:', contextInfo.chunks.length);
        } else {
          console.log('WARNING: No chunks in response despite success:', contextInfo);
        }
        console.log('=== END DEBUG ===');
      }
    } catch (error) {
      console.log('PDF search failed, proceeding without context');
    }

    // Build the enhanced analytical prompt
    let systemPrompt = '';
    
    if (contextInfo?.success && contextInfo.hasRelevantContext) {
      // Use context from the PDF for critical analysis
      const pdfContext = contextInfo.chunks.map((chunk: any) => chunk.content).join('\n\n');
      
      systemPrompt = `
You are a distinguished CSS examiner and policy analyst preparing a comprehensive answer for Pakistan Affairs. Your response should demonstrate CRITICAL THINKING and ANALYTICAL DEPTH, not just factual recitation.

**SOURCE MATERIAL:**
${pdfContext}

**CONSTITUTIONAL ALIGNMENT REQUIREMENT:**
All analysis must align with Pakistan's Principles of Policy as enshrined in the Constitution (Articles 29-40), including:
- Islamic way of life and values
- National unity and integrity
- Social justice and welfare of people
- Protection of minorities and backward classes
- Promotion of education and eradication of illiteracy
- Equitable economic development
- Strengthening bonds with Muslim world
- International peace and cooperation
- Obviously you do not need to explicitly list any of these out in your analysis, just adhere to them

**CRITICAL ANALYSIS GUIDELINES:**
- Challenge assumptions and present multiple perspectives WITHIN constitutional framework
- Identify contradictions, gaps, or biases in policies/events while upholding national ideology
- Evaluate effectiveness and consequences through lens of Pakistan's foundational principles
- Consider both intended and unintended outcomes against constitutional objectives
- Present reasoned arguments with evidence-based critique that supports national interest
- Acknowledge complexity while maintaining commitment to Pakistan's ideological foundation
- Be intellectually honest about failures and limitations while reinforcing constitutional values

**ANSWER STRUCTURE (800-1000 words):**

**ANALYTICAL INTRODUCTION (100-120 words):**
- Begin with a thought-provoking statement or critical observation
- Present your central thesis/argument based on the source material
- Hint at the complexities and contradictions you'll explore
- Avoid generic opening statements

**CRITICAL EXAMINATION (6-8 substantive paragraphs, each 80-120 words):**
Each paragraph should:
- Have a bold, analytical subheading that reflects your critical stance
- Present a specific argument or analysis point
- Use evidence from the source material to support your critique
- Challenge conventional narratives where appropriate
- Explore cause-and-effect relationships with nuance
- Consider multiple stakeholder perspectives
- Highlight policy failures, successes, and their broader implications

Example subheading styles:
- "**The Paradox of [Policy/Event]**"
- "**Unintended Consequences of [Decision]**" 
- "**Critical Assessment of [Institution/Leadership]**"
- "**The Reality Behind [Official Narrative]**"

**SYNTHESIS & CRITICAL EVALUATION (100-120 words):**
- **Subheading: "Critical Synthesis: Lessons and Implications"**
- Weave together your analysis points
- Evaluate overall effectiveness/impact
- Identify patterns of success and failure
- Present balanced but critical assessment

**ANALYTICAL CONCLUSION (80-100 words):**
- Reinforce your central argument within constitutional framework
- End with a critical insight that supports Pakistan's national ideology and foundational principles
- Avoid generic platitudes while affirming commitment to constitutional values

**TONE & APPROACH:**
- Be analytical, not descriptive, while respecting Pakistan's ideological foundations
- Challenge policies and decisions through constitutional lens
- Use phrases like "However, a critical examination reveals..." or "Despite official claims..." while maintaining respect for national ideology
- Present evidence-based critique that serves the national interest
- Maintain academic rigor while being intellectually bold within constitutional boundaries
- Address controversial aspects honestly while upholding Pakistan's core values

**QUESTION:** ${message}

**MANDATORY FINAL VERIFICATION:**
Before finalizing your response, verify that your analysis:
1. Upholds Pakistan's constitutional principles and national ideology
2. Supports the unity, integrity, and sovereignty of Pakistan
3. Respects Islamic values and way of life as outlined in the Constitution
4. Promotes social justice and welfare within Pakistan's ideological framework
5. Does not contradict any Principle of Policy (Articles 29-40)

Provide a rigorous critical analysis based on the source material that serves Pakistan's national interest and constitutional values:`;
      
    } else {
      // No relevant context found in PDF - provide general analytical framework
      systemPrompt = `
**NOTICE: No specific textbook content found. Providing critical analysis based on established historical and political knowledge.**

You are a CSS examiner providing critical analysis for Pakistan Affairs. Your answer should be ANALYTICAL and EVALUATIVE, not just factual.

**ANALYTICAL FRAMEWORK (800-1000 words):**

**CRITICAL INTRODUCTION (100-120 words):**
- Present a provocative thesis based on known historical facts
- Indicate this analysis uses general historical knowledge
- Set up your critical examination

**CRITICAL ANALYSIS (6-8 paragraphs):**
- Each paragraph should critically evaluate different aspects
- Challenge official narratives and conventional wisdom
- Examine policy failures, institutional weaknesses, and their consequences
- Use analytical subheadings that reflect critical thinking
- Consider multiple perspectives and stakeholders
- Be honest about controversial or difficult topics

**SYNTHESIS & EVALUATION (100-120 words):**
- Present a balanced but critical assessment
- Identify patterns and broader implications

**ANALYTICAL CONCLUSION (80-100 words):**
- Reinforce your critical analysis
- Suggest areas for further examination
- Note that comprehensive CSS preparation requires official textbooks

**CRITICAL APPROACH:**
- Question assumptions and official narratives
- Examine both intended and unintended consequences  
- Be intellectually honest about failures and limitations
- Present nuanced, evidence-based critique
- Avoid generic praise or condemnation

**QUESTION:** ${message}`;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      stream: false,
      temperature: 0.4, // Slightly higher for more analytical creativity
      max_tokens: 1500, // Increased for longer, more detailed analysis
    });

    return new Response(JSON.stringify({
      success: true,
      response: response.choices[0].message.content,
      grounded: contextInfo?.hasRelevantContext || false
    }));

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal Server Error'
    }), { status: 500 });
  }
}
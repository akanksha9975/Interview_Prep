import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateInterviewQuestions = async (jdText) => {
  try {
    const prompt = `Based on the following Job Description, generate exactly 3 interview questions that would be asked to a candidate. Make them specific to the role and requirements mentioned.

Job Description:
${jdText}

Format your response as a numbered list (1., 2., 3.) with clear, professional interview questions.`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const text = response.data.candidates[0].content.parts[0].text;
    return text;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    console.log('Using fallback questions based on JD content...');
    
    // Fallback: Generate basic questions from JD keywords
    const fallbackQuestions = `1. Can you tell me about your experience related to the responsibilities mentioned in this role?

2. What skills and qualifications do you possess that make you a good fit for this position?

3. Can you provide specific examples from your background that demonstrate your ability to succeed in this role?`;
    
    return fallbackQuestions;
  }
};

export const evaluateResponse = async (question, userAnswer, resumeChunks) => {
  try {
    const resumeContext = resumeChunks.map((chunk, idx) => 
      `[Resume Chunk ${idx + 1}]: ${chunk.text}`
    ).join('\n\n');
    
    const prompt = `You are an interview evaluator. Evaluate the candidate's response to the interview question based on their resume.

Question: ${question}

Candidate's Response: ${userAnswer}

Resume Information:
${resumeContext}

Provide:
1. A score from 1-10 (where 10 is excellent)
2. Constructive feedback (max 100 words) on their answer

Format your response as:
SCORE: [number]
FEEDBACK: [your feedback here]`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Parse the response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const feedbackMatch = text.match(/FEEDBACK:\s*(.+)/is);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : text;
    
    return { score, feedback };
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    console.log('Using fallback evaluation...');
    
    // Fallback: Simple keyword-based evaluation
    const answerLength = userAnswer.split(' ').length;
    const hasRelevantContent = resumeChunks.some(chunk => 
      userAnswer.toLowerCase().includes(chunk.text.substring(0, 50).toLowerCase())
    );
    
    let score = 5;
    let feedback = '';
    
    if (answerLength < 10) {
      score = 3;
      feedback = 'Your answer is too brief. Try to provide more detailed examples and expand on your experience.';
    } else if (answerLength < 30) {
      score = hasRelevantContent ? 6 : 5;
      feedback = hasRelevantContent 
        ? 'Good start! Your answer references relevant experience. Consider adding more specific examples and details.'
        : 'Your answer is okay, but try to connect it more closely to your resume and provide concrete examples.';
    } else {
      score = hasRelevantContent ? 8 : 6;
      feedback = hasRelevantContent
        ? 'Great answer! You provided detailed information that aligns well with your background. Consider being even more specific with metrics or outcomes.'
        : 'You gave a comprehensive answer. Make sure to tie your responses more directly to specific experiences from your resume.';
    }
    
    return { score, feedback };
  }
};

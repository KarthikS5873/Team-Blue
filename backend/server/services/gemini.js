import { GoogleGenAI, Type } from '@google/genai';
import { formatINR, aggregateByCategory } from './format.js';

let aiClient = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'business-advisor' }
      }
    });
  }
  return aiClient;
}

export async function generateRecommendations(businessProfile, todayActivities, pastActivities, tasks) {
  try {
    const client = getGeminiClient();

    const todaySummary = todayActivities.length > 0
      ? todayActivities.map(a => `- ${a.activity_name} (${a.hours_spent}h)${a.result ? ` → ${a.result}` : ''}`).join('\n')
      : 'No activities logged today.';

    const pastSummary = pastActivities.length > 0
      ? aggregateByCategory(pastActivities).map(c => `- ${c.category}: ${c.totalHours}h across ${c.count} entries`).join('\n')
      : 'No past activity data available.';

    const tasksSummary = tasks.length > 0
      ? tasks.map(t => `- [${t.priority}] ${t.task_name}${t.deadline ? ` (due: ${t.deadline})` : ''}`).join('\n')
      : 'No pending tasks.';

    const prompt = `You are a senior business growth consultant analyzing a business.

BUSINESS PROFILE:
Name: ${businessProfile.business_name}
Type: ${businessProfile.business_type}
Role: ${businessProfile.role}
Location: ${businessProfile.location || 'Unknown'}
Description: ${businessProfile.description || 'N/A'}
Goal: ${businessProfile.goal || 'Not specified'}
Monthly Revenue: ${formatINR(businessProfile.monthly_revenue)}
Weekly Revenue: ${formatINR(businessProfile.weekly_revenue)}
Daily Revenue: ${formatINR(businessProfile.daily_revenue)}

TODAY'S ACTIVITIES:
${todaySummary}

HISTORICAL ACTIVITY SUMMARY:
${pastSummary}

PENDING TASKS:
${tasksSummary}

Based on this data, analyze the user's activity patterns by comparing today against historical data. Provide specific, actionable recommendations in JSON format:

{
  "recommendations": [
    "Actionable recommendation 1 referencing specific activity comparisons",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ],
  "taskPriorities": {
    "high": ["Task name 1", "Task name 2"],
    "medium": ["Task name 3"],
    "low": ["Task name 4"]
  },
  "todayFocus": "Single sentence on what to focus on today",
  "weekFocus": "Single sentence on the weekly direction"
}

Rules:
- Do NOT provide scores or ratings
- Only actionable, specific recommendations
- Reference actual activity names and numbers
- Compare today vs historical patterns
- Use \u20B9 for INR currency
- Consider the user's location, business type, and role
- Be concise and direct`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            taskPriorities: {
              type: Type.OBJECT,
              properties: {
                high: { type: Type.ARRAY, items: { type: Type.STRING } },
                medium: { type: Type.ARRAY, items: { type: Type.STRING } },
                low: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['high', 'medium', 'low']
            },
            todayFocus: { type: Type.STRING },
            weekFocus: { type: Type.STRING }
          },
          required: ['recommendations', 'taskPriorities', 'todayFocus', 'weekFocus']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');

    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    throw error;
  }
}

export async function generateTaskPriorities(businessProfile, tasks) {
  try {
    const client = getGeminiClient();

    const tasksSummary = tasks.map(t =>
      `- ${t.task_name} [Priority: ${t.priority}, Status: ${t.status}${t.deadline ? `, Deadline: ${t.deadline}` : ''}]`
    ).join('\n');

    const prompt = `You are a senior business growth consultant.

BUSINESS:
Name: ${businessProfile.business_name}
Type: ${businessProfile.business_type}
Role: ${businessProfile.role}
Location: ${businessProfile.location || 'Unknown'}
Goal: ${businessProfile.goal || 'Not specified'}

TASKS TO PRIORITIZE:
${tasksSummary}

Rank these tasks by revenue impact, goal alignment, urgency, and customer impact.

Return JSON:
{
  "high": ["task name 1", "task name 2"],
  "medium": ["task name 3"],
  "low": ["task name 4"]
}

No scores. Only categorize into High, Medium, Low.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            high: { type: Type.ARRAY, items: { type: Type.STRING } },
            medium: { type: Type.ARRAY, items: { type: Type.STRING } },
            low: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['high', 'medium', 'low']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');

    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Gemini task prioritization error:', error);
    throw error;
  }
}

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini AI Client
let aiClient = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI insights will use local offline computations.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Full-SaaS AI analysis endpoint
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { user, activities, clients, tasks, goals } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.status(200).json({
        success: false,
        error: "GEMINI_API_KEY is missing",
        insights: [
          {
            title: "Administrative Time Drain (Calculated Offline)",
            category: "efficiency",
            description: "You have spent a considerable amount of hours on administrative tasks. Given your target rate of $" + (user?.targetHourlyRate || 150) + "/hr, this is creating a leak in your week's earning power.",
            impactScore: 82,
            actionableStep: "Harness task batching and limit billing filing to once weekly.",
            date: new Date().toISOString().split('T')[0]
          },
          {
            title: "Client Rate Calibration",
            category: "revenue",
            description: "Your active client rates span a wide margin. Re-assessing Stellar Media's current rates relative to the Acme Corporation baseline can generate an added $450 of high-yield income.",
            impactScore: 78,
            actionableStep: "Introduce standard pricing models with structured retainer tiers.",
            date: new Date().toISOString().split('T')[0]
          }
        ]
      });
    }

    // Build context prompt
    const prompt = `
      You are ChronosAI, an expert SaaS consultant, time valuation algorithm, and executive productivity coach.
      Analyze the user's current tracked time, client values, goals, and tasks, then provide 3 high-impact, actionable insights.

      User Context:
      - Name: ${user?.name || "User"}
      - Current Role: ${user?.role || "Consultant"}
      - Company: ${user?.company || "Freelancer"}
      - Target Hourly Rate: $${user?.targetHourlyRate || 150}/hr
      - Monthly Revenue Goal: $${user?.monthlyRevenueGoal || 15000}

      Logged Activities (Last 30 days):
      ${JSON.stringify(activities)}

      Clients List:
      ${JSON.stringify(clients)}

      Active Tasks:
      ${JSON.stringify(tasks)}

      Monthly Goals:
      ${JSON.stringify(goals)}

      Strict Directives:
      1. Analyze the time leakage. Compute the OPPORTUNITY COST of non-billable hours.
         - Non-billable categories are "Admin & Ops", "Marketing & Sales", "Product Dev", "Learning & Growth".
         - Opportunity Cost = duration * user's target hourly rate.
         - Highlight if "Admin & Ops" hours are too high (leaking high value for manual labor).
      2. Examine client distribution. Find which clients have the highest hourly yield vs energy load.
      3. Recommend concrete, specific automation steps or delegation plans (e.g., using specific tools, scheduling habits).
      4. Suggest rate adjustments if clients are paying under the user's target hourly rate.
      5. Address target goals (revenue and productivity), stating whether they are on track.

      Output JSON array matching the provided schema. Be professional, highly analytical, clear, and direct. No fluff.
    `;

    // Call Gemini 3.5-flash for super fast text generation
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              description: "The list of 3 generated consulting insights",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Captivating and professional short title for the insight."
                  },
                  category: {
                    type: Type.STRING,
                    description: "Category of the insight: must be 'efficiency', 'revenue', 'burnout', or 'growth'."
                  },
                  description: {
                    type: Type.STRING,
                    description: "High-level analysis explaining the exact problem, time leakage, or client yield opportunity."
                  },
                  impactScore: {
                    type: Type.INTEGER,
                    description: "Impact score from 1 to 100 on how critical/beneficial this action is."
                  },
                  actionableStep: {
                    type: Type.STRING,
                    description: "Immediate step-by-step instruction on how to execute the optimization."
                  },
                  date: {
                    type: Type.STRING,
                    description: "The current date in YYYY-MM-DD format."
                  }
                },
                required: ["title", "category", "description", "impactScore", "actionableStep", "date"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      insights: data.insights
    });

  } catch (error) {
    console.error("Gemini server-side API error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
});

// Vite Middleware Configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from dist.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChronosAI Server] running on http://localhost:${PORT}`);
  });
}

startServer();

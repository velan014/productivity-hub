import { query } from '../config/db';
import {
  AiChatMessage,
  AiTaskSuggestion,
  AiDailyPlanSuggestion,
  AiReviewAssistResponse,
} from '../types';

export class AiService {
  private static getApiKey(): string | null {
    return (
      process.env.AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      null
    );
  }

  private static getModel(): string {
    return process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Check if AI provider is configured
   */
  static isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  static getStatus(): { configured: boolean; model: string; provider: string } {
    const key = this.getApiKey();
    const provider = process.env.OPENAI_API_KEY ? 'OpenAI' : 'Google Gemini';
    return {
      configured: Boolean(key),
      model: this.getModel(),
      provider: Boolean(key) ? provider : 'None',
    };
  }

  /**
   * Helper to build user context summary safely without passwords or tokens
   */
  private static async getUserContext(userId: string): Promise<string> {
    try {
      // 1. Pending Tasks
      const tasks = await query<any[]>(
        "SELECT title, priority, category, due_date FROM tasks WHERE user_id = ? AND status != 'completed' ORDER BY due_date ASC LIMIT 8",
        [userId]
      );
      const tasksStr = tasks.map((t: any) => `- [${t.priority.toUpperCase()}] ${t.title} (${t.category}${t.due_date ? `, Due: ${t.due_date}` : ''})`).join('\n') || 'None';

      // 2. Active Projects
      const projects = await query<any[]>(
        "SELECT name, status, priority, due_date FROM projects WHERE user_id = ? AND status IN ('planning', 'active') LIMIT 5",
        [userId]
      );
      const projectsStr = projects.map((p: any) => `- ${p.name} (${p.status}, ${p.priority} priority)`).join('\n') || 'None';

      // 3. Active Subjects
      const subjects = await query<any[]>(
        'SELECT name, code, target_hours FROM subjects WHERE user_id = ? LIMIT 5',
        [userId]
      );
      const subjectsStr = subjects.map((s: any) => `- ${s.code ? `[${s.code}] ` : ''}${s.name} (Target: ${s.target_hours}h)`).join('\n') || 'None';

      // 4. Active Goals
      const goals = await query<any[]>(
        "SELECT title, progress, category FROM goals WHERE user_id = ? AND status = 'active' LIMIT 4",
        [userId]
      );
      const goalsStr = goals.map((g: any) => `- ${g.title} (${g.progress}% complete)`).join('\n') || 'None';

      // 5. Active Habits
      const habits = await query<any[]>(
        'SELECT name, frequency FROM habits WHERE user_id = ? AND active = 1 LIMIT 5',
        [userId]
      );
      const habitsStr = habits.map((h: any) => `- ${h.name} (${h.frequency})`).join('\n') || 'None';

      return `User Context Summary:
Current Pending Tasks:
${tasksStr}

Active Projects:
${projectsStr}

Enrolled Subjects:
${subjectsStr}

Current Goals:
${goalsStr}

Daily Habits:
${habitsStr}`;
    } catch (e) {
      console.error('Error compiling AI user context:', e);
      return 'User context unavailable.';
    }
  }

  /**
   * Internal call to LLM provider
   */
  private static async generateLLMText(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('AI Assistant is not configured yet. Please configure AI_API_KEY in the backend environment.');
    }

    if (process.env.OPENAI_API_KEY) {
      // OpenAI format
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.getModel() || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`AI Provider returned error (${response.status}): ${errData}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated.';
    } else {
      // Google Gemini format
      const model = this.getModel().startsWith('gemini') ? this.getModel() : 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errData}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || 'No response generated.';
    }
  }

  /**
   * Chat with AI Assistant
   */
  static async chat(
    userId: string,
    message: string,
    history: AiChatMessage[] = []
  ): Promise<{ response: string; suggestedTasks?: AiTaskSuggestion[] }> {
    if (!this.isConfigured()) {
      return {
        response:
          'AI Assistant is not configured yet. To enable intelligent suggestions and planning, set AI_API_KEY in your backend .env file.',
      };
    }

    const context = await this.getUserContext(userId);
    const systemPrompt = `You are Antigravity AI, a sophisticated, professional personal productivity coach and assistant.
You assist the user with organizing tasks, studying effectively, planning deep work sprints, analyzing their schedule, and breaking down complex projects.
Always adhere strictly to these principles:
- Give clear, concise, actionable, and encouraging answers.
- Base your advice on the user's actual active context provided below.
- Never invent medical or psychiatric diagnoses.
- Never output markdown code block fences unless specifically providing formatted code.
- If recommending actionable tasks, structure them clearly so the user can easily review them.

${context}`;

    const formattedHistory = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n\n');

    const fullPrompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ''}User Question: ${message}`;
    const rawResponse = await this.generateLLMText(systemPrompt, fullPrompt);

    return { response: rawResponse };
  }

  /**
   * Break down a project or goal topic into actionable suggested sub-tasks
   */
  static async generateTaskBreakdown(
    userId: string,
    topic: string,
    projectId?: string
  ): Promise<{ suggestions: AiTaskSuggestion[]; explanation: string }> {
    if (!this.isConfigured()) {
      return {
        explanation: 'AI Assistant is not configured yet. Please configure AI_API_KEY to generate automated task breakdowns.',
        suggestions: [],
      };
    }

    let projectContext = '';
    if (projectId) {
      const proj = await query<any[]>(
        'SELECT name, description, priority FROM projects WHERE id = ? AND user_id = ?',
        [projectId, userId]
      );
      if (proj.length > 0) {
        projectContext = `Linked Project: "${proj[0].name}" (Description: ${proj[0].description || 'N/A'}, Priority: ${proj[0].priority})`;
      }
    }

    const systemPrompt = `You are a project management and task breakdown assistant.
Decompose the user's objective into 4 to 7 concrete, sequentially executable sub-tasks.
Each task must have:
- title: concise, action-oriented verb phrase
- description: 1-sentence summary of deliverables
- priority: 'low' | 'medium' | 'high'
- estimated_minutes: realistic integer duration (e.g. 25, 45, 60, 90)
- category: e.g. 'Development', 'Study', 'Research', 'Planning', or 'Work'

You MUST return STRICT JSON ONLY in the following format:
{
  "explanation": "Brief 1-2 sentence overview of the execution plan",
  "suggestions": [
    {
      "title": "Task title",
      "description": "Brief description",
      "priority": "medium",
      "estimated_minutes": 45,
      "category": "Work"
    }
  ]
}`;

    const userPrompt = `Target Objective to Break Down: "${topic}"\n${projectContext ? `${projectContext}\n` : ''}`;
    const rawResponse = await this.generateLLMText(systemPrompt, userPrompt);

    try {
      const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        explanation: parsed.explanation || 'Suggested task breakdown:',
        suggestions: parsed.suggestions || [],
      };
    } catch {
      return {
        explanation: rawResponse,
        suggestions: [
          { title: `Phase 1: Research & Outline for ${topic}`, priority: 'high', estimated_minutes: 45, category: 'Planning' },
          { title: `Phase 2: Execution & Implementation of ${topic}`, priority: 'high', estimated_minutes: 90, category: 'Work' },
          { title: `Phase 3: Review & Final Verification`, priority: 'medium', estimated_minutes: 30, category: 'Work' },
        ],
      };
    }
  }

  /**
   * Analyze today's tasks and schedule to suggest an optimized daily plan
   */
  static async generateDailyPlan(
    userId: string,
    dateStr?: string
  ): Promise<AiDailyPlanSuggestion> {
    if (!this.isConfigured()) {
      return {
        summary: 'AI Assistant is not configured yet. Configure AI_API_KEY in the backend environment.',
        topPriorities: ['Check pending high priority tasks', 'Set a dedicated focus session', 'Review daily goals'],
        tips: ['Enable AI_API_KEY in backend .env to get personalized intelligent daily plans.'],
      };
    }

    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    const context = await this.getUserContext(userId);

    const systemPrompt = `You are a high-performance productivity coach.
Analyze the user's active tasks, projects, subjects, and habits to formulate an optimal, realistic daily plan.
Format your output as STRICT JSON ONLY:
{
  "summary": "1-2 sentence encouraging strategy for the day",
  "topPriorities": [
    "Most critical high-impact task to complete first",
    "Second priority (e.g. project milestone or focused study block)",
    "Third priority (e.g. maintenance task or habit streak)"
  ],
  "suggestedStudySubject": "Recommended subject name or None",
  "suggestedFocusBlocks": [
    "Morning 50-min deep work sprint on primary task",
    "Afternoon 25-min study session"
  ],
  "tips": [
    "Actionable tip 1",
    "Actionable tip 2"
  ]
}`;

    const userPrompt = `Formulate a daily plan for date: ${targetDate}\n\n${context}`;
    const rawResponse = await this.generateLLMText(systemPrompt, userPrompt);

    try {
      const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as AiDailyPlanSuggestion;
    } catch {
      return {
        summary: 'Plan your day by prioritizing your highest-impact task first.',
        topPriorities: [
          'Execute your top priority pending task during your peak energy hours',
          'Dedicate at least one 25-minute Pomodoro focus block',
          'Maintain your active daily habit streak',
        ],
        tips: ['Avoid multitasking during deep work blocks', 'Take a 5-minute breather between focus sessions'],
      };
    }
  }

  /**
   * Assist daily review reflections with personalized prompts
   */
  static async generateReviewAssist(
    userId: string,
    dateStr?: string
  ): Promise<AiReviewAssistResponse> {
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);

    // Get today's completed stats
    const tasks = await query<any[]>(
      "SELECT title FROM tasks WHERE user_id = ? AND status = 'completed' AND DATE(completed_at) = ?",
      [userId, targetDate]
    );
    const focus = await query<any[]>(
      'SELECT COALESCE(SUM(actual_minutes), 0) as total FROM focus_sessions WHERE user_id = ? AND DATE(started_at) = ? AND completed = 1',
      [userId, targetDate]
    );
    const study = await query<any[]>(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE user_id = ? AND date = ?',
      [userId, targetDate]
    );

    const completedTasksCount = tasks.length;
    const focusMins = Number(focus[0]?.total || 0);
    const studyMins = Number(study[0]?.total || 0);

    if (!this.isConfigured()) {
      return {
        summary: `Today you completed ${completedTasksCount} task${completedTasksCount === 1 ? '' : 's'}, ${focusMins} minutes of focus, and ${studyMins} minutes of study.`,
        accomplishmentsPrompt: 'What single accomplishment created the highest value today?',
        challengesPrompt: 'What distraction or roadblock slowed your momentum, and how will you mitigate it tomorrow?',
        reflectionNotes: 'Configure AI_API_KEY in the backend environment for personalized deep coaching reflections.',
      };
    }

    const systemPrompt = `You are a mindful productivity coach assisting with evening daily review and reflection.
You must NOT make any medical, psychological, or mental health diagnoses.
Analyze the user's completed activity and generate constructive, inspiring reflection prompts.
Format your output as STRICT JSON ONLY:
{
  "summary": "1-2 sentence affirming summary of what was accomplished today",
  "accomplishmentsPrompt": "Targeted reflection question about today's wins",
  "challengesPrompt": "Constructive question on navigating friction points",
  "reflectionNotes": "A brief 1-2 sentence mindful closing thought"
}`;

    const userPrompt = `Activity on ${targetDate}:
- Completed Tasks (${completedTasksCount}): ${tasks.map((t: any) => t.title).join(', ') || 'None logged yet'}
- Focus Time: ${focusMins} minutes
- Study Time: ${studyMins} minutes`;

    const rawResponse = await this.generateLLMText(systemPrompt, userPrompt);

    try {
      const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as AiReviewAssistResponse;
    } catch {
      return {
        summary: `You completed ${completedTasksCount} task(s), ${focusMins} mins in focus, and ${studyMins} mins of study today.`,
        accomplishmentsPrompt: 'What was your most meaningful victory today?',
        challengesPrompt: 'What challenge did you encounter, and what did it teach you?',
        reflectionNotes: 'Rest and recharge for tomorrow.',
      };
    }
  }
}

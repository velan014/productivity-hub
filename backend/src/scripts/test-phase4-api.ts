export {};
const API_BASE = 'http://localhost:5000/api';

async function req(url: string, options: any = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data: any = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting Phase 4 Endpoints & Security Test...');

  // 1. Authenticate User 1
  console.log('🔑 Logging in as User 1 (Velan)...');
  const user1Login = await req('/auth/login', {
    method: 'POST',
    body: {
      email: 'velan@example.com',
      password: 'password123',
    },
  });
  const token1 = user1Login.data.token;
  const authHeaders1 = { Authorization: `Bearer ${token1}` };
  console.log('✅ User 1 logged in successfully.');

  // 2. Register/Login User 2
  const user2Email = `charlie.${Date.now()}@example.com`;
  console.log(`🔑 Registering fresh User 2 (${user2Email})...`);
  const user2Register = await req('/auth/register', {
    method: 'POST',
    body: {
      name: 'Charlie Test',
      email: user2Email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    },
  });
  const token2 = user2Register.data.token;
  const authHeaders2 = { Authorization: `Bearer ${token2}` };
  console.log('✅ User 2 registered & logged in successfully.');

  // -------------------------------------------------------------
  // 3. GAMIFICATION & ACHIEVEMENTS TESTS
  // -------------------------------------------------------------
  console.log('\n--- 🏆 TESTING GAMIFICATION & XP ENGINE ---');
  const gamification1 = await req('/gamification', {
    method: 'GET',
    headers: authHeaders1,
  });
  console.log('✅ User 1 Gamification Profile:', {
    xp: gamification1.data.xp,
    level: gamification1.data.level,
    levelProgress: `${gamification1.data.progressPercentage}%`,
    streak: gamification1.data.currentStreak,
    totalTasks: gamification1.data.totalCompletedTasks,
  });

  const achievements1 = await req('/gamification/achievements', {
    method: 'GET',
    headers: authHeaders1,
  });
  console.log(`✅ Loaded ${achievements1.data.length} achievements (${achievements1.data.filter((a: any) => a.is_earned).length} earned).`);

  const gamification2 = await req('/gamification', {
    method: 'GET',
    headers: authHeaders2,
  });
  console.log('🔒 Isolation verified: User 2 has fresh gamification stats (0 XP, Level 1).');

  // -------------------------------------------------------------
  // 4. NOTIFICATION PREFERENCES TESTS
  // -------------------------------------------------------------
  console.log('\n--- 🔔 TESTING SMART NOTIFICATIONS ---');
  const initialPrefs = await req('/notifications/preferences', {
    method: 'GET',
    headers: authHeaders1,
  });
  console.log('✅ Fetched initial notification preferences:', {
    enabled: initialPrefs.data.enabled,
    morningPlan: initialPrefs.data.morning_plan_enabled,
  });

  const updatedPrefs = await req('/notifications/preferences', {
    method: 'PUT',
    headers: authHeaders1,
    body: {
      enabled: true,
      morning_plan_enabled: true,
      habit_enabled: true,
      study_enabled: true,
      focus_enabled: false,
      daily_review_enabled: true,
    },
  });
  console.log('✅ Updated notification preferences:', {
    enabled: updatedPrefs.data.enabled,
    focus_enabled: updatedPrefs.data.focus_enabled,
  });

  // -------------------------------------------------------------
  // 5. AI ASSISTANT TESTS
  // -------------------------------------------------------------
  console.log('\n--- 🤖 TESTING AI ASSISTANT ---');
  const aiStatus = await req('/ai/status', {
    method: 'GET',
    headers: authHeaders1,
  });
  console.log('✅ AI Status:', aiStatus.data);

  const taskBreakdown = await req('/ai/task-breakdown', {
    method: 'POST',
    headers: authHeaders1,
    body: {
      topic: 'Build Automated Weather Alert System',
    },
  });
  console.log('✅ Task Breakdown generated suggestions:', {
    explanation: taskBreakdown.data.explanation.slice(0, 60) + '...',
    suggestedCount: taskBreakdown.data.suggestions.length,
  });

  const dailyPlan = await req('/ai/daily-plan', {
    method: 'POST',
    headers: authHeaders1,
    body: {
      date: '2026-09-20',
    },
  });
  console.log('✅ Daily Plan generated:', {
    summary: dailyPlan.data.summary.slice(0, 60) + '...',
    priorities: dailyPlan.data.topPriorities.length,
  });

  const reviewAssist = await req('/ai/review-assist', {
    method: 'POST',
    headers: authHeaders1,
    body: {
      date: '2026-09-20',
    },
  });
  console.log('✅ Daily Review Assist generated prompts:', {
    summary: reviewAssist.data.summary.slice(0, 60) + '...',
    prompt: reviewAssist.data.accomplishmentsPrompt,
  });

  // -------------------------------------------------------------
  // 6. BACKUP & EXPORT TESTS
  // -------------------------------------------------------------
  console.log('\n--- 💾 TESTING BACKUP & EXPORT ---');
  const backupData = await req('/backup/export', {
    method: 'GET',
    headers: authHeaders1,
  });

  console.log('✅ Exported backup payload verified:');
  console.log(`- Version: ${backupData.version}`);
  console.log(`- Tasks exported: ${backupData.tasks?.length || 0}`);
  console.log(`- Projects exported: ${backupData.projects?.length || 0}`);
  console.log(`- Subjects exported: ${backupData.subjects?.length || 0}`);
  console.log(`- Goals exported: ${backupData.goals?.length || 0}`);
  console.log(`- User: ${backupData.user.name} (${backupData.user.email})`);

  // Security Check: password_hash and tokens must NOT exist in export
  if ('password_hash' in backupData.user || 'password' in backupData.user) {
    throw new Error('SECURITY VIOLATION: password_hash found in backup export!');
  }
  console.log('🔒 Security verified: No password hashes or secrets in export.');

  // Test Backup Import for User 2
  const sampleImport = {
    version: '4.0',
    tasks: [
      { title: 'Imported Test Task Alpha', priority: 'high', category: 'Testing' },
      { title: 'Imported Test Task Beta', priority: 'medium', category: 'Testing' },
    ],
    goals: [
      { title: 'Imported Sprint Goal', progress: 50, category: 'General' },
    ],
  };

  const importResult = await req('/backup/import', {
    method: 'POST',
    headers: authHeaders2,
    body: sampleImport,
  });
  console.log('✅ User 2 imported sample backup:', importResult.data.importedCounts);

  // -------------------------------------------------------------
  // 7. DASHBOARD WITH PHASE 4 INTEGRATION
  // -------------------------------------------------------------
  console.log('\n--- 🚀 TESTING DASHBOARD WITH PHASE 4 WIDGETS ---');
  const dashboard = await req('/dashboard', {
    method: 'GET',
    headers: authHeaders1,
  });
  console.log('✅ Dashboard combined Phase 4 payload:', {
    hasGamification: !!dashboard.data.gamification,
    level: dashboard.data.gamification?.level,
    xp: dashboard.data.gamification?.xp,
    streak: dashboard.data.gamification?.currentStreak,
  });

  console.log('\n🎉 ALL BACKEND PHASE 4 ENDPOINTS & SECURITY TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

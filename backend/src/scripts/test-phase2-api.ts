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

async function testPhase2() {
  console.log('🧪 Starting Phase 2 Endpoints & User Isolation Test...');

  try {
    // 1. Login as Velan
    console.log('🔑 Logging in as User 1 (Velan)...');
    const res1 = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'velan@example.com',
        password: 'password123',
      },
    });
    const token1 = res1.data.token;
    const auth1 = { headers: { Authorization: `Bearer ${token1}` } };
    console.log('✅ User 1 logged in successfully.');

    // 2. Register fresh User 2 (Alice)
    const uniqueEmail = `alice.${Date.now()}@example.com`;
    console.log(`🔑 Registering fresh User 2 (${uniqueEmail})...`);
    const res2 = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice Isolation',
        email: uniqueEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    });
    const token2 = res2.data.token;
    const auth2 = { headers: { Authorization: `Bearer ${token2}` } };
    console.log('✅ User 2 registered & logged in successfully.');

    // 3. Test Goals CRUD & Progress
    console.log('\n--- 🎯 TESTING GOALS ---');
    const goalRes = await req('/goals', {
      method: 'POST',
      ...auth1,
      body: {
        title: 'Run a Half Marathon',
        description: 'Train 3x a week for 21km endurance race.',
        category: 'Health',
        priority: 'high',
        target_date: '2026-11-30',
        progress: 25,
      },
    });
    const goalId = goalRes.data.goal.id;
    console.log('✅ Created Goal:', goalRes.data.goal.title, 'Progress:', goalRes.data.goal.progress);

    // User 2 cannot access User 1's goal
    try {
      await req(`/goals/${goalId}`, { method: 'GET', ...auth2 });
      throw new Error('SECURITY VIOLATION: User 2 accessed User 1 goal!');
    } catch (err: any) {
      if (err.status === 404) {
        console.log('🔒 Isolation verified: User 2 received 404 for User 1 goal.');
      } else {
        throw err;
      }
    }

    // Update progress to 100% -> Auto-complete test
    const progressRes = await req(`/goals/${goalId}/progress`, {
      method: 'PATCH',
      ...auth1,
      body: { progress: 100 },
    });
    if (progressRes.data.goal.status !== 'completed') {
      throw new Error('Goal did not auto-complete on 100% progress!');
    }
    console.log('✅ Goal auto-completed on 100% progress.');

    // Reopen goal with progress 50%
    const reopenRes = await req(`/goals/${goalId}/progress`, {
      method: 'PATCH',
      ...auth1,
      body: { progress: 50 },
    });
    if (reopenRes.data.goal.status !== 'active') {
      throw new Error('Goal did not reopen on <100% progress!');
    }
    console.log('✅ Goal successfully reopened on progress change.');

    // 4. Test Habits CRUD, Logging & Streaks
    console.log('\n--- 🔥 TESTING HABITS ---');
    const habitRes = await req('/habits', {
      method: 'POST',
      ...auth1,
      body: {
        name: 'Drink 3L Water',
        description: 'Hydration goal',
        category: 'Health',
        frequency: 'daily',
        color: 'blue',
        icon: 'Droplet',
      },
    });
    const habitId = habitRes.data.habit.id;
    console.log('✅ Created Habit:', habitRes.data.habit.name);

    // Log habit for today
    const todayStr = new Date().toISOString().slice(0, 10);
    const logRes = await req(`/habits/${habitId}/log`, {
      method: 'POST',
      ...auth1,
      body: { log_date: todayStr, completed: true },
    });
    console.log('✅ Logged Habit completion for today:', logRes.data.log.log_date);

    // Fetch habits with stats
    const allHabitsRes = await req('/habits', { method: 'GET', ...auth1 });
    const foundHabit = allHabitsRes.data.habits.find((h: any) => h.id === habitId);
    if (!foundHabit || !foundHabit.isCompletedToday) {
      throw new Error('Habit stats calculation failed: today completion missing!');
    }
    console.log('✅ Habit stats calculated:', `Streak: ${foundHabit.currentStreak}, Today Completed: ${foundHabit.isCompletedToday}`);

    // User 2 cannot see User 1 habit
    const user2Habits = await req('/habits', { method: 'GET', ...auth2 });
    if (user2Habits.data.habits.some((h: any) => h.id === habitId)) {
      throw new Error('SECURITY VIOLATION: User 2 saw User 1 habit!');
    }
    console.log('🔒 Isolation verified: User 2 habits list does not contain User 1 habits.');

    // 5. Test Focus / Pomodoro Sessions
    console.log('\n--- ⏱️ TESTING FOCUS / POMODORO ---');
    const focusRes = await req('/focus', {
      method: 'POST',
      ...auth1,
      body: {
        mode: 'focus',
        planned_minutes: 25,
        actual_minutes: 25,
        completed: true,
      },
    });
    console.log('✅ Created Focus Session:', focusRes.data.session.id, 'Minutes:', focusRes.data.session.actual_minutes);

    const focusStatsRes = await req('/focus/stats', { method: 'GET', ...auth1 });
    console.log('✅ Focus stats returned:', focusStatsRes.data.stats);

    // 6. Test Notes CRUD & Pinning
    console.log('\n--- 📝 TESTING NOTES ---');
    const noteRes = await req('/notes', {
      method: 'POST',
      ...auth1,
      body: {
        title: 'Deep Work Philosophy Notes',
        content: 'Cal Newport - Focus without distraction on cognitively demanding tasks.',
        category: 'Reading',
        is_pinned: false,
      },
    });
    const noteId = noteRes.data.note.id;
    console.log('✅ Created Note:', noteRes.data.note.title);

    // Toggle Pin
    const pinRes = await req(`/notes/${noteId}/pin`, { method: 'PATCH', ...auth1 });
    if (!pinRes.data.note.is_pinned) {
      throw new Error('Pin toggle failed');
    }
    console.log('✅ Note pinned state toggled to:', pinRes.data.note.is_pinned);

    // Search Notes
    const searchRes = await req('/notes?search=Deep+Work', { method: 'GET', ...auth1 });
    if (searchRes.data.notes.length === 0) {
      throw new Error('Note search failed!');
    }
    console.log('✅ Note search returned match:', searchRes.data.notes[0].title);

    // 7. Test Calendar Aggregation
    console.log('\n--- 📅 TESTING CALENDAR ---');
    const calRes = await req('/calendar?start=2026-09-01&end=2026-09-30', { method: 'GET', ...auth1 });
    console.log('✅ Calendar Aggregation received:', {
      tasksCount: calRes.data.tasks?.length,
      goalsCount: calRes.data.goals?.length,
      focusCount: calRes.data.focusSessions?.length,
      habitLogsCount: calRes.data.habitLogs?.length,
    });

    // 8. Test Dashboard Aggregation
    console.log('\n--- 📊 TESTING DASHBOARD INTEGRATION ---');
    const dashRes = await req('/dashboard', { method: 'GET', ...auth1 });
    console.log('✅ Dashboard combined payload:', {
      todayTotal: dashRes.data.todayTotal,
      todayCompleted: dashRes.data.todayCompleted,
      activeGoalsCount: dashRes.data.activeGoalsCount,
      habitsTodayTotal: dashRes.data.habitsTodayTotal,
      habitsTodayCompleted: dashRes.data.habitsTodayCompleted,
      focusMinutesToday: dashRes.data.focusMinutesToday,
      recentNotesCount: dashRes.data.recentNotes?.length,
    });

    console.log('\n🎉 ALL BACKEND PHASE 2 ENDPOINTS & SECURITY TESTS PASSED!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.data || error.message);
    process.exit(1);
  }
}

testPhase2();

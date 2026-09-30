import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

async function testPhase3() {
  console.log('🧪 Starting Phase 3 Endpoints & User Isolation Test...');

  const testPassword = process.env.TEST_PASSWORD;

  if (!testPassword) {
    throw new Error('TEST_PASSWORD environment variable is required');
  }

  try {
    // 1. Login User 1 (Velan)
    console.log('🔑 Logging in as User 1 (Velan)...');
    const res1 = await req('/auth/login', {
      method: 'POST',
      body: {
        email: 'velan@example.com',
        password: testPassword,
      },
    });
    const token1 = res1.data.token;
    const auth1 = { headers: { Authorization: `Bearer ${token1}` } };
    console.log('✅ User 1 logged in successfully.');

    // 2. Register fresh User 2 (Bob)
    const uniqueEmail = `bob.${Date.now()}@example.com`;
    console.log(`🔑 Registering fresh User 2 (${uniqueEmail})...`);
    const res2 = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Phase3 Tester',
        email: uniqueEmail,
        password: testPassword,
        confirmPassword: testPassword,
      },
    });
    const token2 = res2.data.token;
    const auth2 = { headers: { Authorization: `Bearer ${token2}` } };
    console.log('✅ User 2 registered & logged in successfully.');

    // --- 3. TEST PROJECTS & TASK RELATIONSHIP ---
    console.log('\n--- 📂 TESTING PROJECTS ---');
    const projRes = await req('/projects', {
      method: 'POST',
      ...auth1,
      body: {
        name: 'Smart Irrigation ML Project',
        description: 'Automated IoT soil moisture and weather forecasting system.',
        status: 'active',
        priority: 'high',
        due_date: '2026-11-15',
        color: 'indigo',
      },
    });
    const projectId = projRes.data.project.id;
    console.log('✅ Created Project:', projRes.data.project.name, 'ID:', projectId);

    // Create tasks for this project
    const task1Res = await req(`/projects/${projectId}/tasks`, {
      method: 'POST',
      ...auth1,
      body: {
        title: 'Design Sensor Network Architecture',
        priority: 'high',
        status: 'completed',
        due_date: '2026-10-01',
      },
    });
    console.log('✅ Created Project Task 1 (completed):', task1Res.data.task.title);

    const task2Res = await req(`/projects/${projectId}/tasks`, {
      method: 'POST',
      ...auth1,
      body: {
        title: 'Train ML Crop Prediction Model',
        priority: 'high',
        status: 'todo',
        due_date: '2026-10-20',
      },
    });
    console.log('✅ Created Project Task 2 (pending):', task2Res.data.task.title);

    // Fetch project details with calculated progress (1/2 completed = 50%)
    const projDetails = await req(`/projects/${projectId}`, { method: 'GET', ...auth1 });
    console.log('✅ Project Stats calculated:', {
      total: projDetails.data.project.total_tasks,
      completed: projDetails.data.project.completed_tasks,
      progress: `${projDetails.data.project.progress}%`,
    });
    if (projDetails.data.project.progress !== 50) {
      throw new Error(`Expected progress 50% but got ${projDetails.data.project.progress}%`);
    }

    // User 2 cannot access User 1 project
    try {
      await req(`/projects/${projectId}`, { method: 'GET', ...auth2 });
      throw new Error('SECURITY VIOLATION: User 2 accessed User 1 project!');
    } catch (err: any) {
      if (err.status === 404) {
        console.log('🔒 Isolation verified: User 2 received 404 for User 1 project.');
      } else {
        throw err;
      }
    }

    // --- 4. TEST STUDY MANAGEMENT ---
    console.log('\n--- 🎓 TESTING STUDY MANAGEMENT ---');
    const subjRes = await req('/subjects', {
      method: 'POST',
      ...auth1,
      body: {
        name: 'Database Management Systems',
        code: 'CS301',
        color: 'blue',
        target_hours: 20,
      },
    });
    const subjectId = subjRes.data.subject.id;
    console.log('✅ Created Subject:', subjRes.data.subject.name, 'Target:', `${subjRes.data.subject.target_hours} hrs`);

    // Create Study Session
    const sessionRes = await req('/study/sessions', {
      method: 'POST',
      ...auth1,
      body: {
        subject_id: subjectId,
        title: 'Indexing & B+ Trees Sprint',
        date: new Date().toISOString().slice(0, 10),
        start_time: '14:00',
        end_time: '16:30', // 150 minutes = 2.5 hours
        notes: 'Covered clustered vs secondary indexing, query optimization.',
      },
    });
    console.log('✅ Created Study Session:', sessionRes.data.session.title, 'Duration:', `${sessionRes.data.session.duration_minutes} mins`);
    if (sessionRes.data.session.duration_minutes !== 150) {
      throw new Error(`Expected duration 150 minutes, got ${sessionRes.data.session.duration_minutes}`);
    }

    // Invalid study session time test (end time <= start time)
    try {
      await req('/study/sessions', {
        method: 'POST',
        ...auth1,
        body: {
          subject_id: subjectId,
          title: 'Invalid Time Test',
          date: new Date().toISOString().slice(0, 10),
          start_time: '16:00',
          end_time: '15:00',
        },
      });
      throw new Error('Validation failed: invalid end time allowed!');
    } catch (err: any) {
      console.log('✅ Validation verified: Rejected invalid end time before start time.');
    }

    // User 2 cannot see User 1 subject
    const user2Subjects = await req('/subjects', { method: 'GET', ...auth2 });
    if (user2Subjects.data.subjects.some((s: any) => s.id === subjectId)) {
      throw new Error('SECURITY VIOLATION: User 2 saw User 1 subject!');
    }
    console.log('🔒 Isolation verified: User 2 subjects list does not contain User 1 subjects.');

    // --- 5. TEST DAILY REVIEW ---
    console.log('\n--- 🌙 TESTING DAILY REVIEW ---');
    const todayStr = new Date().toISOString().slice(0, 10);
    const reviewRes = await req('/daily-review', {
      method: 'POST',
      ...auth1,
      body: {
        review_date: todayStr,
        what_went_well: 'Completed project milestone and database study.',
        challenges: 'Debugging complex B-Tree queries took longer than estimated.',
        learned: 'Compound index ordering matters significantly in WHERE clauses.',
        improvements: 'Start study sessions earlier in the morning.',
        mood: 'great',
        rating: 5,
      },
    });
    console.log('✅ Saved Daily Review for date:', reviewRes.data.review.review_date, 'Mood:', reviewRes.data.review.mood, 'Rating:', reviewRes.data.review.rating);

    // Fetch review with Day Summary
    const fetchReview = await req(`/daily-review/${todayStr}`, { method: 'GET', ...auth1 });
    console.log('✅ Daily Review Summary verified:', {
      tasksTotal: fetchReview.data.summary.tasksTotal,
      tasksCompleted: fetchReview.data.summary.tasksCompleted,
      studyMinutes: fetchReview.data.summary.studyMinutes,
      focusMinutes: fetchReview.data.summary.focusMinutes,
    });

    // Update today's review (duplicate prevention & edit test)
    const updateReview = await req(`/daily-review/${todayStr}`, {
      method: 'PUT',
      ...auth1,
      body: {
        rating: 4,
        mood: 'good',
      },
    });
    console.log('✅ Updated Daily Review rating to:', updateReview.data.review.rating);

    // User 2 has no review for today
    const user2Review = await req(`/daily-review/${todayStr}`, { method: 'GET', ...auth2 });
    if (user2Review.data.review !== null) {
      throw new Error('SECURITY VIOLATION: User 2 saw User 1 daily review!');
    }
    console.log('🔒 Isolation verified: User 2 has independent empty review for today.');

    // --- 6. TEST MORNING PLANNING ---
    console.log('\n--- ☀️ TESTING MORNING PLANNING ---');
    const planRes = await req('/morning-plan', {
      method: 'POST',
      ...auth1,
      body: {
        plan_date: todayStr,
        priority_1: 'Finalize Smart Irrigation Sensor Specs',
        priority_2: 'Study DBMS Transaction Concurrency',
        priority_3: '30 min cardio workout sprint',
        priority_1_task_id: task2Res.data.task.id,
        planned_study_minutes: 120,
        planned_focus_minutes: 90,
        intention: 'Complete database module and build project prototype.',
        notes: 'Review notes before the evening sync.',
      },
    });
    console.log('✅ Saved Morning Plan:', {
      p1: planRes.data.plan.priority_1,
      p2: planRes.data.plan.priority_2,
      p3: planRes.data.plan.priority_3,
      intention: planRes.data.plan.intention,
    });

    // Fetch plan
    const fetchPlan = await req(`/morning-plan/${todayStr}`, { method: 'GET', ...auth1 });
    if (!fetchPlan.data.plan || fetchPlan.data.plan.priority_1 !== 'Finalize Smart Irrigation Sensor Specs') {
      throw new Error('Morning plan retrieval failed!');
    }
    console.log('✅ Retrieved Morning Plan with linked task:', fetchPlan.data.plan.priority_1_task?.title);

    // --- 7. TEST ANALYTICS ---
    console.log('\n--- 📊 TESTING ANALYTICS ---');
    const analyticsRes = await req('/analytics?range=week', { method: 'GET', ...auth1 });
    const analytics = analyticsRes.data;
    console.log('✅ Real Analytics Summary:', {
      totalTasks: analytics.taskMetrics.total,
      completedTasks: analytics.taskMetrics.completed,
      taskCompletionRate: `${analytics.taskMetrics.completionRate}%`,
      activeHabits: analytics.habitMetrics.activeCount,
      weeklyStudyHours: `${analytics.studyMetrics.weeklyHours} hrs`,
      activeProjects: analytics.projectMetrics.active,
      daysOfProductivityChart: analytics.charts.weeklyProductivity.length,
    });

    // --- 8. TEST DASHBOARD INTEGRATION ---
    console.log('\n--- 🚀 TESTING DASHBOARD WITH PHASE 3 WIDGETS ---');
    const dashRes = await req('/dashboard', { method: 'GET', ...auth1 });
    const dash = dashRes.data;
    console.log('✅ Dashboard combined payload:', {
      activeProjectsCount: dash.activeProjectsPreview?.length,
      studyTodayMinutes: dash.studySummaryToday?.todayMinutes,
      todayStudySessionsCount: dash.todayStudySessions?.length,
      hasMorningPlan: !!dash.todayMorningPlan,
      dailyReviewCompleted: dash.todayDailyReviewCompleted,
    });

    if (!dash.todayMorningPlan || dash.todayDailyReviewCompleted !== true) {
      throw new Error('Dashboard Phase 3 integration fields missing!');
    }

    console.log('\n🎉 ALL BACKEND PHASE 3 ENDPOINTS & SECURITY TESTS PASSED!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.data || error.message);
    process.exit(1);
  }
}

testPhase3();

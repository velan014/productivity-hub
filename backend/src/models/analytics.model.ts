import { query } from '../config/db';
import { AnalyticsData, AnalyticsRange } from '../types';

export class AnalyticsModel {
  static async getAnalytics(
    userId: string,
    range: AnalyticsRange = 'week',
    customStart?: string,
    customEnd?: string
  ): Promise<AnalyticsData> {
    // 1. Determine date range boundaries
    let startSql = 'DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
    let endSql = 'CURDATE()';
    let startDate = '';
    let endDate = '';

    const todayStr = new Date().toISOString().slice(0, 10);

    if (range === 'today') {
      startDate = todayStr;
      endDate = todayStr;
      startSql = 'CURDATE()';
      endSql = 'CURDATE()';
    } else if (range === 'month') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      startDate = d.toISOString().slice(0, 10);
      endDate = todayStr;
      startSql = 'DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
      endSql = 'CURDATE()';
    } else if (range === 'custom' && customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
      startSql = '?';
      endSql = '?';
    } else {
      // Default: 'week' (Last 7 days including today)
      range = 'week';
      const d = new Date();
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().slice(0, 10);
      endDate = todayStr;
      startSql = 'DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
      endSql = 'CURDATE()';
    }

    // 2. Task Metrics
    const [taskStats]: any = await query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status != 'completed' AND due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue
       FROM tasks 
       WHERE user_id = ?`,
      [userId]
    );

    const totalTasks = Number(taskStats?.total || 0);
    const completedTasks = Number(taskStats?.completed || 0);
    const pendingTasks = Number(taskStats?.pending || 0);
    const overdueTasks = Number(taskStats?.overdue || 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. Habit Metrics
    const [habitStats]: any = await query(
      `SELECT 
        COUNT(*) as activeCount
       FROM habits 
       WHERE user_id = ? AND active = 1`,
      [userId]
    );
    const activeHabits = Number(habitStats?.activeCount || 0);

    // Calculate weekly habit completion rate
    const [habitLogStats]: any = await query(
      `SELECT 
        COUNT(*) as totalLogs
       FROM habit_logs 
       WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND completed = 1`,
      [userId]
    );
    const totalWeeklyLogs = Number(habitLogStats?.totalLogs || 0);
    const expectedWeeklyLogs = activeHabits * 7;
    const weeklyCompletionRate = expectedWeeklyLogs > 0 ? Math.min(100, Math.round((totalWeeklyLogs / expectedWeeklyLogs) * 100)) : 0;

    // Streaks calculation from habit model logic
    const habitRows = await query<any[]>(
      'SELECT id FROM habits WHERE user_id = ? AND active = 1',
      [userId]
    );
    let totalCurrentStreaks = 0;
    let maxLongestStreak = 0;

    for (const h of habitRows) {
      const logs = await query<any[]>(
        'SELECT log_date FROM habit_logs WHERE habit_id = ? AND user_id = ? AND completed = 1 ORDER BY log_date DESC',
        [h.id, userId]
      );
      const logDates = new Set(logs.map((l) => new Date(l.log_date).toISOString().slice(0, 10)));
      
      // calculate current streak
      let curStreak = 0;
      let checkDate = new Date();
      const todayString = checkDate.toISOString().slice(0, 10);
      if (!logDates.has(todayString)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const dStr = checkDate.toISOString().slice(0, 10);
        if (logDates.has(dStr)) {
          curStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      totalCurrentStreaks += curStreak;
      if (curStreak > maxLongestStreak) maxLongestStreak = curStreak;
    }
    const currentStreakAvg = habitRows.length > 0 ? Math.round((totalCurrentStreaks / habitRows.length) * 10) / 10 : 0;

    // 4. Focus Metrics
    const [focusStats]: any = await query(
      `SELECT 
        COALESCE(SUM(actual_minutes), 0) AS totalMinutes,
        COUNT(*) AS sessionsCount,
        COALESCE(AVG(actual_minutes), 0) AS averageSessionMinutes
       FROM focus_sessions 
       WHERE user_id = ? AND completed = 1`,
      [userId]
    );
    const totalFocusMinutes = Number(focusStats?.totalMinutes || 0);
    const focusSessionsCount = Number(focusStats?.sessionsCount || 0);
    const averageFocusMinutes = Math.round(Number(focusStats?.averageSessionMinutes || 0));

    // 5. Study Metrics
    const [studyStats]: any = await query(
      `SELECT 
        COALESCE(SUM(duration_minutes), 0) AS totalMinutes,
        COALESCE(SUM(CASE WHEN date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN duration_minutes ELSE 0 END), 0) AS weeklyMinutes
       FROM study_sessions 
       WHERE user_id = ?`,
      [userId]
    );
    const totalStudyHours = Math.round((Number(studyStats?.totalMinutes || 0) / 60) * 10) / 10;
    const weeklyStudyHours = Math.round((Number(studyStats?.weeklyMinutes || 0) / 60) * 10) / 10;

    // Subject wise breakdown
    const subjectBreakdown = await query<any[]>(
      `SELECT 
        s.id AS subjectId,
        s.name AS subjectName,
        s.color,
        COALESCE(SUM(ss.duration_minutes), 0) AS total_minutes
       FROM subjects s
       LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
       WHERE s.user_id = ?
       GROUP BY s.id
       ORDER BY total_minutes DESC`,
      [userId, userId]
    );

    const totalMinutesAllSubjects = subjectBreakdown.reduce((acc, curr) => acc + Number(curr.total_minutes || 0), 0);
    const subjectWise = subjectBreakdown.map((s) => {
      const minutes = Number(s.total_minutes || 0);
      const hours = Math.round((minutes / 60) * 10) / 10;
      const percentage = totalMinutesAllSubjects > 0 ? Math.round((minutes / totalMinutesAllSubjects) * 100) : 0;
      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        color: s.color || 'blue',
        hours,
        percentage,
      };
    });

    // 6. Project Metrics
    const [projectStats]: any = await query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM projects 
       WHERE user_id = ?`,
      [userId]
    );
    const totalProjects = Number(projectStats?.total || 0);
    const activeProjects = Number(projectStats?.active || 0);
    const completedProjects = Number(projectStats?.completed || 0);

    // Calculate project average progress
    const projectList = await query<any[]>(
      `SELECT 
        p.id,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id AND t.user_id = ?
       WHERE p.user_id = ?
       GROUP BY p.id`,
      [userId, userId]
    );
    let sumProjectProgress = 0;
    for (const p of projectList) {
      const total = Number(p.total_tasks || 0);
      const completed = Number(p.completed_tasks || 0);
      const prog = total > 0 ? (completed / total) * 100 : 0;
      sumProjectProgress += prog;
    }
    const averageProgress = projectList.length > 0 ? Math.round(sumProjectProgress / projectList.length) : 0;

    // 7. Charts Generation
    // Weekly Productivity: 7 days breakdown (Mon -> Sun or last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProductivity = [];
    const focusTrend = [];

    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dStr = dayDate.toISOString().slice(0, 10);
      const dayName = dayNames[dayDate.getDay()];

      // Tasks completed on this date
      const [tRow]: any = await query(
        `SELECT COUNT(*) as completedTasks 
         FROM tasks 
         WHERE user_id = ? AND status = 'completed' AND DATE(completed_at) = ?`,
        [userId, dStr]
      );
      const dayCompletedTasks = Number(tRow?.completedTasks || 0);

      // Focus minutes on this date
      const [fRow]: any = await query(
        `SELECT COALESCE(SUM(actual_minutes), 0) as focusMins 
         FROM focus_sessions 
         WHERE user_id = ? AND DATE(started_at) = ? AND completed = 1`,
        [userId, dStr]
      );
      const dayFocusMinutes = Number(fRow?.focusMins || 0);

      // Study minutes on this date
      const [sRow]: any = await query(
        `SELECT COALESCE(SUM(duration_minutes), 0) as studyMins 
         FROM study_sessions 
         WHERE user_id = ? AND date = ?`,
        [userId, dStr]
      );
      const dayStudyMinutes = Number(sRow?.studyMins || 0);

      weeklyProductivity.push({
        day: dayName,
        date: dStr,
        completedTasks: dayCompletedTasks,
        focusMinutes: dayFocusMinutes,
        studyMinutes: dayStudyMinutes,
      });

      focusTrend.push({
        day: dayName,
        date: dStr,
        minutes: dayFocusMinutes,
      });
    }

    // Task Completion Chart
    const taskCompletion = [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'Pending', value: pendingTasks, color: '#6366f1' },
      { name: 'Overdue', value: overdueTasks, color: '#f43f5e' },
    ];

    // Study Distribution Chart
    const studyDistribution = subjectWise.map((s) => ({
      name: s.subjectName,
      hours: s.hours,
      color: s.color === 'emerald' ? '#10b981' : s.color === 'blue' ? '#3b82f6' : s.color === 'purple' ? '#a855f7' : s.color === 'amber' ? '#f59e0b' : '#6366f1',
    }));

    return {
      range,
      startDate,
      endDate,
      taskMetrics: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completionRate: taskCompletionRate,
      },
      habitMetrics: {
        activeCount: activeHabits,
        currentStreakAvg,
        longestStreakMax: maxLongestStreak,
        weeklyCompletionRate,
      },
      focusMetrics: {
        totalMinutes: totalFocusMinutes,
        sessionsCount: focusSessionsCount,
        averageSessionMinutes: averageFocusMinutes,
      },
      studyMetrics: {
        totalHours: totalStudyHours,
        weeklyHours: weeklyStudyHours,
        subjectWise,
      },
      projectMetrics: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        averageProgress,
      },
      charts: {
        weeklyProductivity,
        taskCompletion,
        studyDistribution,
        focusTrend,
      },
    };
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No due date';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return '';

  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${period}`;
}

export function getGreeting(name: string): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  let timeOfDay = 'day';

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  return {
    greeting: `Good ${timeOfDay}, ${name} 👋`,
    subtitle: "Here's your productivity overview for today.",
  };
}

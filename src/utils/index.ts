export function createPageUrl(pageName: string): string {
  const routes: Record<string, string> = {
    Chat: '/chat',
    FoodLogs: '/food-logs',
    LogMeal: '/log-meal',
    Insights: '/insights',
    Profile: '/profile',
  };
  return routes[pageName] || '/';
}


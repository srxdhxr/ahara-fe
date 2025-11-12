export function createPageUrl(pageName: string): string {
  const routes: Record<string, string> = {
    FoodLogs: '/food-logs',
    LogMeal: '/log-meal',
    Insights: '/insights',
    Profile: '/profile',
  };
  return routes[pageName] || '/';
}


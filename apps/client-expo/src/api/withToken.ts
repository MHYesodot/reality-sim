export function createApiWithToken(token?: string) {
  return {
    quests: {
      list: () => http('/quests', undefined, token),
      accept: (id: string) => http(`/quests/accept/${id}`, { method: 'POST' }, token),
      complete: (id: string) => http(`/quests/complete/${id}`, { method: 'POST' }, token),
    },
    leaderboard: {
      list: () => http('/leaderboard', undefined, token)
    },
    auth
  };
}

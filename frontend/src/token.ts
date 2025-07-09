export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  return exp ? Date.now() >= exp : true;
}
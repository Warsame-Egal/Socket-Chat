const logs: string[] = JSON.parse(localStorage.getItem('logs') || '[]');

function write(type: string, ...args: unknown[]) {
  const message = `[${new Date().toISOString()}] ${type}: ${args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')}`;
  logs.push(message);
  localStorage.setItem('logs', JSON.stringify(logs));
  // @ts-ignore
  console[type.toLowerCase()]?.(...args);
}

export default {
  info: (...args: unknown[]) => write('INFO', ...args),
  error: (...args: unknown[]) => write('ERROR', ...args)
};
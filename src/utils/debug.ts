// Debug mode - Set to true during development
export const DEBUG_MODE = false;

export function sendLog(message: string, type: string = 'info') {
  if (!DEBUG_MODE) return;

  figma.ui.postMessage({
    type: 'log',
    message: message,
    logType: type
  });
  console.log(`[${type}]`, message);
}

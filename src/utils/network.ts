import { sendLog } from './debug';

export async function makeRequest(url: string, options: any): Promise<any> {
  sendLog(`Making ${options.method || 'GET'} request to ${url}`);

  try {
    const response = await fetch(url, options);
    sendLog(`Response status: ${response.status}`);

    const responseText = await response.text();

    if (response.ok) {
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          return { ok: true, status: response.status, data: data };
        } catch (e) {
          return { ok: true, status: response.status, data: responseText };
        }
      }
      return { ok: true, status: response.status, data: null };
    } else {
      return { ok: false, status: response.status, error: responseText };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network request failed';
    sendLog(`Request failed: ${errorMessage}`, 'error');
    throw error;
  }
}

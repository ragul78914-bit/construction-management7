import { loadBalancer } from './loadBalancer';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // Not JSON
    }
    const error = new Error(errorJson?.error || errorText || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

export async function apiGet(url) {
  return loadBalancer.execute(
    async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    },
    { url, method: 'GET', deduplicate: true }
  );
}

export async function apiPost(url, data) {
  return loadBalancer.execute(
    async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    { url, method: 'POST', deduplicate: false }
  );
}

export async function apiPut(url, data) {
  return loadBalancer.execute(
    async () => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    { url, method: 'PUT', deduplicate: false }
  );
}

export async function apiDelete(url) {
  return loadBalancer.execute(
    async () => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    },
    { url, method: 'DELETE', deduplicate: false }
  );
}

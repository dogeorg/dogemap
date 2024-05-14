export default class ApiClient {
  constructor(baseURL, networkContext = {}) {
    this.baseURL = baseURL
    this.networkContext = networkContext;

    if (networkContext && networkContext.overrideBaseUrl) {
      this.baseURL = networkContext.apiBaseUrl || 'http://nope.localhost:6969';
    }
  }

  async get(path, config = {}) {
    return this.request(path, { ...config, method: 'GET' });
  }

  async post(path, body, config = {}) {
    return this.request(path, { ...config, method: 'POST', body: JSON.stringify(body) });
  }

  async request(path, config) {
    // Debug, if the dev has forceDelay, wait the delay time in seconds before making request
    if (this.networkContext.forceDelayInSeconds) {
      await new Promise(resolve => setTimeout(resolve, this.networkContext.forceDelayInSeconds * 1000));
    }

    // If mocks enabled, avoid making legitimate request, return mocked response (success or error) instead.
    if (this.networkContext.useMocks && config.mock) {
      return await returnMockedResponse(path, config, this.networkContext)
    }

    // Otherwise, perform the fetch request
    const url = new URL(path, this.baseURL).href;
    const headers = { 'Content-Type': 'application/json', ...config.headers };

    if (this.networkContext.token) {
      headers.Authorization = this.networkContext.token
    }

    let response, data

    try {
      response = await fetch(url, { ...config, headers });
    } catch (fetchErr) {
      throw new Error('An error occurred while fetching data, refer to network logs');
    }

    if (response.status === 404) {
      throw new Error(`Resource not found: ${url}`);
    }

    if (!response.ok) {
      throw new Error('Fetching returned an unsuccessful response', { ok, status: repsonse.status });
    }

    try {
      data = await response.json();
    } catch (jsonParseErr) {
      console.warn('Could not JSON parse response from server', jsonParseErr);
      throw new Error('Could not JSON parse response from server');
    }

    return data;
  }
}

async function returnMockedResponse(path, config, networkContext) {

  const { forceFailures, reqLogs } = networkContext;

  reqLogs && console.group('Mock Request', path)
  reqLogs && console.log(`Req (${config.method}):`, config.body || '--no-body');

  const response = (typeof config.mock === 'function')
    ? config.mock(path, { forceFailures })
    : getMockedSuccessOrError(path, config.mock, forceFailures);
    reqLogs && console.log('Res:', response);
    reqLogs && console.groupEnd();

  return response
}

function getMockedSuccessOrError(path, mock, forceFailures) {
  // When forcing failure
  if (forceFailures) {
    throw new Error(`Simulated error returned from ${path}`)
  }
  return mock;
}

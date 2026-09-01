import fetch from 'node-fetch';

const DEFAULT_TIMEOUT = 20000;

function normalizeApiUrl(url = '') {
  return String(url || '').replace(/\/+$/, '');
}

function getApiConfig() {
  const api = global.api || {};
  return {
    url: normalizeApiUrl(api.url),
    key: String(api.key || ''),
  };
}

export function getDownloadApiErrorMessage(error) {
  if (!error) return 'La API de descargas no está disponible en este momento.';
  const message = String(error.message || error);
  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'La API de descargas rechazó la solicitud. La clave o la suscripción expiró y necesita renovarse.';
  }
  if (message.includes('403') || message.includes('Forbidden')) {
    return 'La API de descargas bloqueó la solicitud por permisos.';
  }
  if (message.includes('404')) {
    return 'La ruta de descarga no existe en la API configurada.';
  }
  if (message.includes('451') || message.includes('502') || message.includes('bad gateway') || message.includes('temporarily')) {
    return 'La API de descargas está temporalmente caída o restringida por el proveedor.';
  }
  if (message.includes('timeout') || message.includes('aborted')) {
    return 'La API de descargas tardó demasiado y expiró la conexión.';
  }
  return 'La API de descargas no está disponible en este momento.';
}

export function buildApiUrl(path, params = {}) {
  const { url, key } = getApiConfig();
  if (!url) {
    throw new Error('La API de descargas no está configurada.');
  }

  const safeParams = new URLSearchParams();
  if (key) safeParams.set('key', key);
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    safeParams.set(name, String(value));
  }

  const baseUrl = normalizeApiUrl(url);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let routePath = normalizedPath;

  if (routePath.startsWith('/dl/')) {
    routePath = routePath.replace(/^\/dl\//, '/download/');
  } else if (routePath === '/dl') {
    routePath = '/download';
  }

  const finalRoute = routePath.startsWith('/download') ? routePath : `/download${routePath}`;
  const finalUrl = baseUrl.endsWith('/download')
    ? `${baseUrl}${finalRoute.replace(/^\/download/, '')}`
    : `${baseUrl}${finalRoute}`;

  const query = safeParams.toString();
  return query ? `${finalUrl}?${query}` : finalUrl;
}

export function pickDownloadUrl(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const candidate = pickDownloadUrl(item);
      if (candidate) return candidate;
    }
    return null;
  }

  if (typeof payload === 'object') {
    const direct = payload.download || payload.dl || payload.url || payload.link || payload.file || payload.direct || payload.href || payload.org || payload.hd || payload.wm || payload.mp4 || payload.video;
    if (direct) return String(direct);

    const nested = payload.data ?? payload.result ?? payload.media ?? payload.response ?? payload.meta;
    if (nested && nested !== payload) {
      const candidate = pickDownloadUrl(nested);
      if (candidate) return candidate;
    }

    if (Array.isArray(payload.downloads)) {
      const candidate = pickDownloadUrl(payload.downloads);
      if (candidate) return candidate;
    }

    if (Array.isArray(payload.media)) {
      const candidate = pickDownloadUrl(payload.media);
      if (candidate) return candidate;
    }
  }

  return null;
}

export async function fetchJson(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });

    const raw = await response.text();
    if (!response.ok) {
      const reason = response.status === 401
        ? 'API_DOWNLOAD_401'
        : `HTTP ${response.status}`;
      throw new Error(reason);
    }

    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.status === false) {
        const msg = parsed.msg || parsed.message || parsed.error || 'API_DOWNLOAD_FALSE';
        throw new Error(String(msg));
      }
      return parsed;
    } catch (error) {
      if (error instanceof Error && (error.message === 'API_DOWNLOAD_FALSE' || error.message.startsWith('HTTP ') || error.message === 'API_DOWNLOAD_401')) {
        throw error;
      }
      return raw;
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchBinary(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      const reason = response.status === 401
        ? 'API_DOWNLOAD_401'
        : `HTTP ${response.status}`;
      throw new Error(reason);
    }

    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

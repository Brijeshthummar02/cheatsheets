/**
 * Client-side data layer — no backend required.
 * Cheatsheet JSON files are served as static Vercel assets from /cheatsheets/.
 * This replaces the previous Render/FastAPI backend entirely, eliminating cold-start delays.
 */

// Kept for backward compatibility (nothing calls these in practice now)
export const BACKEND_URL = '';
export const API_BASE_URL = '/api';

// Topic → base filename (mirrors the Python VALID_TOPICS dict)
const VALID_TOPICS = {
    java: 'java_cheatsheet',
    springboot: 'springboot_cheatsheet',
    dsa: 'dsa_cheatsheet',
    git: 'git_cheatsheet',
};

// In-memory cache so each file is only fetched once per session
const cheatsheetCache = {};

function makeError(status, detail) {
    const err = new Error(detail);
    err.response = { status, data: { detail } };
    return err;
}

function getTopicFilename(topic, lang) {
    if (!VALID_TOPICS[topic]) throw makeError(404, 'Cheatsheet not found');
    const base = VALID_TOPICS[topic];
    return lang === 'hi' ? `${base}_hi.json` : `${base}.json`;
}

async function fetchCheatsheetData(filename) {
    if (cheatsheetCache[filename]) return cheatsheetCache[filename];

    const res = await fetch(`/cheatsheets/${filename}`);
    const contentType = res.headers.get('content-type') || '';

    // If the file doesn't exist, the SPA rewrite returns index.html (not JSON).
    // Fall back to the English version for topics that have no hi translation.
    if (!res.ok || !contentType.includes('json')) {
        if (filename.endsWith('_hi.json')) {
            const fallback = filename.replace('_hi.json', '.json');
            return fetchCheatsheetData(fallback);
        }
        throw makeError(res.status || 404, `Cheatsheet file not found: ${filename}`);
    }

    const data = await res.json();
    cheatsheetCache[filename] = data;
    return data;
}

async function searchCheatsheets(q, lang) {
    if (!q || q.trim().length < 2) return [];
    const query = q.toLowerCase().trim();
    const results = [];

    for (const cheatsheetName of Object.keys(VALID_TOPICS)) {
        try {
            const filename = getTopicFilename(cheatsheetName, lang);
            const data = await fetchCheatsheetData(filename);
            for (const section of data.sections || []) {
                for (const concept of section.concepts || []) {
                    const keyPoints = (concept.keyPoints || []).join(' ');
                    const searchable = `${concept.name} ${concept.explanation} ${concept.code} ${keyPoints}`.toLowerCase();
                    if (searchable.includes(query)) {
                        results.push({
                            cheatsheet: cheatsheetName,
                            section_id: section.id || '',
                            section_title: section.title || '',
                            concept_name: concept.name || '',
                            explanation: concept.explanation || '',
                            code: concept.code || '',
                        });
                    }
                }
            }
        } catch (e) {
            console.error('[API-local] search error for', cheatsheetName, e);
        }
    }
    return results.slice(0, 20);
}

/**
 * Route a URL + params to the appropriate local data function,
 * returning { data, status } — the same shape axios returns.
 */
async function dispatchRequest(url, params = {}) {
    const [path] = url.split('?');
    // Strip leading /api prefix if present, then split into segments
    const parts = path.replace(/^\/api/, '').replace(/^\//, '').split('/').filter(Boolean);
    const lang = params.lang || null;

    if (!parts.length) {
        return { data: { message: 'Java & Spring Boot Cheatsheet API' }, status: 200 };
    }

    if (parts[0] !== 'cheatsheets') throw makeError(404, 'Not found');

    // GET /cheatsheets/search?q=...
    if (parts[1] === 'search') {
        return { data: await searchCheatsheets(params.q, lang), status: 200 };
    }

    const topic = parts[1];

    // GET /cheatsheets/{topic}
    if (!parts[2]) {
        const data = await fetchCheatsheetData(getTopicFilename(topic, lang));
        return { data, status: 200 };
    }

    // GET /cheatsheets/{topic}/sections
    if (parts[2] === 'sections' && !parts[3]) {
        const data = await fetchCheatsheetData(getTopicFilename(topic, lang));
        return {
            data: {
                title: data.title || '',
                description: data.description || '',
                sections: (data.sections || []).map(s => ({ id: s.id || '', title: s.title || '' })),
            },
            status: 200,
        };
    }

    // GET /cheatsheets/{topic}/sections/{sectionId}
    if (parts[2] === 'sections' && parts[3]) {
        const sectionId = parts[3];
        const data = await fetchCheatsheetData(getTopicFilename(topic, lang));
        const section = (data.sections || []).find(s => s.id === sectionId);
        if (!section) throw makeError(404, `Section '${sectionId}' not found in ${topic}`);
        return { data: { title: data.title || '', description: data.description || '', section }, status: 200 };
    }

    throw makeError(404, 'Not found');
}

/**
 * Axios-compatible client backed entirely by local static JSON files.
 * Supports apiClient.get(url) and apiClient.get(url, { params }) — same call sites, no changes needed.
 */
export const apiClient = {
    async get(url, options = {}) {
        // Merge inline query-string params with the axios-style { params } option
        const [path, qs] = url.split('?');
        const params = {
            ...Object.fromEntries(new URLSearchParams(qs || '')),
            ...(options?.params || {}),
        };

        if (import.meta.env.DEV) {
            console.log(`[API-local] GET ${url}`, params);
        }

        return dispatchRequest(path, params);
    },
    // No-op interceptors — kept so any code that calls .interceptors.*.use() doesn't break
    interceptors: {
        request: { use: () => {} },
        response: { use: () => {} },
    },
};

/**
 * Parse API error into user-friendly message
 */
export const getErrorMessage = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 404:
                return 'Resource not found.';
            case 500:
                return 'Server error. Please try again later.';
            case 503:
                return 'Service unavailable. Please try again later.';
            default:
                return error.response.data?.detail || error.message || 'An error occurred.';
        }
    }

    return error.message || 'An unexpected error occurred.';
};

// Always "healthy" — there's no remote server to check
export const checkBackendHealth = async () => true;

export const endpoints = {
    root: '/',
    cheatsheet: (topic) => `/cheatsheets/${topic}`,
    cheatsheetSections: (topic) => `/cheatsheets/${topic}/sections`,
    cheatsheetSection: (topic, sectionId) => `/cheatsheets/${topic}/sections/${sectionId}`,
    search: '/cheatsheets/search',
};

export default apiClient;

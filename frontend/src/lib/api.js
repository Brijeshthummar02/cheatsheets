/**
 * Client-side data layer — there is no backend.
 * Cheatsheet JSON files are static assets served from <base>/cheatsheets/ (GitHub Pages sub-path aware),
 * fetched once per session and cached in memory.
 *
 * `apiClient.get()` keeps an axios-like shape ({ data, status }) so call sites read like a normal HTTP client.
 */
import { assetUrl } from '@/lib/utils';

// Topic -> base filename.
const VALID_TOPICS = {
    java: 'java_cheatsheet',
    springboot: 'springboot_cheatsheet',
    dsa: 'dsa_cheatsheet',
    git: 'git_cheatsheet',
};

const MAX_SEARCH_RESULTS = 20;

// In-memory cache of in-flight/finished loads (promises), so each file is fetched once per session
// and concurrent callers (pre-warm + search) share the same request.
const cheatsheetCache = new Map();

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

async function loadCheatsheetFile(filename) {
    const res = await fetch(assetUrl(`cheatsheets/${filename}`));
    const contentType = res.headers.get('content-type') || '';

    // A missing file may come back as the host's HTML 404 page (status 200 on some hosts) — treat both
    // as "not there". Topics without a Hinglish translation silently fall back to English.
    if (!res.ok || !contentType.includes('json')) {
        if (filename.endsWith('_hi.json')) {
            return fetchCheatsheetData(filename.replace('_hi.json', '.json'));
        }
        throw makeError(res.ok ? 404 : res.status, `Cheatsheet file not found: ${filename}`);
    }

    try {
        return await res.json();
    } catch {
        // The server answered but the body wasn't valid JSON — surface it as a server-side problem.
        throw makeError(502, `Cheatsheet file is not valid JSON: ${filename}`);
    }
}

function fetchCheatsheetData(filename) {
    if (!cheatsheetCache.has(filename)) {
        const pending = loadCheatsheetFile(filename).catch((err) => {
            // Never cache a failure, so a retry (e.g. after coming back online) really re-fetches.
            cheatsheetCache.delete(filename);
            throw err;
        });
        cheatsheetCache.set(filename, pending);
    }
    return cheatsheetCache.get(filename);
}

/** Lower rank = better match. Concept name beats section title beats body text. */
function rankConcept(name, sectionTitle, body, query) {
    const nameIdx = name.indexOf(query);
    if (nameIdx === 0) return 0; // name starts with the query
    if (nameIdx > 0) {
        const startsWord = /[^a-z0-9]/.test(name[nameIdx - 1]);
        return startsWord ? 1 : 2; // word-prefix, then plain substring
    }
    if (sectionTitle.includes(query)) return 3;
    if (body.includes(query)) return 4;
    return -1;
}

async function searchCheatsheets(q, lang) {
    if (!q || q.trim().length < 2) return [];
    const query = q.toLowerCase().trim();
    const hits = [];
    let failure = null;
    let loaded = 0;

    const topics = await Promise.all(
        Object.keys(VALID_TOPICS).map(async (cheatsheetName) => {
            try {
                const data = await fetchCheatsheetData(getTopicFilename(cheatsheetName, lang));
                loaded += 1;
                return { cheatsheetName, data };
            } catch (e) {
                failure = failure || e;
                return null;
            }
        }),
    );

    // Every file failed: that's an error (offline, host down), not "no results".
    if (!loaded && failure) throw failure;

    for (const topic of topics) {
        if (!topic) continue;
        for (const section of topic.data.sections || []) {
            const sectionTitle = (section.title || '').toLowerCase();
            for (const concept of section.concepts || []) {
                const name = (concept.name || '').toLowerCase();
                const body = `${concept.explanation || ''} ${(concept.keyPoints || []).join(' ')} ${concept.code || ''}`.toLowerCase();
                const rank = rankConcept(name, sectionTitle, body, query);
                if (rank < 0) continue;
                hits.push({
                    rank,
                    order: hits.length, // keeps the sort stable (topic, section, concept order)
                    result: {
                        cheatsheet: topic.cheatsheetName,
                        section_id: section.id || '',
                        section_title: section.title || '',
                        concept_name: concept.name || '',
                        explanation: concept.explanation || '',
                        code: concept.code || '',
                    },
                });
            }
        }
    }

    return hits
        .sort((a, b) => a.rank - b.rank || a.order - b.order)
        .slice(0, MAX_SEARCH_RESULTS)
        .map((hit) => hit.result);
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
        return { data: { message: 'Cheatsheets' }, status: 200 };
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
 * Supports apiClient.get(url) and apiClient.get(url, { params }).
 */
export const apiClient = {
    async get(url, options = {}) {
        // Merge inline query-string params with the axios-style { params } option
        const [path, qs] = url.split('?');
        const params = {
            ...Object.fromEntries(new URLSearchParams(qs || '')),
            ...(options?.params || {}),
        };
        return dispatchRequest(path, params);
    },
};

/**
 * Classify an error so callers can pick (and translate) a message:
 * 'offline' | 'not-found' | 'server' | 'unknown'.
 */
export const getErrorKind = (error) => {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const message = String(error?.message || '');
    // fetch() rejects with a TypeError when the network is unreachable ("Failed to fetch",
    // "NetworkError when attempting to fetch resource", "Load failed" on Safari).
    const networkFailure =
        !error?.response && error instanceof TypeError && /fetch|network|load failed/i.test(message);
    if (offline || networkFailure) return 'offline';

    const status = error?.response?.status;
    if (status === 404) return 'not-found';
    if (status >= 500) return 'server';
    return 'unknown';
};

const ERROR_MESSAGES = {
    offline: 'You appear to be offline. Check your connection and try again.',
    'not-found': "We couldn't find that cheatsheet.",
    server: 'Something went wrong on our side. Please try again.',
    unknown: "Something didn't work as expected. Please try again.",
};

/**
 * Turn any thrown error into a short, friendly, English sentence. Never exposes raw technical text.
 * (Callers that have a language context may translate via getErrorKind.)
 */
export const getErrorMessage = (error) => ERROR_MESSAGES[getErrorKind(error)];

export const endpoints = {
    root: '/',
    cheatsheet: (topic) => `/cheatsheets/${topic}`,
    cheatsheetSections: (topic) => `/cheatsheets/${topic}/sections`,
    cheatsheetSection: (topic, sectionId) => `/cheatsheets/${topic}/sections/${sectionId}`,
    search: '/cheatsheets/search',
};

export default apiClient;

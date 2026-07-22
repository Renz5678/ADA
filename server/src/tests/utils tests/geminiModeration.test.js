/**
 * Tests for geminiModeration.js — Phase 1 security fix.
 *
 * Coverage goals:
 *  1. moderateImage with a remote URL (Cloudinary path) now actually calls
 *     fetch() and sends bytes to Gemini — proving the old fs.existsSync
 *     silent-fail bug cannot recur.
 *  2. A mocked "flagged" Gemini response causes isFlagged:true.
 *  3. A mocked "clean" Gemini response causes isFlagged:false.
 *  4. Token-bucket: when the bucket is empty the function returns
 *     quotaExhausted:true WITHOUT calling Gemini at all — and callers
 *     must treat this as a rejection (fail CLOSED).
 *  5. Missing GEMINI_API_KEY skips moderation.
 *  6. Local filesystem path still works (retained for dev/test workflows).
 *  7. Failed fetch (non-2xx) fails open gracefully.
 */

/* global Buffer, global */
import { moderateImage, moderateText, _testOnly_geminiTokenBucket } from '../../utils/geminiModeration.js';

// ---------------------------------------------------------------------------
// Mock @google/generative-ai so no real HTTP call ever leaves the test runner.
// ---------------------------------------------------------------------------
jest.mock('@google/generative-ai', () => {
    const mockGenerateContent = jest.fn();
    const mockGetGenerativeModel = jest.fn(() => ({
        generateContent: mockGenerateContent,
    }));
    return {
        GoogleGenerativeAI: jest.fn(() => ({
            getGenerativeModel: mockGetGenerativeModel,
        })),
        // expose mocks so individual tests can configure return values
        __mockGenerateContent: mockGenerateContent,
        __mockGetGenerativeModel: mockGetGenerativeModel,
    };
});

// ---------------------------------------------------------------------------
// Mock the global fetch used to download images from Cloudinary URLs.
// ---------------------------------------------------------------------------
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const { __mockGenerateContent } = jest.requireMock('@google/generative-ai');

const CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/v1/freelancer_profiles/abc.jpg';

/** Make Gemini respond as if the image is flagged. */
function mockGeminiFlagged(reason = 'NSFW content detected') {
    __mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => JSON.stringify({ isFlagged: true, reason }) }
    });
}

/** Make Gemini respond as if the image is clean. */
function mockGeminiClean() {
    __mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => JSON.stringify({ isFlagged: false, reason: null }) }
    });
}

/** Make fetch() succeed with a tiny 1×1 JPEG buffer. */
function mockFetchSuccess(contentType = 'image/jpeg') {
    const fakeBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG magic bytes
    mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: (h) => (h === 'content-type' ? contentType : null) },
        arrayBuffer: async () => fakeBuffer.buffer,
    });
}

/** Make fetch() return a non-2xx response (e.g. 404). */
function mockFetchFailure(status = 404) {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        status,
        headers: { get: () => null },
    });
}

// ---------------------------------------------------------------------------
// Reset state between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
    // Ensure GEMINI_API_KEY is set for all tests unless overridden.
    process.env.GEMINI_API_KEY = 'test-key';

    // Reset all mocks.
    jest.clearAllMocks();

    // Refill the token bucket to full capacity so each test starts fresh.
    _testOnly_geminiTokenBucket.tokens = 10;
    _testOnly_geminiTokenBucket.lastRefill = Date.now();
});

afterAll(() => {
    delete process.env.GEMINI_API_KEY;
});

// ===========================================================================
// 1. Remote URL path (the real production path — was broken before this fix)
// ===========================================================================
describe('moderateImage — remote Cloudinary URL', () => {
    it('REGRESSION GUARD: actually calls fetch() for a Cloudinary URL, not fs.existsSync', async () => {
        mockFetchSuccess();
        mockGeminiClean();

        await moderateImage(CLOUDINARY_URL);

        // fetch must have been called with the Cloudinary URL
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(CLOUDINARY_URL);

        // Gemini must also have been called (proving bytes were forwarded)
        expect(__mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns isFlagged:true when Gemini flags a remote image (attack path)', async () => {
        mockFetchSuccess();
        mockGeminiFlagged('Explicit NSFW content');

        const result = await moderateImage(CLOUDINARY_URL);

        expect(result.isFlagged).toBe(true);
        expect(result.reason).toBe('Explicit NSFW content');
        expect(result.quotaExhausted).toBeFalsy();
    });

    it('returns isFlagged:false for a clean remote image (legitimate user path)', async () => {
        mockFetchSuccess();
        mockGeminiClean();

        const result = await moderateImage(CLOUDINARY_URL);

        expect(result.isFlagged).toBe(false);
        expect(result.reason).toBeNull();
        expect(result.quotaExhausted).toBeFalsy();
    });

    it('uses Content-Type header to derive MIME type (png)', async () => {
        const fakeBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: (h) => (h === 'content-type' ? 'image/png' : null) },
            arrayBuffer: async () => fakeBuffer.buffer,
        });
        mockGeminiClean();

        await moderateImage('https://res.cloudinary.com/demo/image/upload/photo.png');

        const call = __mockGenerateContent.mock.calls[0][0];
        const imagePart = call[1]; // second element of the content array
        expect(imagePart.inlineData.mimeType).toBe('image/png');
    });

    it('falls back to URL extension for MIME type when Content-Type header is absent', async () => {
        const fakeBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46]);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => null }, // no Content-Type
            arrayBuffer: async () => fakeBuffer.buffer,
        });
        mockGeminiClean();

        await moderateImage('https://res.cloudinary.com/demo/image/upload/photo.webp');

        const call = __mockGenerateContent.mock.calls[0][0];
        expect(call[1].inlineData.mimeType).toBe('image/webp');
    });
});

// ===========================================================================
// 2. Fetch failure handling
// ===========================================================================
describe('moderateImage — fetch failure', () => {
    it('fails open (isFlagged:false) when fetch returns a non-2xx status', async () => {
        mockFetchFailure(404);

        const result = await moderateImage(CLOUDINARY_URL);

        expect(result.isFlagged).toBe(false);
        expect(result.reason).toBeNull();
        // Gemini should NOT be called when we can't get the bytes
        expect(__mockGenerateContent).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// 3. Global token-bucket (Gate 3 — Gemini RPM cap, FAIL CLOSED)
// ===========================================================================
describe('moderateImage — global RPM token bucket (fail CLOSED)', () => {
    it('succeeds normally when tokens are available', async () => {
        mockFetchSuccess();
        mockGeminiClean();

        _testOnly_geminiTokenBucket.tokens = 5; // partial bucket, still available

        const result = await moderateImage(CLOUDINARY_URL);
        expect(result.isFlagged).toBe(false);
        expect(result.quotaExhausted).toBeFalsy();
        expect(__mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns quotaExhausted:true WITHOUT calling Gemini or fetch when bucket is empty', async () => {
        _testOnly_geminiTokenBucket.tokens = 0; // bucket exhausted

        const result = await moderateImage(CLOUDINARY_URL);

        // Must signal quota exhaustion — NOT a clean pass
        expect(result.quotaExhausted).toBe(true);
        // isFlagged must be false so callers don't confuse it with a flagged image,
        // but quotaExhausted:true is the controlling signal
        expect(result.isFlagged).toBe(false);

        // Critically: no network calls should be made — we short-circuit immediately
        expect(mockFetch).not.toHaveBeenCalled();
        expect(__mockGenerateContent).not.toHaveBeenCalled();
    });

    it('consumes exactly one token per successful moderation call', async () => {
        mockFetchSuccess();
        mockGeminiClean();

        _testOnly_geminiTokenBucket.tokens = 3;

        await moderateImage(CLOUDINARY_URL);
        expect(_testOnly_geminiTokenBucket.tokens).toBeCloseTo(2, 0);
    });
});

// ===========================================================================
// 4. Missing API key — skip gracefully
// ===========================================================================
describe('moderateImage — missing API key', () => {
    it('returns isFlagged:false and skips fetch+Gemini when GEMINI_API_KEY is absent', async () => {
        delete process.env.GEMINI_API_KEY;

        const result = await moderateImage(CLOUDINARY_URL);

        expect(result.isFlagged).toBe(false);
        expect(mockFetch).not.toHaveBeenCalled();
        expect(__mockGenerateContent).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// 5. Local filesystem path (retained for dev/test workflows)
// ===========================================================================
describe('moderateImage — local file path (dev/test workflow)', () => {
    it('fails open when the local path does not exist', async () => {
        const result = await moderateImage('/tmp/does-not-exist.jpg');

        expect(result.isFlagged).toBe(false);
        // fetch should not be called for non-URL paths
        expect(mockFetch).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// 6. moderateText — unaffected by these changes, smoke-test
// ===========================================================================
describe('moderateText — smoke test (should be unaffected by Phase 1 changes)', () => {
    it('returns isFlagged:true for flagged text', async () => {
        __mockGenerateContent.mockResolvedValueOnce({
            response: { text: () => JSON.stringify({ isFlagged: true, reason: 'Spam detected' }) }
        });

        const result = await moderateText('buy cheap drugs now');
        expect(result.isFlagged).toBe(true);
    });

    it('returns isFlagged:false for clean text', async () => {
        __mockGenerateContent.mockResolvedValueOnce({
            response: { text: () => JSON.stringify({ isFlagged: false, reason: null }) }
        });

        const result = await moderateText('Hello, I am a freelance tailor.');
        expect(result.isFlagged).toBe(false);
    });
});

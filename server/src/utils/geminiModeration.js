/* global Buffer */
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ---------------------------------------------------------------------------
// Global token-bucket rate limiter for Gemini image calls.
//
// Gemini 1.5 Flash free tier: 15 RPM.  We cap ourselves at 10 RPM to leave
// headroom and avoid HTTP 429 errors from the upstream API.
//
// When the bucket is empty we FAIL CLOSED: callers receive
// { quotaExhausted: true } and are responsible for rejecting the upload and
// cleaning up any already-uploaded Cloudinary asset.  This prevents
// unmoderated images from ever going live.
// ---------------------------------------------------------------------------
const GEMINI_IMAGE_RPM_CAP = parseInt(process.env.GEMINI_IMAGE_RPM_CAP || '10', 10);

const _geminiTokenBucket = {
    tokens: GEMINI_IMAGE_RPM_CAP,
    lastRefill: Date.now(),

    /**
     * Attempt to consume one token.
     * Refills the bucket (up to the cap) based on elapsed time since the last
     * refill, then returns true if a token was available or false if exhausted.
     */
    consume() {
        const now = Date.now();
        const elapsedMs = now - this.lastRefill;
        // Tokens refill at GEMINI_IMAGE_RPM_CAP per 60 000 ms
        const refill = (elapsedMs / 60_000) * GEMINI_IMAGE_RPM_CAP;
        if (refill >= 1) {
            this.tokens = Math.min(GEMINI_IMAGE_RPM_CAP, this.tokens + refill);
            this.lastRefill = now;
        }
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
};

// Exported for test access only — do not mutate in production code.
export const _testOnly_geminiTokenBucket = _geminiTokenBucket;

// ---------------------------------------------------------------------------

export const moderateText = async (text) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping text moderation.');
        return { isFlagged: false, reason: null };
    }
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the following text for spam, phishing links, highly inappropriate language, or malicious content. 
        Respond with ONLY a JSON object in this exact format: {"isFlagged": boolean, "reason": "string (or null if not flagged)"}.
        
        Text to analyze:
        "${text}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Try to parse the JSON from the response
        try {
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return { isFlagged: !!parsed.isFlagged, reason: parsed.reason || null };
            }
        } catch (e) {
            console.error('Failed to parse Gemini text moderation JSON:', e);
        }
        
        return { isFlagged: false, reason: null };
    } catch (error) {
        console.error('Gemini text moderation error:', error);
        // Fail open if the API is down
        return { isFlagged: false, reason: null };
    }
};

/**
 * Moderates an image for inappropriate content via the Gemini API.
 *
 * @param {string} imagePath - Either a remote URL (http/https) or a local
 *   filesystem path.  When a Cloudinary URL is passed (the normal production
 *   path), the function fetches the image bytes from the URL before sending
 *   them to Gemini.  The old fs-based path is retained for local dev/testing
 *   workflows that still write to disk.
 *
 * @returns {{ isFlagged: boolean, reason: string|null, quotaExhausted?: true }}
 *   When quotaExhausted is true the caller MUST reject the upload and clean up
 *   any already-uploaded Cloudinary asset — the image must not go live
 *   unmoderated.
 */
export const moderateImage = async (imagePath) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping image moderation.');
        return { isFlagged: false, reason: null };
    }

    // ---- Global rate-limit check (Gate 3) ---------------------------------
    // Fail CLOSED: if quota is exhausted the image must not be published.
    // Controllers receive quotaExhausted:true and must destroy the Cloudinary
    // asset and return a 503 to the client.
    if (!_geminiTokenBucket.consume()) {
        console.warn('[Gemini] Image moderation RPM cap reached — rejecting upload to prevent unmoderated content going live.');
        return { isFlagged: false, reason: null, quotaExhausted: true };
    }
    // -----------------------------------------------------------------------

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let imageBase64;
        let mimeType = 'image/jpeg';

        const isRemoteUrl = typeof imagePath === 'string' &&
            (imagePath.startsWith('http://') || imagePath.startsWith('https://'));

        if (isRemoteUrl) {
            // Fetch image bytes from the remote URL (e.g. Cloudinary).
            const response = await fetch(imagePath);
            if (!response.ok) {
                console.warn(`[Gemini] Failed to fetch image for moderation (${response.status}): ${imagePath}`);
                return { isFlagged: false, reason: null };
            }
            const arrayBuffer = await response.arrayBuffer();
            imageBase64 = Buffer.from(arrayBuffer).toString('base64');

            // Derive MIME type from the URL extension or Content-Type header.
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('image/png')) mimeType = 'image/png';
            else if (contentType.includes('image/webp')) mimeType = 'image/webp';
            else if (contentType.includes('image/gif')) mimeType = 'image/gif';
            else {
                // Fallback: inspect the URL path for a known extension.
                const ext = imagePath.split('?')[0].split('.').pop().toLowerCase();
                if (ext === 'png') mimeType = 'image/png';
                else if (ext === 'webp') mimeType = 'image/webp';
            }
        } else {
            // Local filesystem path — retained for dev/test workflows.
            if (!fs.existsSync(imagePath)) {
                console.warn('[Gemini] Local image path does not exist for moderation:', imagePath);
                return { isFlagged: false, reason: null };
            }
            const imageFile = fs.readFileSync(imagePath);
            imageBase64 = imageFile.toString('base64');
            const ext = imagePath.split('.').pop().toLowerCase();
            if (ext === 'png') mimeType = 'image/png';
            if (ext === 'webp') mimeType = 'image/webp';
        }

        const prompt = `Analyze this image for inappropriate content (NSFW, explicit violence, severe gore, or illegal content).
        Respond with ONLY a JSON object in this exact format: {"isFlagged": boolean, "reason": "string (or null if not flagged)"}.`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        try {
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return { isFlagged: !!parsed.isFlagged, reason: parsed.reason || null };
            }
        } catch (e) {
            console.error('Failed to parse Gemini image moderation JSON:', e);
        }

        return { isFlagged: false, reason: null };
    } catch (error) {
        console.error('Gemini image moderation error:', error);
        return { isFlagged: false, reason: null };
    }
};

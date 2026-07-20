import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export const moderateImage = async (imagePath) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping image moderation.');
        return { isFlagged: false, reason: null };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Ensure the file exists before reading
        if (!fs.existsSync(imagePath)) {
            console.warn('Image path does not exist for moderation:', imagePath);
            return { isFlagged: false, reason: null };
        }

        const imageFile = fs.readFileSync(imagePath);
        const imageBase64 = imageFile.toString("base64");
        // Get MIME type from extension loosely
        const ext = imagePath.split('.').pop().toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === 'png') mimeType = 'image/png';
        if (ext === 'webp') mimeType = 'image/webp';

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

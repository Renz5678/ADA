/**
 * Unit tests for image moderation logic in productController and
 * profileController — Phase 1 security fix.
 *
 * These tests call the controller functions directly with mocked req/res/next,
 * bypassing the Express router and multer middleware entirely.  This lets us
 * assert moderation behaviour (Cloudinary cleanup, correct HTTP status) without
 * hitting a real database, real Cloudinary, or real Gemini API.
 *
 * Three paths are covered for each image-upload code branch:
 *   A) ATTACK:  Gemini flags the image → 403 + Cloudinary asset destroyed.
 *   B) CLEAN:   Gemini approves the image → upload proceeds (201/200).
 *   C) QUOTA:   Token bucket exhausted (quotaExhausted:true) → 503 + Cloudinary
 *               asset destroyed.  This is the regression guard for the
 *               fail-open bug fixed in Phase 1.
 */

// ---------------------------------------------------------------------------
// Module mocks — must be declared before the first import that uses them.
// ---------------------------------------------------------------------------

// Gemini moderation — we control the return value per test.
jest.mock('../../utils/geminiModeration.js', () => ({
    moderateText: jest.fn().mockResolvedValue({ isFlagged: false, reason: null }),
    moderateImage: jest.fn(),
}));

// Cloudinary destroy — spy so we can assert it's called (or not) correctly.
jest.mock('../../middleware/upload.js', () => ({
    __esModule: true,
    default: {},                                      // unused in controller unit tests
    destroyCloudinaryImage: jest.fn().mockResolvedValue(undefined),
}));

// Models — stub just enough for the moderation paths we're testing.
jest.mock('../../models/index.js', () => {
    const mockUser = {
        approval_status: 'approved',
        user_id: 1,
        profile_picture: null,
        banner_image: null,
        save: jest.fn().mockResolvedValue(undefined),
    };
    const mockProductCreate = jest.fn();
    const mockProductCount  = jest.fn().mockResolvedValue(0);
    const mockProductMaterialCreate = jest.fn();

    const mockTransaction = {
        commit:   jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
    };

    return {
        __esModule: true,
        models: {
            Users: {
                findByPk: jest.fn().mockResolvedValue(mockUser),
            },
            Product: {
                create: mockProductCreate,
                count:  mockProductCount,
                findOne: jest.fn(),
            },
            ProductMaterial: {
                create: mockProductMaterialCreate,
                destroy: jest.fn().mockResolvedValue(undefined),
            },
        },
        sequelize: {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
        },
        // Expose mocks for per-test overrides
        __mockUser: mockUser,
        __mockProductCreate: mockProductCreate,
        __mockTransaction: mockTransaction,
    };
});

// express-validator — always valid so validator errors don't interfere.
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] })),
}));

// ---------------------------------------------------------------------------
// Import controller functions and mocked helpers AFTER jest.mock declarations.
// ---------------------------------------------------------------------------
import { createProduct, updateProduct } from '../../controllers/productController.js';
import { uploadProfileImages } from '../../controllers/profileController.js';
import { moderateImage }           from '../../utils/geminiModeration.js';
import { destroyCloudinaryImage }  from '../../middleware/upload.js';
import { models, sequelize }       from '../../models/index.js';

const { Users, Product } = models;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FAKE_CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/v1/fp/test.jpg';
const FAKE_PROFILE_URL    = 'https://res.cloudinary.com/demo/image/upload/v1/fp/profile.jpg';
const FAKE_BANNER_URL     = 'https://res.cloudinary.com/demo/image/upload/v1/fp/banner.jpg';

// ---------------------------------------------------------------------------
// req / res factory helpers
// ---------------------------------------------------------------------------
function makeRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
}

function makeProductReq(overrides = {}) {
    return {
        user: { id: 1 },
        body: {
            product_code:  'P-TEST',
            product_name:  'Test Product',
            price:         99.99,
            description:   'desc',
            estimated_days: null,
            materials: [],
        },
        file: {
            path: FAKE_CLOUDINARY_URL,
            fieldname: 'image',
            mimetype: 'image/jpeg',
        },
        ...overrides,
    };
}

function makeProfileReq(profilePath = FAKE_PROFILE_URL, bannerPath = null) {
    const files = {};
    if (profilePath) {
        files.profile_picture = [{ path: profilePath }];
    }
    if (bannerPath) {
        files.banner_image = [{ path: bannerPath }];
    }
    return {
        user: { id: 1 },
        body: {},
        files,
    };
}

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
    jest.clearAllMocks();

    // Default approved user
    Users.findByPk.mockResolvedValue({
        approval_status: 'approved',
        user_id: 1,
        profile_picture: null,
        banner_image: null,
        save: jest.fn().mockResolvedValue(undefined),
    });

    // Default: Product.create returns a minimal object
    Product.create.mockResolvedValue({ product_id: 42, product_name: 'Test Product' });

    // Default: no validator errors
    const { validationResult } = jest.requireMock('express-validator');
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

    // Default: transaction mocks
    const mockTx = { commit: jest.fn().mockResolvedValue(), rollback: jest.fn().mockResolvedValue() };
    sequelize.transaction.mockResolvedValue(mockTx);
});

// ===========================================================================
// 1. createProduct — image moderation
// ===========================================================================
describe('createProduct — image moderation', () => {
    it('A) ATTACK: returns 403 and destroys the Cloudinary asset when Gemini flags the image', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: true, reason: 'NSFW content' });

        const req = makeProductReq();
        const res = makeRes();

        await createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/Image blocked by moderation/) })
        );
        // Cloudinary cleanup MUST happen
        expect(destroyCloudinaryImage).toHaveBeenCalledTimes(1);
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_CLOUDINARY_URL);
        // Product must NOT be created in the DB
        expect(Product.create).not.toHaveBeenCalled();
    });

    it('B) CLEAN: returns 201 and does NOT destroy the Cloudinary asset when Gemini approves the image', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null });

        const req = makeProductReq();
        const res = makeRes();

        await createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(destroyCloudinaryImage).not.toHaveBeenCalled();
        expect(Product.create).toHaveBeenCalledTimes(1);
    });

    it('C) QUOTA EXHAUSTED: returns 503 and destroys the Cloudinary asset — image must NOT go live', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null, quotaExhausted: true });

        const req = makeProductReq();
        const res = makeRes();

        await createProduct(req, res);

        // Must be CLOSED — 503, not a silent pass-through
        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/moderation is temporarily unavailable/i) })
        );
        // Cloudinary cleanup MUST happen
        expect(destroyCloudinaryImage).toHaveBeenCalledTimes(1);
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_CLOUDINARY_URL);
        // Product must NOT be created
        expect(Product.create).not.toHaveBeenCalled();
    });

    it('REGRESSION GUARD: without an image file, skips moderateImage entirely', async () => {
        const req = makeProductReq({ file: null }); // no file upload
        const res = makeRes();

        await createProduct(req, res);

        // moderateImage should not be called at all
        expect(moderateImage).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

// ===========================================================================
// 2. updateProduct — image moderation
// ===========================================================================
describe('updateProduct — image moderation', () => {
    const productId = 99;

    beforeEach(() => {
        // Stub the product.findOne + product.update
        const mockProduct = {
            product_id: productId,
            user_id: 1,
            image_url: null,
            update: jest.fn().mockResolvedValue(undefined),
        };
        Product.findOne.mockResolvedValue(mockProduct);
        const { ProductMaterial } = models;
        ProductMaterial.destroy.mockResolvedValue(undefined);
    });

    it('A) ATTACK: returns 403 and destroys the uploaded Cloudinary asset when Gemini flags image', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: true, reason: 'Explicit violence' });

        const req = {
            user: { id: 1 },
            params: { id: productId },
            body: { product_name: 'Updated' },
            file: { path: FAKE_CLOUDINARY_URL },
        };
        const res = makeRes();

        await updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/Image blocked by moderation/) })
        );
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_CLOUDINARY_URL);
    });

    it('B) CLEAN: returns 200 when Gemini approves the updated image', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null });

        const req = {
            user: { id: 1 },
            params: { id: productId },
            body: { product_name: 'Updated Clean' },
            file: { path: FAKE_CLOUDINARY_URL },
        };
        const res = makeRes();

        await updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(moderateImage).toHaveBeenCalledTimes(1);
    });

    it('C) QUOTA EXHAUSTED: returns 503 and destroys the uploaded Cloudinary asset', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null, quotaExhausted: true });

        const req = {
            user: { id: 1 },
            params: { id: productId },
            body: { product_name: 'Quota Update' },
            file: { path: FAKE_CLOUDINARY_URL },
        };
        const res = makeRes();

        await updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/moderation is temporarily unavailable/i) })
        );
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_CLOUDINARY_URL);
    });
});

// ===========================================================================
// 3. uploadProfileImages — image moderation
// ===========================================================================
describe('uploadProfileImages — image moderation', () => {
    it('A) ATTACK: returns 403 and destroys profile picture when Gemini flags it', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: true, reason: 'NSFW' });

        const req = makeProfileReq(FAKE_PROFILE_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/Profile picture blocked/) })
        );
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_PROFILE_URL);
    });

    it('B) CLEAN: returns 200 and does NOT destroy the profile picture when Gemini approves it', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null });

        const req = makeProfileReq(FAKE_PROFILE_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        // The controller calls destroyCloudinaryImage(user.profile_picture) to clean up
        // the OLD image before saving the new one — that's correct behaviour.
        // Assert it was NOT called with the NEW upload URL (i.e. the new upload was NOT deleted).
        expect(destroyCloudinaryImage).not.toHaveBeenCalledWith(FAKE_PROFILE_URL);
    });

    it('C) QUOTA EXHAUSTED: returns 503 and destroys profile picture — image must NOT go live', async () => {
        moderateImage.mockResolvedValueOnce({ isFlagged: false, reason: null, quotaExhausted: true });

        const req = makeProfileReq(FAKE_PROFILE_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/moderation is temporarily unavailable/i) })
        );
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_PROFILE_URL);
    });

    it('A) ATTACK: returns 403 and destroys banner image when Gemini flags it', async () => {
        // Profile picture is clean; banner is flagged
        moderateImage
            .mockResolvedValueOnce({ isFlagged: false, reason: null })       // profile_picture
            .mockResolvedValueOnce({ isFlagged: true, reason: 'Gore' });     // banner_image

        const req = makeProfileReq(FAKE_PROFILE_URL, FAKE_BANNER_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringMatching(/Banner image blocked/) })
        );
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_BANNER_URL);
    });

    it('C) QUOTA EXHAUSTED: returns 503 and destroys banner when bucket exhausted mid-request', async () => {
        moderateImage
            .mockResolvedValueOnce({ isFlagged: false, reason: null })
            .mockResolvedValueOnce({ isFlagged: false, reason: null, quotaExhausted: true });

        const req = makeProfileReq(FAKE_PROFILE_URL, FAKE_BANNER_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(destroyCloudinaryImage).toHaveBeenCalledWith(FAKE_BANNER_URL);
    });

    it('B) CLEAN: returns 200 with both profile picture and banner approved by Gemini', async () => {
        moderateImage
            .mockResolvedValueOnce({ isFlagged: false, reason: null })
            .mockResolvedValueOnce({ isFlagged: false, reason: null });

        const req = makeProfileReq(FAKE_PROFILE_URL, FAKE_BANNER_URL);
        const res = makeRes();

        await uploadProfileImages(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        // The controller calls destroyCloudinaryImage for each old image (null) before saving —
        // assert the NEW upload URLs were not deleted.
        expect(destroyCloudinaryImage).not.toHaveBeenCalledWith(FAKE_PROFILE_URL);
        expect(destroyCloudinaryImage).not.toHaveBeenCalledWith(FAKE_BANNER_URL);
        expect(moderateImage).toHaveBeenCalledTimes(2);
    });
});

import { test, describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { verifyIdToken } from './auth-verify';

describe('Auth Verify', () => {
    const originalFetch = global.fetch;
    const originalEnv = process.env;

    before(() => {
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
    });

    after(() => {
        global.fetch = originalFetch;
        process.env = originalEnv;
    });

    it('should return user ID for a valid token', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                users: [{ localId: 'user-123' }]
            })
        };
        // @ts-ignore
        global.fetch = mock.fn(async () => mockResponse);

        const userId = await verifyIdToken('valid-token');
        assert.strictEqual(userId, 'user-123');
    });

    it('should return null for an invalid token', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: async () => 'Invalid token'
        };
        // @ts-ignore
        global.fetch = mock.fn(async () => mockResponse);

        const userId = await verifyIdToken('invalid-token');
        assert.strictEqual(userId, null);
    });

    it('should return null if API key is missing', async () => {
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '';
         const userId = await verifyIdToken('some-token');
         assert.strictEqual(userId, null);
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
    });
});

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UnsealLogo } from './UnsealLogo';

describe('UnsealLogo', () => {
    it('should be a function', () => {
        assert.strictEqual(typeof UnsealLogo, 'function');
    });

    it('should return a React element', () => {
        const element = UnsealLogo({});
        assert.ok(element);
        assert.strictEqual(typeof element, 'object');
        // In React 19, element.type should be 'svg' for this component
        // @ts-expect-error - Accessing internal type property
        assert.strictEqual(element.type, 'svg');
    });
});

import { describe, it, expect } from 'vitest';
import { cn } from './utils.js';

describe('utils.js', () => {
    describe('cn (classNames)', () => {
        it('should merge tailwind classes properly', () => {
            const result = cn('bg-red-500', 'text-white', { 'opacity-50': true, 'hidden': false });
            expect(result).toBe('bg-red-500 text-white opacity-50');
        });

        it('should handle tailwind-merge correctly', () => {
            // tailwind-merge resolves conflicts, the later class wins
            const result = cn('bg-red-500', 'bg-blue-500');
            expect(result).toBe('bg-blue-500');
        });
    });
});

import { calculatePriorityScore } from '../utils/priorityEngine.js';

describe('Priority Engine', () => {
    const averageOrderValue = 1000;
    
    it('should assign 80 points for orders due today', () => {
        const order = { deadline: new Date().toISOString() };
        const score = calculatePriorityScore(order, averageOrderValue);
        expect(score).toBeGreaterThanOrEqual(80);
    });

    it('should assign 60 points for orders due tomorrow', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const order = { deadline: tomorrow.toISOString() };
        
        const score = calculatePriorityScore(order, averageOrderValue);
        expect(score).toBeGreaterThanOrEqual(60);
        expect(score).toBeLessThan(80);
    });

    it('should assign bonus points for high value orders', () => {
        const order = { 
            deadline: null,
            total_amount: 2000 // 2x average
        };
        const score = calculatePriorityScore(order, averageOrderValue);
        expect(score).toBe(20);
    });

    it('should assign status points for Pending orders', () => {
        const order = { 
            deadline: null,
            total_amount: null,
            status: 'Pending'
        };
        const score = calculatePriorityScore(order, averageOrderValue);
        expect(score).toBe(10);
    });

    it('should compound points correctly for a high-priority order', () => {
        const order = { 
            deadline: new Date().toISOString(), // 80 points
            total_amount: 2500, // 20 points
            status: 'Pending' // 10 points
        };
        const score = calculatePriorityScore(order, averageOrderValue);
        expect(score).toBe(110);
    });
});

/**
 * priorityEngine.js
 * Calculates a Priority Score for an order based on deadline proximity, value, and status.
 */

export const calculatePriorityScore = (order, averageOrderValue) => {
    let score = 0;
    
    // 1. Deadline Proximity (max 80 points)
    if (order.deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deadlineDate = new Date(order.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            score += 80; // Due today or overdue
        } else if (diffDays === 1) {
            score += 60; // Due tomorrow
        } else if (diffDays <= 3) {
            score += 40; // Due in next 3 days
        } else if (diffDays <= 7) {
            score += 20; // Due in next week
        } else {
            score += 5; // Due eventually
        }
    }

    // 2. Order Value (max 20 points)
    // Compare total_amount to the average order value to grant bonus points.
    // E.g., if order is 2x average, it gets max 20 pts.
    if (order.total_amount && averageOrderValue) {
        const ratio = parseFloat(order.total_amount) / averageOrderValue;
        if (ratio >= 2) {
            score += 20;
        } else if (ratio >= 1.5) {
            score += 15;
        } else if (ratio >= 1) {
            score += 10;
        } else if (ratio >= 0.5) {
            score += 5;
        }
    }

    // 3. Status Weight (max 10 points)
    if (order.status === 'Pending') {
        score += 10;
    } else if (order.status === 'In Progress') {
        score += 5;
    }

    return score;
};

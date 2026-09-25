/**
 * Utility functions for Explorely Split Expenses calculation.
 * Accurately calculates individual participant shares, net balances,
 * and the minimum-cash-flow settlement transactions.
 */

/**
 * Formats a monetary number into Indian Rupee format.
 * E.g., 1200 -> "₹1,200", 750.5 -> "₹750.50"
 */
export function formatRupees(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    const num = Math.round(Number(amount) * 100) / 100;
    const isInteger = Number.isInteger(num);
    const formatted = num.toLocaleString('en-IN', {
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return `₹${formatted}`;
}

/**
 * Calculates total paid, total share, and net balance for each person.
 * Formula:
 * Balance = Total Paid - Total Share
 *
 * Positive balance: Person should RECEIVE money (Creditor)
 * Negative balance: Person OWES money (Debtor)
 * Zero balance: Settled
 *
 * @param {Array<{id: string, name: string, isYou?: boolean}>} people
 * @param {Array<{id: string, description: string, amount: number, paidBy: string, splitAmong: string[]}>} expenses
 * @returns {Array<{personId: string, name: string, isYou: boolean, totalPaid: number, totalShare: number, netBalance: number, status: 'receives' | 'owes' | 'settled'}>}
 */
export function calculateBalances(people = [], expenses = []) {
    if (!people || people.length === 0) return [];

    // Map each person name to an accumulator
    const balanceMap = new Map();
    people.forEach((p) => {
        balanceMap.set(p.name, {
            personId: p.id,
            name: p.name,
            isYou: Boolean(p.isYou),
            totalPaid: 0,
            totalShare: 0,
            netBalance: 0,
            status: 'settled',
        });
    });

    expenses.forEach((expense) => {
        const amount = Number(expense.amount) || 0;
        if (amount <= 0) return;

        // Payer's total paid
        if (balanceMap.has(expense.paidBy)) {
            const payer = balanceMap.get(expense.paidBy);
            payer.totalPaid += amount;
        }

        // Split among participants
        const participants = Array.isArray(expense.splitAmong)
            ? expense.splitAmong.filter((name) => balanceMap.has(name))
            : [];

        if (participants.length > 0) {
            const sharePerPerson = amount / participants.length;
            participants.forEach((name) => {
                const participant = balanceMap.get(name);
                participant.totalShare += sharePerPerson;
            });
        }
    });

    return Array.from(balanceMap.values()).map((item) => {
        const roundedPaid = Math.round(item.totalPaid * 100) / 100;
        const roundedShare = Math.round(item.totalShare * 100) / 100;
        // Balance = Paid - Share
        let net = Math.round((roundedPaid - roundedShare) * 100) / 100;

        // Handle edge rounding where net is -0 or within 0.005
        if (Math.abs(net) < 0.01) {
            net = 0;
        }

        let status = 'settled';
        if (net > 0.005) {
            status = 'receives';
        } else if (net < -0.005) {
            status = 'owes';
        }

        return {
            ...item,
            totalPaid: roundedPaid,
            totalShare: roundedShare,
            netBalance: net,
            status,
        };
    });
}

/**
 * Calculates the minimal number of direct settlement transactions
 * to balance all debts across the group.
 *
 * Uses a greedy minimum cash flow algorithm with exact-match heuristic:
 * 1. Separate into debtors (netBalance < 0) and creditors (netBalance > 0).
 * 2. Pair exact matching amounts first to minimize intermediate transactions.
 * 3. Greedily match largest debtor with largest creditor.
 * 4. Generates transactions [from] pays [to] [amount].
 *
 * @param {Array<{name: string, netBalance: number}>} balances
 * @returns {Array<{id: string, from: string, to: string, amount: number}>}
 */
export function calculateSettlements(balances = []) {
    if (!balances || balances.length === 0) return [];

    // Clone debtors and creditors
    let debtors = [];
    let creditors = [];

    balances.forEach((b) => {
        const net = Math.round(b.netBalance * 100) / 100;
        if (net < -0.009) {
            debtors.push({
                name: b.name,
                amount: Math.abs(net),
            });
        } else if (net > 0.009) {
            creditors.push({
                name: b.name,
                amount: net,
            });
        }
    });

    const transactions = [];
    let txIndex = 1;

    // Step 2: Exact match heuristic (e.g. if A owes 150 and B receives 150, pair them directly)
    for (let i = 0; i < debtors.length; i++) {
        for (let j = 0; j < creditors.length; j++) {
            if (
                debtors[i].amount > 0.009 &&
                creditors[j].amount > 0.009 &&
                Math.abs(debtors[i].amount - creditors[j].amount) < 0.01
            ) {
                const settledAmount = Math.round(debtors[i].amount * 100) / 100;
                transactions.push({
                    id: `tx-${txIndex++}`,
                    from: debtors[i].name,
                    to: creditors[j].name,
                    amount: settledAmount,
                });
                debtors[i].amount = 0;
                creditors[j].amount = 0;
            }
        }
    }

    // Filter out settled
    debtors = debtors.filter((d) => d.amount > 0.009);
    creditors = creditors.filter((c) => c.amount > 0.009);

    // Step 3: Greedy settlement for remaining amounts
    while (debtors.length > 0 && creditors.length > 0) {
        // Sort descending by amount
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const debtor = debtors[0];
        const creditor = creditors[0];

        const transfer = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

        if (transfer > 0.009) {
            transactions.push({
                id: `tx-${txIndex++}`,
                from: debtor.name,
                to: creditor.name,
                amount: transfer,
            });
        }

        debtor.amount = Math.round((debtor.amount - transfer) * 100) / 100;
        creditor.amount = Math.round((creditor.amount - transfer) * 100) / 100;

        if (debtor.amount <= 0.009) {
            debtors.shift();
        }
        if (creditor.amount <= 0.009) {
            creditors.shift();
        }
    }

    return transactions;
}

/**
 * Default initial sample trip data matching Image 2
 */
export const DEFAULT_PEOPLE = [
    { id: 'p-1', name: 'Pratik', isYou: true },
    { id: 'p-2', name: 'Shrish', isYou: false },
    { id: 'p-3', name: 'Ravi', isYou: false },
    { id: 'p-4', name: 'Samrat', isYou: false },
    { id: 'p-5', name: 'XYZ', isYou: false },
];

export const DEFAULT_EXPENSES = [
    {
        id: 'exp-1',
        description: 'rent',
        amount: 1500,
        paidBy: 'Pratik',
        splitAmong: ['Pratik', 'Shrish', 'Ravi', 'Samrat', 'XYZ'],
        iconType: 'stay',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'exp-2',
        description: 'food',
        amount: 1000,
        paidBy: 'Shrish',
        splitAmong: ['Pratik', 'Shrish', 'Ravi', 'Samrat', 'XYZ'],
        iconType: 'food',
        date: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
];

/**
 * Automatically detects the appropriate vector icon for an expense based on its description
 */
export function detectExpenseIcon(description = '') {
    const desc = (description || '').toLowerCase();
    if (desc.includes('rent') || desc.includes('hotel') || desc.includes('stay') || desc.includes('resort') || desc.includes('room') || desc.includes('flat') || desc.includes('house') || desc.includes('villa')) {
        return 'stay';
    }
    if (desc.includes('food') || desc.includes('dinner') || desc.includes('lunch') || desc.includes('breakfast') || desc.includes('snack') || desc.includes('cafe') || desc.includes('meal') || desc.includes('chai') || desc.includes('tea') || desc.includes('coffee') || desc.includes('restaurant')) {
        return 'food';
    }
    if (desc.includes('taxi') || desc.includes('cab') || desc.includes('transport') || desc.includes('uber') || desc.includes('ola') || desc.includes('auto') || desc.includes('car') || desc.includes('fuel') || desc.includes('petrol') || desc.includes('bus') || desc.includes('flight') || desc.includes('train')) {
        return 'transport';
    }
    if (desc.includes('ticket') || desc.includes('entry') || desc.includes('pass') || desc.includes('museum') || desc.includes('fort') || desc.includes('movie') || desc.includes('park') || desc.includes('monument')) {
        return 'tickets';
    }
    return 'general';
}

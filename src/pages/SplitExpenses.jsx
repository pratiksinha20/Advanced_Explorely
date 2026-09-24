import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon';
import AddPeople from '../components/split/AddPeople';
import AddExpense from '../components/split/AddExpense';
import ExpenseList from '../components/split/ExpenseList';
import SettlementResult from '../components/split/SettlementResult';
import BalanceSummary from '../components/split/BalanceSummary';
import {
    calculateBalances,
    calculateSettlements,
    DEFAULT_PEOPLE,
    DEFAULT_EXPENSES,
} from '../utils/splitCalculator';

const STORAGE_KEY_PEOPLE = 'explorely_split_people';
const STORAGE_KEY_EXPENSES = 'explorely_split_expenses';

export default function SplitExpenses() {
    // 1. People state with LocalStorage
    const [people, setPeople] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PEOPLE);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Error loading split people:', e);
        }
        return DEFAULT_PEOPLE;
    });

    // 2. Expenses state with LocalStorage
    const [expenses, setExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Error loading split expenses:', e);
        }
        return DEFAULT_EXPENSES;
    });

    // 3. Reset confirmation modal state
    const [showResetModal, setShowResetModal] = useState(false);

    // Save to LocalStorage on updates
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
        } catch (e) {
            console.error('Error saving split people:', e);
        }
    }, [people]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
        } catch (e) {
            console.error('Error saving split expenses:', e);
        }
    }, [expenses]);

    // Handle adding a person
    const handleAddPerson = (name, isFirstPerson) => {
        const newPerson = {
            id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name,
            isYou: Boolean(isFirstPerson && people.length === 0),
        };
        setPeople((prev) => [...prev, newPerson]);
    };

    // Handle removing a person (including Pratik / isYou per user instruction)
    const handleRemovePerson = (id, personName) => {
        setPeople((prev) => prev.filter((p) => p.id !== id));

        // Clean up expenses: remove expenses paid by that person,
        // and remove person from split participant lists
        setExpenses((prev) =>
            prev
                .filter((exp) => exp.paidBy !== personName)
                .map((exp) => {
                    if (Array.isArray(exp.splitAmong) && exp.splitAmong.includes(personName)) {
                        const updatedSplit = exp.splitAmong.filter((n) => n !== personName);
                        return {
                            ...exp,
                            splitAmong: updatedSplit.length > 0 ? updatedSplit : [exp.paidBy],
                        };
                    }
                    return exp;
                })
        );
    };

    // Handle adding an expense
    const handleAddExpense = (expenseData) => {
        const newExpense = {
            id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            ...expenseData,
            date: new Date().toISOString(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
    };

    // Handle deleting an expense
    const handleDeleteExpense = (id) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    // Reset Trip
    const handleConfirmReset = () => {
        setPeople([]);
        setExpenses([]);
        setShowResetModal(false);
    };

    // Load Demo Data
    const handleLoadDemo = () => {
        setPeople(DEFAULT_PEOPLE);
        setExpenses(DEFAULT_EXPENSES);
        setShowResetModal(false);
    };

    // Calculate balances and settlements memoized for top performance
    const balances = useMemo(() => {
        return calculateBalances(people, expenses);
    }, [people, expenses]);

    const settlements = useMemo(() => {
        return calculateSettlements(balances);
    }, [balances]);

    const totalSpend = useMemo(() => {
        return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    }, [expenses]);

    return (
        <div className="split-page">
            {/* Subtle scenic SVG background decorations */}
            <div className="split-bg-decor split-bg-airplane">
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2 12l20-9-9 20-2-8-9-3z" />
                </svg>
            </div>
            <div className="split-bg-decor split-bg-globe">
                <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            </div>

            {/* Header Section */}
            <section className="split-header">
                <div className="split-header-badge">
                    <Icon name="split" size={14} />
                    <span>Travel Expense Sharing</span>
                </div>
                <h1 className="split-title">
                    Split <span className="gradient-text">Expenses</span>
                </h1>
                <p className="split-subtitle">Travel together. Split smarter.</p>

                {/* Quick actions row */}
                <div className="split-header-actions">
                    <button
                        type="button"
                        className="split-header-btn secondary"
                        onClick={handleLoadDemo}
                        title="Load sample travel scenario from Image 2"
                    >
                        <Icon name="compass" size={15} />
                        <span>Load Sample Trip</span>
                    </button>

                    <button
                        type="button"
                        className="split-header-btn danger"
                        onClick={() => setShowResetModal(true)}
                        title="Clear all trip expenses and members"
                    >
                        <Icon name="rotate-ccw" size={14} />
                        <span>Reset Trip</span>
                    </button>
                </div>

                <div className="split-header-divider" />
            </section>

            {/* Grid Layout matching Image 2 */}
            <div className="split-layout-grid-v2">
                {/* TOP LEFT: 1. Add People */}
                <div className="grid-cell cell-people">
                    <AddPeople
                        people={people}
                        onAddPerson={handleAddPerson}
                        onRemovePerson={handleRemovePerson}
                        expenses={expenses}
                    />
                </div>

                {/* TOP CENTER: 2. Add Expense */}
                <div className="grid-cell cell-expense">
                    <AddExpense
                        people={people}
                        onAddExpense={handleAddExpense}
                    />
                </div>

                {/* TOP RIGHT: 4. Settlement Result (per Image 2) */}
                <div className="grid-cell cell-settlement">
                    <SettlementResult
                        settlements={settlements}
                        balances={balances}
                        expensesCount={expenses.length}
                        peopleCount={people.length}
                    />
                </div>

                {/* BOTTOM LEFT & CENTER (Wide): 3. Expenses List (per Image 2) */}
                <div className="grid-cell cell-list">
                    <ExpenseList
                        expenses={expenses}
                        onDeleteExpense={handleDeleteExpense}
                        peopleCount={people.length}
                    />
                </div>

                {/* BOTTOM RIGHT: 5. Balance Summary (per Image 2) */}
                <div className="grid-cell cell-balance">
                    <BalanceSummary
                        balances={balances}
                        totalSpend={totalSpend}
                    />
                </div>
            </div>

            {/* Reset Trip Confirmation Modal */}
            {showResetModal && (
                <div className="split-modal-backdrop" onClick={() => setShowResetModal(false)}>
                    <div className="split-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="split-modal-icon-wrap">
                            <Icon name="rotate-ccw" size={24} />
                        </div>
                        <h3 className="split-modal-title">Reset Trip Data?</h3>
                        <p className="split-modal-desc">
                            This will clear all expenses and reset your travel group. This action cannot be undone.
                        </p>
                        <div className="split-modal-actions">
                            <button
                                type="button"
                                className="split-modal-btn cancel"
                                onClick={() => setShowResetModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="split-modal-btn confirm"
                                onClick={handleConfirmReset}
                            >
                                Yes, Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

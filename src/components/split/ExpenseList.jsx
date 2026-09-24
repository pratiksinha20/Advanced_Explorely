import React from 'react';
import Icon from '../Icon';
import ExpenseIcon from './ExpenseIcon';
import { formatRupees, detectExpenseIcon } from '../../utils/splitCalculator';

export default function ExpenseList({ expenses, onDeleteExpense, peopleCount }) {
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="split-card expense-list-card">
            <div className="split-card-header">
                <div className="split-card-title-row">
                    <span className="split-step-badge">3</span>
                    <div>
                        <h2 className="split-card-title">Expenses List</h2>
                        <p className="split-card-subtitle">
                            {expenses.length > 0
                                ? `${expenses.length} item${expenses.length === 1 ? '' : 's'} recorded`
                                : 'No expenses recorded yet'}
                        </p>
                    </div>
                </div>

                {expenses.length > 0 && (
                    <div className="split-total-badge" title="Total Group Spend">
                        <span className="total-label">TOTAL</span>
                        <span className="total-value">{formatRupees(totalExpenses)}</span>
                    </div>
                )}
            </div>

            {/* Expenses Cards */}
            {expenses.length === 0 ? (
                <div className="split-empty-expenses">
                    <div className="empty-icon-wrap">
                        <Icon name="receipt" size={32} />
                    </div>
                    <h3 className="empty-title">No expenses yet</h3>
                    <p className="empty-desc">
                        {peopleCount >= 2
                            ? 'Add your first expense using the form to calculate the split.'
                            : 'Add at least 2 people first, then log hotel, food, or travel costs.'}
                    </p>
                </div>
            ) : (
                <div className="split-expense-items-scroll">
                    {expenses.map((expense) => {
                        const splitCount = Array.isArray(expense.splitAmong)
                            ? expense.splitAmong.length
                            : 0;
                        const perHead = splitCount > 0 ? expense.amount / splitCount : 0;
                        const iconType = expense.iconType || detectExpenseIcon(expense.description);

                        return (
                            <div key={expense.id} className="split-expense-item">
                                {/* Real Vector Logo Icon instead of emoji, matching Image 3 */}
                                <ExpenseIcon type={iconType} size={44} />

                                <div className="expense-details">
                                    <div className="expense-top-line">
                                        <h4 className="expense-desc">{expense.description}</h4>
                                        <span className="expense-amount">
                                            {formatRupees(expense.amount)}
                                        </span>
                                    </div>

                                    <div className="expense-meta-line">
                                        <span className="expense-paid-by">
                                            Paid by <strong>{expense.paidBy}</strong>
                                        </span>
                                        <span className="expense-meta-sep">•</span>
                                        <span className="expense-split-tag">
                                            {splitCount} people ({formatRupees(perHead)}/ea)
                                        </span>
                                        {expense.date && (
                                            <>
                                                <span className="expense-meta-sep">•</span>
                                                <span className="expense-time">
                                                    {formatDate(expense.date)}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Participant chips preview */}
                                    {Array.isArray(expense.splitAmong) && expense.splitAmong.length > 0 && (
                                        <div className="expense-participant-chips">
                                            {expense.splitAmong.map((name) => (
                                                <span key={name} className="participant-mini-chip">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="expense-delete-btn"
                                    onClick={() => onDeleteExpense(expense.id)}
                                    title="Delete this expense"
                                    aria-label={`Delete ${expense.description}`}
                                >
                                    <Icon name="trash-2" size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

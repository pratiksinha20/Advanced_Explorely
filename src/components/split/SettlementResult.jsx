import React from 'react';
import Icon from '../Icon';
import { formatRupees } from '../../utils/splitCalculator';

export default function SettlementResult({ settlements, balances, expensesCount, peopleCount }) {
    const isAllSettled =
        balances.length > 0 &&
        expensesCount > 0 &&
        balances.every((b) => Math.abs(b.netBalance) < 0.01);

    const hasNoExpenses = expensesCount === 0;

    return (
        <div className="split-card settlement-card">
            <div className="split-card-header">
                <div className="split-card-title-row">
                    <span className="split-step-badge">4</span>
                    <div>
                        <h2 className="split-card-title">Settlement Result</h2>
                        <p className="split-card-subtitle">Here’s who owes whom</p>
                    </div>
                </div>

                {!hasNoExpenses && settlements.length > 0 && (
                    <span className="split-tx-count-pill">
                        {settlements.length} transfer{settlements.length === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {/* Condition 1: No expenses yet */}
            {hasNoExpenses ? (
                <div className="settlement-empty-state">
                    <div className="empty-icon-wrap subtle">
                        <Icon name="arrow-right-left" size={28} />
                    </div>
                    <h3 className="empty-title">No settlements yet</h3>
                    <p className="empty-desc">
                        {peopleCount < 2
                            ? 'Add your travel buddies and log expenses to see who pays whom.'
                            : 'Log your trip expenses on the left to see the simplest way to settle up.'}
                    </p>
                </div>
            ) : isAllSettled || settlements.length === 0 ? (
                /* Condition 2: All Settled */
                <div className="settlement-all-settled-card">
                    <div className="settled-icon-circle">
                        <Icon name="check-circle" size={32} />
                    </div>
                    <h3 className="settled-title">All settled!</h3>
                    <p className="settled-desc">No pending balances. Everyone has paid their exact share.</p>
                </div>
            ) : (
                /* Condition 3: List of Transactions */
                <div className="settlement-transactions-list">
                    {settlements.map((tx) => (
                        <div key={tx.id} className="settlement-tx-row">
                            <div className="settlement-tx-flow">
                                {/* Debtor (Pays) */}
                                <div className="tx-party debtor-party">
                                    <div className="tx-avatar debtor-avatar">
                                        {tx.from.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="tx-party-meta">
                                        <span className="tx-name">{tx.from}</span>
                                        <span className="tx-role owes">PAYS</span>
                                    </div>
                                </div>

                                {/* Arrow Indicator */}
                                <div className="tx-direction-indicator">
                                    <Icon name="arrow-right" size={16} className="tx-arrow-icon" />
                                </div>

                                {/* Creditor (Receives) */}
                                <div className="tx-party creditor-party">
                                    <div className="tx-avatar creditor-avatar">
                                        {tx.to.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="tx-party-meta">
                                        <span className="tx-name">{tx.to}</span>
                                        <span className="tx-role gets">RECEIVES</span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount badge */}
                            <div className="settlement-amount-box">
                                <span className="tx-amount">{formatRupees(tx.amount)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

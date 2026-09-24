import React from 'react';
import Icon from '../Icon';
import { formatRupees } from '../../utils/splitCalculator';

export default function BalanceSummary({ balances, totalSpend }) {
    const averagePerPerson =
        balances.length > 0 ? Math.round((totalSpend / balances.length) * 100) / 100 : 0;

    return (
        <div className="split-card balance-summary-card">
            <div className="split-card-header">
                <div className="split-card-title-row">
                    <span className="split-step-badge">5</span>
                    <div>
                        <h2 className="split-card-title">Balance Summary</h2>
                        <p className="split-card-subtitle">Individual breakdown</p>
                    </div>
                </div>
                <span className="split-people-count-pill" title="Total members">
                    <Icon name="users" size={13} />
                    <span>{balances.length} {balances.length === 1 ? 'member' : 'members'}</span>
                </span>
            </div>

            {/* Quick Trip Stats Bar */}
            <div className="split-stats-bar">
                <div className="split-stat-item">
                    <span className="stat-label">
                        <Icon name="wallet" size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                        Total Spend
                    </span>
                    <span className="stat-val">{formatRupees(totalSpend)}</span>
                </div>
                <div className="split-stat-divider" />
                <div className="split-stat-item">
                    <span className="stat-label">
                        <Icon name="split" size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                        Avg / Person
                    </span>
                    <span className="stat-val">{formatRupees(averagePerPerson)}</span>
                </div>
                <div className="split-stat-divider" />
                <div className="split-stat-item">
                    <span className="stat-label">
                        <Icon name="users" size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                        Members
                    </span>
                    <span className="stat-val">{balances.length}</span>
                </div>
            </div>

            {/* Balances List */}
            {balances.length === 0 ? (
                <div className="balance-empty-state">
                    <p>No members added yet.</p>
                </div>
            ) : (
                <div className="balance-persons-list">
                    {balances.map((person) => {
                        const isPositive = person.status === 'receives';
                        const isNegative = person.status === 'owes';

                        return (
                            <div
                                key={person.personId || person.name}
                                className={`balance-person-row ${person.status}`}
                            >
                                <div className="balance-person-left">
                                    <div className="balance-person-avatar">
                                        {person.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="balance-name-wrap">
                                        <span className="balance-name">
                                            {person.name}
                                            {person.isYou && <span className="you-tag">You</span>}
                                        </span>
                                        <div className="balance-sub-details">
                                            <span>Paid {formatRupees(person.totalPaid)}</span>
                                            <span className="sub-sep">•</span>
                                            <span>Share {formatRupees(person.totalShare)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="balance-person-right">
                                    {isPositive && (
                                        <div className="balance-badge receives">
                                            <span className="badge-text">Gets back</span>
                                            <span className="badge-amount">
                                                +{formatRupees(person.netBalance)}
                                            </span>
                                        </div>
                                    )}

                                    {isNegative && (
                                        <div className="balance-badge owes">
                                            <span className="badge-text">Owes</span>
                                            <span className="badge-amount">
                                                {formatRupees(Math.abs(person.netBalance))}
                                            </span>
                                        </div>
                                    )}

                                    {!isPositive && !isNegative && (
                                        <div className="balance-badge settled">
                                            <span className="badge-text">Settled</span>
                                            <span className="badge-amount">₹0</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import { formatRupees, detectExpenseIcon } from '../../utils/splitCalculator';

export default function AddExpense({ people, onAddExpense }) {
    const [paidBy, setPaidBy] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [splitAmong, setSplitAmong] = useState([]);
    const [error, setError] = useState('');

    // Default paidBy to "You" or first person
    useEffect(() => {
        if (people.length > 0) {
            const youPerson = people.find((p) => p.isYou);
            if (!paidBy || !people.some((p) => p.name === paidBy)) {
                setPaidBy(youPerson ? youPerson.name : people[0].name);
            }
        } else {
            setPaidBy('');
        }
    }, [people, paidBy]);

    // Default splitAmong to all people whenever people changes
    useEffect(() => {
        const validNames = people.map((p) => p.name);
        setSplitAmong((prev) => {
            const filtered = prev.filter((name) => validNames.includes(name));
            return filtered.length > 0 ? filtered : validNames;
        });
    }, [people]);

    const toggleParticipant = (name) => {
        setSplitAmong((prev) => {
            if (prev.includes(name)) {
                // Must keep at least 1 person selected
                if (prev.length === 1) {
                    setError('At least 1 person must share this expense');
                    return prev;
                }
                setError('');
                return prev.filter((n) => n !== name);
            } else {
                setError('');
                return [...prev, name];
            }
        });
    };

    const handleSelectAll = () => {
        setSplitAmong(people.map((p) => p.name));
        setError('');
    };

    const handleSelectPayerOnly = () => {
        if (paidBy) {
            setSplitAmong([paidBy]);
            setError('');
        }
    };

    const parsedAmount = parseFloat(amount) || 0;
    const sharePerPerson =
        parsedAmount > 0 && splitAmong.length > 0
            ? Math.round((parsedAmount / splitAmong.length) * 100) / 100
            : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (people.length < 2) {
            setError('Please add at least 2 people before creating an expense.');
            return;
        }

        const trimmedDesc = description.trim();
        if (!trimmedDesc) {
            setError('Please enter a description (e.g. rent, food, taxi).');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount greater than ₹0.');
            return;
        }

        if (!paidBy) {
            setError('Please select who paid.');
            return;
        }

        if (splitAmong.length === 0) {
            setError('Please select who participated in this expense.');
            return;
        }

        // Auto-detect vector icon from description
        const iconType = detectExpenseIcon(trimmedDesc);

        onAddExpense({
            description: trimmedDesc,
            amount: numAmount,
            paidBy,
            iconType,
            splitAmong,
        });

        // Reset form inputs for next expense
        setDescription('');
        setAmount('');
        setSplitAmong(people.map((p) => p.name));
    };

    const isDisabled = people.length < 2;

    return (
        <div className={`split-card add-expense-card ${isDisabled ? 'is-disabled' : ''}`}>
            <div className="split-card-header">
                <div className="split-card-title-row">
                    <span className="split-step-badge">2</span>
                    <div>
                        <h2 className="split-card-title">Add Expense</h2>
                        <p className="split-card-subtitle">Enter the details of your expense</p>
                    </div>
                </div>
            </div>

            {isDisabled ? (
                <div className="split-disabled-notice">
                    <Icon name="users" size={24} />
                    <p>Add at least 2 travel buddies in Step 1 to begin splitting expenses.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="split-expense-form">
                    {/* Paid By and Amount in 2 columns */}
                    <div className="split-form-row">
                        <div className="split-field-group">
                            <label htmlFor="split-paid-by" className="split-field-label">Paid by</label>
                            <div className="split-select-wrap">
                                <select
                                    id="split-paid-by"
                                    className="split-select"
                                    value={paidBy}
                                    onChange={(e) => setPaidBy(e.target.value)}
                                >
                                    {people.map((person) => (
                                        <option key={person.id} value={person.name}>
                                            {person.name} {person.isYou ? '(You)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="split-field-group">
                            <label htmlFor="split-amount-input" className="split-field-label">Amount</label>
                            <div className="split-amount-input-wrap">
                                <span className="split-currency-symbol">₹</span>
                                <input
                                    id="split-amount-input"
                                    type="number"
                                    min="1"
                                    step="any"
                                    className="split-amount-input"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        if (error) setError('');
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="split-field-group">
                        <label htmlFor="split-desc-input" className="split-field-label">Description</label>
                        <input
                            id="split-desc-input"
                            type="text"
                            className="split-text-input"
                            placeholder="e.g. Hotel Booking, Dinner, Fuel..."
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (error) setError('');
                            }}
                            maxLength={50}
                        />
                    </div>

                    {/* Split Among */}
                    <div className="split-field-group">
                        <div className="split-label-with-actions">
                            <label className="split-field-label">Split among</label>
                            <div className="split-quick-selection">
                                <button
                                    type="button"
                                    className="split-link-btn"
                                    onClick={handleSelectAll}
                                >
                                    Select All
                                </button>
                                <span className="split-dot-sep">•</span>
                                <button
                                    type="button"
                                    className="split-link-btn"
                                    onClick={handleSelectPayerOnly}
                                >
                                    Only Payer
                                </button>
                            </div>
                        </div>

                        <div className="split-participants-selector">
                            {people.map((person) => {
                                const isSelected = splitAmong.includes(person.name);
                                return (
                                    <button
                                        key={person.id}
                                        type="button"
                                        className={`split-participant-pill ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleParticipant(person.name)}
                                    >
                                        <span className="participant-check">
                                            {isSelected ? <Icon name="check" size={13} /> : '○'}
                                        </span>
                                        <span className="participant-name">{person.name}</span>
                                        {person.isYou && <span className="pill-you">You</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Live Share Calculation Hint */}
                        {parsedAmount > 0 && splitAmong.length > 0 && (
                            <div className="split-live-share-hint">
                                <Icon name="split" size={14} />
                                <span>
                                    <strong>{formatRupees(sharePerPerson)}</strong> / person ({splitAmong.length} {splitAmong.length === 1 ? 'person' : 'people'})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Error Notice */}
                    {error && (
                        <div className="split-error-banner">
                            <Icon name="alert-circle" size={15} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="split-add-expense-btn">
                        <Icon name="plus" size={16} />
                        <span>Add Expense</span>
                    </button>
                </form>
            )}
        </div>
    );
}

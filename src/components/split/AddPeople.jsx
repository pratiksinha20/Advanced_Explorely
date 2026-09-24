import React, { useState, useRef } from 'react';
import Icon from '../Icon';

export default function AddPeople({ people, onAddPerson, onRemovePerson, expenses }) {
    const [nameInput, setNameInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = nameInput.trim();

        if (!trimmed) {
            setErrorMessage('Please enter a name');
            return;
        }

        // Check duplicates (case-insensitive)
        const isDuplicate = people.some(
            (p) => p.name.toLowerCase() === trimmed.toLowerCase()
        );

        if (isDuplicate) {
            setErrorMessage(`"${trimmed}" is already added!`);
            return;
        }

        // If no one is marked as "You", mark the first person added as "You"
        const isFirstPerson = people.length === 0;
        onAddPerson(trimmed, isFirstPerson);
        setNameInput('');
        setErrorMessage('');
        if (inputRef.current) inputRef.current.focus();
    };

    const handleRemoveClick = (person) => {
        // Check if person paid for any existing expenses
        const paidExpenses = expenses.filter((exp) => exp.paidBy === person.name);
        if (paidExpenses.length > 0) {
            const confirmed = window.confirm(
                `"${person.name}" paid for ${paidExpenses.length} expense(s). Removing them will also delete those expenses. Continue?`
            );
            if (!confirmed) return;
        }

        onRemovePerson(person.id, person.name);
    };

    return (
        <div className="split-card add-people-card">
            <div className="split-card-header">
                <div className="split-card-title-row">
                    <span className="split-step-badge">1</span>
                    <div>
                        <h2 className="split-card-title">Add People</h2>
                        <p className="split-card-subtitle">Add your travel buddies</p>
                    </div>
                </div>
                <span className="split-people-count-pill" title="Current buddy count">
                    <Icon name="users" size={13} />
                    <span>{people.length} {people.length === 1 ? 'person' : 'people'}</span>
                </span>
            </div>

            {/* People List */}
            <div className="split-people-list">
                {people.map((person) => (
                    <div
                        key={person.id}
                        className={`split-person-chip ${person.isYou ? 'is-you' : ''}`}
                    >
                        <div className="split-person-avatar">
                            {person.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="split-person-name">
                            {person.name}
                            {person.isYou && <span className="you-tag">YOU</span>}
                        </span>

                        {/* Allow deleting any person per user request */}
                        <button
                            type="button"
                            className="split-remove-person-btn"
                            onClick={() => handleRemoveClick(person)}
                            title={`Remove ${person.name}`}
                            aria-label={`Remove ${person.name}`}
                        >
                            <Icon name="x" size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Minimum 2 Warning / Info */}
            {people.length < 2 && (
                <div className="split-warning-banner">
                    <Icon name="alert-circle" size={15} />
                    <span>Add at least {people.length === 0 ? '2 people' : 'one more person'} to split expenses.</span>
                </div>
            )}

            {/* Inline Add Input at the bottom of the card, matching Image 2 */}
            <form onSubmit={handleSubmit} className="split-inline-form">
                <div className="split-input-wrap">
                    <input
                        ref={inputRef}
                        type="text"
                        className={`split-text-input ${errorMessage ? 'has-error' : ''}`}
                        placeholder="Buddy's name (e.g., Ankit)"
                        value={nameInput}
                        onChange={(e) => {
                            setNameInput(e.target.value);
                            if (errorMessage) setErrorMessage('');
                        }}
                        maxLength={24}
                    />
                    <button
                        type="submit"
                        className="split-submit-btn"
                        disabled={!nameInput.trim()}
                    >
                        <Icon name="plus" size={14} />
                        <span>Add</span>
                    </button>
                </div>
                {errorMessage && (
                    <p className="split-field-error">{errorMessage}</p>
                )}
            </form>
        </div>
    );
}

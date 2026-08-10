import React from 'react';

export default function FoodCard({ food, stateName, style }) {
    return (
        <article className="food-card" style={style}>
            <div className="food-card-emoji-wrapper">
                <span className="food-card-emoji" role="img" aria-label={food.name}>
                    {food.emoji ? food.emoji.split(' ')[0] : '🍽️'}
                </span>
                {food.rank && food.rank <= 3 && (
                    <span className={`food-rank-badge rank-${food.rank}`}>
                        {food.rank === 1 ? '🥇' : food.rank === 2 ? '🥈' : '🥉'}
                    </span>
                )}
            </div>
            <div className="food-card-content">
                <h3 className="food-card-name">{food.name}</h3>
                {stateName && (
                    <span className="food-state-badge">{stateName}</span>
                )}
                <p className="food-card-description">{food.description}</p>
            </div>
        </article>
    );
}

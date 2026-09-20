import React, { useState } from 'react';
import { getFoodImage } from '../utils/foodImageHelper';

export default function FoodCard({ food, stateName, style }) {
    const [imgError, setImgError] = useState(false);
    const imageUrl = getFoodImage(food);

    return (
        <article className="food-card" style={style}>
            <div className="food-card-img-wrapper">
                {!imgError ? (
                    <img
                        src={imageUrl}
                        alt={food.name}
                        className="food-card-img"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="food-card-fallback-badge">
                        <span>🍽️</span>
                    </div>
                )}
                {food.rank && food.rank <= 3 && (
                    <span className={`food-rank-badge rank-${food.rank}`} title={`Rank #${food.rank}`}>
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

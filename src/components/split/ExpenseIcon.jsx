import React from 'react';
import {
    Building2,
    Utensils,
    Car,
    Ticket,
    Receipt,
    Home,
} from 'lucide-react';

/**
 * Premium, professional vector icons for expense items.
 * Uses clean modern duotone iconography (similar to Stripe/Linear/Airbnb)
 * avoiding cartoonish or AI-generated clip art.
 */
export default function ExpenseIcon({ type = 'general', size = 44, className = '' }) {
    const getIconConfig = () => {
        switch (type) {
            case 'stay':
                return {
                    IconComponent: Building2,
                    bgColor: 'rgba(255, 126, 95, 0.12)',
                    borderColor: 'rgba(255, 126, 95, 0.25)',
                    iconColor: '#ff7e5f',
                    altIcon: Home,
                };
            case 'food':
                return {
                    IconComponent: Utensils,
                    bgColor: 'rgba(245, 158, 11, 0.12)',
                    borderColor: 'rgba(245, 158, 11, 0.25)',
                    iconColor: '#d97706',
                };
            case 'transport':
                return {
                    IconComponent: Car,
                    bgColor: 'rgba(14, 165, 233, 0.12)',
                    borderColor: 'rgba(14, 165, 233, 0.25)',
                    iconColor: '#0284c7',
                };
            case 'tickets':
                return {
                    IconComponent: Ticket,
                    bgColor: 'rgba(139, 92, 246, 0.12)',
                    borderColor: 'rgba(139, 92, 246, 0.25)',
                    iconColor: '#7c3aed',
                };
            default:
                return {
                    IconComponent: Receipt,
                    bgColor: 'rgba(100, 116, 139, 0.12)',
                    borderColor: 'rgba(100, 116, 139, 0.22)',
                    iconColor: '#475569',
                };
        }
    };

    const config = getIconConfig();
    const IconCmp = config.IconComponent;

    return (
        <div
            className={`expense-icon-squircle modern-duotone ${className}`}
            style={{
                width: size,
                height: size,
                background: config.bgColor,
                border: `1px solid ${config.borderColor}`,
            }}
            title={type}
        >
            <IconCmp size={20} color={config.iconColor} strokeWidth={2.2} />
        </div>
    );
}

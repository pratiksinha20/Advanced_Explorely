import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import Icon from './Icon';

const SEGMENT_COLORS = [
    { bg: '#FFE3D8', text: '#2C1810', border: '#FDBA9B' }, // Warm Coral Peach
    { bg: '#E0F2FE', text: '#0C4A6E', border: '#BAE6FD' }, // Sky Azure
    { bg: '#FEF3C7', text: '#451A03', border: '#FDE68A' }, // Golden Sunlight
    { bg: '#DCFCE7', text: '#064E3B', border: '#BBF7D0' }, // Mint Sage
    { bg: '#EDE9FE', text: '#3B0764', border: '#DDD6FE' }, // Lavender Mist
    { bg: '#FCE7F3', text: '#500724', border: '#FBCFE8' }, // Soft Rose
    { bg: '#CCFBF1', text: '#134E4A', border: '#99F6E4' }, // Coastal Teal
    { bg: '#FFEDD5', text: '#431407', border: '#FED7AA' }, // Apricot Warmth
    { bg: '#E2E8F0', text: '#0F172A', border: '#CBD5E1' }, // Mountain Mist
    { bg: '#FEE2E2', text: '#450A0A', border: '#FECACA' }, // Terracotta
    { bg: '#E0E7FF', text: '#1E1B4B', border: '#C7D2FE' }, // Twilight Indigo
    { bg: '#CFFAFE', text: '#164E63', border: '#A5F3FC' }, // Crystal Lake
];

const SpinWheel = forwardRef(function SpinWheel({
    options = [],
    isSpinning = false,
    onSpinStart,
    onSpinEnd,
    disabled = false,
    spinTrigger = 0
}, ref) {
    const [rotation, setRotation] = useState(0);
    const [activeSliceIndex, setActiveSliceIndex] = useState(null);
    const animRef = useRef(null);
    const spinningRef = useRef(false);

    const count = options.length;
    const center = 200;
    const radius = 186;

    // Calculate slice angle in degrees
    const sliceAngle = count > 0 ? 360 / count : 360;

    const executeSpin = useCallback(() => {
        if (spinningRef.current || disabled || count < 2) return;
        spinningRef.current = true;

        // Select random winning index with uniform probability
        const winningIndex = Math.floor(Math.random() * count);
        setActiveSliceIndex(null);

        // Notify parent spin started
        if (onSpinStart) onSpinStart();

        // Calculate target rotation to align winning slice under pointer at 12 o'clock
        const alphaMid = (winningIndex + 0.5) * sliceAngle;
        const normalizedCurrent = rotation % 360;

        // Jitter within +/- 20% of slice to look organic but stay strictly within segment
        const maxJitter = sliceAngle * 0.2;
        const jitter = (Math.random() - 0.5) * 2 * maxJitter;

        let delta = (360 - alphaMid + jitter - normalizedCurrent) % 360;
        if (delta <= 0) delta += 360;

        // 6 to 8 full rotations
        const extraTurns = (6 + Math.floor(Math.random() * 3)) * 360;
        const targetRotation = rotation + extraTurns + delta;

        setRotation(targetRotation);

        // Timer matches CSS animation duration (4.5s)
        if (animRef.current) clearTimeout(animRef.current);
        animRef.current = setTimeout(() => {
            spinningRef.current = false;
            setActiveSliceIndex(winningIndex);
            if (onSpinEnd) {
                onSpinEnd(options[winningIndex], winningIndex);
            }
        }, 4500);
    }, [disabled, count, onSpinStart, sliceAngle, rotation, onSpinEnd, options]);

    useImperativeHandle(ref, () => ({
        spin: executeSpin
    }), [executeSpin]);

    // Support external spin trigger button
    const prevTriggerRef = useRef(spinTrigger);
    useEffect(() => {
        if (spinTrigger > 0 && spinTrigger !== prevTriggerRef.current) {
            prevTriggerRef.current = spinTrigger;
            executeSpin();
        }
    }, [spinTrigger, executeSpin]);

    useEffect(() => {
        return () => {
            if (animRef.current) clearTimeout(animRef.current);
        };
    }, []);

    // Generate SVG path for a slice
    const getSlicePath = (index) => {
        if (count === 1) {
            // Full circle
            return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
        }

        const startAngle = index * sliceAngle;
        const endAngle = (index + 1) * sliceAngle;

        const toRad = (deg) => (deg * Math.PI) / 180;

        // 12 o'clock is 0 deg: x = cx + r*sin(a), y = cy - r*cos(a)
        const x1 = center + radius * Math.sin(toRad(startAngle));
        const y1 = center - radius * Math.cos(toRad(startAngle));
        const x2 = center + radius * Math.sin(toRad(endAngle));
        const y2 = center - radius * Math.cos(toRad(endAngle));

        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    // Format text inside slice
    const formatLabel = (text) => {
        if (!text) return '';
        const maxLen = count <= 4 ? 16 : count <= 8 ? 12 : 9;
        return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
    };

    return (
        <div className="spin-wheel-wrapper">
            {/* Top Pointer Pin */}
            <div className="wheel-pointer-container" title="Winning marker">
                <div className="wheel-pointer-pin">
                    <div className="pointer-dot" />
                </div>
            </div>

            {/* Wheel Container */}
            <div className="spin-wheel-frame">
                <svg
                    className={`spin-wheel-svg ${isSpinning ? 'spinning' : ''}`}
                    viewBox="0 0 400 400"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning
                            ? 'transform 4.5s cubic-bezier(0.15, 0.88, 0.15, 1)'
                            : 'none'
                    }}
                >
                    <defs>
                        <filter id="wheelShadow" x="-10%" y="-10%" width="130%" height="130%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                        </filter>
                    </defs>

                    {/* Outer Wheel Rim */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 6}
                        className="wheel-outer-rim"
                    />

                    {/* Segments */}
                    {count === 0 ? (
                        <g>
                            <circle cx={center} cy={center} r={radius} fill="var(--surface-2)" />
                            <text
                                x={center}
                                y={center}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="wheel-empty-text"
                                fill="var(--muted)"
                                style={{ fontSize: '15px', fontWeight: '500' }}
                            >
                                Add a few options to spin!
                            </text>
                        </g>
                    ) : (
                        options.map((opt, i) => {
                            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
                            const midAngle = (i + 0.5) * sliceAngle;
                            const textDist = count <= 4 ? radius * 0.6 : radius * 0.65;
                            const isWinner = activeSliceIndex === i && !isSpinning;

                            return (
                                <g key={opt.id || i} className={`wheel-slice ${isWinner ? 'winning-slice' : ''}`}>
                                    <path
                                        d={getSlicePath(i)}
                                        fill={color.bg}
                                        stroke={color.border}
                                        strokeWidth="1.5"
                                        className="slice-path"
                                    />
                                    {/* Text in Segment */}
                                    <text
                                        x={center}
                                        y={center - textDist}
                                        transform={`rotate(${midAngle}, ${center}, ${center})`}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={color.text}
                                        className="slice-label"
                                        style={{
                                            fontSize: count <= 6 ? '14px' : count <= 10 ? '12px' : '10.5px',
                                            fontWeight: '700',
                                            letterSpacing: '0.3px',
                                            fontFamily: 'var(--font-display, Outfit, sans-serif)'
                                        }}
                                    >
                                        {formatLabel(opt.text)}
                                    </text>
                                </g>
                            );
                        })
                    )}

                    {/* Segment separator lines */}
                    {count > 1 && options.map((_, i) => {
                        const angle = i * sliceAngle;
                        const toRad = (deg) => (deg * Math.PI) / 180;
                        const x = center + radius * Math.sin(toRad(angle));
                        const y = center - radius * Math.cos(toRad(angle));
                        return (
                            <line
                                key={`line-${i}`}
                                x1={center}
                                y1={center}
                                x2={x}
                                y2={y}
                                stroke="rgba(255,255,255,0.75)"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                {/* Central SPIN Hub Button */}
                <button
                    type="button"
                    className={`wheel-center-hub ${isSpinning ? 'spinning' : ''} ${disabled || count < 2 ? 'disabled' : ''}`}
                    onClick={executeSpin}
                    disabled={isSpinning || disabled || count < 2}
                    title={count < 2 ? 'Add at least 2 options' : 'Click to SPIN!'}
                >
                    <div className="hub-inner">
                        <span className="hub-icon">
                            <Icon name="mountain" size={20} />
                        </span>
                        <span className="hub-text">SPIN</span>
                    </div>
                </button>
            </div>
        </div>
    );
});

export default SpinWheel;

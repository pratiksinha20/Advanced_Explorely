import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import './ExplorelyLoader.css';

/**
 * ExplorelyLoader — 60-120FPS GPU Accelerated Cinematic 3D Logo Startup Animation
 * 
 * - Continuous, buttery-smooth millisecond-by-millisecond exponential growth
 * - ZERO CPU filter blurs: Pure GPU hardware matrix blitting for 100% unblurred HD
 * - No lag, no stutter, zero hesitation from frame 1 to the final exit
 */
export default function ExplorelyLoader({ onFinish }) {
    const { darkMode } = useApp();
    const [isExiting, setIsExiting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const logoRef = useRef(null);
    const auraRef = useRef(null);
    const flashRef = useRef(null);

    const triggerExit = useCallback(() => {
        setIsExiting(true);
        // Seamless 360ms dissolve into the live website
        setTimeout(() => {
            setIsDone(true);
            if (onFinish) onFinish();
        }, 360);
    }, [onFinish]);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            const timer = setTimeout(() => {
                triggerExit();
            }, 1200);
            return () => clearTimeout(timer);
        }

        // Total duration for the continuous HD zoom sequence (2200ms)
        const DURATION = 2200;
        let startTime = null;
        let rId;

        const tick = (now) => {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            const p = Math.min(elapsed / DURATION, 1.0);

            // Continuous, strictly increasing exponential growth curve.
            // Starts small at 0.040 (~19px) and continuously accelerates forward:
            // p = 0.00 -> scale = 0.040 (~19px)
            // p = 0.20 -> scale = 0.105 (~50px)
            // p = 0.50 -> scale = 0.440 (~211px)
            // p = 0.75 -> scale = 1.480 (~710px, dominates screen in crisp 1024 HD!)
            // p = 0.90 -> scale = 3.050 (~1460px, crosses screen borders)
            // p = 1.00 -> scale = 5.000 (~2400px, passes camera plane with zero blur)
            const scale = 0.040 * Math.exp(4.828 * p);

            // 3D forward camera dolly along Z-axis
            const z = -650 * (1 - p) + 650 * Math.pow(p, 1.8);

            // Subtle steadycam rotational stabilization
            const rotX = 4.5 * Math.pow(1 - p, 1.6);
            const rotY = -4.0 * Math.pow(1 - p, 1.6);
            const rotZ = Math.sin(p * Math.PI) * 1.4 * (1 - p);

            // Pure GPU transform update: ZERO CPU filters or layout recalculations!
            if (logoRef.current) {
                logoRef.current.style.transform = 
                    `translate3d(0, 0, ${z.toFixed(1)}px) scale(${scale.toFixed(4)}) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;
            }

            // Ambient Backlight Aura: pure GPU scale
            if (auraRef.current) {
                const auraScale = 0.28 + 3.8 * Math.pow(p, 1.6);
                auraRef.current.style.transform = `scale(${auraScale.toFixed(3)})`;
            }

            // Portal light flash at final pass-through
            if (flashRef.current && p >= 0.88) {
                const flashP = (p - 0.88) / 0.12;
                const flashAlpha = Math.sin(flashP * Math.PI) * 0.78;
                flashRef.current.style.opacity = flashAlpha.toFixed(3);
            }

            if (p < 1.0) {
                rId = requestAnimationFrame(tick);
            } else {
                triggerExit();
            }
        };

        rId = requestAnimationFrame(tick);

        return () => {
            if (rId) cancelAnimationFrame(rId);
        };
    }, [triggerExit]);

    if (isDone) {
        return null;
    }

    return (
        <div
            className={`explorely-loader-stage ${darkMode ? 'dark' : 'light'} ${isExiting ? 'stage-exiting' : ''}`}
            aria-live="polite"
            aria-label="Explorely Loading"
        >
            {/* Luminous warm ambient backlight aura */}
            <div ref={auraRef} className="loader-ambient-aura" />

            {/* Subtle atmospheric floating particles */}
            <div className="loader-particles-container">
                <span className="loader-particle p1" />
                <span className="loader-particle p2" />
                <span className="loader-particle p3" />
                <span className="loader-particle p4" />
                <span className="loader-particle p5" />
                <span className="loader-particle p6" />
            </div>

            {/* 3D Perspective Stage */}
            <div className="loader-3d-viewport">
                <div className="loader-medallion-wrapper">
                    {/* Dedicated soft 3D ambient shadow layer (GPU cached, never re-rasterizes) */}
                    <div className="loader-logo-shadow-glow" />

                    {/* High-Definition 3D Explorely Logo (GPU texture accelerated, ZERO CSS filter blur) */}
                    <img
                        ref={logoRef}
                        src="/explorely-logo.png"
                        alt="Explorely Logo"
                        className="explorely-loader-logo"
                        loading="eager"
                        decoding="sync"
                        width="480"
                        height="480"
                    />
                </div>
            </div>

            {/* Minimal Motto Badge (pure CSS fade) */}
            <div className="loader-motto-wrapper">
                <span className="loader-motto">DISCOVER • EXPLORE • BELONG</span>
            </div>

            {/* Warm light burst transition at final zoom */}
            <div ref={flashRef} className="loader-portal-flash" />
        </div>
    );
}

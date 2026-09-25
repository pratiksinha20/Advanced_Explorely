import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import './India3DBackground.css';

// Geographic center for India projection
const CENTER_LON = 82.78;
const CENTER_LAT = 21.92;

// Curated travel beacon coordinates [lon, lat]
const DESTINATIONS = [
    { name: 'Delhi', coords: [77.2090, 28.6139] },
    { name: 'Mumbai', coords: [72.8777, 19.0760] },
    { name: 'Goa', coords: [73.8180, 15.4909] },
    { name: 'Jaipur', coords: [75.7873, 26.9124] },
    { name: 'Rishikesh', coords: [78.2676, 30.0869] },
    { name: 'Manali', coords: [77.1887, 32.2396] },
    { name: 'Srinagar', coords: [74.7973, 34.0837] },
    { name: 'Kolkata', coords: [88.3639, 22.5726] },
    { name: 'Bengaluru', coords: [77.5946, 12.9716] },
    { name: 'Hyderabad', coords: [78.4867, 17.3850] },
    { name: 'Varanasi', coords: [82.9739, 25.3176] },
    { name: 'Amritsar', coords: [74.8723, 31.6340] }
];

// Curated decorative travel arcs [fromIndex, toIndex]
const TRAVEL_ROUTES = [
    [0, 1], // Delhi -> Mumbai
    [1, 2], // Mumbai -> Goa
    [0, 3], // Delhi -> Jaipur
    [0, 7], // Delhi -> Kolkata
    [8, 9]  // Bengaluru -> Hyderabad
];

export default function India3DBackground() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const { darkMode } = useApp();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check WebGL support safely
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            console.warn('WebGL not available for 3D background:', e);
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 13.5);

        const BASE_PROJECTION_SCALE = 0.30;

        // Position & Scale: Perfectly calibrated for all viewports, especially phone screens
        const updateOffsets = () => {
            const width = window.innerWidth;
            if (width <= 480) {
                // Mobile phones (portrait):
                // Calibrated to fit 100% of India cleanly within the narrow phone screen with comfortable margins
                const phoneScale = Math.min(0.125, (width / 390) * 0.125);
                return { x: 0, y: 0.16, scale: phoneScale, rotX: -0.58, rotY: 0 };
            } else if (width <= 768) {
                // Phablets / small tablets
                return { x: 0, y: 0.12, scale: 0.165, rotX: -0.62, rotY: 0 };
            } else if (width <= 1100) {
                // Tablets
                return { x: 0.40, y: 0.05, scale: 0.24, rotX: -0.66, rotY: 0.06 };
            } else {
                // Desktop: Balanced between Image 1 and Image 2, gracefully on the right side
                return { x: 0.95, y: -0.05, scale: 0.31, rotX: -0.70, rotY: 0.10 };
            }
        };

        let currentConfig = updateOffsets();
        let responsiveScaleRatio = currentConfig.scale / BASE_PROJECTION_SCALE;

        // Main map group
        const mapGroup = new THREE.Group();
        mapGroup.position.set(currentConfig.x, currentConfig.y, 0);
        mapGroup.rotation.x = currentConfig.rotX;
        mapGroup.rotation.y = currentConfig.rotY;
        scene.add(mapGroup);

        // Lighting System for Image 2: Luminous, soft, premium frosted platinum
        const ambientLight = new THREE.AmbientLight(darkMode ? 0x223650 : 0xffffff, darkMode ? 1.6 : 1.65);
        scene.add(ambientLight);

        // Key rim light from top-right creating soft silver-cyan highlights
        const cyanRimLight = new THREE.DirectionalLight(0xb5deff, darkMode ? 1.6 : 1.0);
        cyanRimLight.position.set(8, 10, 10);
        scene.add(cyanRimLight);

        // Warm coral point light hovering above central India
        const coralPointLight = new THREE.PointLight(0xff8566, darkMode ? 2.0 : 1.3, 22);
        coralPointLight.position.set(0, 0, 4.5);
        mapGroup.add(coralPointLight);

        // Luminous fill light from bottom-left to keep extrusion side walls soft, light, and airy
        const fillLight = new THREE.DirectionalLight(0xf0f5fa, darkMode ? 0.9 : 0.95);
        fillLight.position.set(-8, -6, 5);
        scene.add(fillLight);

        // Geo projection helper (normalized to BASE_PROJECTION_SCALE)
        const toX = (lon) => (lon - CENTER_LON) * BASE_PROJECTION_SCALE;
        const toY = (lat) => (lat - CENTER_LAT) * BASE_PROJECTION_SCALE;

        let animationFrameId;
        let isDisposed = false;

        // Animation arrays
        const beaconHalos = [];
        const routeBeziers = [];

        // Ambient Travel Particles (floating 3D sparkles)
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 35 : 70;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSpeeds = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 16 + currentConfig.x;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14 + currentConfig.y;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5 + 1;
            particleSpeeds[i] = 0.003 + Math.random() * 0.005;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: darkMode ? 0x6fc7ff : 0xff7e5f,
            size: isMobile ? 0.07 : 0.09,
            transparent: true,
            opacity: darkMode ? 0.45 : 0.30,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Real 3D Extrusion Depth
        const extrudeDepth = 0.75;
        const bevelThickness = 0.05;
        const bevelSize = 0.04;
        const surfaceZ = extrudeDepth + bevelThickness;

        // Fetch India boundary
        fetch(process.env.PUBLIC_URL + '/data/india.geojson')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load india.geojson');
                return res.json();
            })
            .then(geo => {
                if (isDisposed) return;

                const shapes = [];
                const perimeterRings = [];

                geo.features.forEach(f => {
                    const coords = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
                    coords.forEach(poly => {
                        if (poly.length === 0 || poly[0].length < 4) return;
                        const shape = new THREE.Shape();
                        const topRing = [];

                        poly[0].forEach(([lon, lat], idx) => {
                            const x = toX(lon);
                            const y = toY(lat);
                            topRing.push(new THREE.Vector3(x, y, surfaceZ));
                            if (idx === 0) shape.moveTo(x, y);
                            else shape.lineTo(x, y);
                        });
                        perimeterRings.push(topRing);

                        // Holes (interior rings)
                        for (let h = 1; h < poly.length; h++) {
                            if (poly[h].length < 4) continue;
                            const hole = new THREE.Path();
                            poly[h].forEach(([lon, lat], idx) => {
                                const x = toX(lon);
                                const y = toY(lat);
                                if (idx === 0) hole.moveTo(x, y);
                                else hole.lineTo(x, y);
                            });
                            shape.holes.push(hole);
                        }
                        shapes.push(shape);
                    });
                });

                // Extrude geometry with bevelled 3D depth
                const extrudeSettings = {
                    steps: 1,
                    depth: extrudeDepth,
                    bevelEnabled: true,
                    bevelThickness: bevelThickness,
                    bevelSize: bevelSize,
                    bevelSegments: 2
                };

                const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

                // Multi-material EXACTLY matching Image 2 (light, frosted, premium):
                // Material 0: Top surface (luminous frosted pearl-platinum glass)
                const topFaceMaterial = new THREE.MeshStandardMaterial({
                    color: darkMode ? 0x223650 : 0xf4f8fc, // Image 2 soft luminous pearl-white
                    roughness: 0.32,
                    metalness: 0.12,
                    transparent: true,
                    opacity: darkMode ? 0.65 : 0.38,
                    depthWrite: false
                });

                // Material 1: 3D Extrusion Side Walls (light silvery-slate / platinum depth from Image 2)
                const sideWallMaterial = new THREE.MeshStandardMaterial({
                    color: darkMode ? 0x18283a : 0xc0d2e4, // Image 2 light soft platinum-slate
                    roughness: 0.38,
                    metalness: 0.16,
                    transparent: true,
                    opacity: darkMode ? 0.80 : 0.50,
                    depthWrite: false
                });

                const mapMesh = new THREE.Mesh(geometry, [topFaceMaterial, sideWallMaterial]);
                mapGroup.add(mapMesh);

                // Glowing Top Perimeter Outlines (delicate coral line from Image 2)
                const topGlowLineMat = new THREE.LineBasicMaterial({
                    color: 0xff7e5f, // Explorely coral glow line from Image 2
                    transparent: true,
                    opacity: darkMode ? 0.80 : 0.50,
                    linewidth: 1.2
                });

                perimeterRings.forEach(ring => {
                    const lineGeom = new THREE.BufferGeometry().setFromPoints(ring);
                    const lineLoop = new THREE.LineLoop(lineGeom, topGlowLineMat);
                    mapGroup.add(lineLoop);
                });

                // Cyan Base Outline Rim (Soft cyan ground trace from Image 2)
                const baseLineMat = new THREE.LineBasicMaterial({
                    color: 0x7eccff, // Soft cyan base trace from Image 2
                    transparent: true,
                    opacity: darkMode ? 0.45 : 0.25,
                    linewidth: 1.0
                });
                perimeterRings.forEach(ring => {
                    const basePoints = ring.map(p => new THREE.Vector3(p.x, p.y, -bevelThickness));
                    const lineGeom = new THREE.BufferGeometry().setFromPoints(basePoints);
                    const lineLoop = new THREE.LineLoop(lineGeom, baseLineMat);
                    mapGroup.add(lineLoop);
                });

                // 3D Destination Beacons & Wave Rings
                const pinGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8);
                const beadGeom = new THREE.SphereGeometry(0.065, 12, 12);
                const haloGeom = new THREE.RingGeometry(0.08, 0.16, 24);

                DESTINATIONS.forEach((dest, i) => {
                    const x = toX(dest.coords[0]);
                    const y = toY(dest.coords[1]);
                    const isCoral = i % 2 === 0;
                    const beaconColor = isCoral ? 0xff7e5f : 0x6fc7ff;

                    // Standing 3D pin
                    const pinMat = new THREE.MeshBasicMaterial({
                        color: beaconColor,
                        transparent: true,
                        opacity: darkMode ? 0.85 : 0.70
                    });
                    const pin = new THREE.Mesh(pinGeom, pinMat);
                    pin.rotation.x = Math.PI / 2;
                    pin.position.set(x, y, surfaceZ + 0.11);
                    mapGroup.add(pin);

                    // Glowing top bead
                    const beadMat = new THREE.MeshBasicMaterial({
                        color: beaconColor,
                        transparent: true,
                        opacity: darkMode ? 0.95 : 0.90
                    });
                    const bead = new THREE.Mesh(beadGeom, beadMat);
                    bead.position.set(x, y, surfaceZ + 0.22);
                    mapGroup.add(bead);

                    // Pulsing ripple ring on the surface
                    const haloMat = new THREE.MeshBasicMaterial({
                        color: beaconColor,
                        transparent: true,
                        opacity: 0.35,
                        side: THREE.DoubleSide
                    });
                    const halo = new THREE.Mesh(haloGeom, haloMat);
                    halo.position.set(x, y, surfaceZ + 0.012);
                    mapGroup.add(halo);

                    beaconHalos.push({
                        mesh: halo,
                        phase: i * 0.6
                    });
                });

                // Elevated 3D Travel Routes (Arching Beziers with glowing comets)
                TRAVEL_ROUTES.forEach(([fromIdx, toIdx], routeIdx) => {
                    const p1 = DESTINATIONS[fromIdx].coords;
                    const p2 = DESTINATIONS[toIdx].coords;

                    const v1 = new THREE.Vector3(toX(p1[0]), toY(p1[1]), surfaceZ + 0.05);
                    const v2 = new THREE.Vector3(toX(p2[0]), toY(p2[1]), surfaceZ + 0.05);
                    const mid = new THREE.Vector3(
                        (v1.x + v2.x) / 2,
                        (v1.y + v2.y) / 2,
                        surfaceZ + 0.60 + (routeIdx * 0.06)
                    );

                    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
                    const curvePoints = curve.getPoints(42);
                    const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
                    const curveMat = new THREE.LineBasicMaterial({
                        color: routeIdx % 2 === 0 ? 0xff7e5f : 0x6fc7ff,
                        transparent: true,
                        opacity: darkMode ? 0.55 : 0.35,
                        blending: THREE.AdditiveBlending
                    });
                    const curveLine = new THREE.Line(curveGeom, curveMat);
                    mapGroup.add(curveLine);

                    // Moving glowing comet bead along the arc
                    const sparkGeom = new THREE.SphereGeometry(0.048, 10, 10);
                    const sparkMat = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.95
                    });
                    const spark = new THREE.Mesh(sparkGeom, sparkMat);
                    mapGroup.add(spark);

                    routeBeziers.push({
                        curve,
                        spark,
                        progress: (routeIdx * 0.20) % 1.0,
                        speed: 0.0032 + (routeIdx * 0.0005)
                    });
                });

                setLoaded(true);
            })
            .catch(err => {
                console.warn('India 3D GeoJSON error:', err.message);
            });

        // Interactive Mouse Parallax (Responsive, smooth 3D tilt & pan)
        let targetRotX = 0;
        let targetRotY = 0;
        let targetShiftX = 0;
        let targetShiftY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let currentShiftX = 0;
        let currentShiftY = 0;

        const handleMouseMove = (e) => {
            if (prefersReducedMotion) return;
            const normX = (e.clientX / window.innerWidth) * 2 - 1;
            const normY = -(e.clientY / window.innerHeight) * 2 + 1;
            // Noticeable 3D tilt responsiveness when cursor moves!
            targetRotY = normX * 0.28; // Tilts left-right in 3D
            targetRotX = -normY * 0.20; // Tilts up-down in 3D
            targetShiftX = normX * 0.38; // Subtle pan in 3D
            targetShiftY = normY * 0.25;
        };

        // Scroll Animation: "while scroll indian map size also increase"
        let scrollY = 0;
        let targetScrollScale = 1.0;
        let currentScrollScale = 1.0;

        const handleScroll = () => {
            scrollY = window.scrollY || 0;
            // Starts fitted at 1.0x at the top of the home screen,
            // and smoothly grows in size as the user scrolls down the page!
            const progress = Math.min(scrollY / 600, 2.2);
            const growthRate = window.innerWidth <= 768 ? 0.58 : 0.65;
            targetScrollScale = 1.0 + progress * growthRate;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Resize handler
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);

            currentConfig = updateOffsets();
            responsiveScaleRatio = currentConfig.scale / BASE_PROJECTION_SCALE;
            mapGroup.position.x = currentConfig.x;
            mapGroup.position.y = currentConfig.y;
        };
        window.addEventListener('resize', handleResize, { passive: true });

        // Animation Loop (Continuous, smooth, responsive)
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            if (!prefersReducedMotion) {
                // Silky smooth lerp for responsive cursor movement
                currentRotX += (targetRotX - currentRotX) * 0.055;
                currentRotY += (targetRotY - currentRotY) * 0.055;
                currentShiftX += (targetShiftX - currentShiftX) * 0.055;
                currentShiftY += (targetShiftY - currentShiftY) * 0.055;

                // Smooth scroll scale expansion (fixed and stable on mobile)
                currentScrollScale += (targetScrollScale - currentScrollScale) * 0.055;
                const effectiveScale = responsiveScaleRatio * currentScrollScale;
                mapGroup.scale.set(effectiveScale, effectiveScale, effectiveScale);

                // Continuous gentle 3D floating and rocking animation
                const floatY = Math.sin(elapsedTime * 0.7) * 0.14;
                const rockY = Math.sin(elapsedTime * 0.45) * 0.035;
                const rockX = Math.cos(elapsedTime * 0.35) * 0.02;

                mapGroup.rotation.x = currentConfig.rotX + currentRotX + rockX;
                mapGroup.rotation.y = currentConfig.rotY + currentRotY + rockY;
                mapGroup.position.x = currentConfig.x + currentShiftX;
                mapGroup.position.y = currentConfig.y + currentShiftY + floatY - (scrollY * 0.0003);

                // Pulse destination beacon halos (expanding radar waves)
                beaconHalos.forEach(b => {
                    const wave = (elapsedTime * 1.9 + b.phase) % (Math.PI * 2);
                    const scaleFactor = 1 + 0.45 * Math.sin(wave);
                    b.mesh.scale.set(scaleFactor, scaleFactor, 1);
                    b.mesh.material.opacity = 0.12 + 0.30 * Math.max(0, Math.sin(wave));
                });

                // Animate glowing travel sparks along bezier curves
                routeBeziers.forEach(r => {
                    r.progress = (r.progress + r.speed) % 1.0;
                    const pos = r.curve.getPointAt(r.progress);
                    r.spark.position.copy(pos);
                });

                // Ambient floating travel particles
                const posAttr = particleGeometry.attributes.position;
                for (let i = 0; i < particleCount; i++) {
                    let y = posAttr.getY(i) + particleSpeeds[i];
                    if (y > 9) y = -9;
                    posAttr.setY(i, y);
                }
                posAttr.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            isDisposed = true;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            // Clean Three.js resources
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            });
            renderer.dispose();
        };
    }, [darkMode]);

    return (
        <div
            ref={containerRef}
            className={`india-3d-bg-wrapper ${loaded ? 'loaded' : ''}`}
            aria-hidden="true"
        >
            <canvas ref={canvasRef} className="india-3d-canvas" />
            <div className="india-3d-vignette" />
        </div>
    );
}

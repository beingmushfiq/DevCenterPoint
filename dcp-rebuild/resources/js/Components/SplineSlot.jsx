import React, { useEffect, useRef } from 'react';
import { mountSpline, SPLINE_SCENE_URL } from '../three/spline';

export default function SplineSlot({ onSplineReady }) {
    const slotRef = useRef(null);
    const splineAppRef = useRef(null);

    useEffect(() => {
        if (!SPLINE_SCENE_URL || !slotRef.current) return;

        let cancelled = false;
        mountSpline(slotRef.current).then((instance) => {
            if (cancelled) return;
            splineAppRef.current = instance;
            if (typeof onSplineReady === 'function') {
                onSplineReady(instance);
            }
        }).catch((err) => {
            console.warn('Spline slot mount failed', err);
        });

        return () => {
            cancelled = true;
            if (splineAppRef.current && splineAppRef.current.app) {
                try {
                    splineAppRef.current.app.dispose?.();
                } catch (e) {}
            }
        };
    }, []);

    if (!SPLINE_SCENE_URL) return null;

    return (
        <div
            ref={slotRef}
            id="spline-slot"
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 1,
            }}
        />
    );
}

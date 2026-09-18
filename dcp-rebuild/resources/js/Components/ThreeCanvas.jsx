import React, { useEffect, useRef } from 'react';
import { Scene } from '../three/scene';

export default function ThreeCanvas({ profile = 'full', onSceneReady }) {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const scene = new Scene(canvas, { profile });
            sceneRef.current = scene;
            if (typeof onSceneReady === 'function') {
                onSceneReady(scene);
            }
        } catch (err) {
            console.warn('WebGL initialization failed, running in 2D mode', err);
        }

        return () => {
            if (sceneRef.current) {
                sceneRef.current.destroy();
                sceneRef.current = null;
            }
        };
    }, [profile]);

    return (
        <canvas
            ref={canvasRef}
            id="webgl"
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}

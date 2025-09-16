import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const AnimatedBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // Emblem
        const geometry = new THREE.TorusKnotGeometry(1.8, 0.4, 150, 20);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, // A bright cyan color
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const emblem = new THREE.Mesh(geometry, material);
        scene.add(emblem);

        // Animation
        let frameId: number;
        const animate = () => {
            emblem.rotation.x += 0.001;
            emblem.rotation.y += 0.0015;
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        // Handle Resize
        const handleResize = () => {
            if (currentMount) {
                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};

export default AnimatedBackground;
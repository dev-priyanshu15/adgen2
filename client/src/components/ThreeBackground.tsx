import { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';

export const ThreeBackground = memo(function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasWebGL(false);
      return;
    }

    if (!mountRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      try {
        renderer = new THREE.WebGLRenderer({ 
          alpha: true, 
          antialias: false,
          failIfMajorPerformanceCaveat: true,
          powerPreference: 'low-power',
        });
      } catch (error) {
        setHasWebGL(false);
        return;
      }

      if (!renderer) return;

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      camera.position.z = 5;

      // Reduced particles: 600 instead of 2000
      const particles = new THREE.BufferGeometry();
      const particleCount = 600;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;

        // Muted violet tones
        colors[i] = 0.49;
        colors[i + 1] = 0.23;
        colors[i + 2] = 0.93;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);

      // Fewer, smaller, more transparent shapes
      const geometries = [
        new THREE.OctahedronGeometry(0.15),
        new THREE.TetrahedronGeometry(0.15),
        new THREE.IcosahedronGeometry(0.15),
      ];

      const shapes: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const geometry = geometries[i % geometries.length];
        const material = new THREE.MeshBasicMaterial({
          color: 0x7c3aed,
          wireframe: true,
          transparent: true,
          opacity: 0.06,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
        shapes.push(mesh);
        scene.add(mesh);
      }

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Slowed rotation by 40%
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        particleSystem.rotation.y += 0.0003;
        particleSystem.rotation.x += 0.00012;

        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.03;
        camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        shapes.forEach((shape, index) => {
          shape.rotation.x += 0.0006 * (index + 1);
          shape.rotation.y += 0.0012 * (index + 1);
        });

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer?.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        if (renderer) {
          renderer.dispose();
        }
        particles.dispose();
        particleMaterial.dispose();
        geometries.forEach(g => g.dispose());
      };
    } catch (error) {
      console.error('Three.js initialization error:', error);
      setHasWebGL(false);
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'var(--bg)' }}
    />
  );
});

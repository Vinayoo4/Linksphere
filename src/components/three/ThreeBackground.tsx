import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';

const MovingSpheres = () => {
  const { theme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  const darkColor = '#4c1d95'; // primary-900
  const lightColor = '#8b5cf6'; // primary-500
  const secondaryColor = '#0ea5e9'; // secondary-500
  const accentColor = '#ec4899'; // accent-500

  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => {
        const radius = 4 + i * 0.5;
        const speed = 0.1 - i * 0.01;
        const sphereRef = useRef<THREE.Mesh>(null);
        const sphereScale = 0.1 + Math.random() * 0.3;
        const baseColor = i % 3 === 0 ? lightColor : i % 3 === 1 ? secondaryColor : accentColor;
        
        useFrame(({ clock }) => {
          if (sphereRef.current) {
            const t = clock.getElapsedTime() * speed;
            sphereRef.current.position.x = radius * Math.sin(t);
            sphereRef.current.position.z = radius * Math.cos(t);
            sphereRef.current.position.y = Math.sin(t * 2) * 1.5;
          }
        });

        return (
          <mesh key={i} ref={sphereRef} scale={[sphereScale, sphereScale, sphereScale]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
              color={baseColor}
              transparent
              opacity={theme === 'dark' ? 0.6 : 0.3}
              roughness={0.5}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const ThreeBackground: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={theme === 'dark' ? 0.1 : 0.3} />
        <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 0.5 : 1} />
        <MovingSpheres />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
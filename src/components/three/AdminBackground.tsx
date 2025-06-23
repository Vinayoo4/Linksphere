import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';

const FloatingCubes = () => {
  const { theme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
      groupRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.1) * 0.2;
    }
  });

  const darkColor = '#1e40af'; // blue-800
  const lightColor = '#3b82f6'; // blue-500
  const accentColor = '#06b6d4'; // cyan-500

  return (
    <group ref={groupRef}>
      {[...Array(12)].map((_, i) => {
        const cubeRef = useRef<THREE.Mesh>(null);
        const scale = 0.5 + Math.random() * 0.5;
        const position = [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ];
        const rotation = [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ];
        
        useFrame(({ clock }) => {
          if (cubeRef.current) {
            cubeRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2 + i) * 0.3;
            cubeRef.current.rotation.y = Math.cos(clock.getElapsedTime() * 0.2 + i) * 0.3;
            cubeRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.5;
          }
        });

        return (
          <mesh
            key={i}
            ref={cubeRef}
            position={position}
            rotation={rotation}
            scale={[scale, scale, scale]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? lightColor : i % 3 === 1 ? darkColor : accentColor}
              transparent
              opacity={theme === 'dark' ? 0.6 : 0.3}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const AdminBackground: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={theme === 'dark' ? 0.2 : 0.4} />
        <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 0.5 : 1} />
        <FloatingCubes />
      </Canvas>
    </div>
  );
};

export default AdminBackground;
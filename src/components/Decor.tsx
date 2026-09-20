type TreeProps = { position: [number, number, number]; scale?: number };

export function Tree({ position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.4, 8]} />
        <meshStandardMaterial color="#7a4b2a" />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[1.05, 1.8, 10]} />
        <meshStandardMaterial color="#2f9e44" />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <coneGeometry args={[0.75, 1.2, 10]} />
        <meshStandardMaterial color="#3cb35a" />
      </mesh>
    </group>
  );
}

export function Palm({ position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 2.6, 8]} />
        <meshStandardMaterial color="#b57a3a" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.sin(i * 1.26) * 0.7, 2.55, Math.cos(i * 1.26) * 0.7]} rotation={[0.7, i, 0]} castShadow>
          <boxGeometry args={[0.22, 0.08, 1.3]} />
          <meshStandardMaterial color="#2fa85a" />
        </mesh>
      ))}
    </group>
  );
}

export function Cactus({ position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 1.8, 8]} />
        <meshStandardMaterial color="#3d9a4a" />
      </mesh>
      <mesh position={[0.38, 1.05, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.7, 8]} />
        <meshStandardMaterial color="#3d9a4a" />
      </mesh>
      <mesh position={[-0.32, 1.25, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.55, 8]} />
        <meshStandardMaterial color="#3d9a4a" />
      </mesh>
    </group>
  );
}

export function Rock({ position, scale = 1 }: TreeProps) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <dodecahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color="#9a8770" roughness={0.9} />
    </mesh>
  );
}

export function Building({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, size[1] * 0.55, size[2] / 2 + 0.01]}>
        <planeGeometry args={[size[0] * 0.55, size[1] * 0.35]} />
        <meshStandardMaterial color="#ffe08a" emissive="#ffe08a" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export function Grandstand({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[8, 1.2, 2.4]} />
        <meshStandardMaterial color="#d9d4cc" />
      </mesh>
      <mesh position={[0, 1.3, -0.4]} castShadow>
        <boxGeometry args={[8, 0.8, 1.6]} />
        <meshStandardMaterial color="#ef3b3b" />
      </mesh>
      <mesh position={[0, 2.0, -0.7]} castShadow>
        <boxGeometry args={[8, 0.7, 1.1]} />
        <meshStandardMaterial color="#ef3b3b" />
      </mesh>
    </group>
  );
}

export function Buoy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color="#ff4d4d" />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

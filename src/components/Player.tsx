import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Vector3, Euler } from 'three';

// Module-level reusable objects — avoid per-frame GC pressure
const _direction = new Vector3();
const _euler = new Euler(0, 0, 0, 'YXZ');

const SPEED = 4;

export default function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);

  const [, getKeys] = useKeyboardControls();

  useFrame((state) => {
    const body = bodyRef.current;
    if (!body) return;

    const { forward, backward, left, right } = getKeys();

    // Build a flat movement vector from key input
    _direction.set(
      (right ? 1 : 0) - (left ? 1 : 0),
      0,
      (backward ? 1 : 0) - (forward ? 1 : 0),
    );

    // Rotate the movement vector to align with where the camera is facing (yaw only)
    _euler.set(0, state.camera.rotation.y, 0, 'YXZ');
    _direction.applyEuler(_euler);

    if (_direction.lengthSq() > 0) {
      _direction.normalize().multiplyScalar(SPEED);
    }

    // Preserve vertical velocity so gravity and jumps are unaffected
    const currentLinvel = body.linvel();
    body.setLinvel(
      { x: _direction.x, y: currentLinvel.y, z: _direction.z },
      true,
    );

    // Sync camera to capsule position, eye height offset = 0.8
    const pos = body.translation();
    state.camera.position.set(pos.x, pos.y + 0.8, pos.z);
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="dynamic"
        position={[0, 2, 3]}
        lockRotations
        colliders={false}
      >
        <CuboidCollider args={[0.3, 0.8, 0.3]} />
      </RigidBody>

      <PointerLockControls />
    </>
  );
}

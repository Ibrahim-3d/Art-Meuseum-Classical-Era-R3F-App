import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Vector3, Raycaster, Vector2, PerspectiveCamera, Matrix3 } from 'three'
import { useMuseum } from '../stores/useMuseum'
import { paintings } from '../data/paintings'
import { APPROACH_OUTER } from '../lib/approachState'

// Module-level reusable objects — avoid per-frame GC pressure
const _direction = new Vector3()
const _raycaster = new Raycaster()
const _mouse = new Vector2()
const _worldNormal = new Vector3()
const _normalMatrix = new Matrix3()
const _toTarget = new Vector3()
const _paintingPos = new Vector3()

// Minimum Y component of hit normal to count as "floor" (vs wall/ceiling)
const FLOOR_NORMAL_THRESHOLD = 0.7

// Speed values per tier (base speeds, Shift doubles them)
const SPEEDS = { 1: 3, 2: 5, 3: 10 } as const
const SPRINT_MULTIPLIER = 2

// Auto-walk speed when walking to a teleport target
const WALK_TO_SPEED = 5

// Distance threshold to consider "arrived" at walk-to target
const ARRIVAL_THRESHOLD = 0.5

// Bob frequency per speed tier
const BOB_FREQUENCIES = { 1: 6, 2: 8, 3: 12 } as const
const BOB_AMPLITUDE = 0.03

// Camera rotation sensitivity (radians per pixel)
const ROTATION_SENSITIVITY = 0.003

// Pitch clamp range
const PITCH_MIN = -Math.PI / 3
const PITCH_MAX = Math.PI / 3

// Teleport click drag threshold (pixels)
const CLICK_DRAG_THRESHOLD = 5

// FOV lens zoom constants (hold Shift = telephoto zoom)
const FOV_DEFAULT = 65
const FOV_ZOOMED = 35 // narrow FOV = magnified view
const FOV_LERP_SPEED = 6 // degrees per second multiplier for smooth transition

// Nearest painting detection range
const NEAREST_RANGE = APPROACH_OUTER

export default function Player() {
  const bodyRef = useRef<RapierRigidBody>(null)
  const { camera, gl, scene } = useThree()

  const [, getKeys] = useKeyboardControls<
    'forward' | 'backward' | 'left' | 'right' | 'slow' | 'normal' | 'fast'
  >()

  // Camera rotation state
  const yaw = useRef<number>(0) // face north into museum from spawn
  const pitch = useRef<number>(0)
  const isRightDragging = useRef<boolean>(false)

  // Head bob state
  const bobPhase = useRef<number>(0)

  // Speed tier key tracking (avoid re-setting every frame)
  const prevSlowRef = useRef<boolean>(false)
  const prevNormalRef = useRef<boolean>(false)
  const prevFastRef = useRef<boolean>(false)

  // Click-to-teleport state
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  // Walk-to destination (set by floor click or minimap waypoint)
  const walkTarget = useRef<{ x: number; z: number } | null>(null)

  // Indicator position (React state so the mesh re-renders)
  const [indicatorPos, setIndicatorPos] = useState<{ x: number; z: number } | null>(null)

  // Alt = FOV zoom, Shift = sprint
  const altHeld = useRef(false)
  const shiftHeld = useRef(false)
  const currentFov = useRef(FOV_DEFAULT)

  // Nearest painting tracking (only update store on change)
  const prevNearestRef = useRef<string | null>(null)

  // Set Euler order for FPS camera once on mount
  useEffect(() => {
    camera.rotation.order = 'YXZ'
  }, [camera])

  // Keyboard event listeners for Shift (FOV zoom) + E (deep zoom)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't process if deep zoom is open
      if (useMuseum.getState().deepZoomPainting) return

      // E key: open deep zoom for nearest painting
      if (e.code === 'KeyE' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const nearest = findNearestPainting()
        if (nearest) {
          useMuseum.getState().setDeepZoomPainting(nearest.id)
        }
      }

      // Alt key: hold to zoom in (narrow FOV like a telephoto lens)
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault()
        altHeld.current = true
      }

      // Shift key: sprint
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        shiftHeld.current = true
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        altHeld.current = false
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        shiftHeld.current = false
      }
    }

    // If the window loses focus (alt-tab, click outside), release all held keys
    // so the camera doesn't get stuck zoomed in
    const onBlur = () => {
      altHeld.current = false
      shiftHeld.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  // Right-click drag camera rotation + left-click teleport
  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 2) {
        // Right click — start drag rotation
        isRightDragging.current = true
        document.body.style.cursor = 'none'
      } else if (e.button === 0) {
        // Left click — record starting position for drag threshold check
        pointerDownPos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (isRightDragging.current && (e.buttons & 2) !== 0) {
        yaw.current -= e.movementX * ROTATION_SENSITIVITY
        pitch.current -= e.movementY * ROTATION_SENSITIVITY
        pitch.current = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch.current))
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 2) {
        isRightDragging.current = false
        document.body.style.cursor = ''
      } else if (e.button === 0) {
        const downPos = pointerDownPos.current
        if (!downPos) return

        const dx = e.clientX - downPos.x
        const dy = e.clientY - downPos.y
        const dragDist = Math.sqrt(dx * dx + dy * dy)
        pointerDownPos.current = null

        // Only teleport if this was a click (not a drag)
        if (dragDist > CLICK_DRAG_THRESHOLD) return

        // Don't teleport if deep zoom is open
        if (useMuseum.getState().deepZoomPainting) return

        // Don't teleport if clicking on HTML overlay (target not the canvas)
        if (e.target !== canvas) return

        const body = bodyRef.current
        if (!body) return

        // Convert client coordinates to normalized device coordinates
        const rect = canvas.getBoundingClientRect()
        _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        // Raycast against scene geometry — only accept floor hits (upward normal)
        _raycaster.setFromCamera(_mouse, camera)
        const hits = _raycaster.intersectObjects(scene.children, true)

        for (const hit of hits) {
          if (!hit.face) continue
          // Transform face normal from object-local to world space
          _normalMatrix.getNormalMatrix(hit.object.matrixWorld)
          _worldNormal.copy(hit.face.normal).applyMatrix3(_normalMatrix).normalize()
          if (_worldNormal.y > FLOOR_NORMAL_THRESHOLD) {
            walkTarget.current = { x: hit.point.x, z: hit.point.z }
            setIndicatorPos({ x: hit.point.x, z: hit.point.z })
            break
          }
        }
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
      document.body.style.cursor = ''
    }
  }, [camera, gl.domElement, scene])

  useFrame((state, delta) => {
    const body = bodyRef.current
    if (!body) return

    // Skip movement if deep zoom is open
    const deepZoomOpen = useMuseum.getState().deepZoomPainting !== null
    if (deepZoomOpen) {
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true)
      // Still sync camera
      const pos = body.translation()
      state.camera.position.set(pos.x, pos.y + 0.8, pos.z)
      state.camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')
      return
    }

    // --- Speed tier key handling ---
    const { forward, backward, left, right, slow, normal, fast } = getKeys()
    const setSpeedTier = useMuseum.getState().setSpeedTier

    if (slow && !prevSlowRef.current) setSpeedTier(1)
    if (normal && !prevNormalRef.current) setSpeedTier(2)
    if (fast && !prevFastRef.current) setSpeedTier(3)

    prevSlowRef.current = slow as boolean
    prevNormalRef.current = normal as boolean
    prevFastRef.current = fast as boolean

    // --- Minimap teleport: instant position set, bypasses colliders ---
    const teleportTarget = useMuseum.getState().teleportTarget
    if (teleportTarget) {
      body.setTranslation(
        { x: teleportTarget.x, y: teleportTarget.y + 1, z: teleportTarget.z },
        true,
      )
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      walkTarget.current = null
      setIndicatorPos(null)
      useMuseum.getState().setTeleportTarget(null)
    }

    // --- Nearest painting detection ---
    // Only counts paintings where the player is on the VIEWING side
    // (in front of the painting, not behind the wall it hangs on)
    // and within the approach range.
    const pos = body.translation()
    const camPos = state.camera.position
    let nearestId: string | null = null
    let nearestDist = Infinity
    for (const p of paintings) {
      _paintingPos.set(p.position[0], p.position[1], p.position[2])
      const dist = camPos.distanceTo(_paintingPos)
      if (dist >= nearestDist || dist > NEAREST_RANGE) continue

      // Painting outward normal from its Y rotation
      const nx = Math.sin(p.rotation[1])
      const nz = Math.cos(p.rotation[1])

      // Vector from painting center to player (XZ only)
      const toPlayerX = camPos.x - p.position[0]
      const toPlayerZ = camPos.z - p.position[2]

      // Dot product > 0 means player is on the front side of the painting
      const dot = toPlayerX * nx + toPlayerZ * nz
      if (dot <= 0) continue

      nearestDist = dist
      nearestId = p.id
    }
    // Only update store when the nearest painting changes
    if (nearestId !== prevNearestRef.current) {
      prevNearestRef.current = nearestId
      useMuseum.getState().setNearestPaintingId(nearestId)
    }

    // --- FOV lens zoom (Alt held = telephoto) ---
    // Safety: if window lost focus or the keyup was missed, force-release
    if (altHeld.current && !document.hasFocus()) {
      altHeld.current = false
    }
    const targetFov = altHeld.current ? FOV_ZOOMED : FOV_DEFAULT
    if (Math.abs(currentFov.current - targetFov) > 0.1) {
      currentFov.current += (targetFov - currentFov.current) * Math.min(delta * FOV_LERP_SPEED, 1)
      const cam = state.camera as PerspectiveCamera
      cam.fov = currentFov.current
      cam.updateProjectionMatrix()
    }

    // --- Movement ---
    const speedTier = useMuseum.getState().speedTier
    const speed = SPEEDS[speedTier] * (shiftHeld.current ? SPRINT_MULTIPLIER : 1)
    const hasManualInput = forward || backward || left || right

    // Manual input cancels any walk-to target
    if (hasManualInput && walkTarget.current) {
      walkTarget.current = null
      setIndicatorPos(null)
    }

    if (walkTarget.current) {
      // Walk-to mode: steer toward target on XZ plane
      _toTarget.set(walkTarget.current.x - pos.x, 0, walkTarget.current.z - pos.z)
      const dist = _toTarget.length()

      if (dist < ARRIVAL_THRESHOLD) {
        // Arrived — stop and hide indicator
        walkTarget.current = null
        setIndicatorPos(null)
        _direction.set(0, 0, 0)
      } else {
        _toTarget.normalize().multiplyScalar(WALK_TO_SPEED)
        _direction.set(_toTarget.x, 0, _toTarget.z)
      }
    } else {
      // Manual WASD movement
      const forwardX = -Math.sin(yaw.current)
      const forwardZ = -Math.cos(yaw.current)
      const strafeX = Math.cos(yaw.current)
      const strafeZ = -Math.sin(yaw.current)

      _direction.set(
        (right ? 1 : 0) * strafeX + (left ? -1 : 0) * strafeX +
        (forward ? 1 : 0) * forwardX + (backward ? -1 : 0) * forwardX,
        0,
        (right ? 1 : 0) * strafeZ + (left ? -1 : 0) * strafeZ +
        (forward ? 1 : 0) * forwardZ + (backward ? -1 : 0) * forwardZ,
      )

      if (_direction.lengthSq() > 0) {
        _direction.normalize().multiplyScalar(speed)
      }
    }

    // Preserve vertical velocity so gravity is unaffected
    const currentLinvel = body.linvel()
    body.setLinvel(
      { x: _direction.x, y: currentLinvel.y, z: _direction.z },
      true,
    )

    // --- Head bob ---
    const isMoving = hasManualInput || walkTarget.current !== null
    const bobFrequency = BOB_FREQUENCIES[speedTier]

    if (isMoving) {
      bobPhase.current += delta * bobFrequency
    } else {
      // Lerp bob phase toward nearest multiple of pi for smooth settle
      const nearestPiMultiple = Math.round(bobPhase.current / Math.PI) * Math.PI
      bobPhase.current += (nearestPiMultiple - bobPhase.current) * Math.min(delta * 8, 1)
    }

    const bobOffset = Math.sin(bobPhase.current) * BOB_AMPLITUDE

    // --- Camera sync ---
    const finalPos = body.translation()
    state.camera.position.set(finalPos.x, finalPos.y + 0.8 + bobOffset, finalPos.z)

    // Apply camera rotation from right-click drag
    state.camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')
  })

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="dynamic"
        position={[0, 0.9, 14]}
        lockRotations
        colliders={false}
      >
        <CuboidCollider args={[0.3, 0.8, 0.3]} />
      </RigidBody>

      {/* Walk-to indicator — blue circle on the ground */}
      {indicatorPos && (
        <mesh
          position={[indicatorPos.x, 0.02, indicatorPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.25, 0.35, 32]} />
          <meshBasicMaterial
            color="#4a9eff"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
}

/** Find nearest painting within approach range */
function findNearestPainting() {
  const state = useMuseum.getState()
  if (!state.nearestPaintingId) return null
  return paintings.find((p) => p.id === state.nearestPaintingId) ?? null
}

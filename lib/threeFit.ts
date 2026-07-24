import * as THREE from "three";

// Auto-fit any imported object to the ~14-unit stage, sitting on the ground.
export function fitToStage(root: THREE.Object3D) {
  const obj = root.clone(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const s = 14 / (Math.max(size.x, size.y, size.z) || 1);
  obj.scale.setScalar(s);
  obj.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return obj;
}

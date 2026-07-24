"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { fitToStage } from "@/lib/threeFit";

export default function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  const fitted = useMemo(() => fitToStage(obj), [obj]);
  return <primitive object={fitted} />;
}

"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { fitToStage } from "@/lib/threeFit";

export default function FbxModel({ url }: { url: string }) {
  const obj = useLoader(FBXLoader, url);
  const fitted = useMemo(() => fitToStage(obj), [obj]);
  return <primitive object={fitted} />;
}

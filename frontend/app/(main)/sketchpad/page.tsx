import type { Metadata } from "next";
import { SketchpadClient } from "@/components/sketchpad/SketchpadClient";

export const metadata: Metadata = {
  title: "Start or join a room - Sketchpad",
  description: "Open a new Sketchpad room or join one with an 8-character code.",
};

export default function SketchpadPage() {
  return <SketchpadClient />;
}
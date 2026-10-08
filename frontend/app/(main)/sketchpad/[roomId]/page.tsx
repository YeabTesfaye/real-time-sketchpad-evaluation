import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import RoomClient from "@/components/sketchpad/RoomClient";

type Props = { params: Promise<{ roomId: string }> };

// Adjust if your room ids use other characters
const ROOM_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params;
  return {
    title: `Room ${roomId} - Sketchpad`,
    // Rooms are private, keep them out of search indexes
    robots: { index: false, follow: false },
  };
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;

  // Replaces the old "no room id, show RoomActions" branch
  if (roomId === "undefined") redirect("/sketchpad");
  // Reject junk at the boundary, before it reaches the canvas or the socket layer
  if (!ROOM_ID_RE.test(roomId)) notFound();

  return <RoomClient roomId={roomId} />;
}
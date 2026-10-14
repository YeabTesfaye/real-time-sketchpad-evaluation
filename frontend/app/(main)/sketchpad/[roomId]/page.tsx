import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import RoomClient from "@/components/sketchpad/RoomClient";

type Props = {
  params: Promise<{
    roomId: string;
  }>;
};

const ROOM_ID_RE =
  /^[A-Za-z0-9_-]{1,64}$/;


export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {

  const {
    roomId,
  } = await params;


  return {
    title:
      `Room ${roomId} - Sketchpad`,

    robots: {
      index: false,
      follow: false,
    },
  };
}


export default async function RoomPage({
  params,
}: Props) {

  const {
    roomId,
  } = await params;


  if (
    roomId ===
    "undefined"
  ) {
    redirect(
      "/sketchpad"
    );
  }


  if (
    !ROOM_ID_RE.test(
      roomId
    )
  ) {
    notFound();
  }


  return (
    <RoomClient
      roomId={
        roomId
      }
    />
  );
}
"use client"
import { SessionProvider } from "next-auth/react"
import { RoomProvider } from "@/lib/RoomContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoomProvider>
        {children}
      </RoomProvider>
    </SessionProvider>
  )
}

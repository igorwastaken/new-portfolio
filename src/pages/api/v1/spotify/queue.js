import { NextResponse } from "next/server"
import { StatsFM } from "./profile"

export const runtime = 'edge'

export default async function Queue() {
    const stats = new StatsFM('igorwastaken')
    const now = await stats.listening();
    const last = await stats.lastListened();
    return NextResponse.json({
        listening: {
            now,
            last
        }
    })
}
import { NextResponse } from "next/server";
import { StatsFM } from "./spotify/profile";
import Utils from "@/lib/Utils";

export const runtime = 'edge';
async function findLyrics(info) {
    const baseURL = "https://lrclib.net/api/get";
    const durr = info.duration / 1000;
    const params = {
        track_name: info.title,
        artist_name: info.artist,
        album_name: info.album,
        duration: durr,
    };

    const finalURL = `${baseURL}?${Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&")}`;

    const body = await fetch(finalURL);

    if (body.status !== 200) {
        return {
            error: "Request error: Track wasn't found",
            uri: info.uri,
        };
    }

    return await body.json();
}

function getUnsynced(body) {
    const unsyncedLyrics = body?.plainLyrics;
    const isInstrumental = body.instrumental;
    if (isInstrumental) return [{ text: "♪ Instrumental ♪" }];

    if (!unsyncedLyrics) return null;

    return Utils.parseLocalLyrics(unsyncedLyrics).unsynced;
}

function getSynced(body) {
    const syncedLyrics = body?.syncedLyrics;
    const isInstrumental = body.instrumental;
    if (isInstrumental) return [{ text: "♪ Instrumental ♪" }];

    if (!syncedLyrics) return null;

    return Utils.parseLocalLyrics(syncedLyrics).synced;
}

export default async function Lyrics(req, res) {
    const stats = new StatsFM('igorwastaken');
    const now = await stats.listening();

    const lyrics = await findLyrics({
        title: now.song.name,
        artist: now.song.artists[0].name,
        album: now.song.album.name,
        duration: now.song.duration
    });
    const syncedLyrics = await getSynced(lyrics);
    const unsyncedLyrics = await getUnsynced(lyrics);
    return NextResponse.json({
        song: {
            title: now.song.name,
            artist: now.song.artists,
            image: now.song.image,
            duration: {
                now: now.progress,
                end: now.song.duration
            }
        },
        lyrics: {
            ...lyrics,
            unsynced: unsyncedLyrics,
            synced: syncedLyrics
        }
    })
}
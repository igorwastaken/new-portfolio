import { useServerInsertedHTML } from "next/navigation";
import { NextResponse } from "next/server";
export const runtime = "edge";
export class StatsFM {
    userId = "igorwastaken"
    url = "https://api.stats.fm/api/v1"
    constructor(userId, options = {}) {
        this.userId = userId;
        this.options = options;
        this.url = "https://api.stats.fm/api/v1";
    }
    async fetch(endpoint, options) {
        const response = await fetch(this.url + endpoint, options);
        if(!response.ok) {
            console.error('Failed to fetch data from stats.fm');
            return {};
        }
        return response.json();
    }
    async listening() {
        const np = await this.fetch(`/users/${this.userId}/streams/current`);
        const item = np.item;
        if (!item || !item.track) return { isPlaying: false };
        
        return {
            isPlaying: item.isPlaying,
            progress: item.progressMs,
            device: item.deviceName,
            song: {
                name: item.track.name,
                artists: item.track.artists,
                album: item.track.albums[0],
                duration: item.track.durationMs,
                preview: item.track.spotifyPreview,
                image: item.track.albums[0].image
            }
        };
    }
    async lastListened() {
        const last = await this.fetch(`/users/${this.userId}/streams/recent`);
        const item = last.items[0];
        if (!item) return { song: null };

        return {
            song: {
                name: item.track.name,
                artists: item.track.artists,
                album: item.track.albums[0],
                duration: item.track.durationMs,
                preview: item.track.spotifyPreview,
                image: item.track.albums[0].image
            }
        }
    }
    async topTracks() {
        const topReq = await this.fetch(`/users/${this.userId}/top/tracks?range=weeks`)
        const top = topReq.items;
        
        if(!top) return [];
        return top.map((q) => ({
            position: q.position,
            indicator: q.indicator,
            name: q.track.name,
            artists: q.track.artists,
            duration: q.track.duration,
            image: q.track.albums[0].image,
            album: q.track.albums[0],
            preview: q.track.spotifyPreview
        }));
    }
    async topArtists() {
        const topReq = await this.fetch(`/users/${this.userId}/top/artists?range=weeks`)
        const top = topReq.items;
        if(!top) return [];
        return top.map((q) => ({
            position: q.position,
            indicator: q.indicator,
            name: q.artist.name,
            avatar: q.artist.image,
            genres: q.artist.genres
        }))
    }
    async profile() {
        const profileReq = await this.fetch(`/users/${this.userId}`);
        const profile = profileReq.item
        const [tracks, artists] = await Promise.all([this.topTracks(), this.topArtists()]);
        return {
            name: profile.displayName,
            avatar: profile.image,
            top: {
                tracks,
                artists
            },
            spotify: {
                name: profile.spotifyAuth.displayName,
                avatar: profile.spotifyAuth.image,
                url: `https://open.spotify.com/user/${profile.spotifyAuth.platformUserId}`
            }
        }
    }
}

export default async function Profile() {
    const stats = new StatsFM("igorwastaken");
    const now = await stats.listening();
    const last = await stats.lastListened();
    const profile = await stats.profile();
    console.log(profile)
    return NextResponse.json({
        profile,
        listening: {
            now,
            last
        },
        z_message: "Data provided by stats.fm"
    })
}
import { NextResponse } from "next/server";

export const runtime = "edge";

const {
    SPOTIFY_CLIENT_ID: client_id,
    SPOTIFY_CLIENT_SECRET: client_secret,
    SPOTIFY_REFRESH_TOKEN: refresh_token,
} = process.env;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const QUEUE_ENDPOINT = `https://api.spotify.com/v1/me/player/queue`;
const HISTORY_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played`;

export const getAccessToken = async () => {
    const params = new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }).toString();

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
    });

    if (!response.ok) {
        throw new Error('Failed to refresh access token');
    }

    return response.json();
};
const cache = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds

const getCachedData = (key) => {
    const cached = cache[key];
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    cache[key] = { data, timestamp: Date.now() };
};

const fetchSpotify = async (endpoint, access_token) => {
    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (response.status === 401) {
        console.error('Unauthorized: Invalid or expired access token');
    }
    if (response.status === 204) {
        // Spotify API returns 204 No Content if nothing is currently playing
        return null;
    }
    if (response.status === 429) {
        console.error('Rate limited: Too many requests to Spotify API');
    }
    if (response.status !== 200) {
        console.error(`Spotify API request failed with status ${response.status}`);
    }

    return response.json();
};
export const getProfile = async (access_token) => {
    return fetchSpotify('https://api.spotify.com/v1/me', access_token);
};
export const getTop = async (type, access_token) => {
    const cacheKey = `top_${type}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const data = await fetchSpotify(`https://api.spotify.com/v1/me/top/${type}`, access_token);
    setCachedData(cacheKey, data);

    return data;
};

export const getNowPlaying = async (access_token) => {
    return fetchSpotify(NOW_PLAYING_ENDPOINT, access_token);
};

export default async function handler(req, res) {
    const { access_token } = await getAccessToken();
    const [profile, artists, tracks, np] = await Promise.all([
        getProfile(access_token),
        getTop("artists", access_token),
        getTop("tracks", access_token),
        getNowPlaying(access_token)
    ])
    const song = await np;
    const isPlaying = np && np.is_playing;

    /* This should work */
    const songPlaying = isPlaying ? {
        title: song.item?.name,
        artist: song.item?.artists.map((_artist) => _artist.name).join(', '),
        album: song.item?.album.name,
        albumImageUrl: song.item?.album.images[0].url,
        songUrl: song.item?.external_urls.spotify,
        duration: song.item?.duration_ms,
        progress: song.progress_ms,
        preview: song.item?.preview_url,
        current: true
    } : {  };

    return NextResponse.json({
        profile: {
            name: profile.display_name,
            followers: profile.followers.total,
            images: profile.images,
            url: profile.external_urls.spotify,
        },
        listening: {
            isPlaying,
            now: songPlaying,
            // debug: song
        },
        top: {
            artists: artists.items.map((q) => ({
                name: q.name,
                avatar: q.images[0].url,
                url: q.external_urls.spotify,
            })),
            tracks: tracks.items.map((q) => ({
                album: q.album.name,
                artist: q.artists.map((_artist) => _artist.name).join(', '),
                albumImageUrl: q.album.images[0].url,
                title: q.name,
                url: q.external_urls.spotify,
            }))
        }
    })
}
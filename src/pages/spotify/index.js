import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/loading";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaSpotify, FaHeadphones, FaCompactDisc } from "react-icons/fa6";
import useSWR from "swr";
import Vibrant from 'node-vibrant'
import useTheme from "@/hooks/useTheme";
const fetcher = (url) => fetch(url).then((r) => r.json())
function ImageWithLoading({ src, alt }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            width="100"
            height="100"
            className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Skeleton Loader or Spinner */}
            <motion.div
              className="border-4 border-gray-200 border-t-transparent rounded-full animate-spin"
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
        <motion.img
          className={`rounded-lg ${isLoading ? 'opacity-0' : 'opacity-1'}`}
          width="100"
          height="100"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}

export default function Spotify() {
  const router = useRouter();
  const [a, setA] = useState(false);
  const [color, setColor] = useState("#FFFFFF")
  const [mutedColor, setMutedColor] = useState("#FFFFFF")
  const [lightMutedColor, setLightColor] = useState("#000000")
  const { data: spotify, mutate, isLoading: loading } = useSWR("/api/spotify/profile", fetcher, { revalidateOnFocus: true })
  const { theme } = useTheme();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Estado para o índice da música atual
  const [tracks, setTracks] = useState([]); // Estado para armazenar as músicas do momento

  useEffect(() => {
    const percentage = Math.floor(Math.random() * 100);
    if (percentage <= 10) {
      setA(true)
    } else {
      setA(false)
    }
    // alert(percentage)
  }, [])
  useEffect(function () {
    if (loading) return;
    if (!spotify.listening.isPlaying) return;
    async function getCol(songs) {
      const col = await Vibrant.from(songs).getPalette();

      setColor(col.Muted?.hex.toString())
      setMutedColor(col.DarkMuted?.getHex().toString());
      setLightColor(col.LightMuted?.getHex().toString())
    }
    getCol(spotify.listening.now?.albumImageUrl)
  }, [spotify])

  useEffect(() => {
    if (spotify && spotify.top && spotify.top.track) {
      const interval = setInterval(() => {
        setTracks(spotify.top.track);
        console.log(spotify.top.track)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [spotify]);
  useEffect(() => {
    if (!tracks || tracks.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
      mutate();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tracks]);

  return (<AnimatePresence>
    {loading ? (<Layout>
      <div className="h-dvh w-full flex justify-center items-center">
        <LoadingSpinner />
      </div>
    </Layout>) : (<Layout>
      <div className="p-5">
        <motion.button transition={{ type: "spring", duration: 1 }} initial={{ x: "20%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-20%", opacity: 0 }} className="flex items-center text-center gap-1" onClick={() => router.back()}>
          {a ? <FaSpotify className="font-bold text-xl m-2" /> : <FaArrowLeft className="font-bold" />}
          <p className="text-xl font-bold">Spotify</p>
        </motion.button>
        <div className="p-5">
          <div id="ProfileOverview" className="flex items-center gap-2 w-full">
            <img className="rounded-full min-w-12 w-18 max-w-32" src={spotify.profile.images[1].url} width="100" height="100" alt="Igor's Avatar" />
            <div className="flex flex-col">
              <p className="text-xl font-bold gap-1">{spotify.profile.name}</p>
              <p>{spotify.profile.followers} seguidores</p>
              <div className="flex gap-2">
                <button className="bg-green-500 hover:bg-green-700 text-white dark:text-gray-900 font-bold py-2 px-3 rounded-xl flex justify-center items-center text-center gap-2">
                  <FaSpotify className="text-lg" />
                  <Link href={spotify.profile.url}>Spotify</Link>
                </button>
              </div>
            </div>
          </div>
          <hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />
          <AnimatePresence mode="wait">
            {spotify.listening.isPlaying ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="overflow-hidden flex flex-col p-2 rounded-lg dark:bg-gray-800 dark:text-gray-100 bg-gray-100 text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <p className="p-2 flex items-center gap-1 text-lg font-bold">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <FaCompactDisc />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.span key={spotify.listening.now} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Ouvindo agora</motion.span>
                    </AnimatePresence>
                  </p>
                  <motion.div
                    className="overflow-hidden p-2 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  >
                    <ImageWithLoading src={spotify.listening.now.albumImageUrl} alt={spotify.listening.now.title} />
                    <div className="overflow-hidden w-full flex flex-col justify-center gap-1">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={spotify.listening.now.title} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ y: "-10%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "10%", opacity: 0 }} className="relative text-lg font-bold truncate">{spotify.listening.now.title}</motion.p>
                      </AnimatePresence>
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={spotify.listening.now.artist} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative text-md font-medium truncate">{spotify.listening.now.artist}</motion.p>
                      </AnimatePresence>
                      <progress
                        value={spotify.listening.now?.progress}
                        max={spotify.listening.now?.duration}
                        className={`w-full [&::-webkit-progress-bar]:rounded-lg h-2 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-500 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 [&::-webkit-progress-value]:opacity-1 [&::-moz-progress-bar]:transition-all [&::-moz-progress-bar]:duration-500 [&::-moz-progress-bar]:bg-slate-100`}
                      /*initial={{ width: 0 }}
                      animate={{ width: `${(spotify.listening.now?.progress / spotify.listening.now?.duration) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}*/
                      ></progress>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="overflow-hidden flex flex-col p-2 rounded-lg dark:bg-gray-800 dark:text-gray-100 bg-gray-100 text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <p className="p-2 flex items-center gap-1 text-lg font-bold">
                    <motion.div
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <FaCompactDisc />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.span key={spotify.listening.now} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Tocado recentemente</motion.span>
                    </AnimatePresence>
                  </p>
                  <motion.div
                    className="overflow-hidden p-2 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ImageWithLoading src={spotify.listening.last.albumImageUrl} alt={spotify.listening.last.title} />
                    <div className="overflow-hidden w-full flex flex-col justify-center gap-1">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={spotify.listening.last.title} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ y: "10%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-10%", opacity: 0 }} className="relative text-lg font-bold truncate">{spotify.listening.last.title}</motion.p>
                      </AnimatePresence>
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={spotify.listening.last.artist} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative text-md font-medium truncate">{spotify.listening.last.artist}</motion.p>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />
          <div id="Stats">
            <p className="text-lg font-bold">Estatísticas</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center overflow-hidden">
              <motion.li className="overflow-hidden w-full gap-2 justify-center items-center flex flex-col md:items-start p-4 rounded-lg text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800">
                <p className="text-xs">Músicas do momento</p>
                {tracks.length > 0 && (
                  <div className="w-full gap-2 flex justify-center items-center">
                    <ImageWithLoading src={tracks[currentTrackIndex].albumImageUrl} alt={tracks[currentTrackIndex].title} />
                    <div className="overflow-hidden w-full flex flex-col gap-0.5 justify-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tracks[currentTrackIndex].title}
                          transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                          initial={{ y: "10%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-10%", opacity: 0 }}
                          className="relative text-md md:text-lg font-bold truncate"
                        >
                          {tracks[currentTrackIndex].title}
                        </motion.p>
                      </AnimatePresence>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tracks[currentTrackIndex].artist}
                          transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative text-md font-medium truncate"
                        >
                          {tracks[currentTrackIndex].artist}
                        </motion.p>
                      </AnimatePresence>
                      <div className="flex">
                        <p className="flex gap-1 text-center items-center justify-center">
                          <FaCompactDisc />
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={tracks[currentTrackIndex].playCount}
                              transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              {tracks[currentTrackIndex].playCount}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.li>
            </ul>
          </div>
          {spotify?.top.artists.length > 0 ?? (<hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />)}
          {spotify?.top.artists.length > 0 ?? (<div id="TopArtists" className="my-3 flex flex-col justify-center gap-2 w-full">
            <p className="text-lg font-bold">Artistas mais escutado</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center overflow-hidden">
              {spotify?.top.artists.map((art) => (
                <motion.li viewport={{ once: true }} key={art.name} transition={{ type: 'spring', stiffness: 260, damping: 60 }} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={() => window.open(art.url)} className="p-2 flex items-center">
                  {/*<img className="rounded-full" style={{ objectFit: 'cover', width: 80, height: 80 }} src={art.avatar} alt={`${art.name}'s Avatar`} height="80" width="80" />*/}
                  <div className="rounded-full" style={{ objectFit: 'cover', width: 80, height: 80 }}>
                    <ImageWithLoading src={art.avatar} alt={art.name} />
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-lg font-medium">{art.name}</p>
                  </div>
                </motion.li>
              ))}
              {/*<li className="text-lg font-bold p-3">More {spotify?.top.artists.length-8}...</li>*/}
            </ul>
          </div>)}
          {spotify?.top.tracks.length > 0 ?? (<hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />)}
          {spotify?.top.tracks.length > 0 ?? (<div id="TopTracks" className="w-full my-3">
            <p className="text-lg font-extrabold">Top listened songs</p>
            <motion.ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-center">
              {spotify?.top.tracks.map((track) => (
                <motion.li viewport={{ once: true }} key={track.title} transition={{ type: 'spring', stiffness: 260, damping: 60 }} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1, transition: { duration: 1 } }} onClick={() => window.open(track.url)} className="p-2 flex items-center">
                  <img className="rounded" style={{ width: 80, height: 80 }} src={track.albumImageUrl} alt={`${track.title} cover`} height="80" width="80" />
                  <div className="flex flex-col p-2 gap-y-1 truncate ellipsis">
                    <p className="text-lg font-bold">{track.title}</p>
                    <p className="text-sm font-medium">{track.artist}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>)}
        </div>
      </div>
    </Layout>)}
    <style jsx>{`
  progress {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    appearance: none;
  }
  progress::-webkit-progress-bar {
    background-color: ${mutedColor} !important;
    border-radius: 4px;
  }
  progress::-webkit-progress-value {
    background-color: ${lightMutedColor} !important;
    border-radius: 4px;
    transition: width 0.5s ease-in-out;
  }
  progress::-moz-progress-bar {
    background-color: ${lightMutedColor} !important;
    border-radius: 4px;
    transition: width 0.5s ease-in-out;
  }
`}</style>
  </AnimatePresence>)
}

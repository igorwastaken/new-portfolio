import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/loading";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaSpotify, FaHeadphones, FaCompactDisc, FaArrowUp, FaAngleUp, FaAngleDown, FaCircle, FaBorderNone, FaAnglesUp } from "react-icons/fa6";
import { IoMdStats } from "react-icons/io";
import useSWR from "swr";
import Vibrant from 'node-vibrant/worker'
import useTheme from "@/hooks/useTheme";
import { Lrc } from "react-lrc";
const fetcher = (url) => fetch(url).then((r) => r.json())
/*const Line = styled.div<{ active: boolean }>`
  min-height: 10px;
  padding: 5px 20px;

  font-size: 16px;
  text-align: center;

  ${({ active }) => css`
    color: ${active ? 'green' : 'black'};
  `}
`;*/
export function parseSyncedLyrics(syncedLyrics) {
  const lines = syncedLyrics.split("\n"); // Divide por linhas
  return lines.map((line) => {
    const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\] (.+)$/); // Regex para capturar timestamp e conteúdo
    if (!match) return null; // Ignora linhas inválidas
    const [_, minutes, seconds, content] = match;
    const timestamp = parseFloat(minutes) * 60 * 1000 + parseFloat(seconds) * 1000; // Converte para ms
    return { timestamp, content };
  }).filter(Boolean); // Remove entradas nulas
}

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <img
            className={`rounded-lg ${isLoading ? 'opacity-0' : 'opacity-1'} object-cover`}
            width="100"
            height="100"
            src={src}
            alt={alt}
            loading="lazy"
            style={{
              width: "100",
              height: "100",
              objectFit: "cover"
            }}
            onLoad={() => setIsLoading(false)}
          />
        </motion.div>
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
  const { data: spotify, mutate, isLoading: loading } = useSWR("/api/v1/spotify/profile", fetcher, { revalidateOnFocus: true })
  const { data: queue, mutate: mutatequeue, isLoading: loadingqueue } = useSWR('/api/v1/spotify/queue', fetcher);
  const { data: lyrics, mutate: mutatelyrics, isLoading: loadinglyrics } = useSWR('/api/v1/lyrics', fetcher)
  const { theme } = useTheme();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Estado para o índice da música atual
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [tracks, setTracks] = useState([]); // Estado para armazenar as músicas do momento
  const [artists, setArtists] = useState([]);
  const [messagesArray, setMessageArray] = useState([])
  const [parsedLyrics, setLyrics] = useState("");
  const [localProgress, setLocalProgress] = useState(0); // Progresso local
  const [isPlaying, setIsPlaying] = useState(false); // Estado de reprodução
  const [ startTime, setStartTime ] = useState(0);
  useEffect(() => {
    if (!queue || !queue.listening.now.isPlaying) return;
  
    const initialProgress = queue.listening.now.progress; // Progresso inicial
    setStartTime(Date.now()); // Tempo de início
  
    setIsPlaying(queue.listening.now.isPlaying); // Atualiza o estado de reprodução
  
    const interval = setInterval(() => {
      if (!isPlaying) return; // Não atualiza se estiver pausado
      const elapsed = Date.now() - startTime; // Tempo decorrido
      setLocalProgress(initialProgress + elapsed); // Atualiza o progresso localmente
    }, 1000); // Atualiza a cada segundo
  
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, [queue]);
  
  // Atualize o estado de reprodução ao pausar ou reproduzir
  useEffect(() => {
    if (queue && queue.listening.now.isPlaying !== isPlaying) {
      setIsPlaying(queue.listening.now.isPlaying);
    }
  }, [queue]);
  useEffect(() => {
    if (!isPlaying) return; // Pausa o progresso
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLocalProgress(initialProgress + elapsed);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [isPlaying]);
  
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
    if (!queue.listening.now.isPlaying) return;
    async function getCol(songs) {
      const col = await Vibrant.from(songs).getPalette();

      setColor(col.Muted?.hex.toString())
      setMutedColor(col.DarkMuted?.getHex().toString());
      setLightColor(col.LightMuted?.getHex().toString())
    }
    getCol(queue.listening.now.song.image)
  }, [queue])
  /*useEffect(() => {
    async function setUser() {
      const req = await fetch("/api/v1/spotify/profile");
      if (!req.ok) return;
      const prof = await req.json();
      setProfile(prof);
      console.log(profile, queue)
      /*setSpotify({
        profile,
        ...queue
      })
    }
    setUser();
  }, [])*/
  useEffect(() => {
    if (spotify && spotify.profile && spotify.profile.top && spotify.profile.top.tracks) {
      const interval = setInterval(() => {
        setTracks(spotify.profile.top.tracks);
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [spotify]);
  useEffect(() => {
    if (spotify && spotify.profile && spotify.profile.top && spotify.profile.top.artists) {
      const interval = setInterval(() => {
        setArtists(spotify.profile.top.artists);
      }, 1000)
      return () => clearInterval(interval);
    }
  }, [spotify])

  useEffect(() => {
    if (!tracks || tracks.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
      setCurrentArtistIndex((prevIndex) => (prevIndex + 1) % artists.length);
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messagesArray.length)
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tracks]);
  useEffect(() => {
    if (loading) return;
    setLyrics(parseSyncedLyrics(lyrics.lyrics.syncedLyrics))
    const intervalId = setInterval(() => {
      mutate();
      mutatequeue();
      mutatelyrics();
    }, 5000)
    return () => clearInterval(intervalId);
  }, [tracks]);

  useEffect(() => {
    if (loading) return;
    if (!queue && !queue.listening) return;
    const messages = [
      queue.listening.now.isPlaying ? `Ouvindo agora em um ${queue.listening.now.device}` : `Por agora, a playlist está pausada.`,
      `Ouvi pela última vez ${queue.listening.last.song.name}`,
      (<a key="ref-1" href="https://stats.fm/igorwastaken" className="text-blue-600 dark:text-blue-300">stats.fm</a>),
      (<a key="ref-2" href="https://open.spotify.com/playlist/2BbTZ0WHEf7nkq5kH9WmXU" className="text-blue-600 dark:text-blue-300">playlist: metal</a>),
      (<a key="ref-3" href="https://open.spotify.com/playlist/4pUDvGQUfW4taF38cSPxWT" className="text-blue-600 dark:text-blue-300">playlist: rock</a>),
      (<a key="ref-4" href="https://open.spotify.com/playlist/58U2KDyKpg7fDz0tvWWshI" className="text-blue-600 dark:text-blue-300">playlist: rap</a>),
      (<a key="ref-5" href="https://open.spotify.com/playlist/5ahErdsTauk2uOSBzneWa8" className="text-blue-600 dark:text-blue-300">playlist: indie</a>),
      (<a key="ref-6" href="https://open.spotify.com/playlist/4Tl6mzWn9TQqCxYlmJSczu" className="text-blue-600 dark:text-blue-300">playlist: jazz</a>),
    ]
    setMessageArray(messages)
    console.log(messagesArray)
  }, [queue])
  const indicator = {
    'UP': (<FaAngleUp />),
    'DOWN': (<FaAngleDown />),
    'SAME': (<FaCircle />),
    'NEW': (<FaAnglesUp />),
    'NONE': (<></>)
  }
  return (<AnimatePresence>
    {loading || !spotify || !queue ? (<Layout>
      <div className="h-dvh w-full flex justify-center items-center">
        <LoadingSpinner />
      </div>
    </Layout>) : (<Layout className="p-5 w-full h-dvh flex flex-col md:justify-center md:items-center">
      <div className="w-full">
        <motion.button transition={{ type: "spring", duration: 1 }} initial={{ x: "20%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-20%", opacity: 0 }} className="flex items-center text-center gap-1" onClick={() => router.back()}>
          {a ? <FaSpotify className="font-bold text-xl m-2" /> : <FaArrowLeft className="font-bold" />}
          <p className="text-xl font-bold">Spotify</p>
        </motion.button>
        <div className="p-5">
          <div id="ProfileOverview" className="flex items-center gap-2 w-full">
            <img className="rounded-full min-w-12 w-18 max-w-32" src={spotify.profile.avatar} width="100" height="100" alt="Igor's Avatar" />
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold gap-1">{spotify.profile.name}</p>
              <AnimatePresence mode="wait">
                <motion.p transition={{ stiffness: 160, damping: 60 }} key={currentMessageIndex} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -5, opacity: 0 }} className="text-xs">{messagesArray[currentMessageIndex]}</motion.p>
              </AnimatePresence>
              <div className="flex gap-2">
                <button className="bg-green-500 hover:bg-green-700 text-white dark:text-gray-900 font-bold py-2 px-3 rounded-xl flex justify-center items-center text-center gap-2">
                  <FaSpotify className="text-lg" />
                  <Link href={spotify.profile.spotify.url}>Spotify</Link>
                </button>
              </div>
            </div>
          </div>
          <hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />
          <AnimatePresence mode="wait">
            {queue.listening.now.isPlaying ? (
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
                      <motion.span key={queue.listening.now} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Ouvindo agora</motion.span>
                    </AnimatePresence>
                  </p>
                  <motion.div
                    className="overflow-hidden p-2 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  >
                    <ImageWithLoading src={queue.listening.now.song.image} alt={queue.listening.now.title} />
                    <div className="overflow-hidden w-full flex flex-col justify-center gap-1">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={queue.listening.now.song.name} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ y: "-10%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "10%", opacity: 0 }} className="relative text-lg font-bold truncate">{queue.listening.now.song.name}</motion.p>
                      </AnimatePresence>
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={queue.listening.now.song.artists.map((_artist) => _artist.name).join(', ')} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative text-md font-medium truncate">{queue.listening.now.song.artists.map((_artist) => _artist.name).join(', ')}</motion.p>
                      </AnimatePresence>
                      <progress
                        value={localProgress}
                        max={queue.listening.now?.song.duration}
                        className={`w-full [&::-webkit-progress-bar]:rounded-lg h-2 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-500 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 [&::-webkit-progress-value]:opacity-1 [&::-moz-progress-bar]:transition-all [&::-moz-progress-bar]:duration-500 [&::-moz-progress-bar]:bg-slate-100`}
                      /*initial={{ width: 0 }}
                      animate={{ width: `${(spotify.listening.now?.progress / spotify.listening.now?.duration) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}*/
                      ></progress>
                    </div>
                  </motion.div>
                </motion.div>
                <Lrc
                  lrc={lyrics.lyrics.syncedLyrics}
                  currentMillisecond={localProgress}
                  lineRenderer={({ active, line: { content }, index }) => {
                    // Determine a faixa de linhas a serem mostradas
                    const activeIndex = lyrics.lyrics.syncedLyrics
                      .split("\n")
                      .findIndex((line) => line.includes(content));

                    //const activeIndex = parsedLyrics.findIndex((line) => line.timestamp === queue.listening.now?.progress);
                    const rangeStart = Math.max(activeIndex - 2, 0);
                    const rangeEnd = Math.min(activeIndex + 2,  lyrics.lyrics.syncedLyrics.length);


                    // Renderiza apenas as linhas dentro da faixa
                    if (index >= rangeStart && index <= rangeEnd) {
                      return (
                        <motion.p
                          key={index}
                          animate={active ? { scale: 1 } : { scale: 0.8, opacity: 0.5 }}
                          style={{
                            textAlign: "center",
                            fontWeight: active ? "bold" : "normal",
                            fontSize: active ? "1.2em" : "1em",
                            color: active ? "#1DB954" : "#888",
                          }}
                        >
                          {content}
                        </motion.p>
                      );
                    }
                    return null;
                  }}
                />

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
                      <motion.span key={queue.listening.now} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Tocado recentemente</motion.span>
                    </AnimatePresence>
                  </p>
                  <motion.div
                    className="overflow-hidden p-2 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ImageWithLoading src={queue.listening.last.song.image} alt={queue.listening.last.song.title} />
                    <div className="overflow-hidden w-full flex flex-col justify-center gap-1">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={queue.listening.last.song.name} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ y: "-10%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "10%", opacity: 0 }} className="relative text-lg font-bold truncate">{queue.listening.last.song.name}</motion.p>
                      </AnimatePresence>
                      <AnimatePresence initial={false} mode="wait">
                        <motion.p key={queue.listening.last.song.artists.map((_artist) => _artist.name).join(', ')} transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative text-md font-medium truncate">{queue.listening.last.song.artists.map((_artist) => _artist.name).join(', ')}</motion.p>
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
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center overflow-hidden gap-2">
              <motion.li
                viewport={{ once: true }}
                key={tracks.length > 0 ? tracks[0].title : "Unknown Track"}
                transition={{ type: 'spring', stiffness: 260, damping: 60 }}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden w-full gap-2 justify-center items-center flex flex-col md:items-start p-4 rounded-lg text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800">
                <p className="text-xs">Músicas do momento</p>
                {tracks.length !== 0 ? (
                  <div className="w-full gap-2 flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={tracks[currentTrackIndex].image}>
                        <ImageWithLoading src={tracks[currentTrackIndex].image} alt={tracks[currentTrackIndex].name} />
                      </motion.div>
                    </AnimatePresence>
                    <div className="overflow-hidden w-full flex flex-col gap-0.5 justify-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tracks[currentTrackIndex].name}
                          transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                          initial={{ y: "10%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-10%", opacity: 0 }}
                          className="relative text-md md:text-lg font-bold truncate"
                        >
                          {tracks[currentTrackIndex].name}
                        </motion.p>
                      </AnimatePresence>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tracks[currentTrackIndex].artists.map((_artist) => _artist.name).join(', ')}
                          transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative text-md font-medium truncate"
                        >
                          {tracks[currentTrackIndex].artists.map((_artist) => _artist.name).join(', ')}
                        </motion.p>
                      </AnimatePresence>
                      <div className="flex gap-2">
                        <p className="px-1 flex gap-1 text-center items-center justify-center">
                          <IoMdStats />
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={tracks[currentTrackIndex].position}
                              transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                              initial={{ y: "20%", opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: "-20%", opacity: 0 }}
                            >
                              {tracks[currentTrackIndex].position}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                        <p className="px-1 flex gap-1 text-center items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={tracks[currentTrackIndex].indicator}
                              transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -5, opacity: 0 }}
                            >
                              {indicator[tracks[currentTrackIndex].indicator]}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (<div></div>)}
              </motion.li>
              <motion.li
                viewport={{ once: true }}
                key={artists.length > 0 ? artists[0].name : "Unknown Artist"}
                transition={{ type: 'spring', stiffness: 260, damping: 60 }}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden w-full gap-2 justify-center items-center flex flex-col md:items-start p-4 rounded-lg text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800">
                <p className="text-xs">Artistas do momento</p>
                {artists.length !== 0 ? (
                  <div className="w-full gap-2 flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      <motion.div style={{ borderRadius: "100%", width: "100", height: "100" }} key={artists[currentArtistIndex].avatar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="">
                        <ImageWithLoading src={artists[currentArtistIndex].avatar} alt={artists[currentArtistIndex].name} />
                      </motion.div>
                    </AnimatePresence>
                    <div className="overflow-hidden w-full flex flex-col gap-0.5 justify-center">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={tracks[currentArtistIndex].title}
                          transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                          initial={{ y: "10%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-10%", opacity: 0 }}
                          className="relative text-md md:text-lg font-bold truncate"
                        >
                          {artists[currentArtistIndex].name}
                        </motion.p>
                      </AnimatePresence>
                      {/*<AnimatePresence mode="wait">
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
                      </AnimatePresence>*/}
                      <div className="flex gap-2">
                        <p className="px-1 flex gap-1 text-center items-center justify-center">
                          <IoMdStats />
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={artists[currentArtistIndex].position}
                              transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                              initial={{ y: "20%", opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: "-20%", opacity: 0 }}
                            >
                              {artists[currentArtistIndex].position}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                        <p className="px-1 flex gap-1 text-center items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={artists[currentArtistIndex].indicator}
                              transition={{ duration: 0.5, ease: 'easeInOut', stiffness: 100 }}
                              initial={{ y: 5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -5, opacity: 0 }}
                            >
                              {indicator[artists[currentArtistIndex].indicator]}
                            </motion.span>
                          </AnimatePresence>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (<div></div>)}
              </motion.li>
            </ul>
          </div>
          {/*{spotify?.top.artists.length > 0 ?? (<hr className="w-48 h-1 mx-auto my-4 bg-gray-900 dark:bg-gray-100 border-0 rounded md:my-10" />)}
          {spotify?.top.artists.length > 0 ?? (<div id="TopArtists" className="my-3 flex flex-col justify-center gap-2 w-full">
            <p className="text-lg font-bold">Artistas mais escutado</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center overflow-hidden">
              {spotify?.top.artists.map((art) => (
                <motion.li viewport={{ once: true }} key={art.name} transition={{ type: 'spring', stiffness: 260, damping: 60 }} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={() => window.open(art.url)} className="p-2 flex items-center">
                  {/*<img className="rounded-full" style={{ objectFit: 'cover', width: 80, height: 80 }} src={art.avatar} alt={`${art.name}'s Avatar`} height="80" width="80" />}
                  <div className="rounded-full" style={{ objectFit: 'cover', width: 80, height: 80 }}>
                    <ImageWithLoading src={art.avatar} alt={art.name} />
                  </div>
                  <div className="flex flex-col p-2">
                    <p className="text-lg font-medium">{art.name}</p>
                  </div>
                </motion.li>
              ))}
              {/*<li className="text-lg font-bold p-3">More {spotify?.top.artists.length-8}...</li>/}
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
          </div>)}*/}
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

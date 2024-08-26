import Layout from '@/components/Layout'
import useTheme from '@/hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { Poppins } from 'next/font/google'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaA, FaBook, FaBots, FaMoon, FaSpotify, FaSun } from 'react-icons/fa6';
export const poppins = Poppins({
    subsets: ['latin'],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})
export default function Home() {
    const [desenvolvo, setIt] = useState("...")
    const { theme, toggleTheme } = useTheme();
    useEffect(() => {
        const coisas = [
            "jogos",
            "sites",
            "bots",
            "projetos",
            "videos",
            "conteúdo",
            "diversão"
        ]
        const randomCoisas = coisas[Math.floor(Math.random() * coisas.length)];
        setIt(randomCoisas)
    }, [])
   /* useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const toggleTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
    };*/

    return (<Layout>
        <div className="fixed flex justify-end items-center w-full p-4">
            <AnimatePresence mode="wait">
                <motion.button
                   initial={{rotate:0}}
                   animate={{rotate:360}}
                   transition={{stiffness: 260, damping: 60}}
                   key={theme}
                   onClick={() => toggleTheme(theme==='light'?'dark':'light')}>
                    {theme==='dark'?<FaSun className="text-2xl"/>:<FaMoon className="text-2xl"/>}
                </motion.button>
            </AnimatePresence>
        </div>
        <div className="h-dvh w-full flex flex-col justify-center items-center gap-2">
            <p className="text-2xl font-bold">Olá, sou Igor.</p>
            <p>Eu desenvolvo {desenvolvo}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center items-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center text-center gap-2">
                    <FaBook className="text-lg" />
                    <Link href="/projetos">Projetos</Link>
                </button>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center text-center gap-2">
                    <FaSpotify className="text-lg" />
                    <Link href="/spotify">Spotify</Link>
                </button>
            </div>
            {/*<div className="flex gap-2 mt-4">
                    <button 
                        className={`py-2 px-4 rounded ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700 text-white'}`} 
                        onClick={() => toggleTheme('light')}
                    >
                        Light Theme
                    </button>
                    <button 
                        className={`py-2 px-4 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-300'}`} 
                        onClick={() => toggleTheme('dark')}
                    >
                        Dark Theme
                    </button>
                </div>*/}
        </div>
    </Layout>)
}
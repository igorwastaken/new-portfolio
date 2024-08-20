import Layout from '@/components/Layout'
import { Poppins } from 'next/font/google'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaA, FaBook, FaBots, FaSpotify } from 'react-icons/fa6';
export const poppins = Poppins({
    subsets: ['latin'],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})
export default function Home() {
    const [desenvolvo, setIt] = useState("...")

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
    return (<Layout>
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
        </div>
    </Layout>)
}
import Layout from "@/components/Layout"
import useTheme from "@/hooks/useTheme"
import { useEffect, useState } from "react"
import { Fa0, Fa4 } from "react-icons/fa6"

export default function FourZeroFour() {
    const [emojis, setEmoji] = useState("😭")
    const { theme, setTheme } = useTheme();
    useEffect(() => {
        const interval = setInterval(() => {
            const arrayEmoji = [
                '😭',
                '😱',
                '🥹',
                '😂',
                '🙂‍↕️',
                '🙄',
                '😒',
                '😞'
            ]
            const emoji = arrayEmoji[Math.floor(Math.random(0) * arrayEmoji.length)]
            setEmoji(emoji)
        }, 500)
        return () => clearInterval(interval)
    })
    return (
        <Layout>
            <div className="flex flex-col h-dvh w-full justify-center items-center">
                <p className="text-xl flex justify-center items-center"><Fa4/>{emojis}<Fa4/></p>
                <p className="text-lg font-bold flex">Four-Zero-Four</p>
                <p className="text-xl font-extrabold">Não pude encontrar essa página.</p>
            </div>
        </Layout>
    )
}
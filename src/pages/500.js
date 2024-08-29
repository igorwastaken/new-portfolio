import Layout from "@/components/Layout";
import useTheme from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { Fa0, Fa5 } from "react-icons/fa6";

export default function FiveZeroZero() {
    const { theme } = useTheme();
    
    return (
        <Layout>
            <div className="h-dvh w-full flex flex-col justify-center items-center">
                <p className="flex"><Fa5/><Fa0/><Fa0/></p>
                <p>Hmmm, algo deu errado</p>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center text-center gap-2" onClick={() => window.location.refresh()}>Tentar de novo?</button>
            </div>
        </Layout>
    )
}
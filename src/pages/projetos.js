import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { FaArrowLeft } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import Link from "next/link";
import useTheme from "@/hooks/useTheme";

const ProjectCard = ({ project }) => {
    const statuses = {
        0: "Ativo",
        1: "Descontinuado",
        2: "Pausado"
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 mb-4"
        >
            <Link href={project.link}>
                <img src={project.image} alt={project.name} className="w-full h-32 object-cover rounded-md" />
                <h2 className="text-xl font-bold mt-2 dark:text-white">{project.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{statuses[project.status]}</p>
                <p className="text-gray-700 dark:text-gray-200 mt-2">{project.description}</p>
            </Link>
        </motion.div>
    );
};


export default function Projetos() {
    const router = useRouter();
    /*  const statuses = {
          0: "Ativo",
          1: "Descontinuado",
          2: "Pausado"
      }*/
    const projetos = [
        {
            name: 'snipp.gg',
            status: 0,
            description: "Snipp is the best way to share your epic moments with the world.",
            image: "https://cdn.snipp.gg/banner.png",
            link: "https://snipp.gg/"
        },
        {
            name: "What The Floosh Game",
            status: 0,
            description: "\"WTFL\" é um jogo endless-runner criado no início de Outubro de 2023 por Igor.\nAtualmente o projeto foi pausado.",
            image: "/projetos/wtfl.png",
            link: "https://igorwastaken.itch.io/wtfl-game"
        },
        {
            name: "Bloggor",
            status: 1,
            description: "Bloggor foi um blog de variedades e entretenimento brasileiro, criado por Igor e Goldino.\nAtualmente o projeto foi pausado devido à problemas financeiros e falta de recursos para manter ativo.",
            image: "/projetos/bloggor.png",
            link: "#"
        },
        {
            name: "@notigorwastaken",
            status: 0,
            description: "Meu canal no YouTube.\nComédia, diversão, e tudo mais. O meu canal é focado em gameplays junto com meus amigos.",
            image: "/projetos/notigorwastaken.jpg",
            link: "https://www.youtube.com/@notigorwastaken"
        },
        {
            name: "BruteOne",
            status: 1,
            description: "The BruteOne Blog, where a small, dedicated team of cybersecurity experts provides cutting-edge research and accessible insights on the latest trends and data breaches, all driven by a passion for innovation and excellence in the ever-evolving world of cyber threats.",
            image: "/projetos/bruteone.png",
            link: "https://bruteone.com/"
        }
    ]
    const { theme } = useTheme();
    return (
        <Layout>
            <div className="p-5">
                <motion.button transition={{ type: "spring", duration: 1 }} initial={{ x: "20%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-20%", opacity: 0 }} className="flex items-center text-center gap-1" onClick={() => router.back()}>
                    <FaArrowLeft className="font-bold" />
                    <p className="text-xl font-bold">Projetos</p>
                </motion.button>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
                    {projetos.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            </div>
        </Layout>
    )
}

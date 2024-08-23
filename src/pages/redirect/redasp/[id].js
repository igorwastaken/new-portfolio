export async function getServerSideProps(context) {
    const data = [
        {
            url: 'https://www.educacao.sp.gov.br/educacao-financeira-educacao-inclui-disciplina-no-curriculo-e-1-milhao-de-alunos-vao-aprender-lidar-com-o-dinheiro-em-sala-de-aula/'
        },
        {
            url: 'https://www.cnnbrasil.com.br/economia/financas/educacao-financeira-na-infancia-entenda-qual-a-importancia-e-como-promover/'
        }
    ][context.params.id];

    if (!data) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        redirect: {
            destination: data.url,
            permanent: true
        }, // will be passed to the page component as props
    }
}
export const runtime = 'experimental-edge';

export default function REDASPREDIRECT() {
    return (
        <div>Você deveria ser redirecionado...</div>
    )
}

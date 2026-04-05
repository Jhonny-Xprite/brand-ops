import { GetServerSideProps } from 'next'

import OverviewWorkspace from '@/components/Overview/OverviewWorkspace'

interface OverviewAliasPageProps {
  projectId: string
}

export default function OverviewAliasPage({ projectId }: OverviewAliasPageProps) {
  return <OverviewWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<OverviewAliasPageProps> = async (context) => {
  const { id } = context.params as { id: string }

  if (!id) {
    return { notFound: true }
  }

  return {
    props: {
      projectId: id,
    },
  }
}

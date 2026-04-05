import { GetServerSideProps } from 'next'

import OverviewWorkspace from '@/components/Overview/OverviewWorkspace'

interface OverviewPageProps {
  projectId: string
}

export default function OverviewPage({ projectId }: OverviewPageProps) {
  return <OverviewWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<OverviewPageProps> = async (context) => {
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

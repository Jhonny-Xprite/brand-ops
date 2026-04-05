import { GetServerSideProps } from 'next'

import StrategyWorkspace from '@/components/ProjectDomain/StrategyWorkspace'

interface StrategyPageProps {
  projectId: string
}

export default function StrategyPage({ projectId }: StrategyPageProps) {
  return <StrategyWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<StrategyPageProps> = async (context) => {
  const { id } = context.params as { id: string }
  if (!id) return { notFound: true }
  return { props: { projectId: id } }
}

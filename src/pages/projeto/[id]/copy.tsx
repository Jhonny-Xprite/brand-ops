import { GetServerSideProps } from 'next'

import CopyMessagingWorkspace from '@/components/ProjectDomain/CopyMessagingWorkspace'

interface CopyPageProps {
  projectId: string
}

export default function CopyPage({ projectId }: CopyPageProps) {
  return <CopyMessagingWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<CopyPageProps> = async (context) => {
  const { id } = context.params as { id: string }
  if (!id) return { notFound: true }
  return { props: { projectId: id } }
}

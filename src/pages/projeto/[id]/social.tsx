import { GetServerSideProps } from 'next'

import SocialAssetsWorkspace from '@/components/ProjectDomain/SocialAssetsWorkspace'

interface SocialPageProps {
  projectId: string
}

export default function SocialPage({ projectId }: SocialPageProps) {
  return <SocialAssetsWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<SocialPageProps> = async (context) => {
  const { id } = context.params as { id: string }
  if (!id) return { notFound: true }
  return { props: { projectId: id } }
}

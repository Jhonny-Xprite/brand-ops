import { GetServerSideProps } from 'next'

import ProductionWorkspace from '@/components/ProjectDomain/ProductionWorkspace'

interface ProductionPageProps {
  projectId: string
}

export default function ProductionPage({ projectId }: ProductionPageProps) {
  return <ProductionWorkspace projectId={projectId} />
}

export const getServerSideProps: GetServerSideProps<ProductionPageProps> = async (context) => {
  const { id } = context.params as { id: string }
  if (!id) return { notFound: true }
  return { props: { projectId: id } }
}

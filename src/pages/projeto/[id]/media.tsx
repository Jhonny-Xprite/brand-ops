import { GetServerSideProps } from 'next'

import CreativeLibraryWorkspace from '@/components/CreativeLibrary/CreativeLibraryWorkspace'
import ProjectShellFrame from '@/components/Layout/ProjectShellFrame'

interface MediaPageProps {
  projectId: string
}

export default function MediaPage({ projectId }: MediaPageProps) {
  return (
    <ProjectShellFrame projectId={projectId} workspaceClassName="desktop-workspace min-w-0 px-0 py-0">
      <CreativeLibraryWorkspace
        projectId={projectId}
        scope="media"
        eyebrow="Operacao de midia por projeto"
        title="MEDIA LIBRARY"
        description="Biblioteca criativa exclusiva deste projeto com upload, organizacao de assets, metadata e versionamento no mesmo idioma visual da Creative Library global."
      />
    </ProjectShellFrame>
  )
}

export const getServerSideProps: GetServerSideProps<MediaPageProps> = async (context) => {
  const { id } = context.params as { id: string }

  if (!id) {
    return { notFound: true }
  }

  return {
    props: { projectId: id },
  }
}

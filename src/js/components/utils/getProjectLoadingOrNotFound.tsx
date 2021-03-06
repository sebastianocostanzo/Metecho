import React, { ReactElement } from 'react';

import ProjectNotFound from '@/components/projects/project404';
import { SpinnerWrapper } from '@/components/utils';
import { Project } from '@/store/projects/reducer';

export default ({
  project,
  projectSlug,
}: {
  project?: Project | null;
  projectSlug?: string;
}): ReactElement | false => {
  if (!project) {
    if (!projectSlug || project === null) {
      return <ProjectNotFound />;
    }
    // Fetching project from API
    return <SpinnerWrapper />;
  }
  return false;
};

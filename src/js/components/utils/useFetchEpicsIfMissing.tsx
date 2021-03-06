import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import { AppState, ThunkDispatch } from '@/store';
import { fetchObjects } from '@/store/actions';
import { selectEpicsByProject } from '@/store/epics/selectors';
import { Project } from '@/store/projects/reducer';
import { OBJECT_TYPES } from '@/utils/constants';

export default (
  project: Project | null | undefined,
  routeProps: RouteComponentProps,
) => {
  const dispatch = useDispatch<ThunkDispatch>();
  const selectEpicsWithProps = useCallback(selectEpicsByProject, []);
  const epics = useSelector((state: AppState) =>
    selectEpicsWithProps(state, routeProps),
  );

  useEffect(() => {
    if (project && !epics?.fetched) {
      // Fetch epics from API
      dispatch(
        fetchObjects({
          objectType: OBJECT_TYPES.EPIC,
          filters: { project: project.id },
          reset: true,
        }),
      );
    }
  }, [dispatch, project, epics?.fetched]);

  return { epics };
};

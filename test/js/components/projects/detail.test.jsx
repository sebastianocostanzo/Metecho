import React from 'react';
import { StaticRouter } from 'react-router-dom';

import ProjectDetail from '@/components/projects/detail';
import { fetchObject, fetchObjects } from '@/store/actions';
import routes from '@/utils/routes';

import { renderWithRedux, storeWithThunk } from './../../utils';

jest.mock('@/store/actions');

fetchObject.mockReturnValue(() => Promise.resolve({ type: 'TEST' }));
fetchObjects.mockReturnValue(() => Promise.resolve({ type: 'TEST' }));

afterEach(() => {
  fetchObject.mockClear();
  fetchObjects.mockClear();
});

const defaultState = {
  products: {
    products: [
      {
        id: 'p1',
        name: 'Product 1',
        slug: 'product-1',
        old_slugs: [],
        description: 'This is a test product.',
        repo_url: 'https://www.github.com/test/test-repo',
      },
    ],
    notFound: ['different-product'],
    next: null,
  },
  projects: {
    p1: {
      projects: [
        {
          id: 'project1',
          slug: 'project-1',
          name: 'Project 1',
          product: 'p1',
          description: 'Project Description',
          old_slugs: ['old-slug'],
        },
      ],
      next: null,
      notFound: ['different-project'],
      fetched: true,
    },
  },
  tasks: {
    project1: [
      {
        id: 'task1',
        name: 'Task 1',
        slug: 'task-1',
        old_slugs: [],
        project: 'project1',
        description: 'Task Description',
      },
    ],
  },
};

describe('<ProjectDetail/>', () => {
  const setup = options => {
    const defaults = {
      initialState: defaultState,
      productSlug: 'product-1',
      projectSlug: 'project-1',
    };
    const opts = Object.assign({}, defaults, options);
    const { initialState, productSlug, projectSlug } = opts;
    const context = {};
    const { getByText, getByTitle, queryByText } = renderWithRedux(
      <StaticRouter context={context}>
        <ProjectDetail match={{ params: { productSlug, projectSlug } }} />
      </StaticRouter>,
      initialState,
      storeWithThunk,
    );
    return { getByText, getByTitle, queryByText, context };
  };

  test('renders project detail and tasks list', () => {
    const { getByText, getByTitle } = setup();

    expect(getByTitle('Project 1')).toBeVisible();
    expect(getByText('Project Description')).toBeVisible();
    expect(getByText('Tasks for Project 1')).toBeVisible();
    expect(getByText('Task 1')).toBeVisible();
  });

  test('renders with form expanded if no tasks', () => {
    const { getByText, queryByText } = setup({
      initialState: {
        ...defaultState,
        tasks: { project1: [] },
      },
    });

    expect(getByText('Add a Task for Project 1')).toBeVisible();
    expect(queryByText('Tasks for Project 1')).toBeNull();
  });

  describe('project not found', () => {
    test('fetches project from API', () => {
      const { queryByText } = setup({ projectSlug: 'other-project' });

      expect(queryByText('Project 1')).toBeNull();
      expect(fetchObject).toHaveBeenCalledWith({
        filters: { product: 'p1', slug: 'other-project' },
        objectType: 'project',
      });
    });
  });

  describe('product does not exist', () => {
    test('renders <ProductNotFound />', () => {
      const { getByText, queryByText } = setup({
        productSlug: 'different-product',
      });

      expect(queryByText('Project 1')).toBeNull();
      expect(getByText('list of all products')).toBeVisible();
    });
  });

  describe('project does not exist', () => {
    test('renders <ProjectNotFound />', () => {
      const { getByText, queryByText } = setup({
        projectSlug: 'different-project',
      });

      expect(queryByText('Project 1')).toBeNull();
      expect(getByText('another project')).toBeVisible();
    });
  });

  describe('old project slug', () => {
    test('redirects to project_detail with new slug', () => {
      const { context } = setup({ projectSlug: 'old-slug' });

      expect(context.action).toEqual('REPLACE');
      expect(context.url).toEqual(
        routes.project_detail('product-1', 'project-1'),
      );
    });
  });

  describe('tasks have not been fetched', () => {
    test('fetches tasks from API', () => {
      const { queryByText } = setup({
        initialState: {
          ...defaultState,
          tasks: {},
        },
      });

      expect(queryByText('Tasks for Project 1')).toBeNull();
      expect(fetchObjects).toHaveBeenCalledWith({
        filters: { project: 'project1' },
        objectType: 'task',
      });
    });
  });
});

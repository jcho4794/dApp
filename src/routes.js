import * as Containers from './containers';

export const routes = [
  {
    component: Containers.LandingContainer,
    exact: true,
    path: '/'
  },
  {
    component: Containers.DeployContainer,
    path: '/contract/deploy'
  },
  {
    component: Containers.ExplorerContainer,
    path: '/contract/explorer'
  },
  {
    component: Containers.SimExchangeContainer,
    path: '/exchange'
  },
  {
    component: Containers.TestQueryContainer,
    path: '/test'
  }
];

export const redirects = [
{
  from: '/exchange/*',
  to: '/exchange'
}
];
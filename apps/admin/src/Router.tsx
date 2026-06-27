import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { getUser } from './apis/requests/auth.requests';
import DashboardLayout from './components/layouts/DashboardLayout';
import Catalog from './pages/dashboard/catalog';
import Cms from './pages/dashboard/cms';
import Contact from './pages/dashboard/contact';
import Outfits from './pages/dashboard/outfits';
import Overview from './pages/dashboard/overview';
import Reports from './pages/dashboard/reports';
import Reviews from './pages/dashboard/reviews';
import Settings from './pages/dashboard/settings';
import Users from './pages/dashboard/users';
import ErrorPage from './pages/error';
import ForgotPassword from './pages/forgot-password';
import Root from './pages';
import useZStore from './store';

const dashboardLoader = async () => {
  try {
    const res = await getUser();
    useZStore.getState().updateUser(res.data.user);
    return null;
  } catch (_) {
    return redirect('/');
  }
};

const router = createBrowserRouter([
  { path: '/', element: <Root />, errorElement: <ErrorPage /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    loader: dashboardLoader,
    children: [
      { index: true, element: <Overview /> },
      { path: 'users', element: <Users /> },
      { path: 'outfits', element: <Outfits /> },
      { path: 'reports', element: <Reports /> },
      { path: 'contact', element: <Contact /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'cms', element: <Cms /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OnboardingScreen } from '../screens/OnboardingScreen/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { BurgerTestScreen } from '../screens/BurgerTestScreen/BurgerTestScreen';
import { getStoredUser } from '@kartoffel/utils';

function requireUser(element: React.ReactElement): React.ReactElement {
  return getStoredUser() ? element : <Navigate to="/" replace />;
}

function redirectIfUser(element: React.ReactElement): React.ReactElement {
  return getStoredUser() ? <Navigate to="/home" replace /> : element;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: redirectIfUser(<OnboardingScreen />),
  },
  {
    path: '/home',
    element: requireUser(<HomeScreen />),
  },
  {
    path: '/burger-test',
    element: requireUser(<BurgerTestScreen />),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

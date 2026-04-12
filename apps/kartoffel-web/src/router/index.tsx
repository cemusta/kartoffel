import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OnboardingScreen } from '../screens/OnboardingScreen/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { BurgerTestScreen } from '../screens/BurgerTestScreen/BurgerTestScreen';
import { getStoredUser } from '@kartoffel/utils';

function RequireUser({ children }: { children: React.ReactElement }): React.ReactElement {
  return getStoredUser() ? children : <Navigate to="/" replace />;
}

function RedirectIfUser({ children }: { children: React.ReactElement }): React.ReactElement {
  return getStoredUser() ? <Navigate to="/home" replace /> : children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RedirectIfUser>
        <OnboardingScreen />
      </RedirectIfUser>
    ),
  },
  {
    path: '/home',
    element: (
      <RequireUser>
        <HomeScreen />
      </RequireUser>
    ),
  },
  {
    path: '/burger-test',
    element: (
      <RequireUser>
        <BurgerTestScreen />
      </RequireUser>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

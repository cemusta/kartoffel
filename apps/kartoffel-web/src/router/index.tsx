import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OnboardingScreen } from '../screens/OnboardingScreen/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { BurgerTestScreen } from '../screens/BurgerTestScreen/BurgerTestScreen';
import { StateSelectionScreen } from '../screens/StateSelectionScreen/StateSelectionScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { AllQuestionsScreen } from '../screens/AllQuestionsScreen/AllQuestionsScreen';
import { PracticeQuizScreen } from '../screens/PracticeQuizScreen/PracticeQuizScreen';
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
    path: '/onboarding/state',
    element: (
      <RequireUser>
        <StateSelectionScreen />
      </RequireUser>
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
    path: '/burger-test/all-questions',
    element: (
      <RequireUser>
        <AllQuestionsScreen />
      </RequireUser>
    ),
  },
  {
    path: '/burger-test/practice',
    element: (
      <RequireUser>
        <PracticeQuizScreen />
      </RequireUser>
    ),
  },
  {
    path: '/settings',
    element: (
      <RequireUser>
        <SettingsScreen />
      </RequireUser>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

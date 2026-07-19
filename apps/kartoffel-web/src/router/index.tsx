import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { OnboardingScreen } from '../screens/OnboardingScreen/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { BurgerTestScreen } from '../screens/BurgerTestScreen/BurgerTestScreen';
import { StateSelectionScreen } from '../screens/StateSelectionScreen/StateSelectionScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { AllQuestionsScreen } from '../screens/AllQuestionsScreen/AllQuestionsScreen';
import { PracticeQuizScreen } from '../screens/PracticeQuizScreen/PracticeQuizScreen';
import { RealExamIntroScreen } from '../screens/RealExamIntroScreen/RealExamIntroScreen';
import { RealExamQuizScreen } from '../screens/RealExamQuizScreen/RealExamQuizScreen';
import { ExamReviewScreen } from '../screens/ExamReviewScreen/ExamReviewScreen';
import { getStoredUser } from '@kartoffel/utils';

// Remounts RealExamQuizScreen when the seed param changes,
// so phase resets to 'intro' whenever a new exam code is generated.
function KeyedRealExamQuizScreen() {
  const { seed } = useParams<{ seed: string }>();
  return <RealExamQuizScreen key={seed} />;
}

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
    path: '/burger-test/real-exam',
    element: (
      <RequireUser>
        <RealExamIntroScreen />
      </RequireUser>
    ),
  },
  {
    path: '/burger-test/real-exam/:seed',
    element: (
      <RequireUser>
        <KeyedRealExamQuizScreen />
      </RequireUser>
    ),
  },
  {
    path: '/burger-test/real-exam/:seed/review',
    element: (
      <RequireUser>
        <ExamReviewScreen />
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

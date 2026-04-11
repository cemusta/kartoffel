import { useNavigate } from 'react-router-dom';
import { OnboardingPage } from '@kartoffel/ui-library';
import { useUser } from '../../hooks/useUser';

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { createAnonymousUser } = useUser();

  return (
    <OnboardingPage
      onContinueAnonymous={() => {
        createAnonymousUser();
        navigate('/home');
      }}
    />
  );
}

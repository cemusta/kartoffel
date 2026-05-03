import { useNavigate } from 'react-router-dom';
import { StateSelectionPage } from '@kartoffel/ui-library';
import { GERMAN_STATES } from '@kartoffel/utils';
import { useUser } from '../../hooks/useUser';

export function StateSelectionScreen() {
  const navigate = useNavigate();
  const { user, setGermanState } = useUser();

  return (
    <StateSelectionPage
      states={GERMAN_STATES}
      initialState={user?.germanState ?? null}
      onContinue={state => {
        setGermanState(state);
        navigate('/home');
      }}
      onBack={() => navigate(-1)}
    />
  );
}

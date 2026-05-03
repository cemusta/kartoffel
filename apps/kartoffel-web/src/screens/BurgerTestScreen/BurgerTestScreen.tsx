import { useNavigate } from 'react-router-dom';
import { BurgerTestPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';

export function BurgerTestScreen() {
  const navigate = useNavigate();
  const { user, germanState, clearUser, correctQuestionIds, incorrectQuestionIds } = useUser();

  function handleLogout() {
    clearUser();
    window.location.replace('/');
  }

  const allQuestions = questions.filter(
    q => q.type === 'general' || (q.type === 'state' && q.state === germanState)
  );
  const allQuestionIds = allQuestions.map(q => q.id);

  return (
    <BurgerTestPage
      onBack={() => navigate(-1)}
      username={user?.username ?? null}
      onLogout={handleLogout}
      onSettings={() => navigate('/settings')}
      onShowAllQuestions={() => navigate('/burger-test/all-questions')}
      onStartPractice={() => navigate('/burger-test/practice')}
      userState={germanState}
      allQuestionIds={allQuestionIds}
      correctQuestionIds={correctQuestionIds}
      incorrectQuestionIds={incorrectQuestionIds}
    />
  );
}

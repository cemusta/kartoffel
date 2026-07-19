import { useNavigate } from 'react-router-dom';
import { BurgerTestPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';

export function BurgerTestScreen() {
  const navigate = useNavigate();
  const { user, germanState, clearUser, questionAnswers } = useUser();

  function handleLogout() {
    clearUser();
    window.location.replace('/');
  }

  const allQuestions = questions.filter(
    q => q.type === 'general' || (q.type === 'state' && q.state === germanState)
  );
  const allQuestionIds = allQuestions.map(q => q.id);
  const stateQuestionIds = allQuestions.filter(q => q.type === 'state').map(q => q.id);

  return (
    <BurgerTestPage
      onBack={() => navigate(-1)}
      username={user?.username ?? null}
      onLogout={handleLogout}
      onSettings={() => navigate('/settings')}
      onShowAllQuestions={() => navigate('/einburger-test/all-questions')}
      onStartPractice={() => navigate('/einburger-test/practice')}
      onStartPracticeMode={() => navigate('/einburger-test/practice-mode')}
      onStartRealExam={() => navigate('/einburger-test/real-exam')}
      userState={germanState}
      allQuestionIds={allQuestionIds}
      questionAnswers={questionAnswers}
      stateQuestionIds={stateQuestionIds}
    />
  );
}

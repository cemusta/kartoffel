import { useNavigate } from 'react-router-dom';
import { AllQuestionsPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';

export function AllQuestionsScreen() {
  const navigate = useNavigate();
  const { germanState, showGoogleSearch } = useUser();

  const filteredQuestions = questions.filter(
    q => q.type === 'general' || (q.type === 'state' && q.state === germanState)
  );

  return <AllQuestionsPage questions={filteredQuestions} onBack={() => navigate(-1)} showGoogleSearch={showGoogleSearch} />;
}

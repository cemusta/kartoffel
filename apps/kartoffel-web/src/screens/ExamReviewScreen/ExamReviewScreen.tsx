import { useNavigate, useLocation } from 'react-router-dom';
import { ExamReviewPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';

interface LocationState {
  wrongIds?: number[];
  userAnswers?: Record<number, string>;
}

export function ExamReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const wrongIds = state?.wrongIds;
  const userAnswers = state?.userAnswers ?? {};

  if (!wrongIds || wrongIds.length === 0) {
    navigate('/einburger-test', { replace: true });
    return null;
  }

  const wrongIdSet = new Set(wrongIds);
  const wrongQuestions = questions.filter(q => wrongIdSet.has(q.id));

  return (
    <ExamReviewPage
      questions={wrongQuestions}
      userAnswers={userAnswers}
      onBack={() => navigate(-1)}
    />
  );
}

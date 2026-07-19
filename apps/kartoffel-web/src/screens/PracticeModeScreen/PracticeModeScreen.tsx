import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeModePage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { pickWorstQuestion } from '@kartoffel/utils';
import { useUser } from '../../hooks/useUser';

export function PracticeModeScreen() {
  const navigate = useNavigate();
  const { germanState, recordQuizAnswers, showGoogleSearch, keepTranslationsOn, questionAnswers } =
    useUser();

  const allQuestions = useMemo(
    () =>
      questions.filter(
        q => q.type === 'general' || (q.type === 'state' && q.state === germanState),
      ),
    [germanState],
  );

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    pickWorstQuestion(allQuestions, questionAnswers),
  );

  const handleAnswer = useCallback(
    (isCorrect: boolean, questionId: number) => {
      recordQuizAnswers(
        isCorrect ? [questionId] : [],
        isCorrect ? [] : [questionId],
      );

      // Build optimistically updated answers to avoid waiting for React state to propagate
      const MAX_HISTORY = 5;
      const prevHistory = questionAnswers[questionId] ?? [];
      const updatedAnswers: Record<number, boolean[]> = {
        ...questionAnswers,
        [questionId]: [...prevHistory, isCorrect].slice(-MAX_HISTORY),
      };

      setCurrentQuestion(pickWorstQuestion(allQuestions, updatedAnswers, questionId));
    },
    [allQuestions, questionAnswers, recordQuizAnswers],
  );

  return (
    <PracticeModePage
      key={currentQuestion.id}
      question={currentQuestion}
      onAnswer={handleAnswer}
      onBack={() => navigate(-1)}
      keepTranslationsOn={keepTranslationsOn}
      showGoogleSearch={showGoogleSearch}
      randomizeOptions={true}
      questionAnswers={questionAnswers}
    />
  );
}

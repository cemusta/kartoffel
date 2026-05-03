import { useNavigate } from 'react-router-dom';
import { QuizQuestionContainer, TopBar } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';
import styles from './AllQuestionsScreen.module.css';

export function AllQuestionsScreen() {
  const navigate = useNavigate();
  const { germanState } = useUser();

  const filteredQuestions = questions.filter(
    q => q.type === 'general' || (q.type === 'state' && q.state === germanState)
  );

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={() => navigate(-1)}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>All Questions</p>
          </>
        }
      />
      <div className={styles.content}>
        <QuizQuestionContainer
          questions={filteredQuestions}
          onComplete={() => navigate('/burger-test')}
        />
      </div>
    </div>
  );
}

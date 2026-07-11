import { QuizQuestionContainer } from '../QuizQuestionContainer';
import { TopBar } from '../TopBar';
import { QuestionData } from '../QuestionBody';
import styles from './PracticeQuizPage.module.css';

export interface PracticeQuizPageProps {
  onBack: () => void;
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  title?: string;
}

export function PracticeQuizPage({
  onBack,
  questions,
  passingScore,
  onComplete,
  title = 'Practice Quiz',
}: PracticeQuizPageProps) {
  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={onBack}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>{title}</p>
          </>
        }
      />
      <div className={styles.content}>
        <QuizQuestionContainer
          questions={questions}
          passingScore={passingScore}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}

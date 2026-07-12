import { HTMLAttributes } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import styles from './AllQuestionsContainer.module.css';

export interface AllQuestionsContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  showTranslation: boolean;
  randomizeOptions?: boolean;
}

export function AllQuestionsContainer({
  questions,
  showTranslation,
  randomizeOptions = false,
  className = '',
  ...props
}: AllQuestionsContainerProps) {
  return (
    <div className={`${styles.wrapper} ${className}`} {...props}>
      <div className={styles.scroll}>
        {questions.map((question, index) => (
          <div key={question.id} className={styles.item}>
            <span className={styles.index}>{index + 1}</span>
            <QuestionContainer
              question={question}
              selectedAnswer={null}
              isRevealed={true}
              showTranslation={showTranslation}
              onSelect={() => {}}
              randomizeOptions={randomizeOptions}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

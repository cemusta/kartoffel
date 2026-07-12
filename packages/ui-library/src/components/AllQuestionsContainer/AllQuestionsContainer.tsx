import { HTMLAttributes, MutableRefObject } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import styles from './AllQuestionsContainer.module.css';

export interface AllQuestionsContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  showTranslation: boolean;
  randomizeOptions?: boolean;
  questionRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
  showGoogleSearch?: boolean;
}

export function AllQuestionsContainer({
  questions,
  showTranslation,
  randomizeOptions = false,
  questionRefs,
  showGoogleSearch = true,
  className = '',
  ...props
}: AllQuestionsContainerProps) {
  return (
    <div className={`${styles.wrapper} ${className}`} {...props}>
      <div className={styles.scroll}>
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={styles.item}
            ref={el => {
              if (questionRefs) {
                questionRefs.current[index] = el;
              }
            }}
          >
            <QuestionContainer
              question={question}
              selectedAnswer={null}
              isRevealed={true}
              showTranslation={showTranslation}
              onSelect={() => {}}
              randomizeOptions={randomizeOptions}
              showGoogleSearch={showGoogleSearch}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

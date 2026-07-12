import { HTMLAttributes, useState } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import { TranslationToggle } from '../TranslationToggle';
import styles from './AllQuestionsContainer.module.css';

export interface AllQuestionsContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  randomizeOptions?: boolean;
}

export function AllQuestionsContainer({
  questions,
  randomizeOptions = false,
  className = '',
  ...props
}: AllQuestionsContainerProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  const hasAnyTranslation = questions.some(q => Boolean(q.translations?.en));

  return (
    <div className={`${styles.wrapper} ${className}`} {...props}>
      {hasAnyTranslation && (
        <div className={styles.header}>
          <TranslationToggle checked={showTranslation} onChange={setShowTranslation} />
        </div>
      )}
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

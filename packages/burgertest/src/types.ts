export type QuestionType = 'general' | 'state';

export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
    id: number;
    type: QuestionType;
    /** Present when type === 'state', e.g. "Bayern" */
    state?: string;
    /** PDF page number — useful for debugging, can be ignored by consumers */
    page: number;
    /** Question text in German */
    text: string;
    /** Answer options in German */
    options: Record<OptionKey, string>;
    /** Correct answer key — present for general questions and Berlin state questions */
    correctAnswer?: OptionKey;
    /**
     * Single image in the question body  → string  e.g. "images/q55.png"
     * Multiple images (one per option)   → string[] e.g. ["images/q21_1.png", …]
     */
    image?: string | string[];
    /** Copyright/attribution credit for the image (e.g. "© Bundesregierung/Engelbert Reineke") */
    imageText?: string;
    /**
     * Translations keyed by BCP 47 language tag (e.g. "en", "tr").
     * Added by the translate step (text + options) and enrich step (context).
     */
    translations?: {
        [lang: string]: {
            text: string;
            options: Record<OptionKey, string>;
            /** 1–3 sentence educational context note (added by enrich step) */
            context?: string;
        };
    };
}

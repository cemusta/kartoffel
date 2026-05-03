export type QuestionType = 'general' | 'state';

export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
    id: number;
    type: QuestionType;
    state?: string; // Only present when type === 'state'
    page: number;
    text: string;
    options: Record<OptionKey, string>;
    /** Required after merge step — sourced from external dataset. */
    correctAnswer?: OptionKey;
    /**
     * Single image in the question body  → string  e.g. "images/q55.png"
     * Multiple images (option images)    → string[] e.g. ["images/q21_1.png", …, "images/q21_4.png"]
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
            /** Fun fact / civic education context (added by enrich step). */
            context?: string;
        };
    };
}

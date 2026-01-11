export type Sentence = {
  sentence: string;
  translation: string;
};

export type SentenceFunction = {
  function: string;
  sentence: Sentence[];
};

export type SentenceGroup = {
  scenario: string;
  functions: SentenceFunction[];
};


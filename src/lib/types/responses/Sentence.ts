export type Sentence = {
  id: string;
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





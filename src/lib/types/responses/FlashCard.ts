import { Sentence } from "./Sentence";

export type FlashCard = {
  id: string;
  front: Front;
  back: Back;
  isReverse?: boolean;
  isReversed?: boolean;
  isRevision: boolean;
  note?: string;
};

export type Front = {
  wordOrChunk: string;
};

export type Back = {
  wordOrChunk: string;
  sentences?: Sentence[];
};

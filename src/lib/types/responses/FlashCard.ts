export type FlashCard = {
  id: string;
  front:Front;
  back: Back;
  isReverse: boolean;
  isRevision: boolean;
  relatedTo: string | null;
  scenario: string;
};

export type Front ={
    text: string;
}

export type Back ={
    text: string;
}
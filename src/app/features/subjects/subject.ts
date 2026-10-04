export interface Subject {
  name: string;
  score: number;
  contentFile: string;
  questions: Question[];
}

export interface Question {
  exam: string;
  id: number;
  contentFile: string;
  alternatives: string[];
  answer: string;
}

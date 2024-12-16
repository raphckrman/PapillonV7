export interface Evaluation {
  id: string;
  name: string;
  subjectId?: string;
  subjectName: string;
  description: string;
  timestamp: number;
  coefficient: number;
  levels: Array<String>;
  skills: Array<Skill>;
  teacher: string;
}

export interface Skill {
  coefficient: number;
  level: string;

  domainName: string;
  itemName: string;
}

export interface EvaluationsPerSubject {
  subjectName: string;
  evaluations: Array<Evaluation>;
}
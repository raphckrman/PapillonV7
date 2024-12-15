export interface TimetableClass {
  subject: string
  id: number | string
  type: "lesson" | "activity" | "detention" | "vacation"
  title: string,
  itemType?: string,
  startTimestamp: number
  endTimestamp: number
  additionalNotes?: string
  building?: string
  room?: string
  teacher?: string
  group?: string
  backgroundColor?: string,
  status?: TimetableClassStatus,
  statusText?: string,
  source?: string
  url?: string,
  ressourceID?: string,
  ressource?: {
    title?: string,
    description?: string,
    category?: ResourceContentCategory,
    files?: Array<{
      name: string,
      url: string
    }>
  }[]
}

export type Timetable = Array<TimetableClass>;

export enum TimetableClassStatus {
  CANCELED = "Annulé",
  MODIFIED = "Modifié",
  ONLINE = "En ligne",
  TEST = "ds",
}

export enum ResourceContentCategory {
  NONE = 0,
  /** Corresponds to "Cours" */
  LESSON = 1,
  /** Corresponds to "Correction" */
  CORRECTION = 2,
  /** Corresponds to "Devoir sur table" */
  DST = 3,
  /** Corresponds to "Interrogation orale" */
  ORAL_INTERROGATION = 4,
  /** Corresponds to "Travaux dirigés" */
  TD = 5,
  /** Corresponds to "Travaux pratiques" */
  TP = 6,
  /** Corresponds to "Évaluation de compétences" */
  EVALUATION_COMPETENCES = 7,
  /** Corresponds to "EPI" */
  EPI = 8,
  /** Corresponds to "AP" */
  AP = 9,
  /** Corresponds to "Visio" */
  VISIO = 12
};

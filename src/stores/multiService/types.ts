import {PapillonMultiServiceSpace, PrimaryAccount} from "@/stores/account/types";

export enum MultiServiceFeature {
  Grades = "grades",
  Timetable = "timetable",
  Homeworks = "homeworks",
  Attendance = "attendance",
  News = "news"
}

export interface MultiServiceSpace {
  accountLocalID: string
  name: string
  featuresServices: {
    [key in keyof typeof MultiServiceFeature]: PrimaryAccount | null
  }
}

export interface MultiServiceStore {
  enabled?: boolean
  spaces: MultiServiceSpace[]
  create: (space: MultiServiceSpace, linkAccount: PapillonMultiServiceSpace) => void
  remove: (localID: string) => void
  update: <A extends MultiServiceSpace, T extends keyof A = keyof A>(localID: string, key: T, value: A[T]) => void
  getFeatureAccount: (feature: keyof typeof MultiServiceFeature, spaceLocalID: string) => PrimaryAccount | null | undefined
}

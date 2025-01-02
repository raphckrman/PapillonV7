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
  image?: string
  // TODO use account ids instead: less disk space + supports changes
  /*
   Each feature returns its linked account localID
   */
  featuresServices: {
    [key in MultiServiceFeature]?: string
  }
  /*
   Each key represents an account id, and is associated to its instance and authentication objects
   */
  authentication: {
    [key: string]: {
      authentication: any
      instance: any
    } | undefined
  }
}

export interface MultiServiceStore {
  enabled?: boolean
  spaces: MultiServiceSpace[]
  create: (space: MultiServiceSpace, linkAccount: PapillonMultiServiceSpace) => void
  remove: (localID: string) => void
  update: <A extends MultiServiceSpace, T extends keyof A = keyof A>(localID: string, key: T, value: A[T]) => void
  toggleEnabledState: () => void
  setFeatureAccount: (spaceLocalID: string, feature: MultiServiceFeature, account: PrimaryAccount) => void
  getFeatureAccountId: (feature: MultiServiceFeature, spaceLocalID: string) => string | undefined
}

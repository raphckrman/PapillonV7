export interface Reel {
  id: string
  message: string
  timestamp: number
  /** base64 encoded */
  image: string
  grade: {
    value: string,
    outOf: string,
    coef: string,
  }
}
export interface Reel {
  id: string
  timestamp: number
  /** base64 encoded */
  image: string
  imagewithouteffect: string

  grade: {
    value: string,
    outOf: string,
    coef: string,
  }
}
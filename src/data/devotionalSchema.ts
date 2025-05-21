export type Devotional = {
  _id: string
  date: string
  title: string
  commentary: string
  imageUrl: string
  further_study: string
  prayer: string
  devotional: string
  word_of_day: string
  scripture_of_day: string
  question_of_day: string[]
  announcements: string
  bible_in_one_year: string
  status: string
  createdAt: string
  updatedAt: string
}

export type DevotionalResponse = {
  status: boolean
  data: Devotional[]
}

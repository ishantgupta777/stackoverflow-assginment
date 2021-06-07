export interface Question {
  title: string,
  link: string,
  question_id: number,
  creation_date: number,
  body: string,
  owner: {
    user_id: number,
    user_type: string,
    profile_image: string,
    display_name: string,
    link: string
  },
}
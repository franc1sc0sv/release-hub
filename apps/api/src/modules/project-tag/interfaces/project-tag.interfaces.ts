export interface IProjectTag {
  id: string
  projectId: string
  name: string
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ICreateProjectTagData {
  projectId: string
  name: string
  color: string | null
}

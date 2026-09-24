/** Todoist API v1 shapes - only the fields the tests use. */

export interface Page<T> {
  results: T[];
  next_cursor: string | null;
}

export interface Due {
  date: string;
  string: string;
  lang: string;
  is_recurring: boolean;
  timezone: string | null;
  datetime?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  is_deleted: boolean;
  is_archived: boolean;
  inbox_project?: boolean;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  is_favorite?: boolean;
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'parent_id'>>;

export interface Task {
  id: string;
  content: string;
  description: string;
  project_id: string;
  section_id: string | null;
  parent_id: string | null;
  labels: string[];
  priority: number;
  due: Due | null;
  checked: boolean;
  is_deleted: boolean;
  note_count: number;
}

export interface CreateTaskInput {
  content: string;
  description?: string;
  project_id?: string;
  parent_id?: string;
  labels?: string[];
  /** 1 (normal) .. 4 (urgent) */
  priority?: number;
  due_string?: string;
  due_date?: string;
  due_lang?: string;
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'project_id' | 'parent_id'>>;

export interface TaskFilter {
  project_id?: string;
  parent_id?: string;
  label?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  order: number;
  is_favorite: boolean;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  is_favorite?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  posted_at: string;
  is_deleted: boolean;
  /** The task the comment belongs to - the response calls it `item_id`, the request `task_id`. */
  item_id?: string | null;
  project_id?: string | null;
}

export interface CreateCommentInput {
  content: string;
  task_id?: string;
  project_id?: string;
}

/** The API also returns the account token here - UserClient strips it. */
export interface User {
  id: string;
  inbox_project_id: string;
  is_premium: boolean;
  tz_info: { timezone: string; gmt_string: string; is_dst: number };
}

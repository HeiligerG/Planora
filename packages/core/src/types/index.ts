export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 1 | 2 | 3;
}
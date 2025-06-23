export interface Link {
  id: string;
  title: string;
  description: string;
  url: string;
  icon?: string;
}

export interface Pdf {
  id: string;
  title: string;
  url: string;
  size?: string;
  added?: string;
}

export interface News {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  date?: string;
  image?: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date?: string;
}

export interface GroupResource {
  title: string;
  url: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  resources?: GroupResource[];
  joinLink?: string;
}

export interface User {
  _id: string;
  username: string;
}

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: 'image' | 'video' | 'article' | 'audio';
  tags: string[];
  createdAt: string;
}


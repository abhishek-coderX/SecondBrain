export type ContentType = "youtube" | "twitter" | "article" | "thought";

export interface TagType {
  _id: string;
  name: string;
}

export interface Content {
  _id: string;
  title: string;
  link?: string;
  type: ContentType;
  tags: TagType[];
  description?: string;
  createdAt: string;
  userId: {
    username: string;
  };
  thumbnail?: string;
  duration?: string;
}
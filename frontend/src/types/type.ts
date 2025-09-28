export type ContentType = "youtube" | "twitter" | "article";

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: ContentType;
  tags: string[];
  description?: string;
  createdAt: string;
  userId: {
    username: string;
  };
  thumbnail?: string;
}
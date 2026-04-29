export type UserPublic = {
  id: string;
  email: string;
  role: "user" | "admin";
  displayName: string | null;
  bio: string | null;
  skillsOffered: string[];
  skillsNeeded: string[];
  createdAt: string;
  updatedAt: string;
};

export type Listing = {
  id: string;
  sellerId: string;
  seller: { id: string; email: string; displayName: string | null };
  title: string;
  description: string;
  category: "item" | "skill";
  skillSubtype?: "offer" | "request" | null;
  status: "available" | "sold" | "swapped";
  moderationStatus: "pending" | "approved" | "rejected";
  flagged: boolean;
  flaggedReason: string | null;
  createdAt: string;
  updatedAt: string;
};

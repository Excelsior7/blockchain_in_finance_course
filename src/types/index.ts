export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  email?: string;
  completedCourses: number[];
  walletAddress: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  txHash?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  completeCourse: (courseId: number, txHash: string) => void;
} 
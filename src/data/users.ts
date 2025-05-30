import { User } from '../types';

export const users: User[] = [
  {
    id: 1,
    username: 'alice',
    password: 'password123',
    name: 'Alice Martin',
    completedCourses: [1, 3],
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  },
  {
    id: 2,
    username: 'bob',
    password: 'password123',
    name: 'Bob Dupont',
    completedCourses: [2],
    walletAddress: '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
  },
  {
    id: 3,
    username: 'charlie',
    password: 'password123',
    name: 'Charlie Dubois',
    completedCourses: [],
    walletAddress: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
  },
]; 
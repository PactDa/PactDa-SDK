import type { Agreement, User } from '@/types';

export const mockAgreements: Agreement[] = [
  {
    id: '1',
    title: 'Rock Paper Scissors Tournament',
    description: 'Best of 5 rounds between two players',
    status: 'active',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    title: 'Poker Game - Texas Hold\'em',
    description: 'Single table tournament with $100 buy-in',
    status: 'completed',
    createdAt: new Date('2024-01-14T15:45:00'),
    updatedAt: new Date('2024-01-14T18:20:00')
  },
  {
    id: '3',
    title: 'Chess Match',
    description: 'Standard 10-minute blitz game',
    status: 'active',
    createdAt: new Date('2024-01-14T09:15:00'),
    updatedAt: new Date('2024-01-14T09:15:00')
  },
  {
    id: '4',
    title: 'Trivia Contest',
    description: 'General knowledge questions - 20 rounds',
    status: 'disputed',
    createdAt: new Date('2024-01-13T14:00:00'),
    updatedAt: new Date('2024-01-13T16:30:00')
  },
  {
    id: '5',
    title: 'Fantasy Football League',
    description: 'Season-long competition with weekly matchups',
    status: 'draft',
    createdAt: new Date('2024-01-12T11:20:00'),
    updatedAt: new Date('2024-01-12T11:20:00')
  }
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'user3',
    email: 'alice.wilson@example.com',
    name: 'Alice Wilson',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08')
  }
];
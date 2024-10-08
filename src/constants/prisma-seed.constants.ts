import { Prisma } from '@prisma/client';

type Comments = Pick<Prisma.CommentCreateInput, 'content'>;

export const users: Prisma.UserCreateInput[] = [
  {
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: 'hashedpassword123',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2024-08-22T08:00:00Z'),
  },
  {
    username: 'jane_doe',
    email: 'jane.doe@example.com',
    password: 'hashedpassword456',
    firstName: 'Jane',
    lastName: 'Doe',
    createdAt: new Date('2024-08-22T09:00:00Z'),
  },
];

export const tags: Prisma.TagCreateInput[] = [
  {
    name: 'Js',
  },
];

export const comments: Comments[] = [
  {
    content: 'Nqkuv komentar',
  },
  {
    content: 'Oshte Nqkuv komentar',
  },
];

import { getErrorMessage, validateSchema, wait } from '@/lib/utils';
import { CommentRepo } from '@/repository/comment.repo';
import { UserRepo } from '@/repository/user.repo';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import { CreateCommentSchema } from '@/resolvers/comment.resolver';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const validatedFields = validateSchema(CreateCommentSchema, body);

  if ('error' in validatedFields) {
    return NextResponse.json(
      { error: validatedFields.error },
      { status: 400 } // 400 Bad Request
    );
  }

  const { content, postId } = validatedFields.data;

  try {
    const trimContent = content.trim();
    if (!trimContent) {
      return NextResponse.json(
        { error: 'Cannot create comment with empty text' },
        { status: 400 } // 400 Bad Request
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.sub) {
      return NextResponse.json(
        { error: 'Authentication required: Please log in to post a comment' },
        { status: 401 } // 401 Unauthorized
      );
    }

    const user = await UserRepo.findUnique({
      where: { id: session.user.sub },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 } // 404 Not Found
      );
    }

    const newComment = await CommentRepo.create({
      data: {
        content: trimContent,
        author: {
          connect: { id: user.id },
        },
        post: {
          connect: { id: postId },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 }); // 201 Created
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error creating a comment:', message); // Логиране на грешката за по-добро дебъгване
    return NextResponse.json(
      { error: 'Internal server error: ' + message },
      { status: 500 } // 500 Internal Server Error
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json(
      { error: 'Missing parameter: postId is required to fetch comments' },
      { status: 400 } // 400 Bad Request
    );
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.sub) {
    return NextResponse.json(
      { error: 'Authentication required: Please log in to post a comment' },
      { status: 401 } // 401 Unauthorized
    );
  }

  try {
    const comments = await CommentRepo.findMany({
      where: {
        AND: {
          postId,
          parentId: null,
        },
      },
      include: {
        replies: true,
        author: true,
        likes: {
          where: {
            authorId: session.user.sub,
          },
        },
        disLikes: {
          where: {
            authorId: session.user.sub,
          },
        },
      },
    });
    const commentsCount = await CommentRepo.count(postId);

    return NextResponse.json({ comments, commentsCount }, { status: 200 }); // 200 OK
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error fetching comments:', message); // Логиране на грешката за по-добро дебъгване
    return NextResponse.json(
      { error: 'Failed to fetch comments: ' + message },
      { status: 500 } // 500 Internal Server Error
    );
  }
}

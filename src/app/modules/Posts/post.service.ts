import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import prisma from '../../../shared/prisma';

const createPost = async (
  userId: string,
  { description, images, audio }: { description: string; images?: string | null; audio?: string | null }
) => {
    return await prisma.post.create({
      data: { userId, description, images: images || null, audio: audio || null },
    });
  };

  const getAllPosts = async () => {
    const posts = await prisma.post.findMany();
    
    if (posts.length === 0) {
       return [];
    }

    return posts;
};

const getPostById = async (postId: string) => {
  console.log({postId});
  const post = await prisma.post.findUnique({ where: { id: postId } });
  return post;
};



//todo check and active the update functionalities
const updatePost = async (
  userId: string,
  postId: string,
  data: Partial<{ description: string; images?: string | null; audio?: string | null }>
) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (existingPost.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this post'
    );
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      description: data.description ?? existingPost.description,
      images: data.images ?? existingPost.images,
      audio: data.audio ?? existingPost.audio,
    },
  });

  return updatedPost;
};

const deletePost = async (userId: string, postId: string) => {
  const [user, existingPost] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.post.findUnique({
      where: { id: postId },
    }),
  ]);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!existingPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (existingPost.userId !== userId && user.role !== 'ADMIN') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this post'
    );
  }

  const result = await prisma.post.delete({
    where: { id: postId },
  });

  return result;
};


export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};

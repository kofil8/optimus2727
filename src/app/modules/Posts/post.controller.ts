import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  const userId = req.user.id;

  const files = req.files as {
    images?: Express.Multer.File[];
    audio?: Express.Multer.File[];
  };

  const imagePaths =
    files?.images?.map(
      (file) => `${config.backend_image_url}/${file.filename}`
    ) || [];
  const audioPaths =
    files?.audio?.map(
      (file) => `${config.backend_image_url}/${file.filename}`
    ) || [];
  
  console.log({imagePaths, audioPaths});

  const postData = {
    description,
    images: imagePaths.length > 0 ? imagePaths[0] : null,
    audio: audioPaths.length > 0 ? audioPaths[0] : null,
  };

  const result = await PostService.createPost(
    userId,
    postData
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await PostService.getAllPosts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts fetched successfully',
    data: posts,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Post ID is required');
  }

  const post = await PostService.getPostById(postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched successfully',
    data: post,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = (req.user as { id: string }).id;

  const { description } = req.body;

  const files = req.files as {
    images?: Express.Multer.File[];
    audio?: Express.Multer.File[];
  };
  console.log(files);

  const imagePaths =
    files?.images?.map(
      (file) => `${config.backend_image_url}/${file.filename}`
    ) || [];
  const audioPaths =
    files?.audio?.map(
      (file) => `${config.backend_image_url}/${file.filename}`
    ) || [];

  const postData: any = {};

  if (description) {
    postData.description = description;
  }

  if (imagePaths.length > 0) {
    postData.images = imagePaths[0];
  }

  if (audioPaths.length > 0) {
    postData.audio = audioPaths[0];
  }
  if (Object.keys(postData).length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'At least one field (description, images, or audio) must be provided for update'
    );
  }

  const result = await PostService.updatePost(userId, postId, postData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = (req.user as { id: string }).id;

  const result = await PostService.deletePost(userId, postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});


export const PostController = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};

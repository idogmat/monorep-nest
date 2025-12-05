import { Prisma } from "../../../../../content/prisma/generated/content-client"

export const urlsMapping = (urls) => {
  return {
    id: urls?.id,
    createdAt: urls?.createdAt,
    updatedAt: urls?.updatedAt,
    deletedAt: urls?.deletedAt,
    fileName: urls?.fileName,
    fileUrl: urls?.fileUrl,
    postId: urls?.postId
  }
}

export const likesMapping = (like) => {
  return {
    id: like?.id,
    createdAt: like?.createdAt,
    updatedAt: like?.updatedAt,
    deletedAt: like?.deletedAt,
    postId: like?.postId,
    userId: like?.userId
  }
}

export const commentsMapping = (comment) => {
  return {
    id: comment?.id,
    createdAt: comment?.createdAt,
    updatedAt: comment?.updatedAt,
    deletedAt: comment?.deletedAt,
    message: comment?.message,
    postId: comment?.postId,
    userId: comment?.userId
  }
}

type PostWithIncludes = Prisma.PostGetPayload<{
  include: { urls: true, comments: true, likes: true }
}>;


export const outputMapper = (post: PostWithIncludes) => {
  return {
    id: post.id,
    userId: post.userId,
    createdAt: post.createdAt?.toString(),
    updatedAt: post.updatedAt?.toString(),
    deletedAt: post.deletedAt?.toString(),
    title: post.title,
    published: post.published,
    banned: post.banned,
    photoUploadStatus: post.photoUploadStatus,
    urls: post?.urls?.map(urlsMapping) || [],
    comments: post?.comments?.map(commentsMapping) || []
  };
};
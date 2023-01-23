import express from 'express'
import { model } from 'mongoose'
import posts from './model.js'
import createHttpError from 'http-errors'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const postsRouter = express.Router()

const postCoverPhoto = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'LinkedIn',
    },
  }),
}).single('postPhoto')

//Add a new post
postsRouter.post('/', async (request, response, next) => {
  try {
    const newPost = new posts(request.body)
    const { _id } = await newPost.save()
    response.status(200).send({ _id })
  } catch (error) {
    next(error)
  }
})

//Get all posts
postsRouter.get('/', async (request, response, next) => {
  try {
    const getPosts = await posts.find({})
    response.status(200).send(getPosts)
  } catch (err) {
    err
  }
})

//Get post by ID
postsRouter.get('/:postID', async (request, response, next) => {
  try {
    const getPost = await posts.findById(request.params.postID)

    if (getPost) {
      response.status(200).send(getPost)
    } else {
      next(
        createHttpError(
          404,
          `Unable to find post with ID ${request.params.postID}`,
        ),
      )
    }
  } catch (err) {
    next(err)
  }
})

//Edit a post
postsRouter.put('/:postID', async (request, response, next) => {
  try {
    const post = await posts.findByIdAndUpdate(
      request.params.postID,
      request.body,
      { new: true },
    )
    response.status(200).send(post)
  } catch (error) {
    next(err)
  }
})

//Delete a post
postsRouter.delete('/:postID', async (request, response, next) => {
  try {
    const post = await posts.findByIdAndDelete(request.params.postID)

    if (post) {
      response.status(204).send()
    } else {
      next(
        createHttpError(
          404,
          `There was no post with the ID ${request.params.postID}. Nothing has been deleted.`,
        ),
      )
    }
  } catch (err) {
    next(err)
  }
})

//Upload an image and attach it to a post
postsRouter.post(
  '/:postID/uploadPostImage',
  postCoverPhoto,
  async (request, response, next) => {
    try {
      const url = request.file.path

      const post = await posts.findByIdAndUpdate(request.params.postID, {
        image: url,
      })
      response.status(200).send('Image uploaded')
    } catch (err) {
      next(err)
    }
  },
)

export default postsRouter

import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import q2m from "query-to-mongo";
import { getPdfReadableStream } from "./pdfTools.js";
import { pipeline } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "build-week-4-linkedin-project",
    },
  }),
}).single("userPicture");

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);

    //we need to verify if the username is unique

    const users = await UsersModel.find();

    if (users !== []) {
      const checkUsername = users.findIndex(
        (user) =>
          user.username.toLowerCase() === req.body.username.toLowerCase()
      );

      if (checkUsername === -1) {
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
      } else {
        next(
          createHttpError(
            400,
            `Please select another username, this one is already taken`
          )
        );
      }
    } else {
      console.log("else block with users = []");
      const { _id } = await newUser.save();
      res.status(201).send({ _id });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await UsersModel.countDocuments(mongoQuery.criteria);
    console.log("total", total);
    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .sort(mongoQuery.sort)
      .skip(mongoQuery.skip)
      .limit(mongoQuery.limit);

    res.send({
      links: mongoQuery.links("http://localhost:3001/users", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      users,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    if (req.body.username) {
      const userAlreadyExists = await UsersModel.findOne({
        username: req.body.username,
      });

      if (userAlreadyExists) {
        next(
          createHttpError(
            400,
            `There's already a user with this username. Please select another username.`
          )
        );
      } else {
        const updatedUser = await UsersModel.findByIdAndUpdate(
          req.params.userId,
          req.body,
          { new: true, runValidators: true }
        );
        if (updatedUser) {
          res.send(updatedUser);
        } else {
          next(
            createHttpError(404, `User with id ${req.params.userId} not found`)
          );
        }
      }
    } else {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found`)
        );
      }
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/:userId/picture",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      //we get from req.body the picture we want to upload
      console.log(req.file.path);
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/profile/:userId/CV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=test.pdf");

    const user = await UsersModel.findById(req.params.userId);

    if (user) {
      const source = await getPdfReadableStream(user, req.params.userId);

      const destination = res;

      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;

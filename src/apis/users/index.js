import e from "express";
import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import experienceModel from "../experiences/model.js";
import q2m from "query-to-mongo";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);

    //we need to verify if the username is unique

    const users = await UsersModel.find();

    if (users !== []) {
      const checkUsername = users.findIndex((user) => user.username.toLowerCase() === req.body.username.toLowerCase());

      if (checkUsername === -1) {
        const { _id } = await newUser.save();
        res.status(201).send({ _id });
      } else {
        next(createHttpError(400, `Please select another username, this one is already taken`));
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
    const users = await UsersModel.find(mongoQuery.criteria, mongoQuery.options.fields).sort(mongoQuery.sort).skip(mongoQuery.skip).limit(mongoQuery.limit).populate({ path: "experience" });

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
    const user = await UsersModel.findById(req.params.userId).populate({ path: "experience" });
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
        next(createHttpError(400, `There's already a user with this username. Please select another username.`));
      } else {
        const updatedUser = await UsersModel.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true });
        if (updatedUser) {
          res.send(updatedUser);
        } else {
          next(createHttpError(404, `User with id ${req.params.userId} not found`));
        }
      }
    } else {
      const updatedUser = await UsersModel.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true });
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(createHttpError(404, `User with id ${req.params.userId} not found`));
      }
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:userId/picture", async (req, res, next) => {
  try {
    //we get from req.body the picture we want to upload
    const updatedUser = await UsersModel.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true });
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/profile/:userId/CV", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

//----------------*EXPERIENCES*-------------------------------------------

usersRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const newExperience = new experienceModel(req.body);
    await newExperience.save();

    const userID = newExperience._id;

    console.log(newExperience._id);
    const relatedUser = await UsersModel.findByIdAndUpdate(req.params.userId, { $push: { experience: userID.toString() } }, { new: true, runValidators: true });
    await relatedUser.save();
    res.status(200).send(newExperience);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const Experiences = await experienceModel.find();
    res.status(200).send(Experiences);
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const expId = req.params.expId;
    const experience = await experienceModel.findById(expId);
    res.status(200).send(experience);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const expId = req.params.expId;

    const editedExperience = await experienceModel.findByIdAndUpdate(expId, req.body, { new: true, runValidators: true });
    res.status(200).send(editedExperience);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId/experiences/:expId", async (req, res, next) => {
  try {
    const expId = req.params.expId;
    const expToDelete = await experienceModel.findByIdAndDelete(expId);
    res.status(200).send({ status: `Experience with ID ${expId} was successfully deleted` });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;

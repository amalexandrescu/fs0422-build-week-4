import express from "express";
import experienceModel from "./model.js";

const experienceRouter = express.Router();

experienceRouter.post("/userId/experiences", async (req, res, next) => {
  try {
    const newExperience = new experienceModel(req.body);
    await newExperience.save();

    const userID = newExperience._id;

    console.log(newExperience._id);
    const relatedUser = await userModel.findByIdAndUpdate(request.params.userId, { $push: { Experience: userID.toString() } }, { new: true, runValidators: true });
    await relatedUser.save();
    res.status(200).send(newExperience);
  } catch (error) {
    next(error);
  }
});

export default experienceRouter;

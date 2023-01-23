import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import UsersModel from "../users/model.js";
import experienceModel from "../experiences/model.js";
import { pipeline } from "stream";
import json2csv from "json2csv";
import fs from "fs-extra";
import { getExpJsonReadableStream } from "../../lib/fs-tools.js";
import { Readable } from "stream";

const { createReadStream } = fs;

const pictureRouter = express.Router();

const pictureUploaderToCloudinary = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "exp-profile/pictures" },
  }),
}).single("picture");

pictureRouter.post("/:userName/experiences/:expId/picture", pictureUploaderToCloudinary, async (req, res, next) => {
  try {
    const theUser = await UsersModel.findOne({ username: req.params.userName });
    console.log("theUser:", req.params.userName);
    console.log("theUser:", theUser);
    const theExperience = await experienceModel.findByIdAndUpdate(req.params.expId, { image: req.file.path }, { new: true, runValidators: true });
    console.log("theExperience:", theExperience);
    await theUser.save();
    res.status(200).send(theExperience);
  } catch (error) {
    next(error);
  }
});

pictureRouter.get("/:userName/experiences/CSV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=books.csv");

    const theUser = await UsersModel.findOne({ username: req.params.userName }).populate({ path: "experience" });
    const experienceArray = theUser.experience;

    const readableArray = await Readable.from(experienceArray);
    readableArray.on("data", (row) => {
      console.log("ROW:", row);

      const source = row;
      const transform = new json2csv.Transform({ objectMode: true, fields: ["company"] });
      const destination = res;
      pipeline(source, transform, destination, (err) => {
        if (err) console.log(err);
      });
    });
  } catch (error) {
    next(error);
  }
});

export default pictureRouter;

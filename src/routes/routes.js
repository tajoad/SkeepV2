const express = require("express");
const router = express.Router();
const usercontroller = require("../../controller/userController");
const answerController = require("../../controller/answerController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  dest: "./images/",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(undefined, true);
  },
});

router.post("/signup", usercontroller.signUp);
router.post("/signin", usercontroller.signIn);
router.post("/answer", answerController.processAnswer);
router.post("/deleteanswers", answerController.deleteAnswer);
router.post("/getanswers", answerController.getAnswer);
/*router.post("/createperson", upload.single("file"), controller.createPerson);
router.post("/updateAdmin", upload.single("file"), updateAdmin.updateAdmin);*/

module.exports = router;

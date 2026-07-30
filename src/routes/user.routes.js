const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const authorize =
require("../middleware/role.middleware");

const controller =
require("../controllers/user.controller");

router.post(
  "/receptionist",
  auth,
  authorize("ADMIN"),
  controller.createReceptionist
);

router.get(
  "/",
  auth,
  authorize("ADMIN"),
  controller.getAllReceptionists
);

router.get(
  "/:id",
  auth,
  authorize("ADMIN"),
  controller.getReceptionist
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  controller.updateReceptionist
);

router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  controller.deleteReceptionist
);

module.exports = router;
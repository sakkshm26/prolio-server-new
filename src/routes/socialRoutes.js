import express from "express";
import passport from "passport";
import {
  disconnectAccount,
  processTwitterUser,
  processYoutubeUser,
} from "../controllers/index.js";

var router = express.Router();

router.get("/twitter/start/:id", function (req, res, next) {
  passport.authenticate("twitter", {
    scope: ["profile"],
    session: false,
    callbackURL: `/social/twitter/redirect?id=${req.params.id}`,
  })(req, res, next);
});
router.get(
  "/twitter/redirect",
  passport.authenticate("twitter", { session: false }),
  processTwitterUser
);

router.get("/youtube/start", function (req, res, next) {
  let id = req.url.split('?state=')[1]
  passport.authenticate("youtube", {
    session: false,
    callbackURL: `/social/youtube/redirect`,
    state: id
  })(req, res, next);
});
router.get(
  "/youtube/redirect",
  passport.authenticate("youtube", { session: false }),
  processYoutubeUser
);

router.post("/disconnect", disconnectAccount);

export default router;

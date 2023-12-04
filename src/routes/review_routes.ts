import express from "express";
import * as authenticate from "../middleware/authenticate";
import * as review_controllers from "../controllers/review_controllers";

const router: express.Router = express.Router();

// get reviews, post new review
router
  .route("/")
  .get(authenticate.authorizeStaff, review_controllers.getReviews)
  .post(authenticate.authorizeUserSelf, review_controllers.postNewReview);

// review get, update, delete by id routes
router
  .route("/r/:reviewId")
  .get(authenticate.authorizeUserSelf, review_controllers.getReviewById)
  .put(authenticate.authorizeUserSelf, review_controllers.putReviewById)
  .delete(
    authenticate.authorizeAdminStaff,
    review_controllers.deleteReviewById
  );

export default router;

import{Router} from "express";
import{getUsers, getUserDetails} from "./admin-users.controller.js";
const router=Router();

router.get("/", getUsers);
router.get("/:id", getUserDetails);
export default router;
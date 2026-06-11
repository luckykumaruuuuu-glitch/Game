import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mediaRouter from "./media";
import versionRouter from "./version";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mediaRouter);
router.use(versionRouter);

export default router;

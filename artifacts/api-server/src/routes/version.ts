import { Router } from "express";

const router = Router();

/**
 * GET /api/version
 *
 * Layer 3 of the Secure Force Update System.
 * Returns the server-controlled force-update flag.
 *
 * Set SERVER_FORCE_UPDATE=true in environment to hard-lock all users
 * independently of Firebase — useful for emergency rollbacks or critical
 * security patches where Firebase alone cannot be trusted.
 *
 * The mobile client treats this as a best-effort override:
 *   - Server says forceUpdate=true  → lock the user (even if Firebase says OK)
 *   - Server unreachable            → fall back to Firebase decision only
 *   - Server says forceUpdate=false → trust Firebase
 */
router.get("/version", (_req, res) => {
  const raw = process.env.SERVER_FORCE_UPDATE ?? "false";
  const forceUpdate = raw.trim().toLowerCase() === "true";

  res.json({
    forceUpdate,
    source: "server",
  });
});

export default router;

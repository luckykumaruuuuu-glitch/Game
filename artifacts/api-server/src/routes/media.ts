import { Router } from "express";
import crypto from "crypto";

const router = Router();

router.delete("/media/cloudinary/:publicId", async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(503).json({ error: "Cloudinary not configured on server" });
    return;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const sigStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha256").update(sigStr).digest("hex");

    const form = new URLSearchParams();
    form.append("public_id", publicId);
    form.append("timestamp", timestamp.toString());
    form.append("api_key", apiKey);
    form.append("signature", signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: form }
    );

    const data = await cloudinaryRes.json() as { result?: string };

    if (data.result === "ok" || data.result === "not found") {
      res.json({ deleted: true, result: data.result });
      return;
    }

    res.status(500).json({ error: "Cloudinary delete failed", detail: data });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

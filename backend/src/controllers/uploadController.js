import supabase from "../db/index.js";
import { runPython } from "../utils/pythonBridge.js";

export const handleUpload = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`;
        const bucketName = "csv-uploads";

        // Upload to Supabase Storage with simple retry logic
        let uploadResult = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                uploadResult = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });
                if (!uploadResult.error) break;
                console.warn(`Upload attempt ${attempts + 1} failed:`, uploadResult.error.message);
            } catch (err) {
                console.warn(`Upload attempt ${attempts + 1} crashed:`, err.message);
                if (attempts === maxAttempts - 1) throw err;
            }
            attempts++;
            if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 1500)); // wait before retry
        }

        if (uploadResult?.error) {
            throw uploadResult.error;
        }

        const data = uploadResult.data;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // Get Metadata using Python
        let metadata = {};
        try {
            metadata = await runPython([
                "./python/get_metadata.py",
                "--file",
                publicUrl
            ]);
        } catch (pyError) {
            console.error("Python metadata extraction failed:", pyError);
            metadata = { error: "Failed to extract metadata" };
        }

        // Log Activity
        import("../utils/activityLogger.js").then(({ logActivity }) => {
            logActivity("dataset_upload", "system_user", {
                fileName: file.originalname,
                size: file.size,
                publicUrl
            });
        });

        return res.json({
            status: "success",
            message: "File uploaded successfully",
            data: {
                path: data.path,
                fileUrl: publicUrl,
                originalName: file.originalname,
                metadata: metadata
            }
        });

    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ error: err.message });
    }
};

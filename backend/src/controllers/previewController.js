import { runPython } from "../utils/pythonBridge.js";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";

export const getPreview = async (req, res) => {
    let tempFilePath = null;
    try {
        const { fileUrl } = req.body; // Expecting fileUrl in body, or we could use a fileId if we had a DB

        if (!fileUrl) {
            return res.status(400).json({ error: "fileUrl is required" });
        }

        let localFilePath = fileUrl;

        // Bypass Python IPv6 timeout by downloading the dataset via Node.js first
        if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
            tempFilePath = path.join(os.tmpdir(), `preview_dataset_${Date.now()}.csv`);
            
            const downloadWithRedirects = (url, destPath, maxRedirects = 5) => new Promise((resolve, reject) => {
                if (maxRedirects < 0) return reject(new Error('Too many redirects'));
                const protocol = url.startsWith('https://') ? https : http;
                const file = fs.createWriteStream(destPath);
                
                protocol.get(url, { timeout: 60000 }, (response) => {
                    if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
                        file.close();
                        downloadWithRedirects(response.headers.location, destPath, maxRedirects - 1)
                            .then(resolve).catch(reject);
                        return;
                    }
                    if (response.statusCode !== 200) {
                        file.close();
                        return reject(new Error(`HTTP ${response.statusCode} downloading dataset`));
                    }
                    response.pipe(file);
                    file.on('finish', () => file.close(resolve));
                    file.on('error', reject);
                }).on('error', reject);
            });

            await downloadWithRedirects(fileUrl, tempFilePath);
            localFilePath = tempFilePath;
        }

        // Reuse get_metadata.py as it returns preview and columns
        const metadata = await runPython([
            "./python/get_metadata.py",
            "--file",
            localFilePath
        ]);

        // Cleanup local dataset immediately
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }

        if (metadata.error) {
            return res.status(500).json({ error: metadata.error });
        }

        res.json({ status: "success", data: metadata });
    } catch (err) {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }
        res.status(500).json({ error: err.message });
    }
};

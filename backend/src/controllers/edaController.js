import { runPython } from "../utils/pythonBridge.js";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";

export const performEDA = async (req, res) => {
    let tempFilePath = null;
    try {
        const { fileUrl, targetColumn } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ error: "fileUrl is required" });
        }

        let localFilePath = fileUrl;

        // Bypass Python IPv6 timeout by downloading the dataset via Node.js first
        if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
            tempFilePath = path.join(os.tmpdir(), `eda_dataset_${Date.now()}.csv`);
            
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

        const args = ["./python/eda.py", "--file", localFilePath];
        if (targetColumn) {
            args.push("--target", targetColumn);
        }

        const result = await runPython(args);

        // Cleanup local dataset immediately
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json({ status: "success", data: result });
    } catch (err) {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }
        res.status(500).json({ error: err.message });
    }
};

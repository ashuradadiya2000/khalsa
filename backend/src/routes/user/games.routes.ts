import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express.Router();

import { userAuth } from '../../middleware/auth.middleware';
import { User } from '../../models/user.model';
import { Games } from '../../models/game.model';


// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', '..', 'uploads', 'game');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        cb(null, "image-" + uniqueSuffix + fileExt);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    },
});

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}
app.get("/list", userAuth, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const game = await Games.find({}).lean();
        return res.status(200).json({ list: game });
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// OCR endpoint with character verification
app.post("/verify", userAuth, upload.single("image"), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    let uploadedFilePath: string | null = null;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image file uploaded" });
        } else if (!req.body.lavel) {
            return res.status(400).json({ success: false, error: "lavel is required!" });
        }

        uploadedFilePath = req.file.path;
        console.log("Processing OCR request for user:", req.user?.id);

        const expectedChar = req.body.character;
        if (!expectedChar) {
            return res.status(400).json({ success: false, error: "Expected character not provided" });
        }

        // Verify the image file exists and is readable
        if (!fs.existsSync(uploadedFilePath)) {
            return res.status(400).json({ success: false, error: "Uploaded image file not found" });
        }

        const scriptPath = path.join(__dirname, "ocr_api.py");
        if (!fs.existsSync(scriptPath)) {
            return res.status(500).json({ success: false, error: "OCR script not found" });
        }

        // Execute OCR script with timeout
        const result = await Promise.race([
            executePythonScript(scriptPath, [uploadedFilePath, expectedChar]),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("OCR processing timed out")), 30000)
            )
        ]);

        if (!result) {
            throw new Error("OCR processing failed - no result returned");
        }

        // Handle successful match
        if (result.kid_friendly) {
            const gameID = new mongoose.Types.ObjectId("683c201fd607ac9e438b77e0");
            const userID = new mongoose.Types.ObjectId(req.user?.id);

            try {
                const game = await Games.findOne({ _id: gameID }).lean();
                if (game) {
                    await User.updateOne(
                        { _id: userID },
                        {
                            $inc: { reward_points: game.reward },
                            $set: { lavel: req.body.lavel }
                        }
                    );
                }
            } catch (dbError) {
                console.error("Database error during reward update:", dbError);
                // Continue with response even if reward update fails
            }
        }

        return res.json(result);

    } catch (error) {
        console.error("OCR Error:", error);

        // Clean up uploaded file if it exists
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            try {
                fs.unlinkSync(uploadedFilePath);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded file:", cleanupError);
            }
        }

        // Clean up temp directory
        try {
            const tempDir = path.join(__dirname, 'temp');
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupError) {
            console.error("Failed to clean up temp directory:", cleanupError);
        }

        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'OCR processing failed'
        });
    }
});

async function executePythonScript(scriptPath: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        console.log("scriptPath", args);

        const python = process.platform === 'win32' ? 'python' : 'python3';

        const pythonProcess = spawn(python, [scriptPath, ...args]);
        let stdoutData = '';
        let stderrData = '';
        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.error(`Python stderr: ${data}`);
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Script execution failed with code ${code}: ${stderrData}`));
            }
            try {
                const result = JSON.parse(stdoutData);
                resolve(result);
            } catch (e) {
                reject(new Error(`Failed to parse result: ${e instanceof Error ? e.message : String(e)}`));
            }
        });
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
}

export default app;
import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const docker = new Docker();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const LANGUAGE_CONFIG: any = {
    javascript: {
        image: 'node:18-alpine',
        cmd: ['node', '/code/script.js'],
        filename: 'script.js',
    },
    python: {
        image: 'python:3.9-alpine',
        cmd: ['python3', '/code/script.py'],
        filename: 'script.py',
    },
    // Add Java/C++ support here
};

app.post('/execute', async (req, res) => {
    const { language, code, tests } = req.body; // tests = [{input, expected}]

    if (!LANGUAGE_CONFIG[language]) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const { image, cmd, filename } = LANGUAGE_CONFIG[language];

    // Create unique temp dir for this run
    const runId = Math.random().toString(36).substring(7);
    const tempDir = path.join(__dirname, 'temp', runId);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
        // Write code to file
        fs.writeFileSync(path.join(tempDir, filename), code);

        // Pull image if not exists (simplified, normally do this at startup)
        // Pull image (simplified, normally do this at startup)
        await docker.pull(image);

        const results = [];

        // Simple execution: Running the code. 
        // In a real judge, we would wrap this to parse inputs/outputs against 'tests'.
        // For now, we just return the stdout of the code.

        let output = '';
        const container = await docker.createContainer({
            Image: image,
            Cmd: cmd,
            HostConfig: {
                Binds: [`${tempDir}:/code`],
                Memory: 256 * 1024 * 1024, // 256MB
                NetworkMode: 'none',
                AutoRemove: true,
            },
        });

        await container.start();

        // Capture output
        const stream = await container.logs({ follow: true, stdout: true, stderr: true });

        await new Promise((resolve) => {
            container.wait().then(resolve);
            stream.on('data', (chunk) => output += chunk.toString());
        });

        res.json({ status: 'AC', output });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});

app.listen(PORT, () => {
    console.log(`Execution Service running on port ${PORT}`);
});

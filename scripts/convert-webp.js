import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const imageDirs = [
    path.join(rootDir, 'frontend', 'src', 'assets'),
    path.join(rootDir, 'frontend', 'public')
];

const sourceDirs = [
    path.join(rootDir, 'frontend', 'src')
];

async function findFiles(dir, exts) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(await findFiles(filePath, exts));
        } else {
            if (exts.some(ext => file.toLowerCase().endsWith(ext))) {
                results.push(filePath);
            }
        }
    }
    return results;
}

async function convertToWebp() {
    console.log("Starting WebP Conversion...");
    let convertedImages = [];

    for (const dir of imageDirs) {
        const images = await findFiles(dir, ['.jpg', '.jpeg', '.png']);
        for (const imgPath of images) {
            const ext = path.extname(imgPath);
            const webpPath = imgPath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
            const relativeOld = path.relative(rootDir, imgPath).replace(/\\/g, '/');
            const relativeNew = path.relative(rootDir, webpPath).replace(/\\/g, '/');
            
            try {
                await sharp(imgPath)
                    .webp({ quality: 80 })
                    .toFile(webpPath);
                
                console.log(`Converted: ${relativeOld} -> ${relativeNew}`);
                convertedImages.push({
                    oldName: path.basename(imgPath),
                    newName: path.basename(webpPath)
                });
                
                // Delete old file
                fs.unlinkSync(imgPath);
            } catch (err) {
                console.error(`Error converting ${imgPath}:`, err.message);
            }
        }
    }

    if (convertedImages.length > 0) {
        console.log("\nUpdating Source References...");
        const sourceFiles = await findFiles(path.join(rootDir, 'src'), ['.js', '.jsx', '.css']);
        
        for (const file of sourceFiles) {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;

            for (const { oldName, newName } of convertedImages) {
                // simple global replace of the filename
                // This might be risky if names overlap with variables, but assuming standard assets
                const regex = new RegExp(oldName.replace(/\./g, '\\.'), 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, newName);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(file, content);
                console.log(`Updated references in: ${path.relative(rootDir, file)}`);
            }
        }
    } else {
        console.log("No images found to convert.");
    }
    
    console.log("Conversion complete!");
}

convertToWebp();

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function getDimensions(src) {
    try {
        const metadata = await sharp(src).metadata();
        return { width: metadata.width, height: metadata.height };
    } catch (e) {
        console.error("Error reading image:", src);
        return null;
    }
}

async function fixCLS() {
    const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    
    for (const file of files) {
        let html = fs.readFileSync(file, 'utf8');

        // 1. Preload Bebas Neue font
        // Look for the Bebas Neue font file in the inline CSS
        const bebasMatch = html.match(/url\((fonts\/[^)]+Bebas[^)]+\.woff2)\)/i) || html.match(/url\((fonts\/JTUSjIg69[^)]+\.woff2)\)/i);
        if (bebasMatch && !html.includes('rel="preload" href="' + bebasMatch[1] + '"')) {
            const preloadTag = `<link rel="preload" href="${bebasMatch[1]}" as="font" type="font/woff2" crossorigin>\n<style>`;
            html = html.replace('<style>', preloadTag);
        }

        // 2. Change font-display for Bebas Neue to prevent FOUT layout shift
        html = html.replace(/font-family:\s*'Bebas Neue'[\s\S]*?font-display:\s*swap;/gi, match => {
            return match.replace('swap', 'block');
        });

        // 3. Add explicit width and height to images to reserve aspect-ratio space
        const imgRegex = /<img([^>]+)>/g;
        const replacements = [];
        
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            let imgTag = match[0];
            const attrs = match[1];

            // If it already has both width and height, skip
            if (attrs.includes('width=') && attrs.includes('height=')) continue;

            const srcMatch = attrs.match(/src="([^"]+)"/);
            if (srcMatch) {
                let srcPath = srcMatch[1];
                // strip leading slash if any
                if (srcPath.startsWith('/')) srcPath = srcPath.slice(1);
                
                if (fs.existsSync(srcPath)) {
                    const dims = await getDimensions(srcPath);
                    if (dims) {
                        // Insert width and height just before the src attribute
                        const newImgTag = imgTag.replace(/src="/, `width="${dims.width}" height="${dims.height}" src="`);
                        replacements.push({ old: imgTag, new: newImgTag });
                    }
                }
            }
        }

        for (const rep of replacements) {
            html = html.replace(rep.old, rep.new);
        }

        fs.writeFileSync(file, html, 'utf8');
        console.log(`Processed ${file}`);
    }
}

fixCLS().then(() => console.log('Done'));

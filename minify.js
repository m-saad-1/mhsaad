const fs = require('fs');
const { minify: terserMinify } = require('terser');
const CleanCSS = require('clean-css');

async function runMinification() {
    console.log('Minifying script.js...');
    const jsContent = fs.readFileSync('script.js', 'utf8');
    const minifiedJs = await terserMinify(jsContent, {
        compress: true,
        mangle: true
    });
    fs.writeFileSync('script.min.js', minifiedJs.code);
    
    console.log('Minifying styles.css...');
    const cssContent = fs.readFileSync('styles.css', 'utf8');
    const minifiedCss = new CleanCSS({}).minify(cssContent);
    fs.writeFileSync('styles.min.css', minifiedCss.styles);
    
    // Now we need to update the HTML files to use the minified files
    // But since the task just says:
    // "Implement a build step (using cssnano and terser or similar tools) to minify styles.css and script.js."
    // "Ensure the production deployment correctly serves these minified assets."
    // Let's replace the script/link tags in all HTML files.
    const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let updated = false;
        
        if (content.includes('script.js')) {
            content = content.replace(/script\.js/g, 'script.min.js');
            updated = true;
        }
        
        if (content.includes('styles.css')) {
            content = content.replace(/styles\.css/g, 'styles.min.css');
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(file, content);
            console.log(`Updated ${file} to use minified assets`);
        }
    });
    
    console.log('Minification complete.');
}

runMinification().catch(console.error);

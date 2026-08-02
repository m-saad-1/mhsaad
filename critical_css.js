const { generate } = require('critical');
const glob = require('glob');
const fs = require('fs');

async function processFiles() {
  // First, we must remove the Google Fonts link and prepend fonts.css to styles.css
  const fontsCss = fs.readFileSync('fonts.css', 'utf8');
  let stylesCss = fs.readFileSync('styles.css', 'utf8');
  if (!stylesCss.includes('Bebas Neue')) {
    fs.writeFileSync('styles.css', fontsCss + '\n' + stylesCss);
  }

  const files = glob.sync('*.html');
  for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove old Google Fonts link
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]+>/g, '');
    
    fs.writeFileSync(file, content);

    console.log(`Processing critical CSS for ${file}...`);
    try {
      await generate({
        inline: true,
        base: './',
        src: file,
        target: file,
        width: 1300,
        height: 900,
        extract: false, // Do not remove critical CSS from the original stylesheet, we'll just defer it
      });

      // The 'critical' package replaces the original <link rel="stylesheet"> with the inlined <style>
      // and it defers the original stylesheet automatically using `<link rel="preload" as="style" onload="...`
      // or similar. Let's see what it does.
      
      console.log(`${file} processed.`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

processFiles();

import { generate } from 'critical';
import glob from 'glob';
const globSync = glob.sync;
import fs from 'fs';

async function processFiles() {
  const fontsCss = fs.readFileSync('fonts.css', 'utf8');
  let stylesCss = fs.readFileSync('styles.css', 'utf8');
  
  if (!stylesCss.includes('fonts/JTUSjIg69CK48gW7PXoo9Wdhyzbi.woff2')) {
    fs.writeFileSync('styles.css', fontsCss + '\n' + stylesCss);
  }

  const files = globSync('*.html');
  for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');
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
        extract: false,
      });
      console.log(`${file} processed.`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

processFiles();

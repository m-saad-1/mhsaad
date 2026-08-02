const https = require('https');
const fs = require('fs');
const path = require('path');

const cssUrl = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap';
const fontsDir = path.join(__dirname, 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir);
}

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  }
};

https.get(cssUrl, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const fontUrls = [...data.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^\)]+)\)/g)].map(m => m[1]);
    let cssContent = data;

    let downloads = [];
    
    fontUrls.forEach(url => {
      const filename = path.basename(url);
      const localPath = path.join(fontsDir, filename);
      const localUrl = `fonts/${filename}`;
      cssContent = cssContent.replace(url, localUrl);

      downloads.push(new Promise((resolve, reject) => {
        const file = fs.createWriteStream(localPath);
        https.get(url, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(localPath, () => reject(err));
        });
      }));
    });

    Promise.all(downloads).then(() => {
      fs.writeFileSync(path.join(__dirname, 'fonts.css'), cssContent);
      console.log('Fonts downloaded and fonts.css created successfully.');
    }).catch(err => console.error(err));
  });
}).on('error', err => console.error(err));

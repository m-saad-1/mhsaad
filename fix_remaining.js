const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const imagesToProcess = [
    { src: 'images/Broady/Broady/thumbnail-900.avif', target: 'images/Broady/Broady/thumbnail-650.avif' },
    { src: 'images/Papershare/thumbnail-900.avif', target: 'images/Papershare/thumbnail-650.avif' },
    { src: 'images/AI_Chatbot/thumbnail-900.avif', target: 'images/AI_Chatbot/thumbnail-650.avif' },
    { src: 'images/FashionHub/thumbnail-900.webp', target: 'images/FashionHub/thumbnail-650.webp' },
    { src: 'images/VisualShare/thumbnail-900.webp', target: 'images/VisualShare/thumbnail-650.webp' },
    { src: 'images/leaf_disease_detection/thumbnail-900.webp', target: 'images/leaf_disease_detection/thumbnail-650.webp' }
];

async function resizeImages() {
    for (const img of imagesToProcess) {
        if (fs.existsSync(img.src)) {
            await sharp(img.src)
                .resize(650)
                .toFile(img.target);
            console.log('Resized:', img.target);
        } else {
            console.log('Missing:', img.src);
        }
    }
}

function fixHTML() {
    const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
    
    // GTM Deferral with user interaction
    const gtmRegex = /<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js', new Date\(\)\);\s*gtag\('config', 'G-TZNPWMWETW'\);\s*window\.addEventListener\('load', function\(\) \{\s*var script = document\.createElement\('script'\);\s*script\.src = "https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TZNPWMWETW";\s*script\.async = true;\s*document\.head\.appendChild\(script\);\s*\}\);\s*<\/script>/i;

    const newGtm = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TZNPWMWETW');

  let gtmLoaded = false;
  function loadGTM() {
      if (gtmLoaded) return;
      gtmLoaded = true;
      var script = document.createElement('script');
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW";
      script.async = true;
      document.head.appendChild(script);
  }
  ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event => {
      window.addEventListener(event, loadGTM, { once: true, passive: true });
  });
  setTimeout(loadGTM, 3500);
</script>`;

    files.forEach(file => {
        let html = fs.readFileSync(file, 'utf8');

        // 1. Fix GTM script
        if (gtmRegex.test(html)) {
            html = html.replace(gtmRegex, newGtm);
        }

        // 2. Add 650w to srcset and update sizes
        // We will look for thumbnail-900 and if it doesn't already have 650w, we add it.
        const srcsetRegex = /srcset="([^"]*thumbnail-450\.(avif|webp)\s+450w),\s*([^"]*thumbnail-900\.(avif|webp)\s+900w)"/g;
        html = html.replace(srcsetRegex, (match, p1, ext1, p3, ext3) => {
            const baseDir = p3.replace(/thumbnail-900\.(avif|webp)\s+900w/, '');
            return `srcset="${p1}, ${baseDir}thumbnail-650.${ext3} 650w, ${p3}"`;
        });

        // Update sizes attribute to be more accurate (92vw on mobile instead of 100vw)
        html = html.replace(/sizes="\(max-width: 768px\) 100vw, 50vw"/g, 'sizes="(max-width: 768px) 92vw, 50vw"');

        fs.writeFileSync(file, html, 'utf8');
    });
    console.log('HTML files updated.');
}

async function run() {
    await resizeImages();
    fixHTML();
}

run();

const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    
    // 1. Move <title> right after <meta name="description">
    let headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
    if (headMatch) {
        let head = headMatch[0];
        let titleMatch = head.match(/<title>[\s\S]*?<\/title>/i);
        if (titleMatch) {
            head = head.replace(titleMatch[0], '');
            // Place it after the meta description
            head = head.replace(/(<meta[^>]*name="description"[^>]*>)/i, '$1\n' + titleMatch[0]);
            html = html.replace(headMatch[0], head);
        }
    }
    
    // 2. Fix Color Contrast in inline CSS
    // Darken colors to meet WCAG AA
    // --color-gray-400: #a3a3a3 (fails) -> #707070 (4.7:1)
    // --color-gray-500: #737373 (fails on #e5e5e5) -> #595959 (7:1)
    // --color-gray-600: #525252 (passes, but darken slightly for proportion) -> #454545
    html = html.replace(/--color-gray-400:#a3a3a3/g, '--color-gray-400:#707070');
    html = html.replace(/--color-gray-500:#737373/g, '--color-gray-500:#595959');
    html = html.replace(/--color-gray-600:#525252/g, '--color-gray-600:#454545');

    // 3. Fix GTM script implementation
    // Remove the bad deferred script
    const badScriptRegex = /<script>\s*window\.addEventListener\('load', function\(\) \{\s*var script = document\.createElement\('script'\);\s*script\.src = "https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TZNPWMWETW";\s*document\.head\.appendChild\(script\);\s*window\.dataLayer = window\.dataLayer \|\| \[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js', new Date\(\)\);\s*gtag\('config', 'G-TZNPWMWETW'\);\s*\}\);\s*<\/script>/i;
    
    const goodScript = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TZNPWMWETW');

  window.addEventListener('load', function() {
      var script = document.createElement('script');
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-TZNPWMWETW";
      script.async = true;
      document.head.appendChild(script);
  });
</script>`;

    if (badScriptRegex.test(html)) {
        html = html.replace(badScriptRegex, goodScript);
    }

    fs.writeFileSync(file, html, 'utf8');
});

// 4. Fix colors in styles.css
let css = fs.readFileSync('styles.css', 'utf8');
css = css.replace(/--color-gray-400:\s*#a3a3a3/g, '--color-gray-400: #707070');
css = css.replace(/--color-gray-500:\s*#737373/g, '--color-gray-500: #595959');
css = css.replace(/--color-gray-600:\s*#525252/g, '--color-gray-600: #454545');
// Also fix footer contrast explicitly if missed
css = css.replace(/color:\s*#868686;/g, 'color: #707070;'); // Ensure 4.5:1
fs.writeFileSync('styles.css', css, 'utf8');

console.log('Fixes applied.');

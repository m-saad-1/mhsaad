const fs = require('fs');

function fixLearnMore() {
    let html = fs.readFileSync('index.html', 'utf8');
    const searchRegex = /<a class="hero-cv-btn" href="about\.html" aria-label="Learn more about Muhammad Saad's background">LEARN MORE<\/a>/;
    
    if (searchRegex.test(html)) {
        html = html.replace(
            searchRegex,
            `<a class="hero-cv-btn" href="about.html" aria-label="Learn more about Muhammad Saad's background">LEARN MORE<span class="sr-only"> about my professional background and experience</span></a>`
        );
        fs.writeFileSync('index.html', html, 'utf8');
        console.log('Fixed LEARN MORE link in index.html');
    } else {
        console.log('LEARN MORE link not found or already modified.');
    }
}

fixLearnMore();

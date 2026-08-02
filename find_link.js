const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<a[^>]*>.*?LEARN MORE.*?<\/a>/i);
if (match) {
    console.log("Found:", match[0]);
} else {
    console.log("Not found");
}

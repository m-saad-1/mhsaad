const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const config = [
  {
    input: 'images/avatar.webp',
    outputs: [
      { name: 'images/avatar-600.webp', width: 600, options: { quality: 80 } },
      { name: 'images/avatar-1200.webp', width: 1150, options: { quality: 80 } }
    ]
  },
  {
    input: 'images/personalOS.webp',
    outputs: [{ name: 'images/personalOS.webp', width: 150, options: { quality: 80 } }]
  },
  {
    input: 'images/visualshare.webp',
    outputs: [{ name: 'images/visualshare.webp', width: 150, options: { quality: 80 } }]
  },
  {
    input: 'images/msstudio.webp',
    outputs: [{ name: 'images/msstudio.webp', width: 150, options: { quality: 80 } }]
  },
  {
    input: 'images/Fashionhub.webp',
    outputs: [{ name: 'images/Fashionhub.webp', width: 150, options: { quality: 80 } }]
  },
  {
    input: 'images/AI_Chatbot/Multi-vertical-Ai-receptionist-chatbot.avif',
    outputs: [
      { name: 'images/AI_Chatbot/thumbnail-700.avif', width: 700, options: { quality: 80 } },
      { name: 'images/AI_Chatbot/thumbnail-1400.avif', width: 1350, options: { quality: 80 } }
    ]
  },
  {
    input: 'images/Broady/Broady/thumbnail.avif',
    outputs: [
      { name: 'images/Broady/Broady/thumbnail-700.avif', width: 700, options: { quality: 80 } },
      { name: 'images/Broady/Broady/thumbnail-1400.avif', width: 1350, options: { quality: 80 } }
    ]
  },
  {
    input: 'images/Papershare/Thumbnail.avif',
    outputs: [
      { name: 'images/Papershare/thumbnail-700.avif', width: 700, options: { quality: 80 } },
      { name: 'images/Papershare/thumbnail-1400.avif', width: 1350, options: { quality: 80 } }
    ]
  },
  {
    input: 'images/PersonalOS/thumbnail.avif',
    outputs: [
      { name: 'images/PersonalOS/thumbnail-700.avif', width: 700, options: { quality: 80 } },
      { name: 'images/PersonalOS/thumbnail-1400.avif', width: 1350, options: { quality: 80 } }
    ]
  },
  {
    input: 'images/DevBug/Thumbnail.webp',
    outputs: [
      { name: 'images/DevBug/thumbnail-700.webp', width: 700, options: { quality: 80 } },
      { name: 'images/DevBug/thumbnail-1400.webp', width: 1350, options: { quality: 80 } }
    ]
  }
];

async function processImages() {
  for (const item of config) {
    if (!fs.existsSync(item.input)) {
      console.error(`Missing input file: ${item.input}`);
      continue;
    }
    const inputBuffer = fs.readFileSync(item.input);
    for (const output of item.outputs) {
      try {
        const ext = path.extname(output.name).toLowerCase();
        let s = sharp(inputBuffer).resize({ width: output.width, withoutEnlargement: true });
        
        if (ext === '.avif') {
          s = s.avif(output.options);
        } else if (ext === '.webp') {
          s = s.webp(output.options);
        } else if (ext === '.jpg' || ext === '.jpeg') {
          s = s.jpeg(output.options);
        } else if (ext === '.png') {
          s = s.png(output.options);
        }

        await s.toFile(output.name);
        console.log(`Saved ${output.name}`);
      } catch (err) {
        console.error(`Error processing ${output.name}:`, err);
      }
    }
  }
}

processImages();

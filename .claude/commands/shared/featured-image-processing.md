# Featured Image Processing

Shared specification for processing featured images across all content generation commands (generate-services, generate-case-studies, generate-blog). Each command references this file and provides only the content-type-specific output path.

## Image Specifications

| Property | Value |
|----------|-------|
| Dimensions | 1400x781 pixels |
| Format | JPEG, quality 85 |
| Target file size | 200-400KB |
| Logo overlay | `static/img/logo/perts-foundry-icon-64.png`, southeast gravity |
| Watermark cover | 100x100px dark rectangle (#050710) under the logo to cover AI generator watermarks |

## Workflow

For each new page missing a `featured.jpg`:

**Step 1: Analyze visual style.** Read 3-4 existing featured images (e.g., `content/services/*/featured.jpg`, `content/case-studies/*/featured.jpg`) to confirm the visual style still matches the established pattern:
- Dark navy/black backgrounds
- Glowing neon accents in blue and purple/violet tones
- Futuristic 3D perspective renders
- Symbolic metaphors for the content's concept (not literal depictions)
- No text overlays, no logos, no people
- 16:9 aspect ratio

**Step 2: Generate image prompt.** Craft a prompt for the user to use with Google Gemini (or another AI image generator). The prompt must:
- Describe a symbolic 3D visualization that represents the page's theme
- Specify the dark navy-black background with blue/violet neon glow palette
- Request cinematic lighting, 3D perspective, photorealistic render style
- Explicitly state: "No text, no logos, no letters, no people. 16:9 aspect ratio."
- Avoid requesting any literal text, abbreviations, or acronyms in the image

Present the prompt to the user and ask them to generate the image and provide the file path.

**Step 3: Process the image.** When the user provides the generated image path, process it using a Node.js script with the sharp library (do not use sharp CLI, it has unreliable argument parsing for composite operations):

```javascript
node -e "
const sharp = require('sharp');
sharp('<USER_PROVIDED_PATH>')
  .resize(1400, 781, { fit: 'cover' })
  .composite([
    {
      input: {
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 5, g: 7, b: 16 }
        }
      },
      gravity: 'southeast'
    },
    {
      input: 'static/img/logo/perts-foundry-icon-64.png',
      gravity: 'southeast'
    }
  ])
  .jpeg({ quality: 85 })
  .toFile('<OUTPUT_PATH>')
  .then(info => console.log('Done:', JSON.stringify(info)))
  .catch(err => console.error('Error:', err.message));
"
```

The two-layer composite approach is essential: the dark rectangle blanks out any AI generator watermark in the corner, then the PF icon sits cleanly on top.

**Step 4: Verify.** Show the processed image to the user for approval. If the watermark is still visible or the image needs adjustment, re-process. Check the file size is within the 200-400KB range. If it exceeds 400KB, re-run with `quality: 75`. If it falls below 200KB, the source image may be too small; flag to the user.

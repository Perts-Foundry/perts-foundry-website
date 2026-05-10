# Featured Image Processing

Shared specification for processing featured images across all content generation commands (generate-services, generate-case-studies, generate-blog). Each command references this file and provides only the content-type-specific output path.

## Image Specifications

| Property         | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Dimensions       | 1400x781 pixels                                                                    |
| Format           | JPEG, quality 85                                                                   |
| Target file size | 200-400KB                                                                          |
| Logo overlay     | `static/img/logo/perts-foundry-icon-64.png`, southeast gravity                     |
| Watermark cover  | 130x130px dark rectangle (#050710) under the logo to cover AI generator watermarks |

Note: prior versions of this spec used a 68x68 cover, which is too small for current Google Gemini watermarks (the sparkle icon extends ~90px from the corner in a 1400x781 resized image). 130x130 leaves comfortable buffer for variation in watermark position across generations.

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

**Batch hand-off convention (for multi-image runs).** When generating 4 or more images in one session, suggest the user save them with a known naming convention (e.g., `1-<slug>.png`, `2-<slug>.png` ...) so the slug-to-source mapping is unambiguous. If the user instead provides opaque vendor filenames (Gemini emits hashes), sort by file mtime and confirm the mapping with the user before processing.

**Step 3: Process the image.** When the user provides the generated image path, process it using a Node.js script with the sharp library (do not use the sharp CLI, it has unreliable argument parsing for composite operations). Run the script from the project root so `sharp` resolves from the project's `node_modules`; `node -e` from outside the project root will fail with `Cannot find module 'sharp'`.

```javascript
node -e "
const sharp = require('sharp');
sharp('<USER_PROVIDED_PATH>')
  .resize(1400, 781, { fit: 'cover' })
  .composite([
    {
      input: {
        create: {
          width: 130,
          height: 130,
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

**Step 4: Verify watermark coverage.** This step is mandatory and is the only reliable way to catch drift in the vendor's watermark size or position. After processing each image, extract the bottom-right 250x250 region with sharp and show it to the user (or to your own visual review). Confirm no fragment of the source watermark (Gemini sparkle, etc.) is visible above or to the left of the dark cover. If anything is visible, enlarge the cover (next standard step is 160x160) and re-process. Do not skip this verification on multi-image batch runs; the watermark may vary in position across generations even when the prompt does not.

```javascript
node -e "
const sharp = require('sharp');
sharp('<OUTPUT_PATH>')
  .extract({ left: 1150, top: 531, width: 250, height: 250 })
  .toFile('/tmp/corner-check.png')
  .then(() => console.log('Wrote /tmp/corner-check.png for visual review'));
"
```

**Step 5: Verify file size.** Check the file size is within the 200-400KB range. If it exceeds 400KB, re-run with `quality: 75`. If it falls below 200KB, check the source image's dimensions against the 1400x781 target before flagging:

- If source dimensions are smaller than 1400x781, the source is too small; flag to the user.
- If source dimensions are 1400x781 or larger, the small file size is from efficient JPEG compression of the dark-and-neon palette; this is benign and does not need flagging.

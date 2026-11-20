# Full-width hero scroll video plan

Site kind is software. Study [the supplied clip](../study/1795189323_hero_scroll_video.md).

## Approval

The owner approved the full-width hero background, desktop scrubbing, still layouts, and live foreground demo. See [ADR 0006](../adr/0006-hero-scroll-video.md).

## Scope

Start from `feat/modeled-poker-hero` on a new feature branch. Replace the Three.js hero effect with the supplied clip. Keep GSAP ScrollTrigger for the new scroll motion and GSAP for the Rebuy chip. Remove the WebGL code and runtime dependencies that the landing page no longer uses. Preserve the original Blender work on its branch. The Log and the later sections keep their current behavior.

### T1. Prepare the video and still — tests: alongside

- [x] Encode the provided clip as H.264 MP4. Use 1280 × 720, remove audio, and put a keyframe every six frames. Put the index at the start of the file. Target 2 MB.
- [x] Export the first frame as an optimized WebP. Use the same crop for the poster and video at each width. Keep enough room around the stack when it is fully spread.
- [x] Record the source name and the commands to create both assets. Add only the web assets to the served media.

Acceptance. Check the encoding and keyframe spacing with FFprobe. Compare the poster with the first video frame. View the first and last frames in the desktop crop.

Done when the video and still show the same opening picture and the chip stack fits at both ends of the motion.

### T2. Build the full-width hero background — tests: alongside

- [x] Put the video and poster in a decorative layer that covers the hero. Place the visible stack on the right on desktop. Blend the video edges into the dark hero ground. Frame the still lower on phones.
- [x] Keep the existing headline, join actions, and live pot and Rebuy in normal focus order above the background. Place the panel in the left column on desktop so it clears the widest stack. Check contrast against the brightest frames. Give the layer no pointer events.
- [x] Keep the desktop hero one screen tall. Keep the chips and controls in view at 1440, 1024, 768, and 390 px. Let short phones scroll to the panel.

Acceptance. The background reaches both page edges. Both actions and Rebuy stay readable and clickable in the first, middle, and last poses. The layout has no horizontal overflow.

Done when the hero reads and works with only the poster and HTML.

### T3. Link video time to scroll — tests: alongside

| Element | Property | Timing | Reduced motion |
| --- | --- | --- | --- |
| Background video | Playback time from the opening stack to the last sequence frame | GSAP ScrollTrigger, linear over the first 45% of the hero exit. Hold both ends. | Opening still. |
| Chip framing | Move the media down and scale to 0.51. Keep the spread stack below the nav. | Linear over the same scroll range. | Opening still. |
| Poster to video | Opacity of the video layer | 180 ms ease-out after the first frame at the current scroll position. | Still image. |
| Rebuy | Position and opacity of the chip feedback | Current 320 ms input effect. | Immediate pot update. |

- [x] Keep the video paused. Set its time from scroll progress. Limit work to one pending seek and keep the latest target. Sync on a reload partway down and after a layout change. The default browser scroll remains in use.
- [x] Use the poster if the video fails or stalls before a frame is ready. Skip the motion asset on phones, reduced motion, and motion off. Clear listeners and ScrollTrigger when the still layout takes over.
- [x] Replace the WebGL probes with playback tests. Check first, middle, and last frames down and up, a fast scroll, a restored scroll position, slow media, failed media, and a motion preference change.

Acceptance. At a given scroll position, the same frame is visible in either direction. The final frame holds. The poster stays visible while the clip loads at the top or partway down. Rebuy updates the pot while the clip seeks.

Done when the background responds to scroll and every fallback retains the hero controls.

### T4. Verify the built page and sync docs — tests: alongside

- [x] Run `npm test` and `npm run build`. Run the browser probe and review the motion and full-width layout. Compare Chrome and Safari seeking if both are available.
- [x] Tap Rebuy on the phone layout and find the entry in the Log. Click Rebuy while the desktop clip seeks and check the same total. Check reduced motion with a still and working Rebuy.
- [x] Record the checks. Update the wiki and add the approved decision. Run `graphify update .` after the code changes.

Acceptance. The checks cover scroll, video failure, responsive layout, and the first demo action.

Done when the verified page and the wiki agree.

## Checks

- FFprobe read one 1280 × 720 H.264 stream at 24 fps. The export is 1.88 MB. Keyframes are 250 ms apart. The opening WebP is 18 KB and matches the first video frame in the checked crop.
- `npm test` passed 41 tests. Astro reported zero errors and warnings. `npm run build` built three pages.
- Chrome passed 114 of 114 checks. The frames match in both directions. The final stack clears the fixed nav. Chrome kept the same frame on eight additional native reloads. The poster covers slow loading and media failure.
- Playwright WebKit reached the same times and frames in both directions after presentation. The average channel difference was 0.0035 out of 255 for the first frame and zero at the two middle samples.
- The layout checker reported no hero findings or horizontal overflow at the five checked widths and heights. Its other findings were sparse Log and Compare views and Count-up height at 1024 × 640.
- A Chrome trace of the reveal counted 45 seeks and zero interrupted seeks or layout events. The video issued zero seeks during the idle sample.
- A phone tap and a desktop rebuy during scroll updated the same pot and Log. Rapid rebuys, reduced motion, and motion off passed.
- Review found late stack clipping and an early WebKit frame sample. The final framing clears the nav. The WebKit check waits for presentation. A stable scroll anchor also fixed native reload restoration. `graphify update .` rebuilt the graph.

The verified work is on `feat/hero-scroll-video`.

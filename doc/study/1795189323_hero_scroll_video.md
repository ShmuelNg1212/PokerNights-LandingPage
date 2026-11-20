# Hero scroll video study

Date 2026-11-20

The owner supplied `hero-chip-stack-video.mp4` and asked for the scroll animation to be the hero background.

## Source

The clip is 1280 × 720 at 24 frames per second. Its picture runs for 10 seconds. It has an AAC audio track. The source file is 3.09 MB. Its only seek point is the first frame.

The first frame shows a compact black-and-gold stack. The chips separate and turn in the center of the picture. At the end they float above one another. The edges of the picture are dark. The gold highlights give the motion its focus.

## Visual direction

Extend the video ground from edge to edge within the hero. Place the stack on the right on a wide screen. Keep the headline, lead, and actions on the left over the dark ground. Place the live pot and Rebuy in the foreground near the bottom of the art. Leave room for the tall stack at the end of the clip. Use a dark fade on the copy side to keep contrast through the full sequence.

On phones, frame the stack lower in the hero. Keep the headline and both actions above it. Put the live panel in the foreground. A still from this same clip gives the phone and reduced-motion layouts the same art.

## Playback

The current branch uses GSAP ScrollTrigger to move a WebGL camera as the hero leaves. Reuse that native scroll range for video time. Scroll down to separate and turn the chips. Scroll up to stack them again. Show the first frame as the poster and hold the last frame at the end. The heading can keep its short entrance.

An FFmpeg test export at the original picture size took 1.88 MB. It removes audio and puts a keyframe every six frames, or 250 ms. Use the export for browser checks. The source file stays with the owner. [FFmpeg documentation](https://www.ffmpeg.org/ffmpeg.html)

Setting `currentTime` starts a media seek. Keep at most one seek in flight and use the latest target when it ends. Use a poster before the first valid frame and on a load or decode failure. [HTML media specification](https://html.spec.whatwg.org/multipage/media.html#dom-media-currenttime-dev)

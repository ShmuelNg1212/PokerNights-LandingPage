# 0006. Scroll-driven hero video

Date 2026-11-20. Status accepted. Supersedes the modeled hero decision on `feat/modeled-poker-hero`.

The owner supplied the Gemini chip-stack clip and approved the [background video plan](../plan/1795189323_hero_scroll_video.md).

## Decision

- Use the clip as the hero background. Put the headline, actions, and live Rebuy panel in front. On desktop the stack stays to the right. The framing moves down and scales the stack to keep its last pose below the fixed nav.
- Tie the paused video's frame to the first 45% of the hero exit. Use GSAP ScrollTrigger. Native scrolling sets the frame in either direction.
- Keep the decorative layer out of scroll anchoring. The browser restores the page position, and the scroll trigger seeks to the matching frame.
- Load the silent MP4 from 1024 px wide and 640 px tall when motion is on. Show the first frame as a still while it loads, on smaller screens, with reduced motion, or on a media error.
- Keep the live demo in HTML. Its input feedback and pot update work with the video and the still.

## Consequences

- The video is the hero's visual effect. The scroll approval for the modeled scene applies to this background. The Log, Steps, Compare, and Count-up decisions in [ADR 0004](0004-more-scroll-motion.md) still apply.
- The modeled version remains on `feat/modeled-poker-hero`. The video branch serves the clip and its still.
- The media notes give the export commands. The browser probe checks frames and fallbacks.

# Understrand

Assets for the Understrand website (Webflow), served through jsDelivr.

## logo/
- `understrand-chrome-logo.webm`: spinning chrome logo, VP9 with transparency. Chrome, Firefox, Edge.
- `understrand-chrome-logo-hevc.mov`: same logo, HEVC with transparency. Safari (Mac and iPhone).

Both are 30 fps, 180 frames (6 second loop). Link them by commit, not `@main`, so updates don't get stuck in jsDelivr's cache:

`https://cdn.jsdelivr.net/gh/Jame55-Design/understrand@<commit>/logo/<file>`

## js/
- `understrand.js`: site code that's too big for Webflow's 2,000-character inline scripts. X-ray toggle, x-ray glitch buttons, progressive blur, logo video boxes, flick card video slider and play/pause on scroll. Added in Webflow as a hosted script, pinned by commit with an integrity hash.

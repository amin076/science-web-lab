# Esbiko VR — isolated robotics prototype

Status: development workspace prepared. The existing rover is NOT yet converted to VR.
No headset session, hand interaction, build, or emulator runtime has been verified.

## Browser-only development
1. Open this branch in GitHub Codespaces.
2. Select the **Esbiko VR** dev-container configuration if prompted.
3. In its terminal, from the repository root:
   `node experiments/esbiko-vr/bootstrap.mjs`
4. Run:
   `cd experiments/esbiko-vr/app`
   `npm install`
   `npm run dev`
5. Open the forwarded application URL in a separate browser tab (not an embedded preview).
   Use the running SDK's reported port and IWER toolbar to enter XR and select hands.
   XR is an immersive session; IWER emulates the headset and hands in a desktop browser.

Dependencies install in the cloud, not on your Windows machine.
Codespaces usage is subject to your GitHub quota. No Codespace has been created by this commit.
If the SDK launches a managed cloud browser, use its documented runtime URL for the human browser;
do not assume its localhost URL points to your Windows machine.

The bootstrap uses Meta's official @iwsdk/create generator, refuses to overwrite app/,
and disables SDK physics and locomotion. This avoids introducing a second physics solver
beside the existing Rapier model. The generated starter may need adaptation with those features disabled.
After generating, commit its source and package-lock.json to this branch; use npm ci on repeat installs.
The generated SDK version should be recorded before testing. Do not commit node_modules or dist.

## Product scope
A seated tabletop game: tune slope and per-motor torque, run the four-wheel rover,
observe failure/success, and retry. First technical milestone:
the rover and ramp render in XR and a spatial start/pause/reset panel works with hands.

## Reference
reference/rover-level2.html is today's visually upgraded working desktop prototype.
It retains its original external CDN imports and is reference material, not the VR entry point.
Its coil springs are decorative; it does not model suspension.

## Next implementation
- Scaffold and verify the official SDK starter and IWER hands.
- Extract the reference rover's geometry and Rapier update into modules.
- Use a meter-based tabletop parent transform; keep physics in original simulation units.
- Disable the desktop orbit camera during XR, and use a fixed-step physics accumulator.
- Replace DOM controls with reachable spatial controls for start, pause, reset, slope, and torque.
- Verify a complete hands-only loop in the emulator; later check comfort and tracking on hardware.

## Sources
- https://github.com/facebook/immersive-web-sdk/blob/main/docs/public/skill.md
- https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/

No production deployment or main-branch change is included.

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import SimulationTransparentHUD from '@/components/simulation-ui/SimulationTransparentHUD';

const guides = {
  microscope: {
    title: 'Compound microscope',
    path: 'Object → objective lens → real intermediate image → eyepiece lens → eye.',
    elements: 'Both elements are converging lenses. Put the object just beyond the objective focal point. The objective makes an enlarged, inverted real image; the eyepiece acts as a magnifier.',
    focus: 'For a relaxed eye, place that intermediate image at the front focal point of the eyepiece. Lens separation = objective image distance + eyepiece focal length.',
    magnification: 'Angular magnification = objective magnification × (250 mm / eyepiece focal length). The 250 mm reference is the conventional near point. A negative sign means an inverted image.',
    try: 'Increase object distance slightly, observe defocus, then press “Focus for relaxed eye”. Compare the new magnification. Try a shorter eyepiece focal length and refocus.',
  },
  refractor: {
    title: 'Refracting telescope',
    path: 'Distant object → objective lens → real intermediate image → eyepiece lens → eye.',
    elements: 'Two converging lenses. Nearly parallel light from a distant object is brought to focus by the objective. The eyepiece turns the light from each image point into a parallel outgoing bundle.',
    focus: 'Relaxed-eye focus occurs when the rear focal plane of the objective meets the front focal plane of the eyepiece. Lens separation = objective focal length + eyepiece focal length.',
    magnification: 'At focus, angular magnification = −objective focal length / eyepiece focal length. A longer objective or shorter eyepiece increases its magnitude. The negative sign indicates inversion.',
    try: 'Change lens separation to blur the view, then refocus. Halve the eyepiece focal length and refocus to double the angular magnification.',
  },
  reflector: {
    title: 'Newtonian reflecting telescope',
    path: 'Distant object → concave primary mirror → flat diagonal mirror → eyepiece lens → eye.',
    elements: 'The silver curved component is a concave primary mirror with a schematic parabolic profile, not a lens. Its reflective face sends light back along the tube. The small gold flat mirror turns the beam sideways and adds no focusing power. The purple eyepiece is the only lens.',
    focus: 'Measure the optical path from the primary to the flat mirror and then to the eyepiece. For a relaxed eye, total path = primary focal length + eyepiece focal length. The flat mirror only folds this path.',
    magnification: 'The magnitude at focus is primary focal length / eyepiece focal length. The signed value uses the unfolded optical plane; the folded view is rotated by the secondary mirror.',
    try: 'Change the optical path to move the eyepiece, then use “Focus for relaxed eye”. Compare with the refractor: light reflects back here instead of passing through an objective lens.',
  },
};
export default function InstrumentHUD({ params, optics, onVisibleChange }) {
  const [expanded, setExpanded] = useState(false);
  const guide = guides[params.mode];
  const mm = value => value === null ? '—' : `${(Math.abs(value) < 0.000005 ? 0 : value * 1000).toFixed(2)} mm`;
  return <SimulationTransparentHUD visible={params.hudVisible} onVisibleChange={onVisibleChange} title={guide.title}
    rows={[{ label: 'Focus error', value: mm(optics.focusError) }, { label: 'Magnification', value: optics.angularMagnification === null ? 'Refocus first' : `${optics.angularMagnification.toFixed(1)}×` }, { label: 'Target optical path', value: mm(optics.idealSeparation) }]}>
    <Typography sx={{ color: '#cbd5e1', fontSize: 11, lineHeight: 1.5 }}>{guide.path}</Typography>
    <Button aria-expanded={expanded} aria-controls="optics-hud-guide" onClick={() => setExpanded(!expanded)} sx={{ pointerEvents: 'auto', alignSelf: 'flex-start', color: '#67e8f9', textTransform: 'none', minHeight: 44, px: 0.5, background: 'transparent' }}>
      {expanded ? '− Close optical guide' : '+ How this instrument works'}
    </Button>
    {expanded && <Box id="optics-hud-guide" role="region" aria-label="Optical instrument guide" tabIndex={0}
      sx={{ pointerEvents: 'auto', maxHeight: { xs: '22dvh', md: '42dvh' }, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', pr: 1, background: 'transparent' }}>
      {[
        ['Optical elements', guide.elements], ['Find the focus', guide.focus], ['Understand magnification', guide.magnification], ['Try it', guide.try],
        ['Read the measurements', 'Focus error is current optical path minus its relaxed-eye target. Zero means focus at infinity. Exit angular spread measures how parallel the sampled outgoing rays are; a smaller value means better relaxed-eye focus. A finite final image may still be visible to an accommodating eye, which this model does not simulate.'],
        ['Model & display', 'Esbiko Physics uses ideal, monochromatic paraxial rays. Lens and mirror silhouettes are schematic; the parabolic primary drawing is not a full surface ray trace. No diffraction, aberrations, aperture clipping or secondary obstruction. The circular image is an illustrative blur preview. Run rays animates direction, not the physical speed of light.'],
      ].map(([title, body]) => <Box key={title} sx={{ mb: 1.3 }}><Typography sx={{ color: '#67e8f9', fontWeight: 700, fontSize: 12 }}>{title}</Typography><Typography sx={{ color: '#e2e8f0', fontSize: 12, lineHeight: 1.6 }}>{body}</Typography></Box>)}
    </Box>}
  </SimulationTransparentHUD>;
}

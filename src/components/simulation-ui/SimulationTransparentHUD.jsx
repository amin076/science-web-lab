import { Box, Button, Stack, Typography } from '@mui/material';

// Only the toggle receives input; the transparent readout never blocks scene gestures.
export default function SimulationTransparentHUD({ visible, onVisibleChange, title = 'Live measurements', rows = [] }) {
  return <Box data-transparent-hud="true" sx={{ background: 'transparent', border: 0, boxShadow: 'none', backdropFilter: 'none', pointerEvents: 'none', maxWidth: { xs: 220, sm: 320 }, textShadow: '0 1px 4px #000, 0 0 8px #000' }}>
    <Button size="small" aria-expanded={visible} aria-label={visible ? 'Hide HUD' : 'Show HUD'} onClick={() => onVisibleChange(!visible)}
      sx={{ pointerEvents: 'auto', color: '#e2e8f0', background: 'transparent', border: '1px solid rgba(226,232,240,0.35)', borderRadius: '8px', minHeight: 44, textTransform: 'none', '&:hover': { background: 'transparent', borderColor: '#38bdf8' } }}>
      {visible ? 'Hide HUD' : 'Show HUD'}
    </Button>
    {visible && <Stack spacing={0.35} sx={{ mt: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#67e8f9' }}>{title}</Typography>
      {rows.map(({ label, value }) => <Typography key={label} sx={{ fontSize: { xs: 11, sm: 12 }, color: '#f1f5f9' }}>{label}: {value}</Typography>)}
    </Stack>}
  </Box>;
}

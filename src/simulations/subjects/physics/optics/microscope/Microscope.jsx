import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, MenuItem, Select, Slider, Stack, Typography, Button, Chip } from '@mui/material';
import { readEmbeddedMcpParameters } from '@/platform/agent';
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from '@/webmcp/registerWebMcpTools.js';
import MicroscopeSpecimens, { SPECIMENS, microscopeFieldWidthUm } from './MicroscopeSpecimens';

const ID = 'physics.optics.microscope';
const DEFAULT = { focus: 0.5, zoom: 1, light: 1, specimen: 'leaf' };
const limits = { focus: [0, 1], zoom: [1, 10], light: [0.2, 2] };
const validate = (patch) => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw Error('Expected microscope settings object');
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'specimen') {
      if (!Object.prototype.hasOwnProperty.call(SPECIMENS, value)) throw Error('Invalid specimen');
    } else if (!limits[key] || typeof value !== 'number' || !Number.isFinite(value) || value < limits[key][0] || value > limits[key][1]) {
      throw Error('Invalid microscope parameter: ' + key);
    }
  }
};
export default function MicroscopeSimulation() {
  const embedded = useMemo(() => readEmbeddedMcpParameters(ID, DEFAULT), []);
  const initial = useMemo(() => {
    const safe = { ...DEFAULT };
    for (const [key, value] of Object.entries(embedded.values || {})) {
      try { validate({ [key]: value }); safe[key] = value; } catch { /* ignore stale embedded settings */ }
    }
    return safe;
  }, [embedded]);
  const [settings, setSettings] = useState(initial);
  const stateRef = useRef(initial);
  const configure = (patch) => {
    validate(patch);
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setSettings(next);
    return { simulationId: ID, ...next, magnification: Math.round(next.zoom * 100), fieldWidthUm: microscopeFieldWidthUm(next.zoom * 100) };
  };
  const api = useRef(null);
  api.current = { configure, getState: () => ({ simulationId: ID, ...stateRef.current, magnification: Math.round(stateRef.current.zoom * 100), fieldWidthUm: microscopeFieldWidthUm(stateRef.current.zoom * 100) }), reset: () => configure(DEFAULT) };
  useEffect(() => {
    const controller = new AbortController();
    const empty = { type: 'object', properties: {}, additionalProperties: false };
    const props = {
      focus: { type: 'number', minimum: 0, maximum: 1 },
      zoom: { type: 'number', minimum: 1, maximum: 10 },
      light: { type: 'number', minimum: 0.2, maximum: 2 },
      specimen: { type: 'string', enum: Object.keys(SPECIMENS) },
    };
    const tools = [
      { name: 'esbiko_microscope_get_state', description: 'Read live virtual microscope sample, focus, magnification and illumination.', inputSchema: empty, annotations: { readOnlyHint: true }, execute: createSafeToolExecutor('microscope_get_state', async () => api.current.getState()) },
      { name: 'esbiko_microscope_configure', description: 'Choose a biological specimen and adjust microscope focus, zoom or illumination.', inputSchema: { type: 'object', properties: props, additionalProperties: false }, execute: createSafeToolExecutor('microscope_configure', async values => api.current.configure(values)) },
      { name: 'esbiko_microscope_reset', description: 'Restore default virtual microscope specimen and optical controls.', inputSchema: empty, execute: createSafeToolExecutor('microscope_reset', async () => api.current.reset()) },
    ];
    registerWebMcpTools({ modelContext: getDocumentModelContext(), tools, signal: controller.signal }).catch(err => {
      if (!controller.signal.aborted) console.warn('Microscope WebMCP:', err);
    });
    return () => controller.abort();
  }, []);
  const magnification = Math.round(settings.zoom * 100);
  const adjust = (key, value) => configure({ [key]: value });
  return <Box sx={{ width: '100%', minHeight: '100%', overflowY: 'auto', bgcolor: '#020617', color: '#e2e8f0', p: { xs: 1.5, md: 3 }, boxSizing: 'border-box' }}>
    <Stack spacing={2} sx={{ maxWidth: 1050, mx: 'auto' }}>
      <Typography variant="h5" sx={{ color: '#4ade80', fontWeight: 700 }}>Virtual Microscope</Typography>
      <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>Explore specimens at a calibrated field scale. Illustrative biology, not captured microscopy images.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.8fr) minmax(240px, 1fr)' }, gap: 2, alignItems: 'start' }}>
        <MicroscopeSpecimens specimen={settings.specimen} magnification={magnification} focus={settings.focus} light={settings.light} />
        <Stack spacing={2} sx={{ bgcolor: '#101c30', p: 2, borderRadius: 2, minWidth: 0 }}>
          <Typography variant="subtitle1">Specimen & optics</Typography>
          <Select size="small" value={settings.specimen} onChange={event => adjust('specimen', event.target.value)} aria-label="Biological specimen" sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}>
            {Object.entries(SPECIMENS).map(([key, data]) => <MenuItem key={key} value={key}>{data.name}</MenuItem>)}
          </Select>
          <Chip label={`${magnification}× · field width ≈ ${microscopeFieldWidthUm(magnification).toFixed(0)} µm`} sx={{ color: '#cffafe' }} />
          {[
            ['zoom', 'Magnification', `${magnification}×`, 0.1],
            ['focus', 'Focus', settings.focus.toFixed(2), 0.01],
            ['light', 'Illumination', settings.light.toFixed(2), 0.05],
          ].map(([key, title, reading, step]) => <Box key={key}>
            <Typography sx={{ fontSize: 13 }}>{title}: {reading}</Typography>
            <Slider value={settings[key]} min={limits[key][0]} max={limits[key][1]} step={step} onChange={(_, val) => adjust(key, val)} aria-label={title} />
          </Box>)}
          <Button variant="outlined" onClick={() => api.current.reset()}>Reset microscope</Button>
          <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>The scale bar changes with magnification. Focus controls schematic blur. Optical resolving power is limited even at high magnification.</Typography>
        </Stack>
      </Box>
    </Stack>
  </Box>;
}

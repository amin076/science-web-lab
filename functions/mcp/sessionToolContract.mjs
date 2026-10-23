// Public operations are individually discoverable; there is no MCP command executor.
export const SESSION_ACTION_TO_TOOL=Object.freeze({
  get_state:"read_simulation_session",
  get_capabilities:"get_simulation_control_schema",
  configure:"configure_simulation_session",
  advance:"advance_simulation_session",
  step:"step_simulation_session",
  play:"play_simulation_session",
  pause:"pause_simulation_session",
  reset:"reset_simulation_session",
  set_camera:"set_simulation_camera",
  clear_trails:"clear_simulation_trails",
  get_trajectory:"get_simulation_trajectory",
  fire:"excite_simulation_session",
});
export const SESSION_OPERATION_TOOLS=Object.freeze(Object.values(SESSION_ACTION_TO_TOOL));
export function publicControlDescriptor(descriptor){
  const {commands,...metadata}=descriptor;
  return {...metadata,tools:(commands||[]).map(action=>SESSION_ACTION_TO_TOOL[action]).filter(Boolean)};
}

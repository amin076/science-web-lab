import {
  MOON_LANDER_STATUS,
  cloneJson,
  createInitialMoonLanderState,
  createMoonLanderMission,
} from "./defaults";
import { stepMoonLanderPhysics } from "./moonLanderPhysics";
import { scoreMoonLanderAttempt } from "./moonLanderScoring";

function isTerminalStatus(status) {
  return (
    status === MOON_LANDER_STATUS.LANDED ||
    status === MOON_LANDER_STATUS.CRASHED
  );
}

export function createMoonLanderEngine(options = {}) {
  let mission = createMoonLanderMission(options.mission);
  let initialState = createInitialMoonLanderState(mission);
  let state = cloneJson(initialState);

  function getState() {
    return cloneJson(state);
  }

  function initialize(nextOptions = {}) {
    mission = createMoonLanderMission(nextOptions.mission || options.mission);
    initialState = createInitialMoonLanderState(mission);
    state = cloneJson(initialState);

    return getState();
  }

  function reset() {
    state = cloneJson(initialState);

    return getState();
  }

  function pause() {
    if (state.status === MOON_LANDER_STATUS.RUNNING) {
      state = {
        ...state,
        status: MOON_LANDER_STATUS.PAUSED,
      };
    }

    return getState();
  }

  function resume() {
    if (
      state.status === MOON_LANDER_STATUS.PAUSED ||
      state.status === MOON_LANDER_STATUS.READY
    ) {
      state = {
        ...state,
        status: MOON_LANDER_STATUS.RUNNING,
      };
    }

    return getState();
  }

  function update(deltaTime = 0, input = {}) {
    if (isTerminalStatus(state.status)) {
      return getState();
    }

    const stepped = stepMoonLanderPhysics(state, input, deltaTime, mission);
    const nextState = stepped.state;

    if (stepped.outcome) {
      nextState.result = scoreMoonLanderAttempt(nextState, stepped.outcome);
    }

    state = nextState;

    return getState();
  }

  function getResult() {
    return state.result ? cloneJson(state.result) : null;
  }

  function getScore() {
    return state.result?.score || 0;
  }

  return {
    initialize,
    update,
    reset,
    pause,
    resume,
    getState,
    getResult,
    getScore,
  };
}

export { MOON_LANDER_STATUS, createMoonLanderMission };

import { useReducer } from "react";
import { generateId, DEFAULT_VALUES } from "../../CircuitUtils";

const initialState = {
  components: [],
  connections: [],
  selectedId: null,

  // interaction
  connectingFrom: null,
  hoveredTerminal: null,
  dragState: null,
  mousePos: { x: 0, y: 0 },

  // simulation
  isSimulating: false,
  results: null,
  animOffset: 0,

  // labs
  lab: null, // null | "capacitor" | "resistor" | "inductor"
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_COMPONENT": {
      const { compType, x, y } = action;
      const id = generateId();

      const newComp = {
        id,
        type: compType,
        x,
        y,
        rotation: 0,
        props: { ...DEFAULT_VALUES[compType] },
      };

      return {
        ...state,
        components: [...state.components, newComp],
        selectedId: id,
      };
    }

    case "UPDATE_COMPONENT": {
      const { id, patch } = action;
      return {
        ...state,
        components: state.components.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            ...patch,
            props: { ...c.props, ...(patch.props || {}) },
          };
        }),
      };
    }

    case "ROTATE_COMPONENT": {
      const { id } = action;
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
        ),
      };
    }

    case "DELETE_COMPONENT": {
      const { id } = action;
      return {
        ...state,
        components: state.components.filter((c) => c.id !== id),
        connections: state.connections.filter(
          (w) => w.fromComponent !== id && w.toComponent !== id
        ),
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }

    case "ADD_CONNECTION":
      return {
        ...state,
        connections: [...state.connections, action.connection],
      };

    case "DELETE_CONNECTION":
      return {
        ...state,
        connections: state.connections.filter((c) => c.id !== action.id),
      };

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "SET_INTERACTION":
      return { ...state, ...action.patch };

    case "SET_SIMULATING":
      return { ...state, isSimulating: action.value };

    case "SET_RESULTS":
      return { ...state, results: action.results };

    case "TICK_ANIM":
      return { ...state, animOffset: state.animOffset + action.delta };

    case "RESET_SIM":
      return { ...state, results: null, animOffset: 0, isSimulating: false };

    case "CLEAR_ALL":
      return { ...initialState };

    case "OPEN_LAB":
      return { ...state, lab: action.lab };

    case "CLOSE_LAB":
      return { ...state, lab: null };

    default:
      return state;
  }
}

export function useCircuitReducer() {
  return useReducer(reducer, initialState);
}

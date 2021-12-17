import produce from "immer";
import set from "lodash/set";

const initialState = {
  activeMqs: [],
  activeMqsToDelete: [],
  contentType: [],
  activeMqToDelete: null,
  loadingActiveMqs: true,
  loadingContentType: true,
};

const reducer = (state, action) =>
  // eslint-disable-next-line consistent-return
  produce(state, (draftState) => {
    switch (action.type) {
      case "GET_DATA_SUCCEEDED": {
        draftState.activeMqs = action.data;
        draftState.loadingActiveMqs = false;
        break;
      }

      case "GET_CONTENTTYPE_SUCCEEDED": {
        draftState.contentType = action.data;
        draftState.loadingContentType = false;
        break;
      }

      case "TOGGLE_LOADING": {
        draftState.loadingActiveMqs = !state.loadingActiveMqs;
        draftState.loadingContentType = !state.loadingContentType;
        break;
      }

      case "SET_ACTIVEMQ_ENABLED": {
        set(draftState, ["activeMqs", ...action.keys], action.value);
        break;
      }

      case "SET_ACTIVEMQ_TO_DELETE": {
        draftState.activeMqToDelete = action.id;
        break;
      }
      case "SET_ACTIVEMQS_TO_DELETE": {
        if (action.value) {
          draftState.activeMqsToDelete.push(action.id);
        } else {
          draftState.activeMqsToDelete = state.activeMqsToDelete.filter(
            (id) => id !== action.id
          );
        }

        break;
      }
      case "SET_ALL_ACTIVEMQS_TO_DELETE": {
        if (state.activeMqsToDelete.length === 0) {
          draftState.activeMqsToDelete = state.activeMqs.map(
            (activeMq) => activeMq.id
          );
        } else {
          draftState.activeMqsToDelete = [];
        }

        break;
      }
      case "ACTIVEMQS_DELETED": {
        draftState.activeMqs = state.activeMqs.filter(
          (activeMq) => !state.activeMqsToDelete.includes(activeMq.id)
        );
        draftState.activeMqsToDelete = [];
        break;
      }
      case "ACTIVEMQ_DELETED": {
        draftState.activeMqs = state.activeMqs.filter(
          (_, index) => index !== action.index
        );
        draftState.activeMqToDelete = null;

        break;
      }
      default:
        return draftState;
    }
  });

export default reducer;
export { initialState };

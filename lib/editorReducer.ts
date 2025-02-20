import {
  ButtonElement,
  EditorAction,
  EditorElement,
  FrameElement,
  ListElement,
} from "./type";

export const elementsReducer = (
  state: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  switch (action.type) {
    case "ADD_ELEMENT":
      return [...state, action.payload];

    case "UPDATE_ELEMENT": {
      const { id, updates } = action.payload;

      const updateElement = (element: EditorElement): EditorElement => {
        if (element.id === id) {
          return { ...element, ...updates };}

        if (element.type === "Frame" && (element as FrameElement).elements) {
          return {
            ...element,
            elements: (element as FrameElement).elements.map(updateElement),
          };
        }

        return element;
      };

      return state.map(updateElement);
    }

    case "DELETE_ELEMENT": {
      const deleteElement = (element: EditorElement): EditorElement | null => {
        if (element.id === action.payload) {
          return null;
        }

        if (element.type === "Frame" && (element as FrameElement).elements) {
          const updatedElements = (element as FrameElement).elements
            .map(deleteElement)
            .filter((el): el is EditorElement => el !== null);

          return {
            ...element,
            elements: updatedElements,
          };
        }

        return element;
      };

      const updatedState = state
        .map(deleteElement)
        .filter((el): el is EditorElement => el !== null);

      return updatedState;
    }

    case "SAVE_ELEMENTS_TO_LOCAL_STORAGE":
      localStorage.setItem("elements", JSON.stringify(state));
      return state;

    case "LOAD_ELEMENTS_FROM_LOCAL_STORAGE":
      return action.payload;

    case "UPDATE_ALL_ELEMENTS": {
      const { payload: updates } = action;

      const updateElement = (element: EditorElement): EditorElement => {
        const updatedElement = { ...element, ...updates };

        if (
          updatedElement.type === "Frame" &&
          (updatedElement as FrameElement).elements
        ) {
          return {
            ...updatedElement,
            elements: (updatedElement as FrameElement).elements.map(
              updateElement
            ),
          };
        }

        return updatedElement;
      };

      return state.map(updateElement);
    }

    case "UPDATE_ALL_SELECTED_ELEMENTS": {
      const { payload: updates } = action;

      const updateSelectedElement = (element: EditorElement): EditorElement => {
        if (element.isSelected) {
          const updatedElement = { ...element, ...updates };

          if (
            updatedElement.type === "Frame" &&
            (updatedElement as FrameElement).elements
          ) {
            return {
              ...updatedElement,
              elements: (updatedElement as FrameElement).elements.map(
                updateSelectedElement
              ),
            };
          }

          return updatedElement;
        }

        return element;
      };

      return state.map(updateSelectedElement);
    }

    case "UPDATE_LIST_ITEM":
      return state.map((element) => {
        if (element.type === "List" && element.id === action.payload.listId) {
          return {
            ...element,
            items: (element as ListElement).items.map((item) =>
              item.id === action.payload.itemId
                ? { ...item, ...action.payload.updates }
                : item
            ),
          };
        }
        return element;
      });

    case "UPDATE_FRAME_ELEMENT": {
      const { childUpdates, updates } = action.payload;

      const updateChildElement = (element: EditorElement): EditorElement => {
        if (element.id === childUpdates) {
          return {
            ...element,
            ...updates,
          };
        }

        if (element.type === "Frame" && (element as FrameElement).elements) {
          return {
            ...element,
            elements: (element as FrameElement).elements.map(
              updateChildElement
            ),
          };
        }

        return element;
      };

      return state.map(updateChildElement);
    }

    case "UNDO":
      return state.slice(0, -1);

    case "REDO":
      return state.concat(action.payload);
    default:
      return state;
  }
};

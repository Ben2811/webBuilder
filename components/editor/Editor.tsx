import React, { useRef, useState, useCallback, useEffect } from "react";
import ContextMenu from "./EditorContextMenu";
import DOMPurify from "dompurify";
import { useEditorContext, useImageUploadContext } from "@/lib/context";
import { ButtonElement, EditorElement, Element } from "@/lib/type";
import { blobToBase64 } from "@/app/utils/HandleImage";

const Editor = () => {
  const { elements, dispatch } = useEditorContext();
  const { uploadImages, setUploadImages } = useImageUploadContext();

  const [prevElementStyle, setPrevElementStyle] =
    useState<React.CSSProperties>();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditorElement>();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [draggingElement, setDraggingElement] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [resizingElement, setResizingElement] = useState<{
    id: string;
    direction: "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const gridSize = 20;

  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch({
      type: "SAVE_ELEMENTS_TO_LOCAL_STORAGE",
      payload: elements,
    });
  }, [elements, dispatch]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, id: string) => {
      e.preventDefault();
      const selectElement = elements.find((element) => element.id === id);
      if (selectElement?.isSelected) {
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
        setSelectedElement(selectElement);
        console.log(selectElement);
      }
    },
    [elements]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const newElement = e.dataTransfer.getData("elementType");
      if (newElement) {
        if (newElement !== "Button") {
          const element: Element = {
            type: newElement,
            id: newElement + "-" + Date.now(),
            content: newElement,
            isSelected: false,
            x: e.clientX,
            y: e.clientY,
            styles: {
              height: "50px",
              width: "100px",
              textAlign: "center",
            },
          };
          dispatch({
            type: "ADD_ELEMENT",
            payload: element,
          });
        } else {
          const buttonElement: ButtonElement = {
            type: "Button",
            id: "Button-" + Date.now(),
            content: "Button",
            isSelected: false,
            x: e.clientX,
            y: e.clientY,
            styles: {
              height: "50px",
              width: "100px",
              textAlign: "center",
            },
          };
          dispatch({
            type: "ADD_ELEMENT",
            payload: buttonElement,
          });
        }
      }
    },
    [dispatch]
  );
  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const selectedElement = elements.find((element) => element.isSelected);
      if (selectedElement) {
        const textToCopy = JSON.stringify(selectedElement);

        if (navigator.clipboard) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            console.log("Element copied to clipboard:", selectedElement);
          });
        }
      }
      setShowContextMenu(false);
    },
    [elements]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      try {
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
          if (item.types.includes("image/png")) {
            const blob = await item.getType("image/png");
            const base64 = await blobToBase64(blob);
            const imageContent = /* html */ `<img src="${base64}" style="pointer-events: none;" />`;

            setUploadImages([...uploadImages, base64]);
            const newElement: Element = {
              type: "Image",
              id: `Image-${Date.now()}`,
              content: imageContent,
              isSelected: false,
              x: 50,
              y: 50,
              styles: {
                height: "50px",
                width: "100px",
                textAlign: "center",
              },
            };

            dispatch({
              type: "ADD_ELEMENT",
              payload: newElement,
            });

            return;
          }

          if (item.types.includes("text/plain")) {
            const text = await item.getType("text/plain");
            const textContent = await text.text();

            try {
              const clipboardText: Element = JSON.parse(textContent);
              const newElement: Element = {
                type: clipboardText.type,
                id: `${clipboardText.type}-${Date.now()}`,
                content: clipboardText.content,
                isSelected: false,
                x: clipboardText.x + 50,
                y: clipboardText.y + 50,
                styles: {
                  ...clipboardText.styles,
                },
              };

              dispatch({
                type: "ADD_ELEMENT",
                payload: newElement,
              });
            } catch (err) {
              console.error("Failed to parse clipboard text as JSON:", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to read clipboard data:", err);
      }
    },
    [dispatch]
  );

  const onResizeHandleMouseDown = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      id: string,
      direction: "nw" | "ne" | "sw" | "se"
    ) => {
      e.stopPropagation();
      const element = elements.find((element) => element.id === id);
      if (element && element.styles) {
        setResizingElement({
          id,
          direction,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: parseInt(element.styles.width?.toString() || "100", 10),
          startHeight: parseInt(element.styles.height?.toString() || "50", 10),
        });
      }
    },
    [elements]
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>, id: string) => {
      let newContent = e.currentTarget.innerHTML;

      if (newContent.includes("<br>")) {
        newContent = newContent.replace(/<br>/g, "");
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = newContent;

      const anchorElement = tempDiv.querySelector("a");
      if (anchorElement) {
        const href = anchorElement.getAttribute("href") || "";
        const textContent = tempDiv.textContent || "";
        let updatedContent = `<a href="${href}">${textContent}</a>`;

        if (updatedContent.includes("<br>")) {
          updatedContent = updatedContent.replace(/<br>/g, "");
        }
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: { id, updates: { content: updatedContent } },
        });
      } else {
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: { id, updates: { content: newContent } },
        });
      }
    },
    [dispatch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
      if (e.key === "End") {
        dispatch({ type: "DELETE_ELEMENT", payload: id });
      }
      if (e.key === "Escape") {
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: { id, updates: { isSelected: false } },
        });
      }
    },
    [dispatch]
  );
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "z" && e.ctrlKey) {
        const selectedElement = elements.find((element) => element.isSelected);
        e.preventDefault();
        if (selectedElement?.isSelected) {
          dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
              id: selectedElement.id,
              updates: { styles: prevElementStyle },
            },
          });
        } else {
          dispatch({ type: "UNDO", payload: elements });
        }
      }
      if (e.key === "y" && e.ctrlKey) {
        e.preventDefault();
        dispatch({ type: "REDO", payload: elements });
      }
    },
    [dispatch, elements, selectedElement, prevElementStyle]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, id: string) => {
      e.currentTarget.focus();
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: { id, updates: { isSelected: true } },
      });
    },
    [dispatch]
  );

  const handleDeselectAll = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      dispatch({ type: "UPDATE_ALL_ELEMENTS", payload: { isSelected: false } });
      // setSelectedElement(undefined);
      // setPrevElementStyle(undefined);
    },
    [dispatch]
  );

  const onMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
    selected: boolean
  ) => {
    const element = elements.find((element) => element.id === id);

    const target = e.target as HTMLElement;
    if (
      (target.closest("button") ||
        target.closest("input") ||
        target.closest("a")) &&
      !selected
    ) {
      return;
    }
    if (selected) {
      e.stopPropagation();
      return;
    }
    if (element) {
      const offsetX = e.clientX - element.x;
      const offsetY = e.clientY - element.y;

      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          id,
          updates: {
            styles: { ...element.styles, border: "2px dotted black" },
          },
        },
      });
      setDraggingElement({ id, offsetX, offsetY });
    }
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (draggingElement) {
        const x = e.clientX - draggingElement.offsetX;
        const y = e.clientY - draggingElement.offsetY;

        dispatch({
          type: "UPDATE_ELEMENT",
          payload: { id: draggingElement.id, updates: { x, y } },
        });

        elements.map((element) => {
          if (element.id !== draggingElement.id) {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                id: element.id,
                updates: {
                  styles: { ...element.styles, border: "2px dotted black" },
                },
              },
            });
          }
        });
      } else if (resizingElement) {
        const { id, direction, startX, startY, startWidth, startHeight } =
          resizingElement;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        switch (direction) {
          case "se":
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
            break;
          case "sw":
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
            break;
          case "ne":
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
            break;
          case "nw":
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
            break;
        }

        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            id,
            updates: {
              styles: {
                ...elements.find((element) => element.id === id)?.styles,
                width: `${newWidth}px`,
                height: `${newHeight}px`,
              },
            },
          },
        });
      }
    },
    [draggingElement, resizingElement, dispatch]
  );

  const onMouseUp = useCallback(() => {
    if (draggingElement) {
      const element = elements.find((e) => e.id === draggingElement.id);
      if (element) {
        const x = Math.round(element.x / gridSize) * gridSize;
        const y = Math.round(element.y / gridSize) * gridSize;

        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            id: draggingElement.id,
            updates: { x, y, styles: { ...element.styles, border: "" } },
          },
        });

        elements.map((element) => {
          if (element.id !== draggingElement.id) {
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                id: element.id,
                updates: {
                  styles: { ...element.styles, border: "" },
                },
              },
            });
          }
        });
      }
      setDraggingElement(null);
    } else if (resizingElement) {
      setResizingElement(null);
    }
  }, [draggingElement, resizingElement, elements, dispatch, gridSize]);

  return (
    <div
      id="canvas"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        e.currentTarget.focus();
        handleDeselectAll(e);
        if (showContextMenu) setShowContextMenu(false);
      }}
      onDrop={onDrop}
      onKeyDown={(e) => handleEditorKeyDown(e)}
      onDragOver={(e) => e.preventDefault()}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onPaste={(e) => handlePaste(e)}
      tabIndex={0}
      className="w-screen h-auto bg-slate-300 overflow-hidden"
    >
      {elements.map((element) => (
        <div
          key={element.id}
          onContextMenu={(e) => onContextMenu(e, element.id)}
          onDoubleClick={(e) => {
            handleDoubleClick(e, element.id);
            e.stopPropagation();
          }}
          onMouseDown={(e) => onMouseDown(e, element.id, element.isSelected)}
          onKeyDown={(e) => handleKeyDown(e, element.id)}
          onCopy={(e) => handleCopy(e)}
          tabIndex={0}
          style={{
            position: "absolute",
            left: element.x,
            top: element.y,
            width: element.styles?.width || "100px",
            height: element.styles?.height || "50px",
            ...element.styles,
          }}
          className={`hover:bg-slate-100 z-50 ${
            element.isSelected
              ? "border-2 border-black hover:cursor-text "
              : "hover:cursor-pointer"
          }`}
        >
          {element.type === "Button" ? (
            <button
              id={element.id}
              contentEditable={element.isSelected}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleInput(e, element.id)}
              onClick={(element as ButtonElement).events?.onClick}
              onMouseOver={(element as ButtonElement).events?.onHover}
              style={{
                width: "90%",
                height: "90%",
              }}
            >
              {element.content}
            </button>
          ) : (
            <div
              id={element.id}
              role="textbox"
              aria-multiline="true"
              contentEditable={element.isSelected && element.type !== "Image"}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleInput(e, element.id)}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.content),
              }}
              style={{
                fontFamily: `"${element.styles?.fontFamily}"`,
                height: "100%",
                width: "100%",
                fontSize: `${element.styles?.fontSize}px`,
              }}
              ref={editableRef}
            />
          )}
          {element.isSelected && (
            <>
              <div
                className="resize-handle resize-handle-se"
                onMouseDown={(e) =>
                  onResizeHandleMouseDown(e, element.id, "se")
                }
              />
              <div
                className="resize-handle resize-handle-sw"
                onMouseDown={(e) =>
                  onResizeHandleMouseDown(e, element.id, "sw")
                }
              />
              <div
                className="resize-handle resize-handle-ne"
                onMouseDown={(e) =>
                  onResizeHandleMouseDown(e, element.id, "ne")
                }
              />
              <div
                className="resize-handle resize-handle-nw"
                onMouseDown={(e) =>
                  onResizeHandleMouseDown(e, element.id, "nw")
                }
              />
            </>
          )}
        </div>
      ))}
      {showContextMenu && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          selectedElement={selectedElement}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

export default Editor;

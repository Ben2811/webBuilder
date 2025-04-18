import { EditorElement } from "@/lib/type";
import { CSSProperties } from "react";
import { v4 as uuidv4 } from "uuid";

const commonStyles: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

export function createElements(
  name: string,
  x: number,
  y: number,
  projectId: string,
  addElementOptimistically?: (
    element: EditorElement,
    projectId: string
  ) => Promise<void>
) {
  const tempId = `${name}-${uuidv4()}`;
  const baseElement = {
    id: tempId,
    content: name,
    isSelected: false,
    x: x,
    y: y,
    styles: {
      ...commonStyles,
      height: "100px",
      width: "200px",
    },
  };

  let newElement: EditorElement;

  switch (name) {
    case "Text": {
      newElement = {
        type: "Text",
        ...baseElement,
        content: "Edit text double clicking",
        styles: {
          ...baseElement.styles,
          display: "flex",
          width: "70%",
          fontSize: "16px",
        },
        projectId: projectId,
      };
      break;
    }
    case "Button": {
      newElement = {
        type: "Button",
        buttonType: "primary",
        ...baseElement,
        styles: {
          ...baseElement.styles,
          padding: "8px 16px",
          backgroundColor: "#0070f3",
          color: "#ffffff",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
        },
        tailwindStyles: "h-10 text-black",
        projectId: projectId,
      };
      break;
    }
    case "Frame": {
      newElement = {
        type: "Frame",
        ...baseElement,
        x: 0,
        styles: {
          ...baseElement.styles,
          minHeight: "100px",
          width: "100%",
          display: "flex",
          backgroundColor: "white"
        },
        elements: [],
        projectId: projectId,
      };
      break;
    }
    case "ListItem": {
      newElement = {
        type: "ListItem",
        ...baseElement,
        styles: {
          ...baseElement.styles,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        },
        elements: [],
        projectId: projectId,
      };
      break;
    }
    case "Link": {
      newElement = {
        type: "Link",
        ...baseElement,
        styles: {
          ...baseElement.styles,
          color: "blue",
          textDecoration: "underline",
          cursor: "pointer",
        },
        href: "#",
        projectId: projectId,
      };
      break;
    }
    case "Image": {
      newElement = {
        type: "Image",
        ...baseElement,
        styles: {
          ...baseElement.styles,
          objectFit: "cover",
        },
        projectId: projectId,
      };
      break;
    }
    case "Carousel": {
      newElement = {
        type: "Carousel",
        ...baseElement,
        x: 0,
        styles: {
          ...baseElement.styles,
          width: "100%",
          height: "300px",
        },
        elements: [],
        settings: {
          dots: true,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,
        },
        projectId: projectId,
      };
      break;
    }
    default: {
      newElement = {
        type: name,
        ...baseElement,
        projectId: projectId,
      };
      break;
    }
  }

  // Use Zustand store method if provided
  if (addElementOptimistically) {
    addElementOptimistically(newElement, projectId);
  }
}

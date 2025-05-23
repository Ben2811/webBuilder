import React, { startTransition, useEffect, useState } from "react";
import { Input } from "../../../ui/input";
import BorderRadiusInput from "./inputs/BorderRadiusInput";
import FrameConfiguration from "./FrameConfiguration";
import BaseConfiguration from "./BaseConfiguration";
import CarouselConfiguration from "./CarouselConfiguration";
import { CarouselElement, FrameElement } from "@/lib/interface";
import { useEditorStore } from "@/lib/store/editorStore";
import { useElementSelectionStore } from "@/lib/store/elementSelectionStore";
import InputConfiguration from "./InputConfiguration";
import ButtonConfiguration from "./ButtonConfiguration";
import SelectConfiguration from "./SelectConfiguration";
import FormConfiguration from "./FormConfiguration";
import CanvasConfiguration from "./CanvasConfiguration";
import NavbarManager from "./NavbarManager";
import { EditorElement } from "@/lib/type";

const Configuration = () => {
  
  const { selectedElement } = useElementSelectionStore();
  const { updateElementOptimistically } = useEditorStore();

  const [localWidth, setLocalWidth] = useState(
    selectedElement?.styles?.width || ""
  );
  const [localHeight, setLocalHeight] = useState(
    selectedElement?.styles?.height || ""
  );
  const [localFontSize, setLocalFontSize] = useState(
    selectedElement?.styles?.fontSize || ""
  );

  useEffect(() => {
    setLocalWidth(selectedElement?.styles?.width || "");
    setLocalHeight(selectedElement?.styles?.height || "");
    setLocalFontSize(selectedElement?.styles?.fontSize || localFontSize);
  }, [selectedElement, localFontSize]);

  const handleWidthChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newWidth = e.currentTarget.value;
    setLocalWidth(newWidth);
    if (!selectedElement) return;

    startTransition(() => {
      updateElementOptimistically(selectedElement.id, {
        styles: {
          ...selectedElement.styles,
          width: newWidth,
        },
      });
    });
  };

  const handleHeightChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newHeight = e.currentTarget.value;
    setLocalHeight(newHeight);
    if (!selectedElement) return;

    startTransition(() => {
      updateElementOptimistically(selectedElement.id, {
        styles: {
          ...selectedElement.styles,
          height: newHeight,
        },
      });
    });
  };

  const renderConfiguration = () => {
    if (!selectedElement) return null;
    
    const isNavbar = 
      selectedElement.type === "Frame" && 
      (selectedElement.name?.toLowerCase().includes("navbar") || 
       selectedElement.name?.toLowerCase().includes("nav") ||
       (selectedElement as FrameElement).elements?.some(
         (el: EditorElement) => el.type === "Frame" && el.name?.toLowerCase().includes("link")
       ));
    
    if (isNavbar) {
      return (
        <>
          <NavbarManager />
          <FrameConfiguration selectedElement={selectedElement} />
        </>
      );
    }
    
    switch (selectedElement?.type) {
      case "Frame":
        return <FrameConfiguration selectedElement={selectedElement} />;
      case "Carousel":
        return (
          <CarouselConfiguration
            selectedElement={selectedElement as CarouselElement}
          />
        );
      case "Input":
        return <InputConfiguration selectedElement={selectedElement} />;
      case "Button":
        return <ButtonConfiguration selectedElement={selectedElement} />;
      case "Select":
        return <SelectConfiguration selectedElement={selectedElement} />;
      case "Form":
        return <FormConfiguration selectedElement={selectedElement} />;
      default:
        return (
          <BaseConfiguration
            selectedElement={selectedElement}
          />
        );
    }
  };

  return (
    <div className="m-2 w-full h-full text-xs">
      <div className="flex flex-col gap-2">
        {!selectedElement ? (
          <CanvasConfiguration />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-1 mr-4">
              <div className="flex flex-col gap-1">
                <Input
                  className="w-full text-xs p-1"
                  value={localWidth}
                  onChange={handleWidthChange}
                />
                <label className="text-xs">Width</label>
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  className="w-full text-xs p-1"
                  value={localHeight}
                  onChange={handleHeightChange}
                />
                <label className="text-xs">Height</label>
              </div>
            </div>
            {renderConfiguration()}
            <div className="flex flex-row gap-1 mr-4">
              <BorderRadiusInput selectedElement={selectedElement} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuration;

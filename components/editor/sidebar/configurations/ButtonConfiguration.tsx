import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useEditorStore } from "@/lib/store/editorStore";
import { EditorElement } from "@/lib/type";
import React, { startTransition, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { ButtonElement } from "@/lib/interface";

type Props = {
  selectedElement: EditorElement;
};

const ButtonConfiguration: React.FC<Props> = ({ selectedElement }) => {
  const { updateElementOptimistically } = useEditorStore();
  const [buttonType, setButtonType] = useState<string>(
    selectedElement.type || "single"
  );

  useEffect(() => {
    if (selectedElement) {
      const buttonElement = selectedElement as ButtonElement;
      setButtonType(buttonElement.buttonType || "single");
    }
  }, [selectedElement]);

  const handleButtonTypeChange = (value: string) => {
    if (!selectedElement) return;

    startTransition(() => {
      if (value === "multi") {
        // Convert to multi-button (dropdown)
        updateElementOptimistically(selectedElement.id, {
          type: "Button",
          buttonType: "multi",
          element: {
            type: "Frame",
            name: "Dropdown Content",
            id: uuidv4(),
            styles: {
              display: "flex",
              flexDirection: "column",
              width: "100%",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "4px",
              gap: "2px",
              overflow: "hidden",
            },
            content: "",
            elements: [
              {
                type: "Button",
                id: uuidv4(),
                content: "Option 1",
                isSelected: false,
                x: 0,
                y: 0,
                buttonType: "primary",
                styles: {
                  padding: "8px 12px",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  color: "#374151",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  fontWeight: "normal",
                  fontSize: "14px",
                },
                tailwindStyles:
                  "text-gray-700 hover:bg-gray-100 rounded w-full text-left",
              },
              {
                type: "Button",
                id: uuidv4(),
                content: "Option 2",
                isSelected: false,
                x: 0,
                y: 0,
                buttonType: "primary",
                styles: {
                  padding: "8px 12px",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  color: "#374151",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  fontWeight: "normal",
                  fontSize: "14px",
                },
                tailwindStyles:
                  "text-gray-700 hover:bg-gray-100 rounded w-full text-left",
              },
              {
                type: "Button",
                id: uuidv4(),
                content: "Option 3",
                isSelected: false,
                x: 0,
                y: 0,
                buttonType: "primary",
                styles: {
                  padding: "8px 12px",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  color: "#374151",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  fontWeight: "normal",
                  fontSize: "14px",
                },
                tailwindStyles:
                  "text-gray-700 hover:bg-gray-100 rounded w-full text-left",
              },
            ],
            isSelected: false,
            x: 0,
            y: 0,
          },
        });
        setButtonType("multi");
      } else {
        updateElementOptimistically(selectedElement.id, {
          type: "Button",
          buttonType: "single",
          element: undefined,
        });
        setButtonType("single");
      }
    });
  };

  return (
    <div className="space-y-3 mt-2">
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Button Type
        </Label>
        <Select value={buttonType} onValueChange={handleButtonTypeChange}>
          <SelectTrigger className="w-full text-sm">
            <div className="flex items-center gap-2">
              {buttonType === "multi" ? (
                <>
                  <span>Dropdown</span>
                </>
              ) : (
                <>
                  <span>Standard</span>
                </>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Standard Button</SelectItem>
            <SelectItem value="multi">Dropdown Button</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1.5">
          {buttonType === "multi"
            ? "Dropdown menu with multiple selectable options"
            : "Standard clickable button with single action"}
        </p>
      </div>
    </div>
  );
};

export default ButtonConfiguration;

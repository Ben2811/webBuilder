import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import {
  ButtonElement,
  commonProps,
  EditorComponentProps,
} from "@/lib/interface";
import FrameComponents from "./FrameComponents";
import { useEditorStore } from "@/lib/store/editorStore";
import { useElementSelectionStore } from "@/lib/store/elementSelectionStore";
import { EditorElement } from "@/lib/type";
import { ChevronUp } from "lucide-react";

type Props = EditorComponentProps & {
  commonProps?: Partial<commonProps>;
  draggingElement: EditorElement | null;
};

const ButtonComponent = ({
  element,
  commonProps,
  draggingElement,
  projectId,
  setContextMenuPosition,
  setShowContextMenu,
}: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const contentProps = {
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(element.content),
    },
  };

  if ((element as ButtonElement).buttonType === "multi") {
    return (
      <motion.div
        key={element.id}
        className={cn("relative group", "", {
          "border-black border-2 border-solid": element.isSelected,
          "z-0": element.id === draggingElement?.id,
          "z-50": element.id !== draggingElement?.id,
        })}
      >
        <motion.button
          {...commonProps}
          className={cn(
            commonProps?.className,
            "w-full flex justify-between items-center"
          )}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div {...contentProps}></div>
          <ChevronUp
            className={cn(
              "transition-transform duration-200",
              isDropdownOpen ? "rotate-180" : ""
            )}
            size={16}
          />
        </motion.button>

        {isDropdownOpen &&
          (element as ButtonElement).element &&
          setContextMenuPosition &&
          setShowContextMenu && (
            <div
              className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <FrameComponents
                element={(element as ButtonElement).element as EditorElement}
                projectId={projectId}
                setContextMenuPosition={setContextMenuPosition}
                setShowContextMenu={setShowContextMenu}
              />
            </div>
          )}
      </motion.div>
    );
  } else {
    return (
      <motion.button key={element.id} {...commonProps} {...contentProps} />
    );
  }
};

export default ButtonComponent;

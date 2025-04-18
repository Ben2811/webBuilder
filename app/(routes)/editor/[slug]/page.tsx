"use client";
import Editor from "@/components/editor/Editor";
import EditorJoyRide from "@/components/editor/EditorJoyRide";
import { useElementSelectionStore } from "@/lib/store/elementSelectionStore";
import { MessageCircleQuestion } from "lucide-react";
import React from "react";

export default function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  // const loadElementsFromDB = useEditorStore(
  //   (state) => state.loadElementsFromDB
  // );
  const { startTour, setStartTour } = useElementSelectionStore();

  // const { data: elements } = useSWR<EditorElement[]>(
  //   `${process.env.NEXT_PUBLIC_API_URL}/elements/${slug}`,
  //   GetAll
  // );

  const handleEndTour = () => setStartTour(false);

  // React.useEffect(() => {
  //   if (elements) {
  //     loadElementsFromDB(elements);
  //   }
  // }, [elements, loadElementsFromDB]);


  return (
    <>
      <Editor projectId={slug} />
      <div className="absolute top-2 right-2 z-50">
        <MessageCircleQuestion
          onClick={() => setStartTour(true)}
          size={24}
          className="text-gray-700 hover:text-blue-500 cursor-pointer transition-colors"
        />
      </div>
      {startTour && (
        <EditorJoyRide
          onTourEnd={handleEndTour}
          start={startTour}
          setStartTour={setStartTour}
        />
      )}
    </>
  );
}

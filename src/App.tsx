import { useState, useCallback, CSSProperties } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  NotDraggingStyle,
  DraggingStyle,
} from "react-beautiful-dnd";

import { getColumnsItems } from "./util/dragItems";

export interface DragItem {
  id: string;
  content: string;
}

export default function App() {
  const [columns, setColumns] = useState<Record<string, DragItem[]>>(
    getColumnsItems(4, 10)
  );

  const remove = (list: DragItem[], startIndex: number) => {
    const newList = Array.from(list);
    const [removed] = newList.splice(startIndex, 1);
    return { newList, removed };
  };

  const add = (list: DragItem[], endIndex: number, removed: DragItem) => {
    const newList = Array.from(list);
    newList.splice(endIndex, 0, removed);
    return newList;
  };

  const onDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) return;

      const isDropSameColumn =
        result.source.droppableId === result.destination.droppableId;

      const { newList: newSourceList, removed } = remove(
        columns[result.source.droppableId],
        result.source.index
      );

      const newDestinationList = add(
        isDropSameColumn
          ? newSourceList
          : columns[result.destination.droppableId],
        result.destination.index,
        removed
      );

      isDropSameColumn
        ? setColumns((prev) => ({
            ...prev,
            [result.source.droppableId]: newDestinationList,
          }))
        : setColumns((prev) => ({
            ...prev,
            [result.source.droppableId]: newSourceList,
            [result.destination?.droppableId!]: newDestinationList,
          }));
    },
    [columns]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex justify-center items-center w-[100vw] min-h-[100vh] overflow-x-hidden">
        <div className="flex justify-center items-baseline gap-x-[20px]">
          {Object.entries(columns).map(([column, items]) => (
            <div key={column}>
              <h1 className="mb-[.5rem] text-[1.5rem] font-bold text-center">
                {column}
              </h1>
              <Droppable droppableId={column}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}

const GRID = 8;

const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle
): CSSProperties => ({
  userSelect: "none",
  padding: GRID * 2,
  margin: `0 0 ${GRID}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: GRID,
  width: 250,
});

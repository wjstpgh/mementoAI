import { useState, useCallback, CSSProperties, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  NotDraggingStyle,
  DraggingStyle,
  OnDragUpdateResponder,
} from "react-beautiful-dnd";

import { getColumnsItems, isEven } from "./util/dragItems";

export interface DragItem {
  id: string;
  content: string;
}

const RESTRICT_TYPE_MSG = {
  COLUMN: "첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능합니다.",
  EVEN: "짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.",
};

const DEFUALT_RESTRICT_STATE = { isInvalid: false, typeMsg: "" };

export default function App() {
  const [columns, setColumns] = useState<Record<string, DragItem[]>>(
    getColumnsItems(4, 10)
  );
  const [restricted, setRestricted] = useState(DEFUALT_RESTRICT_STATE);

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
      if (restricted.isInvalid) {
        setRestricted(DEFUALT_RESTRICT_STATE);
        return;
      }

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
    [columns, restricted]
  );

  const onDragUpdate: OnDragUpdateResponder = useCallback(
    (update) => {
      if (!update.destination) return;

      const isDropSameColumn =
        update.source.droppableId === update.destination.droppableId;

      const draggedItem =
        columns[update.source.droppableId][update.source.index];

      const { newList: destinationList } = isDropSameColumn
        ? remove(columns[update.destination.droppableId], update.source.index)
        : { newList: columns[update.destination.droppableId] };

      const destinationItem = destinationList[update.destination.index];

      if (
        update.source.droppableId === "column1" &&
        update.destination.droppableId === "column3"
      ) {
        setRestricted({ isInvalid: true, typeMsg: RESTRICT_TYPE_MSG.COLUMN });
        return;
      }

      if (isEven(draggedItem) && destinationItem && isEven(destinationItem)) {
        setRestricted({ isInvalid: true, typeMsg: RESTRICT_TYPE_MSG.EVEN });
        return;
      }

      setRestricted({ isInvalid: false, typeMsg: "" });
    },
    [columns]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
      <div className="relative flex flex-col justify-center items-center w-[100vw] min-h-[100vh] overflow-x-hidden">
        <div className="fixed top-[100px]">
          <p className="text-red-500 text-[2rem] font-bold">
            {restricted.typeMsg}
          </p>
        </div>
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
                              provided.draggableProps.style,
                              restricted.isInvalid && snapshot.isDragging
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
  draggableStyle?: DraggingStyle | NotDraggingStyle,
  isRestricted?: boolean
): CSSProperties => ({
  userSelect: "none",
  padding: GRID * 2,
  margin: `0 0 ${GRID}px 0`,
  background: isDragging ? (isRestricted ? "red" : "lightgreen") : "grey",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: GRID,
  width: 250,
});

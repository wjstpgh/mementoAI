import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from "react-beautiful-dnd";

import {
  add,
  getColumnsItems,
  getDragAndDropEventValues,
  isEven,
  remove,
} from "./util/dragNDrop";
import { DragItem } from "./type";
import { DEFUALT_RESTRICT_STATE, RESTRICT_TYPE_MSG } from "./constant";
import { getItemStyle, getListStyle } from "./dynamicStyle";

export default function App() {
  const [columns, setColumns] = useState<Record<string, DragItem[]>>(
    getColumnsItems(4, 10),
  );
  const [restricted, setRestricted] = useState(DEFUALT_RESTRICT_STATE);
  const [selectedItems, setSelectedItems] = useState<Set<DragItem>>(new Set());
  const [selectedColumn, setSelectedColumn] = useState("");

  const handleSelect = (item: DragItem, column: string) => {
    if (selectedColumn !== column) {
      setSelectedColumn(column);
      setSelectedItems(new Set());
    }

    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const onDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) return;
      if (restricted.isInvalid) {
        setRestricted(DEFUALT_RESTRICT_STATE);
        return;
      }

      const { isDropSameColumn, movedTarget, isMultiDrag } =
        getDragAndDropEventValues(result, columns, selectedItems);

      const newSourceList = remove(
        columns[result.source.droppableId],
        movedTarget,
      );

      const newDestinationList = add(
        isDropSameColumn
          ? newSourceList
          : columns[result.destination.droppableId],
        result.destination.index,
        movedTarget,
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

      isMultiDrag && setSelectedItems(new Set());
    },
    [columns, restricted, selectedItems],
  );

  const onDragUpdate: OnDragUpdateResponder = useCallback(
    (update) => {
      if (!update.destination) return;

      const { isDropSameColumn, movedTarget } = getDragAndDropEventValues(
        update,
        columns,
        selectedItems,
      );

      const draggedLastItem = Array.from(movedTarget)[movedTarget.size - 1];

      const destinationList = isDropSameColumn
        ? remove(columns[update.destination.droppableId], movedTarget)
        : columns[update.destination.droppableId];

      const destinationItem = destinationList[update.destination.index];

      if (
        update.source.droppableId === "column1" &&
        update.destination.droppableId === "column3"
      ) {
        setRestricted({ isInvalid: true, typeMsg: RESTRICT_TYPE_MSG.COLUMN });
        return;
      }

      if (
        isEven(draggedLastItem) &&
        destinationItem &&
        isEven(destinationItem)
      ) {
        setRestricted({ isInvalid: true, typeMsg: RESTRICT_TYPE_MSG.EVEN });
        return;
      }

      setRestricted({ isInvalid: false, typeMsg: "" });
    },
    [columns, selectedItems],
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
                              restricted.isInvalid && snapshot.isDragging,
                              selectedItems.has(item),
                            )}
                            onClick={() => handleSelect(item, column)}
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

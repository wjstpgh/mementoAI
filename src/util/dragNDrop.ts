import { DragUpdate, DropResult } from "react-beautiful-dnd";

import { DragItem } from "../type";

const getItems = (count: number, column: number) =>
  Array.from({ length: count }, (_, k) => k).map((k) => ({
    id: `item-${column}-${k + 1}`,
    content: `item ${column}-${k + 1}`,
  }));

export const getColumnsItems = (columnCount: number, itemCount: number) =>
  Array.from({ length: columnCount }).reduce(
    (acc: object, _, idx) => ({
      ...acc,
      [`column${idx + 1}`]: getItems(itemCount, idx + 1),
    }),
    {} as Record<string, DragItem[]>,
  );

export const isEven = (item: DragItem) =>
  parseInt(item.id.split("-")[2]) % 2 === 0;

export const remove = (list: DragItem[], removeTarget: Set<DragItem>) => {
  const newList = Array.from(list);
  return newList.filter((el) => !removeTarget.has(el));
};

export const add = (
  list: DragItem[],
  endIndex: number,
  movedTarget: Set<DragItem>,
) => {
  const newList = Array.from(list);
  newList.splice(endIndex, 0, ...Array.from(movedTarget));
  return newList;
};

export const getDragAndDropEventValues = (
  result: DropResult | DragUpdate,
  columns: Record<string, DragItem[]>,
  selectedItems: Set<DragItem>,
) => {
  const isDropSameColumn =
    result.source.droppableId === result?.destination?.droppableId;
  const movedItem = columns[result.source.droppableId][result.source.index];
  const isMultiDrag = selectedItems.has(movedItem);
  const movedTarget = isMultiDrag ? selectedItems : new Set([movedItem]);

  return {
    isDropSameColumn,
    movedItem,
    isMultiDrag,
    movedTarget,
  };
};

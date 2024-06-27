import { DragItem } from "../App";

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
    {} as Record<string, DragItem[]>
  );

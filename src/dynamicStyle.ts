import { type CSSProperties } from "react";
import { DraggingStyle, NotDraggingStyle } from "react-beautiful-dnd";

const GRID = 8;

export const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: DraggingStyle | NotDraggingStyle,
  isRestricted?: boolean,
  isSelected?: boolean,
): CSSProperties => ({
  userSelect: "none",
  padding: GRID * 2,
  margin: `0 0 ${GRID}px 0`,
  background: isDragging
    ? isRestricted
      ? "red"
      : "lightgreen"
    : isSelected
      ? "blue"
      : "grey",
  ...draggableStyle,
});

export const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: GRID,
  width: 250,
});

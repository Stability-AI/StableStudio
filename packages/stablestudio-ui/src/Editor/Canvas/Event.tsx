import Konva from "konva";

export type Event<Event> = Konva.KonvaEventObject<Event>;
export namespace Event {
  export type Mouse = Event<MouseEvent>;
  export type Drag = Event<DragEvent>;
}

import * as React from "react";
import { Context } from "../Context";
import Column from "./Column";
import Notes from "./Notes/Notes";

import "./Room.css";

type RoomProps = {
  categories: string[];
};

export default function Room({ categories }: RoomProps) {
  const { showNotes } = React.useContext(Context);

  const columnEls: JSX.Element[] = [];

  categories.forEach((category) => {
    columnEls.push(<Column key={category} category={category} />);
  });

  return (
    <div
      className={`room rows-${
        showNotes ? categories.length + 1 : categories.length
      }`}
    >
      {columnEls}
      <Notes />
    </div>
  );
}

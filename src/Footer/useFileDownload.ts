import * as React from "react";

export default function useDownload(data: any) {
  React.useEffect(() => {
    if (data) {
      const cardsPerCategory = new Map();

      data.cards.forEach((card: any) => {
        if (card.content) {
          cardsPerCategory.set(card.type, [
            ...(cardsPerCategory.get(card.type) || []),
            card.content,
          ]);
        }
      });

      const printableCards = Array.from(cardsPerCategory)
        .map(([a, b]) => "\n\n" + a + "\n\n" + b.join("\n"))
        .join("");

      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleDateString()}_${currentDate.toLocaleTimeString()}`;
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(printableCards)}`
      );
      element.setAttribute("download", `Retrospective_${formattedDate}`);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }, [data]);
}

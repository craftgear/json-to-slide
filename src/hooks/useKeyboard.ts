import { useEffect } from "react";

export const useKeyboard = (handleNextSlide: () => void, handlePrevSlide: () => void): void => {

  // set keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNextSlide();
      } else if (event.key === "ArrowLeft") {
        handlePrevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, [handleNextSlide, handlePrevSlide]);
}

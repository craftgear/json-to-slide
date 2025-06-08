import './App.css'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { drawSlide, animateContentTransition, handleResizeWindow, animateSlideTransition } from './slide'

const slides = [
  {
    title: "簡単なプレゼンテーション",
    description:
      "CanvasとJavaScriptを使ったスライド\nテキストと画像の組み合わせ",
    backgroundColor: "linear-gradient(30deg, #1a2a6c, #b21f1f, #fdbb2d)",
    content: [
      {
        type: "text",
        text: "このテキストは動的に配置されます",
        x: "50%",
        y: "50%",
        fontSize: 32,
        color: "#ffffff",
        fontFamily: "Cherry Bomb One",
        fontWeight: "bold",
        textAlign: "center",
      },
      // {
      //   type: "image",
      //   src: "sample.jpg",
      //   x: "50%",
      //   y: 300,
      //   width: 400,
      //   height: 250,
      //   opacity: 1,
      //   anchor: "center",
      // },
    ],
  },
  {
    title: "2枚目のスライド",
    description: "複数コンテンツの例",
    backgroundColor: "rgb(30, 130, 76)",
    content: [
      {
        type: "text",
        text: "左寄せテキスト",
        x: 50,
        y: 200,
        fontSize: 28,
        color: "#FFD700",
        textAlign: "left",
      },
      {
        type: "text",
        text: "右寄せテキスト",
        x: "90%",
        y: 250,
        fontSize: 26,
        color: "#00BFFF",
        textAlign: "right",
      },
    ],
  },
];


enum TransitionDirection {
  NONE = 'none',
  PREV = 'prev',
  NEXT = 'next',
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isSlideTransitioning, setIsSlideTransitioning] = useState<TransitionDirection>(TransitionDirection.NONE)
  const [contentIndex, setContentIndex] = useState(-1);

  const handleNextSlide = useCallback(() => {
    if (isSlideTransitioning !== TransitionDirection.NONE) return; // スライド遷移中は無視
    // コンテンツがある場合は次のコンテンツへ
    if (slides[currentSlideIndex].content && contentIndex < slides[currentSlideIndex].content.length - 1) {
      setContentIndex(contentIndex + 1);
      return;
    }

    const nextIndex = currentSlideIndex + 1
    if (nextIndex >= slides.length) {
      return; // 最後のスライドで止まる
    }

    setIsSlideTransitioning(TransitionDirection.NEXT);
    setCurrentSlideIndex(nextIndex);
    setContentIndex(-1);
  }, [isSlideTransitioning, currentSlideIndex, contentIndex]);

  const handlePrevSlide = useCallback(() => {
    const prevIndex = currentSlideIndex - 1;
    if (prevIndex < 0) {
      return; // 最初のスライドで止まる
    }
    if (isSlideTransitioning !== TransitionDirection.NONE) return; // スライド遷移中は無視

    setIsSlideTransitioning(TransitionDirection.PREV);
    setCurrentSlideIndex(prevIndex);
  }, [isSlideTransitioning, currentSlideIndex])

  const finishTransition = useCallback(() => {
    setIsSlideTransitioning(TransitionDirection.NONE);
  }, [setIsSlideTransitioning]);

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

  // resize window and draw slide
  useEffect(() => {
    if (!ref.current) return;

    const resizeListener = () => {
      if (isSlideTransitioning !== TransitionDirection.NONE) return;
      handleResizeWindow(ref.current!, bgRef.current!);
      drawSlide(ref.current!, slides[currentSlideIndex]);
    }
    resizeListener()
    // リサイズイベント
    window.addEventListener("resize", resizeListener);

    return () => {
      removeEventListener("resize", resizeListener);
    }
  }, [currentSlideIndex, isSlideTransitioning]);

  // スライドの描画とアニメーション
  useEffect(() => {
    if (!ref.current) return;
    if (isSlideTransitioning === TransitionDirection.NONE) {
      return
    }

    // スライド遷移アニメーション
    if (isSlideTransitioning === TransitionDirection.NEXT) {
      requestAnimationFrame(() => {
        animateSlideTransition(finishTransition, ref.current!, slides[currentSlideIndex - 1], slides[currentSlideIndex])
      });
    }
    if (isSlideTransitioning === TransitionDirection.PREV) {
      animateSlideTransition(finishTransition, ref.current!, slides[currentSlideIndex + 1], slides[currentSlideIndex],)
    }
  }, [currentSlideIndex, isSlideTransitioning, finishTransition]);

  // 
  useEffect(() => {
    if (!ref.current) return;

    const content = slides[currentSlideIndex].content[contentIndex] ?? null;
    if (!content) return;

    animateContentTransition(ref.current!, content)

  }, [contentIndex]);

  return (
    <>
      <canvas ref={ref} id="slideCanvas">
      </canvas>
      <div ref={bgRef} id="bg"></div >
    </>
  )
}

export default App

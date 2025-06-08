import { useEffect } from 'react';
import { TransitionDirection } from '../types';
import type { Slide } from '../types';
import { animateSlideTransition } from '../slide';

export const useSlideTransition = (canvas: HTMLCanvasElement, isSlideTransitioning: TransitionDirection, finishSlideTransition: () => void, leftSlide: Slide, rightSlide: Slide) => {

  // スライドの描画とアニメーション
  useEffect(() => {
    if (!canvas) return;
    if (isSlideTransitioning === TransitionDirection.NONE) {
      return
    }

    if (isSlideTransitioning === TransitionDirection.NEXT) {
      // 次のスライドへ遷移
      animateSlideTransition(finishSlideTransition, canvas!, leftSlide, rightSlide);
    }
    if (isSlideTransitioning === TransitionDirection.PREV) {
      // 前のスライドへ遷移
      animateSlideTransition(finishSlideTransition, canvas!, rightSlide, leftSlide);
    }
  }, [finishSlideTransition, canvas, leftSlide, rightSlide, isSlideTransitioning]);

}


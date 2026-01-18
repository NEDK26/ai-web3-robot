import { useState, useRef, useEffect } from 'react';
import { motion, animate, PanInfo } from 'motion/react';

interface WheelPickerProps {
  items: string[];
  defaultIndex?: number;
  onSnapComplete?: (index: number, isSnapped: boolean) => void;
}

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const DAMPING_RATIO = 1.2;
const VELOCITY_THRESHOLD = 0.5;
const FRICTION = 0.95;

export function WheelPicker({ items, defaultIndex = 0, onSnapComplete }: WheelPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [isSnapping, setIsSnapping] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const animationRef = useRef<any>(null);
  const lastWheelTimeRef = useRef(0);

  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

  useEffect(() => {
    const initialY = -defaultIndex * ITEM_HEIGHT;
    setTranslateY(initialY);
  }, []);

  const constrainY = (value: number) => {
    const minY = -(items.length - 1) * ITEM_HEIGHT;
    const maxY = 0;
    return Math.max(minY, Math.min(maxY, value));
  };

  const getClosestIndex = (yValue: number) => {
    const index = Math.round(-yValue / ITEM_HEIGHT);
    return Math.max(0, Math.min(items.length - 1, index));
  };

  const snapToClosest = (currentY: number, velocity = 0) => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const targetIndex = getClosestIndex(currentY);
    const targetY = -targetIndex * ITEM_HEIGHT;

    setIsSnapping(true);
    onSnapComplete?.(targetIndex, false);

    animationRef.current = animate(currentY, targetY, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      velocity,
      onUpdate: (v) => {
        setTranslateY(v);
      },
      onComplete: () => {
        setSelectedIndex(targetIndex);
        setIsSnapping(false);
        onSnapComplete?.(targetIndex, true);
        velocityRef.current = 0;
      },
    });
  };

  const startInertia = (initialVelocity: number) => {
    if (Math.abs(initialVelocity) < VELOCITY_THRESHOLD) {
      snapToClosest(translateY);
      return;
    }

    let currentVelocity = initialVelocity;
    let currentY = translateY;

    const inertiaAnimation = () => {
      currentVelocity *= FRICTION;
      currentY = constrainY(currentY + currentVelocity);
      setTranslateY(currentY);
      velocityRef.current = currentVelocity;

      const currentIndex = getClosestIndex(currentY);
      if (currentIndex !== selectedIndex) {
        setSelectedIndex(currentIndex);
      }

      if (Math.abs(currentVelocity) > VELOCITY_THRESHOLD) {
        animationFrameRef.current = requestAnimationFrame(inertiaAnimation);
      } else {
        snapToClosest(currentY, currentVelocity);
      }
    };

    animationFrameRef.current = requestAnimationFrame(inertiaAnimation);
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsSnapping(false);
    onSnapComplete?.(selectedIndex, false);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const newY = constrainY(translateY + info.delta.y * DAMPING_RATIO);
    setTranslateY(newY);
    velocityRef.current = info.velocity.y * DAMPING_RATIO;

    const currentIndex = getClosestIndex(newY);
    if (currentIndex !== selectedIndex) {
      setSelectedIndex(currentIndex);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    isDraggingRef.current = false;
    const finalVelocity = info.velocity.y * DAMPING_RATIO * 0.1;
    startInertia(finalVelocity);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 添加更强的节流，防止一次滚动触发多次
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 300) {
      return;
    }
    
    if (isDraggingRef.current || isSnapping) {
      return;
    }
    
    lastWheelTimeRef.current = now;

    const delta = e.deltaY > 0 ? 1 : -1;
    const targetIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
    
    if (targetIndex === selectedIndex) return;
    
    const targetY = -targetIndex * ITEM_HEIGHT;

    setIsSnapping(true);
    onSnapComplete?.(targetIndex, false);

    if (animationRef.current) {
      animationRef.current.stop();
    }

    animationRef.current = animate(translateY, targetY, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      onUpdate: (v) => {
        setTranslateY(v);
      },
      onComplete: () => {
        setSelectedIndex(targetIndex);
        setIsSnapping(false);
        onSnapComplete?.(targetIndex, true);
      },
    });
  };

  // 计算每个项的样式
  const getItemStyle = (index: number) => {
    const itemY = index * ITEM_HEIGHT;
    const distanceFromCenter = Math.abs(centerOffset - (itemY + translateY));
    
    let scale = 1.2;
    let opacity = 1;
    
    if (distanceFromCenter > 0) {
      scale = Math.max(0.8, 1.2 - (distanceFromCenter / ITEM_HEIGHT) * 0.2);
      opacity = Math.max(0.4, 1 - (distanceFromCenter / ITEM_HEIGHT) * 0.3);
    }
    
    return { scale, opacity };
  };

  return (
    <div
      className="relative select-none overflow-hidden"
      style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}
      onWheel={handleWheel}
    >
      {/* 透镜层 */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          top: centerOffset,
          height: ITEM_HEIGHT,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-blue-500/5 rounded-xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* 滚轮项 */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ 
          transform: `translateY(${translateY}px)`,
          willChange: 'transform',
        }}
        className="relative cursor-grab active:cursor-grabbing pt-[120px]"
      >
        {items.map((item, index) => {
          const { scale, opacity } = getItemStyle(index);

          return (
            <div
              key={index}
              style={{
                height: ITEM_HEIGHT,
                transform: `scale(${scale})`,
                opacity,
                willChange: 'transform, opacity',
              }}
              className="flex items-center justify-center text-2xl transition-none"
            >
              <span
                className={`${
                  index === selectedIndex
                    ? 'font-bold text-blue-600'
                    : 'font-normal text-gray-700'
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
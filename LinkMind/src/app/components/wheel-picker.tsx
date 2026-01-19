import { useState, useRef, useEffect, useMemo } from 'react';
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
const VIRTUAL_ITEMS_MULTIPLIER = 100; // 虚拟项目倍数，用于创建无限滚动效果

export function WheelPicker({ items, defaultIndex = 0, onSnapComplete }: WheelPickerProps) {
  const [virtualOffset, setVirtualOffset] = useState(0); // 虚拟偏移量
  const [isSnapping, setIsSnapping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number|null>(null);
  const animationRef = useRef<any>(null);
  const lastWheelTimeRef = useRef(0);

  // 计算总虚拟项目数
  const totalVirtualItems = items.length * VIRTUAL_ITEMS_MULTIPLIER;
  
  // 计算中间位置，用于初始定位
  const middleOffset = useMemo(() => {
    const middleVirtualIndex = Math.floor(totalVirtualItems / 2);
    return -middleVirtualIndex * ITEM_HEIGHT;
  }, [totalVirtualItems]);

  // 初始化位置
  useEffect(() => {
    const initialVirtualIndex = Math.floor(totalVirtualItems / 2) + defaultIndex;
    setVirtualOffset(-initialVirtualIndex * ITEM_HEIGHT);
  }, [defaultIndex, totalVirtualItems]);

  // 计算当前实际索引（通过取模实现循环）
  const selectedIndex = useMemo(() => {
    const virtualIndex = Math.round(-virtualOffset / ITEM_HEIGHT);
    // 使用取模运算实现循环
    return ((virtualIndex % items.length) + items.length) % items.length;
  }, [virtualOffset, items.length]);

  // 生成虚拟项目列表（只渲染可见部分）
  const visibleItems = useMemo(() => {
  const startVirtualIndex = Math.floor(-virtualOffset / ITEM_HEIGHT) - Math.floor(VISIBLE_ITEMS / 2);
  const itemsToShow: Array<{
    virtualIndex: number;
    actualIndex: number;
    label: string;
    position: number;
  }> = [];

  for (let i = 0; i < VISIBLE_ITEMS * 3; i++) {
    const virtualIndex = startVirtualIndex + i;
    const actualIndex = ((virtualIndex % items.length) + items.length) % items.length;
    itemsToShow.push({
      virtualIndex,
      actualIndex,
      label: items[actualIndex],
      position: virtualIndex * ITEM_HEIGHT,
    });
  }

  return itemsToShow;
}, [virtualOffset, items]);

  const constrainVirtualOffset = (value: number) => {
    // 这里不需要限制边界，因为我们要实现无限滚动
    return value;
  };

  const getClosestVirtualIndex = (currentOffset: number) => {
    return Math.round(-currentOffset / ITEM_HEIGHT);
  };

  const snapToClosest = (currentOffset: number, velocity = 0) => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const targetVirtualIndex = getClosestVirtualIndex(currentOffset);
    const targetOffset = -targetVirtualIndex * ITEM_HEIGHT;

    setIsSnapping(true);
    const actualIndex = ((targetVirtualIndex % items.length) + items.length) % items.length;
    onSnapComplete?.(actualIndex, false);

    animationRef.current = animate(currentOffset, targetOffset, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      velocity,
      onUpdate: (v) => {
        setVirtualOffset(v);
      },
      onComplete: () => {
        setIsSnapping(false);
        onSnapComplete?.(actualIndex, true);
        velocityRef.current = 0;
        
        // 可选：在动画结束后调整位置，避免虚拟偏移量过大
        // 这样可以防止数字溢出
        if (Math.abs(virtualOffset) > Math.abs(middleOffset) * 1.5) {
          const adjustment = Math.round(virtualOffset / (items.length * ITEM_HEIGHT)) * (items.length * ITEM_HEIGHT);
          setVirtualOffset(virtualOffset - adjustment);
        }
      },
    });
  };

  const startInertia = (initialVelocity: number) => {
    if (Math.abs(initialVelocity) < VELOCITY_THRESHOLD) {
      snapToClosest(virtualOffset);
      return;
    }

    let currentVelocity = initialVelocity;
    let currentOffset = virtualOffset;

    const inertiaAnimation = () => {
      currentVelocity *= FRICTION;
      currentOffset = constrainVirtualOffset(currentOffset + currentVelocity);
      setVirtualOffset(currentOffset);
      velocityRef.current = currentVelocity;

      if (Math.abs(currentVelocity) > VELOCITY_THRESHOLD) {
        animationFrameRef.current = requestAnimationFrame(inertiaAnimation);
      } else {
        snapToClosest(currentOffset, currentVelocity);
      }
    };

    animationFrameRef.current = requestAnimationFrame(inertiaAnimation);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // 修改这里：安全地取消动画帧
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsSnapping(false);
    onSnapComplete?.(selectedIndex, false);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const newOffset = constrainVirtualOffset(virtualOffset + info.delta.y * DAMPING_RATIO);
    setVirtualOffset(newOffset);
    velocityRef.current = info.velocity.y * DAMPING_RATIO;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const finalVelocity = info.velocity.y * DAMPING_RATIO * 0.1;
    startInertia(finalVelocity);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    if (now - lastWheelTimeRef.current < 50) {
      return;
    }

    if (isDragging || isSnapping) {
      return;
    }

    lastWheelTimeRef.current = now;

    const delta = e.deltaY > 0 ? 1 : -1;
    const targetVirtualIndex = getClosestVirtualIndex(virtualOffset) + delta;
    const targetOffset = -targetVirtualIndex * ITEM_HEIGHT;

    setIsSnapping(true);
    const actualIndex = ((targetVirtualIndex % items.length) + items.length) % items.length;
    onSnapComplete?.(actualIndex, false);

    if (animationRef.current) {
      animationRef.current.stop();
    }

    animationRef.current = animate(virtualOffset, targetOffset, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      onUpdate: (v) => {
        setVirtualOffset(v);
      },
      onComplete: () => {
        setIsSnapping(false);
        onSnapComplete?.(actualIndex, true);
      },
    });
  };

  // 计算每个项的样式
  const getItemStyle = (position: number) => {
    const centerPosition = -virtualOffset;
    const distanceFromCenter = Math.abs(centerPosition - position);

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
          top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
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
          transform: `translateY(${virtualOffset}px)`,
          willChange: 'transform',
        }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {visibleItems.map((item) => {
          const { scale, opacity } = getItemStyle(item.position);
          const isSelected = ((Math.round(-virtualOffset / ITEM_HEIGHT) % items.length) + items.length) % items.length === item.actualIndex;

          return (
            <div
              key={`${item.virtualIndex}-${item.actualIndex}`}
              style={{
                height: ITEM_HEIGHT,
                transform: `translateY(${item.position}px) scale(${scale})`,
                opacity,
                willChange: 'transform, opacity',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
              className="flex items-center justify-center text-2xl transition-none"
            >
              <span
                className={`${
                  isSelected
                    ? 'font-bold text-blue-600'
                    : 'font-normal text-gray-700'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
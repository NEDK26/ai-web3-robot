import { useState } from 'react';
import { motion } from 'motion/react';
import { WheelPicker } from './wheel-picker';
import { Zap } from 'lucide-react';

// 学科列表
const SUBJECTS_A = [
  '物理',
  '化学',
  '生物',
  '数学',
  '计算机',
  '地理',
  '历史',
  '天文学',
  '地质学',
  '气象学',
];

const SUBJECTS_B = [
  '哲学',
  '文学',
  '艺术',
  '经济学',
  '社会学',
  '心理学',
  '语言学',
  '人类学',
  '政治学',
  '教育学',
];

export function SubjectCollider() {
  const [leftIndex, setLeftIndex] = useState(0); // 默认：物理
  const [rightIndex, setRightIndex] = useState(0); // 默认：哲学
  const [leftSnapped, setLeftSnapped] = useState(true);
  const [rightSnapped, setRightSnapped] = useState(true);
  const [result, setResult] = useState<{ left: string; right: string } | null>(null);

  const isButtonActive = leftSnapped && rightSnapped;

  const handleLeftSnapComplete = (index: number, isSnapped: boolean) => {
    setLeftIndex(index);
    setLeftSnapped(isSnapped);
  };

  const handleRightSnapComplete = (index: number, isSnapped: boolean) => {
    setRightIndex(index);
    setRightSnapped(isSnapped);
  };

  const handleCollide = () => {
    if (!isButtonActive) return;

    const leftSubject = SUBJECTS_A[leftIndex];
    const rightSubject = SUBJECTS_B[rightIndex];
    
    // 触发结果展示
    setResult({ left: leftSubject, right: rightSubject });
  };

  const handleReset = () => {
    setResult(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">灵感碰撞！</h2>
            <p className="text-gray-600">探索跨学科的无限可能</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-center gap-8">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-2">学科 A</div>
                <div className="text-4xl font-bold text-blue-600">{result.left}</div>
              </div>
              <div className="text-4xl text-gray-400">×</div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-2">学科 B</div>
                <div className="text-4xl font-bold text-purple-600">{result.right}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">可能的研究方向</h3>
            <div className="grid gap-3">
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <div className="font-medium text-gray-800">🔬 跨学科融合</div>
                <div className="text-sm text-gray-600 mt-1">
                  探索 {result.left} 与 {result.right} 的交叉领域
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-left">
                <div className="font-medium text-gray-800">💡 创新思维</div>
                <div className="text-sm text-gray-600 mt-1">
                  用 {result.left} 的方法论重新思考 {result.right}
                </div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-left">
                <div className="font-medium text-gray-800">🌟 未来趋势</div>
                <div className="text-sm text-gray-600 mt-1">
                  {result.right} 视角下的 {result.left} 发展方向
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            继续探索
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* 标题 */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">双滚轮学科选择器</h1>
          <p className="text-xl text-gray-600">
            滑动选择两个学科，碰撞出跨界灵感 ✨
          </p>
        </motion.div>

        {/* 双滚轮容器 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="grid grid-cols-2 gap-12 mb-4">
            {/* 左滚轮 */}
            <div>
              <div className="text-center mb-4">
                <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                  学科 A
                </span>
              </div>
              <WheelPicker
                items={SUBJECTS_A}
                defaultIndex={0}
                onSnapComplete={handleLeftSnapComplete}
              />
            </div>

            {/* 右滚轮 */}
            <div>
              <div className="text-center mb-4">
                <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-4 py-2 rounded-full">
                  学科 B
                </span>
              </div>
              <WheelPicker
                items={SUBJECTS_B}
                defaultIndex={0}
                onSnapComplete={handleRightSnapComplete}
              />
            </div>
          </div>

          {/* 当前选择提示 */}
          <div className="text-center text-sm text-gray-500 mt-6">
            {!isButtonActive && (
              <div className="text-amber-600 font-medium">
                ⚠️ 请等待滚轮停止后再点击按钮
              </div>
            )}
            {isButtonActive && (
              <div className="text-gray-600">
                当前选择：{SUBJECTS_A[leftIndex]} × {SUBJECTS_B[rightIndex]}
              </div>
            )}
          </div>
        </motion.div>

        {/* 碰撞灵感按钮 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleCollide}
            disabled={!isButtonActive}
            whileHover={isButtonActive ? { scale: 1.05 } : {}}
            whileTap={
              isButtonActive
                ? { scale: 0.95 }
                : {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.3 },
                  }
            }
            className={`
              group relative px-12 py-4 rounded-full text-xl font-bold 
              shadow-lg transition-all duration-300
              ${
                isButtonActive
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }
            `}
          >
            <span className="flex items-center gap-3">
              <Zap className={`w-6 h-6 ${isButtonActive ? 'animate-pulse' : ''}`} />
              碰撞灵感
              <Zap className={`w-6 h-6 ${isButtonActive ? 'animate-pulse' : ''}`} />
            </span>

            {/* 激活态光晕效果 */}
            {isButtonActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-50 -z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* 使用提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>💡 提示：可以用鼠标拖拽或滚轮操作</p>
        </motion.div>
      </div>
    </div>
  );
}

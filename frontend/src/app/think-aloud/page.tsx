import { ThinkAloudForm } from "@/features/think-aloud/ui/think-aloud-form";
import { ThinkAloudList } from "@/features/think-aloud/ui/think-aloud-list";
import { FeatureDescription } from "@/shared/ui/feature-description";

export default function ThinkAloudPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Think Aloud</h1>
      
      <FeatureDescription
        title="영어 브레인덤프"
        description="주어진 주제에 대해 2분간 영어로 생각을 자유롭게 쏟아내는 훈련입니다. 막힘 없이 영어로 생각을 표현하는 능력과 논리적 사고 흐름을 기를 수 있습니다."
        features={[
          "2분 타이머로 집중력 향상",
          "자유로운 영어 사고 표현",
          "총 단어 수, 어휘 다양성(TTR), 논리 연결어 분석",
          "실시간 단어 수 표시"
        ]}
        example="예: 주제 'AI가 일자리를 대체할까?' → 2분간 영어로 생각을 자유롭게 작성"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Practice</h2>
          <ThinkAloudForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Think Alouds</h2>
          <ThinkAloudList />
        </div>
      </div>
    </div>
  );
}


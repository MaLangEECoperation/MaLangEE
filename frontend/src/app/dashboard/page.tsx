import { DailyReflectionForm } from "@/features/daily-reflection/ui/daily-reflection-form";
import { DailyReflectionList } from "@/features/daily-reflection/ui/daily-reflection-list";
import { FeatureDescription } from "@/shared/ui/feature-description";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Daily Reflection</h1>
      
      <FeatureDescription
        title="오늘의 회고 영작"
        description="하루를 마무리하며 오늘 있었던 일을 영어로 3문장 작성하고, AI가 문법과 표현을 첨삭해드립니다. 매일 꾸준히 연습하면 영어 표현력이 자연스럽게 향상됩니다."
        features={[
          "하루의 경험을 영어로 정리",
          "AI 기반 문법 및 표현 피드백",
          "더 나은 표현 제안",
          "일일 참여율 및 성장 추이 확인"
        ]}
        example="예: '오늘 뭐 했어?' → 'Today I went to the library and studied English. I also met my friend for lunch. It was a productive day.'"
      />

      {/* Daily Reflection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Write Your Reflection</h2>
          <DailyReflectionForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Reflections</h2>
          <DailyReflectionList />
        </div>
      </div>
    </div>
  );
}


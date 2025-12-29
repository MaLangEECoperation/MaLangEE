import { ScenarioForm } from "@/features/scenario/ui/scenario-form";
import { FeatureDescription } from "@/shared/ui/feature-description";

export default function ScenarioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Scenario Practice</h1>
      
      <FeatureDescription
        title="상황극 롤플레이"
        description="실생활 시나리오에서 AI와 자연스러운 대화를 나누는 훈련입니다. 면접, 협상, 여행 등 다양한 상황에서 영어로 소통하는 능력을 실전처럼 연습할 수 있습니다."
        features={[
          "다양한 실생활 시나리오 선택 (면접, 협상, 여행 등)",
          "AI와 자연스러운 대화 연습",
          "상황에 맞는 적절한 응답 연습",
          "대화 턴 수 및 완료율 추적"
        ]}
        example="예: 면접 시나리오 - AI: 'Why should we hire you?' → 사용자 답변 → AI 후속 질문"
      />
      <ScenarioForm />
    </div>
  );
}


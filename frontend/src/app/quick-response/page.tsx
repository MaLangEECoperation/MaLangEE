import { QuickResponseForm } from "@/features/quick-response/ui/quick-response-form";
import { QuickResponseList } from "@/features/quick-response/ui/quick-response-list";
import { FeatureDescription } from "@/shared/ui/feature-description";

export default function QuickResponsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Quick Response</h1>
      
      <FeatureDescription
        title="즉흥 영작 훈련"
        description="실생활 상황이 주어지면 30초 안에 영어로 응답하는 훈련입니다. 긴장감 있는 환경에서 빠르게 생각하고 영어로 표현하는 능력을 기를 수 있습니다."
        features={[
          "30초 타이머로 긴장감 있는 연습",
          "실생활 상황 기반 시나리오",
          "응답 시간, 문법 정확도, 표현 자연스러움 평가",
          "즉각적인 AI 피드백 제공"
        ]}
        example="예: '카페에서 커피를 주문했는데 차가 나왔어요. 뭐라고 말할래요?' → 30초 내 영어 응답"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Practice</h2>
          <QuickResponseForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Responses</h2>
          <QuickResponseList />
        </div>
      </div>
    </div>
  );
}


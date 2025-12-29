import { RephrasingForm } from "@/features/rephrasing/ui/rephrasing-form";
import { RephrasingList } from "@/features/rephrasing/ui/rephrasing-list";
import { FeatureDescription } from "@/shared/ui/feature-description";

export default function RephrasingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rephrasing</h1>
      
      <FeatureDescription
        title="영어 리프레이징"
        description="같은 의미를 다양한 표현으로 바꿔 말하는 훈련입니다. 영어 표현의 다양성을 늘리고, 상황에 맞는 적절한 표현을 선택하는 능력을 기를 수 있습니다."
        features={[
          "같은 의미, 다른 표현 연습",
          "의미 유사도 및 표현 다양성 평가",
          "더 풍부한 어휘력 습득",
          "상황별 적절한 표현 학습"
        ]}
        example="예: 'I'm very tired.' → 'I'm exhausted.' / 'I'm worn out.' / 'I could use some rest.'"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Practice</h2>
          <RephrasingForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Rephrasings</h2>
          <RephrasingList />
        </div>
      </div>
    </div>
  );
}


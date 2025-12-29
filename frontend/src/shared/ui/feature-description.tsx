interface FeatureDescriptionProps {
  title: string;
  description: string;
  features: string[];
  example?: string;
}

export function FeatureDescription({
  title,
  description,
  features,
  example,
}: FeatureDescriptionProps) {
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <h2 className="text-2xl font-bold mb-3 text-foreground">{title}</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm font-semibold text-foreground">주요 기능:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {example && (
        <div className="mt-4 p-4 bg-background/50 rounded-md border border-primary/10">
          <p className="text-xs font-semibold text-muted-foreground mb-1">예시:</p>
          <p className="text-sm text-foreground italic">{example}</p>
        </div>
      )}
    </div>
  );
}



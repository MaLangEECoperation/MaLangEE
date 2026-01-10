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
    <div className="from-primary/5 to-primary/10 border-primary/20 mb-8 rounded-lg border bg-gradient-to-br p-6">
      <h2 className="text-foreground mb-3 text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>

      <div className="mb-4 space-y-2">
        <p className="text-foreground text-sm font-semibold">주요 기능:</p>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          {features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {example && (
        <div className="bg-background/50 border-primary/10 mt-4 rounded-md border p-4">
          <p className="text-muted-foreground mb-1 text-xs font-semibold">예시:</p>
          <p className="text-foreground text-sm italic">{example}</p>
        </div>
      )}
    </div>
  );
}

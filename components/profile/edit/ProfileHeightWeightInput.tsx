'use client';

interface ProfileHeightWeightInputProps {
  height: string;
  weight: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}

export default function ProfileHeightWeightInput({
  height,
  weight,
  onHeightChange,
  onWeightChange,
}: ProfileHeightWeightInputProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-card-foreground">신체 정보</h2>
      <p className="text-xs text-muted-foreground">
        신장과 체중 정보를 입력하세요.
      </p>

      <div className="space-y-3">
        {/* Height */}
        <div className="space-y-2">
          <label className="text-sm text-card-foreground font-medium">신장 (cm)</label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="예: 175"
            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="text-sm text-card-foreground font-medium">체중 (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="예: 70"
            className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>
    </section>
  );
}

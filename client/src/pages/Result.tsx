import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const Result = () => {
  const { predictionData, resetPrediction } = usePrediction();
  const navigate = useNavigate();

  const handleNewPrediction = () => {
    resetPrediction();
    navigate('/home');
  };

  // The server stores different predictions under different keys depending on the feature
  // (e.g. text -> predictionData.textData, voice -> predictionData.voiceData).
  // Use the first available prediction so that text predictions are shown on the Result page.
  const textPrediction = predictionData?.textData as { label?: string; confidence?: number } | undefined;
  const voicePrediction = predictionData?.voiceData as { label?: string; confidence?: number } | undefined;
  const imagePrediction = predictionData?.imageData as { label?: string; confidence?: number } | undefined;
  const irisPrediction = predictionData?.irisData as { label?: string; confidence?: number } | undefined;
  const psychologicalPrediction = predictionData?.psychologicalData as { label?: string; confidence?: number } | undefined;

  const firstPrediction = textPrediction ?? voicePrediction ?? imagePrediction ?? irisPrediction ?? psychologicalPrediction;

  const predictedAge = firstPrediction?.label ?? 'N/A';
  const confidence = firstPrediction?.confidence != null
    ? (firstPrediction.confidence * 100).toFixed(2) + '%'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 flex items-center justify-center animate-fade-in">
      <Card className="max-w-md w-full shadow-2xl border-border/50 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Sparkles className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl">Your Predicted Age Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-scale-in">
              {predictedAge}
            </div>
            {confidence && (
              <p className="text-muted-foreground mt-2">Confidence: {confidence}</p>
            )}
          </div>

          <Button
            onClick={handleNewPrediction}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            size="lg"
          >
            New Prediction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Result;

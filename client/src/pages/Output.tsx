import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const Output = () => {
  const { predictionData, resetPrediction } = usePrediction();
  const navigate = useNavigate();

  const handleNewPrediction = () => {
    resetPrediction();
    navigate('/home');
  };

  const predictedAge = predictionData.psychologicalAge || 'No data';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 flex items-center justify-center animate-fade-in">
      <Card className="max-w-md w-full shadow-2xl border-border/50 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl">Psychological Assessment Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">
              Your predicted psychological age range:
            </p>
            <div className="text-5xl font-bold text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {predictedAge}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your psychological responses
            </p>
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

export default Output;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, Camera } from 'lucide-react';

const IrisScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      setScanned(true);
      toast.success('Iris scan completed!');
    }, 3000);
  };

  const handleContinue = () => {
    updatePredictionData('irisData', 'iris-scan-complete');
    addCompletedFeature('iris');

    const nextFeature = selectedFeatures.find(
      f => !completedFeatures.includes(f) && f !== 'iris'
    );

    if (nextFeature) {
      const routes: Record<string, string> = {
        psychological: '/psychological',
        image: '/image-upload',
        text: '/text-input',
        voice: '/voice-input',
      };
      navigate(routes[nextFeature]);
    } else {
      navigate('/result');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="shadow-xl border-border/50 animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Iris Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-primary rounded-full animate-pulse" />
                  <Eye className="absolute w-32 h-32 text-primary animate-pulse" />
                </div>
              ) : scanned ? (
                <div className="text-center space-y-4">
                  <Eye className="w-32 h-32 mx-auto text-primary" />
                  <p className="text-lg font-medium text-primary">Scan Complete!</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="w-32 h-32 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Position your eye in front of the camera</p>
                </div>
              )}
            </div>

            {!scanned ? (
              <Button
                onClick={handleScan}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </Button>
            ) : (
              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
              >
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IrisScan;

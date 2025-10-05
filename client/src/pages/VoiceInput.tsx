import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mic } from 'lucide-react';

const VoiceInput = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      toast.success('Audio file selected');
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      toast.error('Please upload an audio file first');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('http://127.0.0.1:8000/predict-audio', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const prediction = await res.json();

      updatePredictionData('voiceData', prediction);
      toast.success('Voice data submitted successfully! ');
      addCompletedFeature('voice');

      const nextFeature = selectedFeatures.find(
        (f) => !completedFeatures.includes(f) && f !== 'voice'
      );

      if (nextFeature) {
        const routes: Record<string, string> = {
          psychological: '/psychological',
          image: '/image-upload',
          iris: '/iris-scan',
          text: '/text-input',
        };
        navigate(routes[nextFeature]);
      } else {
        navigate('/result');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading and predicting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="shadow-xl border-border/50 animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Mic className="w-6 h-6 text-primary" />
              Voice Input (File Upload)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Upload an audio file (WAV, MP3, etc.) to analyze. Manual recording is currently disabled but still available internally.
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="mx-auto"
            />
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity mt-6"
              size="lg"
              disabled={!selectedFile}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceInput;

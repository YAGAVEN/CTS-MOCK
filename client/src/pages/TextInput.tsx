import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

const TextInput = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      // Call the FastAPI endpoint
      const response = await fetch('http://127.0.0.1:8000/predict-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (response.ok && data.label) {
        // Store API result in context
       
        updatePredictionData('textData', data);
        addCompletedFeature('text');
        toast.success(`Predicted Age Group: ${data.label}`);

        // Determine the next feature
        const nextFeature = selectedFeatures.find(
          f => !completedFeatures.includes(f) && f !== 'text'
        );

        if (nextFeature) {
          const routes: Record<string, string> = {
            psychological: '/psychological',
            image: '/image-upload',
            iris: '/iris-scan',
            voice: '/voice-input',
          };
          navigate(routes[nextFeature]);
        } else {
          navigate('/result');
        }
      } else {
        toast.error(data.error || 'Prediction failed');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="shadow-xl border-border/50 animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Write a few sentences about yourself, your interests, or your daily routine.
              </p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[200px] resize-none"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Predicting...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextInput;

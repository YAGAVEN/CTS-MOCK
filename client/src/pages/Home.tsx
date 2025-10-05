import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Brain, Image, Eye, MessageSquare, Mic, LogOut } from 'lucide-react';

const features = [
  { id: 'psychological', label: 'Psychological Questions', icon: Brain, route: '/psychological' },
  { id: 'image', label: 'Image Upload', icon: Image, route: '/image-upload' },
  { id: 'iris', label: 'Iris Scan', icon: Eye, route: '/iris-scan' },
  { id: 'text', label: 'Text Input', icon: MessageSquare, route: '/text-input' },
  { id: 'voice', label: 'Voice Input', icon: Mic, route: '/voice-input' },
];

const Home = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const { logout, user } = useAuth();
  const { setSelectedFeatures, resetPrediction } = usePrediction();
  const navigate = useNavigate();

  const toggleFeature = (featureId: string) => {
    setSelected(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleStart = () => {
    if (selected.length === 0) {
      toast.error('Please select at least one feature');
      return;
    }

    resetPrediction();
    setSelectedFeatures(selected);
    
    const firstFeature = features.find(f => selected.includes(f.id));
    if (firstFeature) {
      navigate(firstFeature.route);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Age Prediction
            </h1>
            <p className="text-muted-foreground">Welcome, {user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Card className="shadow-xl border-border/50 animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl">Select Prediction Features</CardTitle>
            <CardDescription>
              Choose the methods you'd like to use for age prediction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <Checkbox
                    checked={selected.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="flex-1 font-medium">{feature.label}</span>
                </div>
              );
            })}

            <Button
              onClick={handleStart}
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
            >
              Start Prediction
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { text: string; next?: string; ageRange?: string }[];
}

const questions: Record<string, Question> = {
  Q1: {
    id: 'Q1',
    text: 'What type of activities do you enjoy most?',
    options: [
      { text: 'Playing with toys, cartoons', next: 'Q2' },
      { text: 'School/college studies, games', next: 'Q3' },
      { text: 'Job/career building, relationships', next: 'Q4' },
      { text: 'Family, health, retirement plans', next: 'Q5' },
    ],
  },
  Q2: {
    id: 'Q2',
    text: 'What do you like most at home?',
    options: [
      { text: 'Coloring, dolls, cartoons', ageRange: '0–5' },
      { text: 'Video games, outdoor play', ageRange: '5–10' },
    ],
  },
  Q3: {
    id: 'Q3',
    text: 'Which describes you best?',
    options: [
      { text: 'Homework, exams, school stress', ageRange: '10–15' },
      { text: 'Friends, social media, early dating', ageRange: '15–20' },
    ],
  },
  Q4: {
    id: 'Q4',
    text: "What's your top priority now?",
    options: [
      { text: 'Higher studies, starting career', ageRange: '20–25' },
      { text: 'Career growth, friendships/relationships', ageRange: '25–30' },
      { text: 'Family planning, job stability', ageRange: '30–35' },
      { text: "Settled job, kids' schooling", ageRange: '35–40' },
    ],
  },
  Q5: {
    id: 'Q5',
    text: 'Which fits you most?',
    options: [
      { text: "Focusing on kids' education & career", ageRange: '40–50' },
      { text: 'Managing teens/adult kids at home', ageRange: '50–60' },
      { text: 'Health concerns & retirement planning', ageRange: '60–70' },
      { text: 'Relaxation, grandkids, old age', next: 'Q6' },
    ],
  },
  Q6: {
    id: 'Q6',
    text: 'How do you spend most of your free time?',
    options: [
      { text: 'Active hobbies, travel', ageRange: '70–80' },
      { text: 'Family time, light household activities', ageRange: '80–90' },
      { text: 'Mostly rest, need care', ageRange: '90–95' },
    ],
  },
};

const PsychologicalQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState('Q1');
  const [showGlitter, setShowGlitter] = useState(false);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleAnswer = (option: { text: string; next?: string; ageRange?: string }) => {
    setShowGlitter(true);
    setTimeout(() => setShowGlitter(false), 800);

    if (option.ageRange) {
      updatePredictionData('psychologicalAge', option.ageRange);
      addCompletedFeature('psychological');
      
      setTimeout(() => {
        const nextFeature = selectedFeatures.find(
          f => !completedFeatures.includes(f) && f !== 'psychological'
        );

        if (nextFeature) {
          const routes: Record<string, string> = {
            image: '/image-upload',
            iris: '/iris-scan',
            text: '/text-input',
            voice: '/voice-input',
          };
          navigate(routes[nextFeature]);
        } else {
          navigate('/result');
        }
      }, 1000);
    } else if (option.next) {
      setTimeout(() => {
        setCurrentQuestion(option.next!);
      }, 800);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 relative overflow-hidden">
      {showGlitter && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-accent animate-glitter"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto pt-8">
        <Card className="shadow-xl border-border/50 animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full h-auto py-4 text-lg bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-foreground border border-primary/20 hover:border-primary/40 transition-all animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {option.text}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PsychologicalQuestions;

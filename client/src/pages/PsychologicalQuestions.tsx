import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface Option {
  text: string;
  ageRange: string;
  category?: 'children' | 'youngsters' | 'middle-aged' | 'elder';
}

interface Question {
  text: string;
  options: Option[];
}

const initialQuestions: Question[] = [
  {
    text: 'When reflecting on moments of joy, which tends to resonate most deeply for you?',
    options: [
      { text: 'Energetic bursts of exploration and wonder', ageRange: '5-15', category: 'children' },
      { text: 'Connection with peers in shared experiences', ageRange: '15-25', category: 'youngsters' },
      { text: 'Achieving personal milestones quietly', ageRange: '30-50', category: 'middle-aged' },
      { text: 'Cherishing time with familiar companions and calm', ageRange: '55+', category: 'elder' },
    ],
  },
  {
    text: 'If asked about the pace of your daily rhythm, how would you best describe it?',
    options: [
      { text: 'Swift and lively, eager for new discoveries', ageRange: '5-15', category: 'children' },
      { text: 'Spirited with a balance of activity and pause', ageRange: '15-30', category: 'youngsters' },
      { text: 'Thoughtful and measured in purpose', ageRange: '30-55', category: 'middle-aged' },
      { text: 'Gentle and reflective with plenty of rest', ageRange: '55+', category: 'elder' },
    ],
  },
  {
    text: 'Consider your typical interests — which realm do they most align with?',
    options: [
      { text: 'Sparkling ideas and playful creation', ageRange: '5-15', category: 'children' },
      { text: 'Social connections and shared aspirations', ageRange: '15-30', category: 'youngsters' },
      { text: 'Mastery and continual growth', ageRange: '30-55', category: 'middle-aged' },
      { text: 'Wisdom, traditions, and meaningful reflection', ageRange: '55+', category: 'elder' },
    ],
  },
  {
    text: 'Which activity brings you the most satisfaction on weekends or holidays?',
    options: [
      { text: 'Playful outdoor adventures', ageRange: '5-15', category: 'children' },
      { text: 'Sharing goals with friends or online groups', ageRange: '15-30', category: 'youngsters' },
      { text: 'Project deep-dives or creative pursuits', ageRange: '30-55', category: 'middle-aged' },
      { text: 'Peaceful reflection with family or nature', ageRange: '55+', category: 'elder' },
    ],
  },
];

const categoryQuestions: Record<string, Question[]> = {
  children: [
    {
      text: 'When listening to music, how do you react?',
      options: [
        { text: 'Jump and dance spontaneously', ageRange: '5-10' },
        { text: 'Tap rhythm eagerly', ageRange: '10-15' },
        { text: 'Nod quietly', ageRange: '15-20' },
        { text: 'Listen thoughtfully', ageRange: '20-25' },
      ],
    },
    {
      text: 'How often do you feel eager to learn something new?',
      options: [
        { text: 'Every moment', ageRange: '5-10' },
        { text: 'Daily', ageRange: '10-15' },
        { text: 'Weekly', ageRange: '15-20' },
        { text: 'Occasionally', ageRange: '20-25' },
      ],
    },
    {
      text: 'How would you describe the way you make friends?',
      options: [
        { text: 'Instantly and easily', ageRange: '5-10' },
        { text: 'Quickly with smiles', ageRange: '10-15' },
        { text: 'After some time', ageRange: '15-20' },
        { text: 'Carefully and selectively', ageRange: '20-25' },
      ],
    },
    {
      text: 'On a calm day, what\'s your favourite way to spend time?',
      options: [
        { text: 'Exploring with excitement', ageRange: '5-10' },
        { text: 'Imagining stories', ageRange: '10-15' },
        { text: 'Watching quietly', ageRange: '15-20' },
        { text: 'Thinking deeply', ageRange: '20-25' },
      ],
    },
    {
      text: 'How do you tend to celebrate personal achievements?',
      options: [
        { text: 'With energetic cheers', ageRange: '5-10' },
        { text: 'By sharing stories with friends', ageRange: '10-15' },
        { text: 'Reflecting quietly', ageRange: '15-20' },
        { text: 'Savoring moments calmly', ageRange: '20-25' },
      ],
    },
    {
      text: 'What draws you most in new experiences?',
      options: [
        { text: 'The thrill of discovery', ageRange: '5-10' },
        { text: 'Meeting new people', ageRange: '10-15' },
        { text: 'Learning a new skill', ageRange: '15-20' },
        { text: 'Deep understanding', ageRange: '20-25' },
      ],
    },
    {
      text: 'How would you describe your preferred pace of life?',
      options: [
        { text: 'Quick and lively', ageRange: '5-10' },
        { text: 'Balanced and social', ageRange: '10-15' },
        { text: 'Purposeful and steady', ageRange: '15-20' },
        { text: 'Measured and thoughtful', ageRange: '20-25' },
      ],
    },
    {
      text: 'What\'s your favourite kind of story?',
      options: [
        { text: 'Magical adventures', ageRange: '5-10' },
        { text: 'Friendship tales', ageRange: '10-15' },
        { text: 'Achieving a goal', ageRange: '15-20' },
        { text: 'Stories of discovery', ageRange: '20-25' },
      ],
    },
    {
      text: 'What\'s the most exciting part of a school day for you?',
      options: [
        { text: 'Recess or breaks', ageRange: '5-10' },
        { text: 'Group activities', ageRange: '10-15' },
        { text: 'Hands-on projects', ageRange: '15-20' },
        { text: 'Learning new facts', ageRange: '20-25' },
      ],
    },
    {
      text: 'How do you like to spend time with your family?',
      options: [
        { text: 'Playing games', ageRange: '5-10' },
        { text: 'Going on outings', ageRange: '10-15' },
        { text: 'Watching movies together', ageRange: '15-20' },
        { text: 'Talking about dreams', ageRange: '20-25' },
      ],
    },
    {
      text: 'What food is your happiest treat?',
      options: [
        { text: 'Ice cream and sweets', ageRange: '5-10' },
        { text: 'Fruits and juices', ageRange: '10-15' },
        { text: 'Sandwiches or pizzas', ageRange: '15-20' },
        { text: 'Special home-cooked meals', ageRange: '20-25' },
      ],
    },
  ],
  youngsters: [
    {
      text: 'When facing decisions, which describes you best?',
      options: [
        { text: 'Bold and spontaneous', ageRange: '15-20' },
        { text: 'Careful and consults others', ageRange: '20-25' },
        { text: 'Analytical and methodical', ageRange: '25-30' },
        { text: 'Deliberate and cautious', ageRange: '30-35' },
      ],
    },
    {
      text: 'What kind of stories inspire you most?',
      options: [
        { text: 'Adventure and excitement', ageRange: '15-20' },
        { text: 'Friendship and growth', ageRange: '20-25' },
        { text: 'Challenges and perseverance', ageRange: '25-30' },
        { text: 'Wisdom and reflection', ageRange: '30-35' },
      ],
    },
    {
      text: 'How do you usually recharge after a busy day?',
      options: [
        { text: 'Active with friends', ageRange: '15-20' },
        { text: 'Quiet time with good company', ageRange: '20-25' },
        { text: 'Focused on hobbies', ageRange: '25-30' },
        { text: 'Restful and calm', ageRange: '30-35' },
      ],
    },
    {
      text: 'What do you value most in conversations?',
      options: [
        { text: 'Fun and laughter', ageRange: '15-20' },
        { text: 'Sharing ideas', ageRange: '20-25' },
        { text: 'Meaningful depth', ageRange: '25-30' },
        { text: 'Comfort and understanding', ageRange: '30-35' },
      ],
    },
    {
      text: 'How do you appreciate moments of quietness?',
      options: [
        { text: 'Rarely or brief', ageRange: '15-20' },
        { text: 'Occasionally treasured', ageRange: '20-25' },
        { text: 'Often sought', ageRange: '25-30' },
        { text: 'Deeply valued', ageRange: '30-35' },
      ],
    },
    {
      text: 'What colors soothe you best these days?',
      options: [
        { text: 'Bright and sharp', ageRange: '15-20' },
        { text: 'Natural greens', ageRange: '20-25' },
        { text: 'Warm earthy', ageRange: '25-30' },
        { text: 'Soft pastels', ageRange: '30-35' },
      ],
    },
    {
      text: 'How do you tend to respond to new ideas?',
      options: [
        { text: 'Skeptical', ageRange: '15-20' },
        { text: 'Curious but cautious', ageRange: '20-25' },
        { text: 'Open and embracing', ageRange: '25-30' },
        { text: 'Thoughtfully selective', ageRange: '30-35' },
      ],
    },
    {
      text: 'How do you prefer spending weekends?',
      options: [
        { text: 'Exploring outdoors', ageRange: '15-20' },
        { text: 'Learning something new', ageRange: '20-25' },
        { text: 'Connecting with people', ageRange: '25-30' },
        { text: 'Resting and recharging', ageRange: '30-35' },
      ],
    },
    {
      text: 'Which hobbies help you relax best?',
      options: [
        { text: 'Playing sports', ageRange: '15-20' },
        { text: 'Painting or music', ageRange: '20-25' },
        { text: 'Reading or writing', ageRange: '25-30' },
        { text: 'Cooking or meditating', ageRange: '30-35' },
      ],
    },
    {
      text: 'How do you define success for yourself?',
      options: [
        { text: 'Gaining recognition', ageRange: '15-20' },
        { text: 'Personal growth', ageRange: '20-25' },
        { text: 'Overcoming obstacles', ageRange: '25-30' },
        { text: 'Achieving inner balance', ageRange: '30-35' },
      ],
    },
    {
      text: 'What qualities do you admire most in your friends?',
      options: [
        { text: 'Spontaneity', ageRange: '15-20' },
        { text: 'Loyalty', ageRange: '20-25' },
        { text: 'Empathy', ageRange: '25-30' },
        { text: 'Dependability', ageRange: '30-35' },
      ],
    },
  ],
  'middle-aged': [
    {
      text: 'On contemplative days, what are your thoughts focused on?',
      options: [
        { text: 'Past challenges', ageRange: '30-40' },
        { text: 'Present responsibilities', ageRange: '40-50' },
        { text: 'Future possibilities', ageRange: '50-60' },
        { text: 'Life\'s meaning', ageRange: '60-65' },
      ],
    },
    {
      text: 'How important is routine in your day?',
      options: [
        { text: 'Minimal', ageRange: '30-40' },
        { text: 'Somewhat important', ageRange: '40-50' },
        { text: 'Very important', ageRange: '50-60' },
        { text: 'Critical to balance', ageRange: '60-65' },
      ],
    },
    {
      text: 'How do you approach learning these days?',
      options: [
        { text: 'Occasionally for necessity', ageRange: '30-40' },
        { text: 'Regularly for growth', ageRange: '40-50' },
        { text: 'Passionately for interest', ageRange: '50-60' },
        { text: 'Selectively and critically', ageRange: '60-65' },
      ],
    },
    {
      text: 'What kind of stories do you find most enriching?',
      options: [
        { text: 'Action and achievement', ageRange: '30-40' },
        { text: 'Overcoming adversity', ageRange: '40-50' },
        { text: 'Wisdom and insight', ageRange: '50-60' },
        { text: 'Reflection and legacy', ageRange: '60-65' },
      ],
    },
    {
      text: 'How do moments of stillness feel to you?',
      options: [
        { text: 'Uncommon and brief', ageRange: '30-40' },
        { text: 'Pleasant and occasional', ageRange: '40-50' },
        { text: 'Comforting and frequent', ageRange: '50-60' },
        { text: 'Profound and cherished', ageRange: '60-65' },
      ],
    },
    {
      text: 'What kinds of sights bring you peace?',
      options: [
        { text: 'Bright and lively', ageRange: '30-40' },
        { text: 'Gentle hills and valleys', ageRange: '40-50' },
        { text: 'Soft morning light', ageRange: '50-60' },
        { text: 'Quiet evening skies', ageRange: '60-65' },
      ],
    },
    {
      text: 'When you reminisce, what emotions arise?',
      options: [
        { text: 'Restlessness', ageRange: '30-40' },
        { text: 'Warmth and fondness', ageRange: '40-50' },
        { text: 'Gratitude and calm', ageRange: '50-60' },
        { text: 'Deep contentment', ageRange: '60-65' },
      ],
    },
    {
      text: 'What is your preferred way to handle stress?',
      options: [
        { text: 'Actively problem-solving', ageRange: '30-40' },
        { text: 'Talking it through', ageRange: '40-50' },
        { text: 'Taking quiet breaks', ageRange: '50-60' },
        { text: 'Reflecting inwardly', ageRange: '60-65' },
      ],
    },
    {
      text: 'Which achievement are you most proud of recently?',
      options: [
        { text: 'Career growth', ageRange: '30-40' },
        { text: 'Family harmony', ageRange: '40-50' },
        { text: 'Community work', ageRange: '50-60' },
        { text: 'Personal growth', ageRange: '60-65' },
      ],
    },
    {
      text: 'How do you balance work and rest?',
      options: [
        { text: 'Keeping tight schedules', ageRange: '30-40' },
        { text: 'Prioritizing family/friends', ageRange: '40-50' },
        { text: 'Setting clear goals', ageRange: '50-60' },
        { text: 'Allowing for spontaneity', ageRange: '60-65' },
      ],
    },
    {
      text: 'What would you like to learn next?',
      options: [
        { text: 'New tech or skills', ageRange: '30-40' },
        { text: 'Parenting or mentoring', ageRange: '40-50' },
        { text: 'Mindfulness or wellness', ageRange: '50-60' },
        { text: 'Art or history', ageRange: '60-65' },
      ],
    },
  ],
  elder: [
    {
      text: 'How do you engage with others most often?',
      options: [
        { text: 'Briefly and rarely', ageRange: '60-75' },
        { text: 'In small groups', ageRange: '70-80' },
        { text: 'Through shared memories', ageRange: '80-90' },
        { text: 'With long conversations', ageRange: '90-95' },
      ],
    },
    {
      text: 'How often do you find joy in simple pleasures?',
      options: [
        { text: 'Sometimes', ageRange: '60-75' },
        { text: 'Frequently', ageRange: '70-80' },
        { text: 'Almost every day', ageRange: '80-90' },
        { text: 'Always', ageRange: '90-95' },
      ],
    },
    {
      text: 'What kind of tunes or sounds soothe you?',
      options: [
        { text: 'Lively melodies', ageRange: '60-75' },
        { text: 'Soft classical', ageRange: '70-80' },
        { text: 'Natural sounds', ageRange: '80-90' },
        { text: 'Familiar voices', ageRange: '90-95' },
      ],
    },
    {
      text: 'How do you perceive the passage of time?',
      options: [
        { text: 'Quick and fleeting', ageRange: '60-75' },
        { text: 'Measured and steady', ageRange: '70-80' },
        { text: 'Calm and reflective', ageRange: '80-90' },
        { text: 'Slow and precious', ageRange: '90-95' },
      ],
    },
    {
      text: 'How do moments of stillness feel to you?',
      options: [
        { text: 'Uncommon and brief', ageRange: '60-75' },
        { text: 'Pleasant and occasional', ageRange: '70-80' },
        { text: 'Comforting and frequent', ageRange: '80-90' },
        { text: 'Profound and cherished', ageRange: '90-95' },
      ],
    },
    {
      text: 'What kinds of sights bring you peace?',
      options: [
        { text: 'Bright and lively', ageRange: '60-75' },
        { text: 'Gentle hills and valleys', ageRange: '70-80' },
        { text: 'Soft morning light', ageRange: '80-90' },
        { text: 'Quiet evening skies', ageRange: '90-95' },
      ],
    },
    {
      text: 'When you reminisce, what emotions arise?',
      options: [
        { text: 'Restlessness', ageRange: '60-75' },
        { text: 'Warmth and fondness', ageRange: '70-80' },
        { text: 'Gratitude and calm', ageRange: '80-90' },
        { text: 'Deep contentment', ageRange: '90-95' },
      ],
    },
    {
      text: 'Which routines bring you comfort?',
      options: [
        { text: 'Morning walks', ageRange: '60-75' },
        { text: 'Sharing meals', ageRange: '70-80' },
        { text: 'Evening prayers/contemplation', ageRange: '80-90' },
        { text: 'Family chats', ageRange: '90-95' },
      ],
    },
    {
      text: 'What advice do you most enjoy giving?',
      options: [
        { text: 'Being brave', ageRange: '60-75' },
        { text: 'Staying true to yourself', ageRange: '70-80' },
        { text: 'Choosing kindness', ageRange: '80-90' },
        { text: 'Enjoying the present', ageRange: '90-95' },
      ],
    },
    {
      text: 'How do you celebrate life\'s milestones?',
      options: [
        { text: 'With quiet pride', ageRange: '60-75' },
        { text: 'By gathering loved ones', ageRange: '70-80' },
        { text: 'Through storytelling', ageRange: '80-90' },
        { text: 'With thanks and gratitude', ageRange: '90-95' },
      ],
    },
    {
      text: 'What brings you gratitude these days?',
      options: [
        { text: 'Good health', ageRange: '60-75' },
        { text: 'Loving relationships', ageRange: '70-80' },
        { text: 'Memories', ageRange: '80-90' },
        { text: 'Peaceful days', ageRange: '90-95' },
      ],
    },
  ],
};

const PsychologicalQuestions = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showGlitter, setShowGlitter] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isInitialPhase, setIsInitialPhase] = useState(true);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleAnswer = (option: Option) => {
    setShowGlitter(true);
    setTimeout(() => setShowGlitter(false), 800);

    const newAnswers = [...answers, option.ageRange];
    setAnswers(newAnswers);

    // First 4 questions determine category
    if (isInitialPhase && currentQuestionIndex < 3) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 800);
    } else if (isInitialPhase && currentQuestionIndex === 3) {
      // Determine category based on the 4 answers (category chosen more than 1 time)
      const categoryCounts: Record<string, number> = {
        children: 0,
        youngsters: 0,
        'middle-aged': 0,
        elder: 0,
      };

      initialQuestions.forEach((q, idx) => {
        const answer = newAnswers[idx];
        const selectedOption = q.options.find(opt => opt.ageRange === answer);
        if (selectedOption?.category) {
          categoryCounts[selectedOption.category]++;
        }
      });

      // Find category with more than 1 occurrence
      const category = Object.entries(categoryCounts).reduce((a, b) => 
        categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
      )[0];

      setTimeout(() => {
        setSelectedCategory(category);
        setIsInitialPhase(false);
        setCurrentQuestionIndex(0);
        setAnswers([]); // Reset answers for the 11 category questions
      }, 800);
    } else if (!isInitialPhase && currentQuestionIndex < 10) {
      // Continue with category questions (11 total, 0-10)
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 800);
    } else {
      // All 11 category questions answered - store only these 11
      updatePredictionData('psychologicalAgeArray', JSON.stringify(newAnswers));
      
      // Calculate most frequent age range
      const frequencyMap: Record<string, number> = {};
      newAnswers.forEach(ageRange => {
        frequencyMap[ageRange] = (frequencyMap[ageRange] || 0) + 1;
      });
      
      const mostFrequentAgeRange = Object.entries(frequencyMap).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];
      
      updatePredictionData('psychologicalAge', mostFrequentAgeRange);
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
          navigate('/output');
        }
      }, 1000);
    }
  };

  const currentQuestion = isInitialPhase 
    ? initialQuestions[currentQuestionIndex]
    : categoryQuestions[selectedCategory!][currentQuestionIndex];

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
            <CardTitle className="text-2xl text-center">{currentQuestion.text}</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {isInitialPhase 
                ? `Question ${currentQuestionIndex + 1} of 4`
                : `Question ${currentQuestionIndex + 5} of 15`
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.options.map((option, index) => (
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
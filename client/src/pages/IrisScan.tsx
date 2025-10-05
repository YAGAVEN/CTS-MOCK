import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '@/contexts/PredictionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';

const IrisUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedFeatures, completedFeatures, addCompletedFeature, updatePredictionData } = usePrediction();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
  if (!file) {
    toast.error('Please select an image');
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://127.0.0.1:8000/predict-iris', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && (data.label || data.predicted_bin)) {
      // Normalize key for storing iris prediction
      updatePredictionData('irisData', data);
      addCompletedFeature('iris');
      toast.success(`Predicted Age Group: ${data.label ?? data.predicted_bin}`);

      // Directly navigate to results page after iris prediction
      navigate('/result');
    } else {
      toast.error(data.error || 'Prediction failed');
    }
  } catch (error) {
    toast.error('Server error. Please try again.');
    console.error(error);
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
              <ImageIcon className="w-6 h-6 text-primary" />
              Upload Your Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IrisUpload;

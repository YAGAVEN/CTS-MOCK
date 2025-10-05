import React, { createContext, useContext, useState } from 'react';

interface PredictionContextType {
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  completedFeatures: string[];
  addCompletedFeature: (feature: string) => void;
  // predictionData can hold different shapes depending on the feature (voice returns an object)
  predictionData: Record<string, any>;
  // allow any value to be stored (string or structured object)
  updatePredictionData: (key: string, value: any) => void;
  resetPrediction: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [completedFeatures, setCompletedFeatures] = useState<string[]>([]);
  const [predictionData, setPredictionData] = useState<Record<string, any>>({});

  const addCompletedFeature = (feature: string) => {
    setCompletedFeatures(prev => [...prev, feature]);
  };

  const updatePredictionData = (key: string, value: any) => {
    setPredictionData(prev => ({ ...prev, [key]: value }));
  };

  const resetPrediction = () => {
    setSelectedFeatures([]);
    setCompletedFeatures([]);
    setPredictionData({});
  };

  return (
    <PredictionContext.Provider
      value={{
        selectedFeatures,
        setSelectedFeatures,
        completedFeatures,
        addCompletedFeature,
        predictionData,
        updatePredictionData,
        resetPrediction,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};

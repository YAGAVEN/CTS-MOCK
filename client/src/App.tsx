import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PredictionProvider } from "./contexts/PredictionContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PsychologicalQuestions from "./pages/PsychologicalQuestions";
import ImageUpload from "./pages/ImageUpload";
import IrisScan from "./pages/IrisScan";
import TextInput from "./pages/TextInput";
import VoiceInput from "./pages/VoiceInput";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="animate-pulse text-2xl text-primary">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/home" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PredictionProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/home"/>} />  
              <Route path="/home" element={<Home/>} />
              <Route path="/psychological" element={<PsychologicalQuestions />} />
              <Route path="/image-upload" element={<ImageUpload />} />
              <Route path="/iris-scan" element={<IrisScan />} />
              <Route path="/text-input" element={<TextInput />} />
              <Route path="/voice-input" element={<VoiceInput />} />
              <Route path="/result" element={<Result />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PredictionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

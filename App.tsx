import React from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Navigation from './components/Navigation';
import Modal from './components/Modal';
import { STEPS } from './constants';
import { useFormContext } from './context/FormContext';
import { useFormValidation } from './hooks/useFormValidation';
import { useReportGeneration } from './hooks/useReportGeneration';
import { useFormNavigation } from './hooks/useFormNavigation';
import { useUnloadConfirmation } from './hooks/useUnloadConfirmation';


function App() {
  const { state, dispatch } = useFormContext();
  const { modal } = state;

  // Handles the "are you sure you want to leave?" prompt if the form is dirty
  useUnloadConfirmation();

  const {
    handleGenerateSummary
  } = useReportGeneration();
  
  const {
    canProceed,
    validateCurrentStep
  } = useFormValidation();

  const {
    currentStep,
    handleNextStep,
    handlePrevStep,
    goToStep
  } = useFormNavigation(validateCurrentStep, handleGenerateSummary);


  const CurrentStepComponent = STEPS.find(step => step.number === currentStep)?.component;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(252,191,77,0.1)] border border-slate-700/80 p-6 md:p-10 transition-all duration-300 mt-8">
          {CurrentStepComponent ? <CurrentStepComponent /> : null}
          {currentStep < 6 && (
            <Navigation
              onPrev={handlePrevStep}
              onNext={handleNextStep}
              currentStep={currentStep}
              canProceed={canProceed}
            />
          )}
        </div>
      </main>
      {modal && <Modal {...modal} onClose={() => dispatch({ type: 'SET_MODAL', payload: null })} />}
    </>
  );
}

export default App;
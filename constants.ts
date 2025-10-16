import React from 'react';
import { type Step } from '../types';
import Step0Consent from './components/steps/Step0Consent';
import Step1DateTime from './components/steps/Step1DateTime';
import Step2Narrative from './components/steps/Step2Narrative';
import Step3Involved from './components/steps/Step3Involved';
import Step4Evidence from './components/steps/Step4Evidence';
import Step5Review from './components/steps/Step5Review';

export const PREDEFINED_PARTIES: string[] = ['Ex-spouse/Co-parent', 'Their current partner', 'Grandparent', 'Other family member', 'Police/First Responder', 'Witness'];
export const PREDEFINED_CHILDREN: string[] = ['Child A', 'Child B', 'Child C'];
export const JURISDICTIONS: string[] = ['Ontario, Canada', 'British Columbia, Canada', 'Alberta, Canada', 'Quebec, Canada', 'Other Canadian Province', 'US State - Please specify'];

// Fix: Replaced all JSX with React.createElement to be compatible with a .ts file.
export const STEPS: Step[] = [
    { number: 1, title: 'Consent', component: Step0Consent, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"}, React.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }), React.createElement("path", { d: "m9 12 2 2 4-4" })) },
    { number: 2, title: 'Date & Time', component: Step1DateTime, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("polyline", { points: "12 6 12 12 16 14" })) },
    { number: 3, title: 'What Happened', component: Step2Narrative, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }), React.createElement("polyline", { points: "14 2 14 8 20 8" }), React.createElement("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), React.createElement("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), React.createElement("line", { x1: "10", y1: "9", x2: "8", y2: "9" })) },
    { number: 4, title: 'Who Was Involved', component: Step3Involved, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), React.createElement("circle", { cx: "9", cy: "7", r: "4" }), React.createElement("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }), React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })) },
    { number: 5, title: 'Location & Evidence', component: Step4Evidence, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }), React.createElement("circle", { cx: "12", cy: "10", r: "3" })) },
    { number: 6, title: 'Review & Export', component: Step5Review, icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "m9 11 3 3L22 4" }), React.createElement("path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" })) }
];
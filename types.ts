import type React from 'react';

export const EVIDENCE_CATEGORIES = ['Screenshot', 'Document', 'Audio', 'Video', 'Other'] as const;
export type EvidenceCategory = typeof EVIDENCE_CATEGORIES[number];

export interface EvidenceFile {
  name: string;
  size: number;
  type: string;
  category: EvidenceCategory;
  description: string;
  base64?: string;
  aiAnalysis?: string;
}

export interface IncidentData {
  consentAcknowledged: boolean;
  date: string;
  time: string;
  narrative: string;
  parties: string[];
  children: string[];
  jurisdiction: string;
  evidence: EvidenceFile[];
  caseNumber: string;
}

export interface ReportData {
  title: string;
  category: string;
  severity: string;
  severityJustification: string;
  professionalSummary: string;
  observedImpact: string;
  legalInsights: string;
  sources: string[];
  aiNotes: string;
  caseNumber?: string;
}

export interface Step {
  number: number;
  title: string;
  icon: React.ReactElement;
  component: React.FC;
}

export type ValidationErrors = Partial<Record<keyof IncidentData | keyof ReportData, string>>;

export interface ModalInfo {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
}
import { type IncidentData, type ReportData, type EvidenceFile } from './types';

// Define a custom error class for API-specific issues
export class ApiError extends Error {
    public readonly cause: any;
    constructor(message: string, options?: { cause: any }) {
        super(message);
        this.name = 'ApiError';
        this.cause = options?.cause;
    }
}

if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY environment variable not set. OpenAI calls will fail.");
}

if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY environment variable not set. Fallback to OpenAI will be disabled.");
}

// Helper to build the common context for prompts
const buildPromptContext = (incidentData: IncidentData): string => {
    const evidenceDetails = incidentData.evidence.length > 0
    ? incidentData.evidence.map(e => `- File: ${e.name} (Category: ${e.category})\n  Description: ${e.description || 'N/A'}`).join('\n')
    : 'None specified';

    return `
INCIDENT DETAILS:
- Date: ${incidentData.date}
- Time: ${incidentData.time}
- Jurisdiction: ${incidentData.jurisdiction}
- Case Number: ${incidentData.caseNumber || 'N/A'}
- Parties Involved: ${incidentData.parties.join(', ')}
- Children Present/Affected: ${incidentData.children.join(', ') || 'None specified'}
- Evidence Attached:\n${evidenceDetails}
- Original Account: ${incidentData.narrative}
`;
};

// The desired JSON schema structure
const reportSchemaForPrompt = {
    type: "object",
    properties: {
      title: { type: "string", description: "A brief, factual title for the incident report. Example: 'Dispute Regarding Parenting Time Exchange on YYYY-MM-DD'." },
      professionalSummary: { type: "string", description: "A comprehensive, objective summary formatted as exactly three paragraphs separated by single newline characters ('\\n'). Paragraph 1: Context. Paragraph 2: Chronology. Paragraph 3: Outcome." },
      category: { 
        type: "string", 
        enum: [
            "Child Safety & Welfare", "Communication Breakdown", "Parenting Time Violation", "Breach of Court Order (Non-Time Related)", 
            "Parental Alienation Tactics", "Hostile/Disparaging Conduct", "Financial Disputes", "Medical/Educational Disagreements", 
            "Property/Possession Issues", "Other"
        ],
        description: "The single best category for the incident from the provided list."
      },
      severity: { type: "string", enum: ["Low", "Medium", "High"], description: "The assigned severity level." },
      severityJustification: { type: "string", description: "Justification for the assigned severity level in one or two sentences, linking a fact from the narrative to the severity criteria." },
      legalInsights: { type: "string", description: "A 2-3 paragraph analysis. Must begin with the disclaimer 'This is not legal advice...'. Mentioned legal statutes must be formatted as markdown hyperlinks to official government sources for the specified jurisdiction." },
      sources: { 
        type: "array", 
        items: { type: "string", format: "uri" }, 
        description: "An array of 2-3 full URL strings to official government or reputable legal aid organization pages relevant to family law in the specified jurisdiction." 
      },
      observedImpact: { type: "string", description: "A 1-2 paragraph neutral, child-centric analysis of the potential or observed impact on the children, based strictly on the narrative." },
      aiNotes: { type: "string", description: "A markdown string with exactly four sections using these headings: '**Evidence Analysis:**', '**Evidence Gaps & Recommendations:**', '**Communication Strategy:**', and '**Documentation Best Practices:**'. Provide concise, bulleted, actionable points under each." }
    },
    required: ["title", "professionalSummary", "category", "severity", "severityJustification", "legalInsights", "sources", "observedImpact", "aiNotes"]
};


const generateReportWithOpenAI = async (incidentData: IncidentData, context: string): Promise<ReportData> => {
    console.warn("Falling back to OpenAI API for report generation.");
    if (!process.env.OPENAI_API_KEY) {
        // Fix: Removed invalid empty object from ApiError constructor call.
        throw new ApiError("OpenAI API key not configured. Cannot fallback.");
    }

    const systemPrompt = `You are a meticulous, senior family law paralegal and certified mediator AI. Your task is to transmute a user's potentially emotional narrative into a sterile, factual, and comprehensive report suitable for a court filing. Respond with ONLY a valid JSON object that strictly adheres to the provided JSON Schema. Do not include any explanatory text before or after the JSON.`;
    const userPrompt = `
Analyze the following incident details and use your knowledge to find relevant legal information for the specified jurisdiction: ${incidentData.jurisdiction}.

JSON Schema to follow:
${JSON.stringify(reportSchemaForPrompt, null, 2)}

Incident Details to analyze:
${context}
`;
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`OpenAI API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`);
        }

        const data = await response.json();
        const report = JSON.parse(data.choices[0].message.content);
        return { ...report, caseNumber: incidentData.caseNumber };

    } catch (error) {
        console.error("OpenAI API Error in generateReportWithOpenAI:", error);
        throw new ApiError("The fallback AI service (OpenAI) also failed to generate a report.", { cause: error });
    }
}


// --- "Server-Side" API Call: Full Report ---
export const generateReportOnServer = async (incidentData: IncidentData): Promise<ReportData> => {
    const context = buildPromptContext(incidentData);
    return await generateReportWithOpenAI(incidentData, context);
};



const generateCommunicationDraftWithOpenAI = async (userQuery: string): Promise<string> => {
    console.warn("Falling back to OpenAI API for communication draft generation.");
    if (!process.env.OPENAI_API_KEY) {
        throw new ApiError("OpenAI API key not configured. Cannot fallback.");
    }

    const systemPrompt = `You are an AI assistant helping a user draft a clear, concise, and professional email to their lawyer. The goal is to provide an update on a recent co-parenting incident. The response should be only the draft email text itself, including a subject line, salutation, body, and closing. Do not use overly emotional language.`;
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userQuery }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`OpenAI API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`);
        }

        const data = await response.json();
        const draft = data.choices[0].message.content;
        if (!draft) {
            throw new Error("API response for communication draft was empty.");
        }
        
        return draft.trim();

    } catch (error) {
        console.error("OpenAI API Error in generateCommunicationDraftWithOpenAI:", error);
        throw new ApiError("The fallback AI service (OpenAI) also failed to generate a communication draft.", { cause: error });
    }
}


export const generateCommunicationDraftOnServer = async (professionalSummary: string, legalInsights: string, incidentDate: string, caseNumber?: string): Promise<string> => {
    const caseNumberInfo = caseNumber ? ` for case file: ${caseNumber}` : '';
    const subjectLine = caseNumber ? `Incident Report for Case File: ${caseNumber}` : `Update re: Incident on ${incidentDate}`;

    const userQuery = `
    Please draft an email to my lawyer summarizing a co-parenting incident that occurred on ${incidentDate}${caseNumberInfo}.

    The email should have the following structure:
    1.  **Subject Line:** ${subjectLine}
    2.  **Salutation:** A professional opening (e.g., \"Dear [Lawyer's Name],\").
    3.  **Body Paragraph 1 (Summary):** State the purpose is to document an incident and incorporate this professional summary:
        ---
        ${professionalSummary}
        ---
    4.  **Body Paragraph 2 (Key Insights):** Mention an AI tool provided preliminary context and include these key insights (without the disclaimer):
        ---
        ${legalInsights.replace('This is not legal advice and is for informational purposes only. You should consult with a qualified legal professional for advice tailored to your situation.', '').trim()}
        ---
    5.  **Closing:** End with a call to action, like \"Please let me know if you require any further information or if this documentation is sufficient. A more detailed report with evidence is available upon request.\"
    6.  **Sign-off:** A professional closing (e.g., \"Best regards,\" followed by \"[Your Name]\").

    Use placeholders like [Lawyer's Name] and [Your Name].
    `;

    return await generateCommunicationDraftWithOpenAI(userQuery);
};

export const analyzeEvidenceOnServer = async (file: Required<Pick<EvidenceFile, 'type' | 'base64' | 'name' | 'description'>>, incidentNarrative: string): Promise<string> => {
    // Case 1: Handle image files with multimodal analysis
    if (file.type.startsWith('image/')) {
        const prompt = `As a neutral, objective legal assistant, analyze the attached image evidence in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative}"
---
FILE DETAILS:
- Name: ${file.name}
- User Description: ${file.description || 'Not provided.'}
---
INSTRUCTIONS: Provide a concise, one-sentence summary of this image's potential relevance and evidentiary value. Be factual and avoid speculation.

Example Analysis: "This screenshot appears to corroborate the user's claim of receiving a message at the specified time."`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: prompt
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${file.type};base64,${file.base64}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`OpenAI API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`);
            }

            const data = await response.json();
            const analysis = data.choices[0].message.content;
            return analysis || "AI analysis could not be generated for this file.";
        } catch (error) {
            console.error("OpenAI Error in analyzeEvidenceOnServer (image):", error);
            throw new ApiError("AI analysis for this image failed.", { cause: error });
        }
    }
    // Case 2: Handle PDF documents by analyzing their metadata
    else if (file.type === 'application/pdf') {
        const prompt = `As a neutral, objective legal assistant, analyze the *potential relevance* of the attached document based on its metadata, in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative}"
---
DOCUMENT DETAILS:
- Name: ${file.name}
- Type: ${file.type}
- User Description: ${file.description || 'Not provided.'}
---
INSTRUCTIONS: Based *only* on the file name and user-provided description, provide a concise, one-sentence summary of this document's likely relevance and evidentiary value. Do not speculate about the document's specific contents, as you cannot read them.

Example Analysis: "A document named 'school_report.pdf' could be relevant if its contents detail the child's academic performance or behavior during the period of the incident."`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`OpenAI API request failed with status ${response.status}: ${JSON.stringify(errorBody)}`);
            }

            const data = await response.json();
            const analysis = data.choices[0].message.content;
            return analysis || "AI analysis could not be generated for this document's metadata.";
        } catch (error) {
            console.error("OpenAI Error in analyzeEvidenceOnServer (document):", error);
            throw new ApiError("AI analysis for this document's metadata failed.", { cause: error });
        }
    }
    // Case 3 & 4: Handle audio and video with placeholders
    else if (file.type.startsWith('audio/')) {
        return `AI analysis for audio files is in development. The file has been logged as evidence.`;
    }
    else if (file.type.startsWith('video/')) {
        return `AI analysis for video files is in development. The file has been logged as evidence.`;
    }
    // Case 5: Handle all other unsupported file types
    else {
        return `Analysis for '${file.type}' files is not yet supported.`;
    }
};
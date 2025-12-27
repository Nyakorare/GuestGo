/**
 * Feedback Computation Utility
 * Calculates average scores per ISO 25010 criteria from multiple question responses
 */

export interface QuestionResponse {
  questionId: string;
  score: number;
}

export interface CriteriaScores {
  functional_suitability: number;
  performance_efficiency: number;
  compatibility: number;
  usability: number;
  reliability: number;
  security: number;
  maintainability: number;
  portability: number;
}

/**
 * Calculate average score for a set of question responses
 */
function calculateAverage(responses: number[]): number {
  if (responses.length === 0) {
    return 0;
  }
  const sum = responses.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / responses.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Compute criteria scores from form data
 * Takes all question responses and calculates averages per criteria
 */
export function computeCriteriaScores(formData: FormData): CriteriaScores {
  // Function Suitability - 3 questions (1-4 scale)
  const functionalSuitabilityScores = [
    parseInt(formData.get('functional_suitability_q1') as string) || 0,
    parseInt(formData.get('functional_suitability_q2') as string) || 0,
    parseInt(formData.get('functional_suitability_q3') as string) || 0
  ].filter(score => score > 0);
  
  // Performance Efficiency - 3 questions (1-4 scale)
  const performanceEfficiencyScores = [
    parseInt(formData.get('performance_efficiency_q1') as string) || 0,
    parseInt(formData.get('performance_efficiency_q2') as string) || 0,
    parseInt(formData.get('performance_efficiency_q3') as string) || 0
  ].filter(score => score > 0);
  
  // Compatibility - 2 questions (1-4 scale)
  const compatibilityScores = [
    parseInt(formData.get('compatibility_q1') as string) || 0,
    parseInt(formData.get('compatibility_q2') as string) || 0
  ].filter(score => score > 0);
  
  // Usability - 6 questions (1-4 scale)
  const usabilityScores = [
    parseInt(formData.get('usability_q1') as string) || 0,
    parseInt(formData.get('usability_q2') as string) || 0,
    parseInt(formData.get('usability_q3') as string) || 0,
    parseInt(formData.get('usability_q4') as string) || 0,
    parseInt(formData.get('usability_q5') as string) || 0,
    parseInt(formData.get('usability_q6') as string) || 0
  ].filter(score => score > 0);
  
  // Reliability - 4 questions (1-4 scale)
  const reliabilityScores = [
    parseInt(formData.get('reliability_q1') as string) || 0,
    parseInt(formData.get('reliability_q2') as string) || 0,
    parseInt(formData.get('reliability_q3') as string) || 0,
    parseInt(formData.get('reliability_q4') as string) || 0
  ].filter(score => score > 0);
  
  // Security - 5 questions (1-4 scale)
  const securityScores = [
    parseInt(formData.get('security_q1') as string) || 0,
    parseInt(formData.get('security_q2') as string) || 0,
    parseInt(formData.get('security_q3') as string) || 0,
    parseInt(formData.get('security_q4') as string) || 0,
    parseInt(formData.get('security_q5') as string) || 0
  ].filter(score => score > 0);
  
  // Maintainability - 5 questions (1-4 scale)
  const maintainabilityScores = [
    parseInt(formData.get('maintainability_q1') as string) || 0,
    parseInt(formData.get('maintainability_q2') as string) || 0,
    parseInt(formData.get('maintainability_q3') as string) || 0,
    parseInt(formData.get('maintainability_q4') as string) || 0,
    parseInt(formData.get('maintainability_q5') as string) || 0
  ].filter(score => score > 0);
  
  // Portability - 2 questions (1-4 scale)
  const portabilityScores = [
    parseInt(formData.get('portability_q1') as string) || 0,
    parseInt(formData.get('portability_q2') as string) || 0
  ].filter(score => score > 0);

  // Calculate averages and round to nearest integer for database storage
  // All criteria use 1-4 scale
  return {
    functional_suitability: Math.round(calculateAverage(functionalSuitabilityScores)),
    performance_efficiency: Math.round(calculateAverage(performanceEfficiencyScores)),
    compatibility: Math.round(calculateAverage(compatibilityScores)),
    usability: Math.round(calculateAverage(usabilityScores)),
    reliability: Math.round(calculateAverage(reliabilityScores)),
    security: Math.round(calculateAverage(securityScores)),
    maintainability: Math.round(calculateAverage(maintainabilityScores)),
    portability: Math.round(calculateAverage(portabilityScores))
  };
}

/**
 * Validate that all required questions are answered
 */
export function validateAllQuestionsAnswered(formData: FormData): { valid: boolean; missingFields: string[] } {
  const requiredFields = [
    // Function Suitability
    'functional_suitability_q1',
    'functional_suitability_q2',
    'functional_suitability_q3',
    // Performance Efficiency
    'performance_efficiency_q1',
    'performance_efficiency_q2',
    'performance_efficiency_q3',
    // Compatibility
    'compatibility_q1',
    'compatibility_q2',
    // Usability
    'usability_q1',
    'usability_q2',
    'usability_q3',
    'usability_q4',
    'usability_q5',
    'usability_q6',
    // Reliability
    'reliability_q1',
    'reliability_q2',
    'reliability_q3',
    'reliability_q4',
    // Security
    'security_q1',
    'security_q2',
    'security_q3',
    'security_q4',
    'security_q5',
    // Maintainability
    'maintainability_q1',
    'maintainability_q2',
    'maintainability_q3',
    'maintainability_q4',
    'maintainability_q5',
    // Portability
    'portability_q1',
    'portability_q2',
    // Overall Satisfaction
    'overall_satisfaction'
  ];

  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!formData.get(field)) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}


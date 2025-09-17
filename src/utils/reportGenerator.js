import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class ReportGenerator {
  static generateDetailedReport(handwritingResult, speechResult, studentInfo = {}) {
    const combinedScore = this.calculateCombinedScore(handwritingResult, speechResult);
    const timestamp = new Date().toISOString();
    
    const report = {
      metadata: {
        reportId: `LDD-${Date.now()}`,
        generatedAt: timestamp,
        version: "2.0",
        systemVersion: "Week 2 - Advanced Analysis"
      },
      studentInfo: {
        name: studentInfo.name || "Student",
        age: studentInfo.age || 8,
        grade: studentInfo.grade || "Grade 3",
        testDate: new Date().toLocaleDateString(),
        ...studentInfo
      },
      analysisResults: {
        combined: {
          overallScore: combinedScore,
          riskLevel: this.getRiskLevel(combinedScore),
          confidence: this.calculateConfidence(handwritingResult, speechResult)
        },
        handwriting: this.processHandwritingResults(handwritingResult),
        speech: this.processSpeechResults(speechResult)
      },
      recommendations: this.generateRecommendations(combinedScore, handwritingResult, speechResult),
      interventions: this.suggestInterventions(combinedScore, handwritingResult, speechResult),
      nextSteps: this.generateNextSteps(combinedScore)
    };
    
    return report;
  }

  static calculateCombinedScore(handwritingResult, speechResult) {
    if (!handwritingResult || !speechResult) return null;
    
    const handwritingWeight = 0.6;
    const speechWeight = 0.4;
    
    return (handwritingResult.overall_score * handwritingWeight) +
           (speechResult.overall_score * speechWeight);
  }

  static getRiskLevel(score) {
    if (score >= 75) return { level: 'Low Risk', color: 'success', description: 'No significant learning difficulty indicators' };
    if (score >= 50) return { level: 'Moderate Risk', color: 'warning', description: 'Some areas of concern requiring monitoring' };
    return { level: 'High Risk', color: 'error', description: 'Multiple indicators suggest need for comprehensive assessment' };
  }

  static calculateConfidence(handwritingResult, speechResult) {
    // Calculate confidence based on data quality and consistency
    let confidence = 85; // Base confidence
    
    if (handwritingResult?.features?.contour_count < 5) confidence -= 15;
    if (speechResult?.features?.word_count < 10) confidence -= 10;
    if (Math.abs(handwritingResult?.overall_score - speechResult?.overall_score) > 40) confidence -= 10;
    
    return Math.max(60, Math.min(95, confidence));
  }

  static processHandwritingResults(result) {
    if (!result) return null;
    
    return {
      overallScore: result.overall_score,
      keyFindings: {
        linestraightness: result.features.line_straightness,
        letterFormation: result.features.letter_formation_quality,
        consistency: result.features.consistency_score,
        writingPressure: result.features.writing_pressure,
        slantAngle: result.features.slant_angle
      },
      strengths: this.identifyHandwritingStrengths(result.features),
      concerns: this.identifyHandwritingConcerns(result.features),
      rawFeatures: result.features
    };
  }

  static processSpeechResults(result) {
    if (!result) return null;
    
    return {
      overallScore: result.overall_score,
      transcript: result.features.transcript,
      keyFindings: {
        readingSpeed: result.features.reading_speed_wpm,
        fluency: result.features.fluency_score,
        pronunciation: result.features.pronunciation_score,
        clarity: result.features.speech_clarity,
        pauseFrequency: result.features.pause_frequency
      },
      strengths: this.identifySpeechStrengths(result.features),
      concerns: this.identifySpeechConcerns(result.features),
      rawFeatures: result.features
    };
  }

  static identifyHandwritingStrengths(features) {
    const strengths = [];
    if (features.line_straightness > 70) strengths.push("Good line control and straightness");
    if (features.letter_formation_quality > 70) strengths.push("Well-formed letters");
    if (features.consistency_score > 70) strengths.push("Consistent letter sizing and spacing");
    if (features.writing_pressure > 40 && features.writing_pressure < 80) strengths.push("Appropriate writing pressure");
    if (Math.abs(features.slant_angle) < 10) strengths.push("Good slant control");
    return strengths;
  }

  static identifyHandwritingConcerns(features) {
    const concerns = [];
    if (features.line_straightness < 40) concerns.push("Difficulty maintaining straight lines");
    if (features.letter_formation_quality < 40) concerns.push("Poor letter formation quality");
    if (features.consistency_score < 40) concerns.push("Inconsistent letter sizes and spacing");
    if (features.writing_pressure < 20) concerns.push("Very light writing pressure");
    if (features.writing_pressure > 90) concerns.push("Excessive writing pressure");
    if (Math.abs(features.slant_angle) > 20) concerns.push("Inconsistent letter slant");
    return concerns;
  }

  static identifySpeechStrengths(features) {
    const strengths = [];
    if (features.fluency_score > 70) strengths.push("Good speech fluency");
    if (features.pronunciation_score > 70) strengths.push("Clear pronunciation");
    if (features.speech_clarity > 70) strengths.push("Good speech clarity");
    if (features.reading_speed_wpm > 80 && features.reading_speed_wpm < 200) strengths.push("Appropriate reading speed");
    if (features.volume_consistency > 70) strengths.push("Consistent volume control");
    return strengths;
  }

  static identifySpeechConcerns(features) {
    const concerns = [];
    if (features.fluency_score < 40) concerns.push("Speech fluency difficulties");
    if (features.pronunciation_score < 40) concerns.push("Pronunciation challenges");
    if (features.speech_clarity < 40) concerns.push("Poor speech clarity");
    if (features.reading_speed_wpm < 60) concerns.push("Slow reading speed");
    if (features.pause_frequency > 10) concerns.push("Frequent pauses during reading");
    return concerns;
  }

  static generateRecommendations(combinedScore, handwritingResult, speechResult) {
    const recommendations = [];
    
    // Combined recommendations
    if (combinedScore < 50) {
      recommendations.push("Comprehensive learning disability assessment recommended");
      recommendations.push("Consider multi-disciplinary evaluation");
    } else if (combinedScore < 70) {
      recommendations.push("Regular monitoring and targeted interventions");
      recommendations.push("Consider educational support services");
    }
    
    // Handwriting-specific recommendations
    if (handwritingResult?.overall_score < 60) {
      recommendations.push("Handwriting practice exercises with focus on letter formation");
      recommendations.push("Occupational therapy evaluation for fine motor skills");
    }
    
    // Speech-specific recommendations
    if (speechResult?.overall_score < 60) {
      recommendations.push("Speech-language therapy consultation");
      recommendations.push("Daily reading practice with fluency focus");
    }
    
    return recommendations;
  }

  static suggestInterventions(combinedScore, handwritingResult, speechResult) {
    const interventions = [];
    
    // Immediate interventions
    if (handwritingResult?.features?.line_straightness < 40) {
      interventions.push({
        area: "Handwriting - Line Control",
        intervention: "Use lined paper with highlighted baselines",
        duration: "4-6 weeks",
        frequency: "Daily practice 10-15 minutes"
      });
    }
    
    if (speechResult?.features?.fluency_score < 40) {
      interventions.push({
        area: "Speech - Fluency",
        intervention: "Repeated reading exercises with familiar texts",
        duration: "6-8 weeks", 
        frequency: "3-4 times per week, 15-20 minutes"
      });
    }
    
    // Long-term interventions
    if (combinedScore < 60) {
      interventions.push({
        area: "Overall Support",
        intervention: "Individualized Education Plan (IEP) consideration",
        duration: "Ongoing",
        frequency: "Regular team meetings"
      });
    }
    
    return interventions;
  }

  static generateNextSteps(combinedScore) {
    const nextSteps = [];
    
    if (combinedScore < 50) {
      nextSteps.push("Schedule comprehensive psychoeducational assessment");
      nextSteps.push("Consult with school special education team");
      nextSteps.push("Consider medical evaluation to rule out underlying conditions");
    } else if (combinedScore < 70) {
      nextSteps.push("Implement targeted interventions for 6-8 weeks");
      nextSteps.push("Schedule follow-up assessment");
      nextSteps.push("Monitor progress with regular check-ins");
    } else {
      nextSteps.push("Continue current educational approach");
      nextSteps.push("Schedule routine follow-up in 6 months");
    }
    
    return nextSteps;
  }

  static async generatePDFReport(reportData, chartElements = []) {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.text('Learning Disability Detection Report', 20, yPosition);
    yPosition += 20;
    
    // Student Info
    pdf.setFontSize(14);
    pdf.text('Student Information', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Name: ${reportData.studentInfo.name}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Age: ${reportData.studentInfo.age} years`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Test Date: ${reportData.studentInfo.testDate}`, 20, yPosition);
    yPosition += 15;
    
    // Overall Results
    pdf.setFontSize(14);
    pdf.text('Overall Assessment', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Combined Score: ${reportData.analysisResults.combined.overallScore?.toFixed(1)}%`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Risk Level: ${reportData.analysisResults.combined.riskLevel.level}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Confidence: ${reportData.analysisResults.combined.confidence}%`, 20, yPosition);
    yPosition += 15;
    
    // Recommendations
    if (reportData.recommendations.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      
      reportData.recommendations.forEach((rec, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${rec}`, 20, yPosition);
        yPosition += 8;
      });
    }
    
    // Add timestamp
    pdf.setFontSize(8);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
    
    return pdf;
  }

  static downloadJSONReport(reportData) {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disability-assessment-${reportData.metadata.reportId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadCSVReport(reportData) {
    const csvData = this.convertToCSV(reportData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disability-assessment-${reportData.metadata.reportId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static convertToCSV(reportData) {
    const headers = [
      'Report ID', 'Student Name', 'Age', 'Test Date', 
      'Combined Score', 'Risk Level', 'Confidence',
      'Handwriting Score', 'Speech Score',
      'Line Straightness', 'Letter Formation', 'Fluency', 'Pronunciation'
    ];
    
    const row = [
      reportData.metadata.reportId,
      reportData.studentInfo.name,
      reportData.studentInfo.age,
      reportData.studentInfo.testDate,
      reportData.analysisResults.combined.overallScore?.toFixed(1) || 'N/A',
      reportData.analysisResults.combined.riskLevel.level,
      reportData.analysisResults.combined.confidence,
      reportData.analysisResults.handwriting?.overallScore?.toFixed(1) || 'N/A',
      reportData.analysisResults.speech?.overallScore?.toFixed(1) || 'N/A',
      reportData.analysisResults.handwriting?.keyFindings?.linestraightness?.toFixed(1) || 'N/A',
      reportData.analysisResults.handwriting?.keyFindings?.letterFormation?.toFixed(1) || 'N/A',
      reportData.analysisResults.speech?.keyFindings?.fluency?.toFixed(1) || 'N/A',
      reportData.analysisResults.speech?.keyFindings?.pronunciation?.toFixed(1) || 'N/A'
    ];
    
    return [headers.join(','), row.join(',')].join('\n');
  }
}

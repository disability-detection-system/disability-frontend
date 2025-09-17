import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon,
  Code as JsonIcon,
  TableChart as CsvIcon
} from '@mui/icons-material';
import HandwritingTest from './HandwritingTest';
import SpeechTest from './SpeechTest';
import { ReportGenerator } from '../utils/reportGenerator';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CombinedAnalysisDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [handwritingResult, setHandwritingResult] = useState(null);
  const [speechResult, setSpeechResult] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    age: 8,
    grade: 'Grade 3',
    school: '',
    teacher: ''
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const calculateCombinedScore = () => {
    if (!handwritingResult || !speechResult) return null;
    
    const handwritingWeight = 0.6;
    const speechWeight = 0.4;
    
    const combinedScore = 
      (handwritingResult.overall_score * handwritingWeight) +
      (speechResult.overall_score * speechWeight);
    
    return combinedScore;
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return { level: 'Low Risk', color: 'success', icon: <CheckCircleIcon /> };
    if (score >= 50) return { level: 'Moderate Risk', color: 'warning', icon: <WarningIcon /> };
    return { level: 'High Risk', color: 'error', icon: <ErrorIcon /> };
  };

  const generateDetailedReport = () => {
    return ReportGenerator.generateDetailedReport(handwritingResult, speechResult, studentInfo);
  };

  const handleDownloadPDF = async () => {
    setGeneratingReport(true);
    try {
      const reportData = generateDetailedReport();
      const pdf = await ReportGenerator.generatePDFReport(reportData);
      pdf.save(`learning-disability-report-${reportData.metadata.reportId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingReport(false);
      setReportDialogOpen(false);
    }
  };

  const handleDownloadJSON = () => {
    const reportData = generateDetailedReport();
    ReportGenerator.downloadJSONReport(reportData);
    setReportDialogOpen(false);
  };

  const handleDownloadCSV = () => {
    const reportData = generateDetailedReport();
    ReportGenerator.downloadCSVReport(reportData);
    setReportDialogOpen(false);
  };

  const combinedScore = calculateCombinedScore();
  const riskAssessment = combinedScore ? getRiskLevel(combinedScore) : null;
  const canGenerateReport = handwritingResult && speechResult;

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', p: 2 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4, color: '#1976d2' }}>
        Learning Disability Detection System
      </Typography>
      
      {/* System Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={handwritingResult ? "Handwriting ✓" : "Handwriting Pending"} 
                  color={handwritingResult ? "success" : "default"}
                  variant={handwritingResult ? "filled" : "outlined"}
                />
                <Chip 
                  label={speechResult ? "Speech ✓" : "Speech Pending"} 
                  color={speechResult ? "success" : "default"}
                  variant={speechResult ? "filled" : "outlined"}
                />
                <Chip 
                  label={canGenerateReport ? "Ready for Report" : "Analysis Incomplete"} 
                  color={canGenerateReport ? "primary" : "default"}
                  variant={canGenerateReport ? "filled" : "outlined"}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={() => setReportDialogOpen(true)}
                disabled={!canGenerateReport}
                size="large"
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Combined Results Summary */}
      {combinedScore && (
        <Card sx={{ mb: 4, backgroundColor: '#f8f9fa', border: '2px solid #1976d2' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#1976d2' }}>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Combined Assessment Results
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold' }}>
                    {combinedScore.toFixed(1)}%
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Overall Score
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={combinedScore} 
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    {riskAssessment.icon}
                    <Chip 
                      label={riskAssessment.level}
                      color={riskAssessment.color}
                      size="large"
                      sx={{ ml: 1, fontSize: '1.1rem', p: 2 }}
                    />
                  </Box>
                  <Typography variant="subtitle1">
                    Risk Assessment
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#666', mb: 2 }}>
                    {ReportGenerator.calculateConfidence(handwritingResult, speechResult)}%
                  </Typography>
                  <Typography variant="subtitle1">
                    Analysis Confidence
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Based on data quality and consistency
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Detailed Breakdown */}
            <Box sx={{ mt: 4 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Detailed Analysis Breakdown</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Handwriting Analysis ({(handwritingResult?.overall_score || 0).toFixed(1)}%)
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Line Straightness" 
                            secondary={`${handwritingResult?.features?.line_straightness?.toFixed(1) || 0}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Letter Formation" 
                            secondary={`${handwritingResult?.features?.letter_formation_quality?.toFixed(1) || 0}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Writing Consistency" 
                            secondary={`${handwritingResult?.features?.consistency_score?.toFixed(1) || 0}%`}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Speech Analysis ({(speechResult?.overall_score || 0).toFixed(1)}%)
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Speech Fluency" 
                            secondary={`${speechResult?.features?.fluency_score?.toFixed(1) || 0}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Pronunciation" 
                            secondary={`${speechResult?.features?.pronunciation_score?.toFixed(1) || 0}%`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Reading Speed" 
                            secondary={`${speechResult?.features?.reading_speed_wpm?.toFixed(1) || 0} WPM`}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>

            {/* Quick Recommendations */}
            {canGenerateReport && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Quick Recommendations:</Typography>
                {ReportGenerator.generateRecommendations(combinedScore, handwritingResult, speechResult)
                  .slice(0, 3)
                  .map((rec, index) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      {rec}
                    </Alert>
                  ))
                }
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Analysis Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            centered
            variant="fullWidth"
          >
            <Tab 
              label="Handwriting Analysis" 
              icon={<SchoolIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Speech Analysis" 
              icon={<PersonIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={currentTab} index={0}>
          <HandwritingTest onResult={setHandwritingResult} />
        </TabPanel>
        
        <TabPanel value={currentTab} index={1}>
          <SpeechTest onResult={setSpeechResult} />
        </TabPanel>
      </Card>

      {/* Report Generation Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Generate Comprehensive Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Complete the student information to generate a detailed assessment report.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Name"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={studentInfo.age}
                onChange={(e) => setStudentInfo({...studentInfo, age: parseInt(e.target.value) || 8})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade"
                value={studentInfo.grade}
                onChange={(e) => setStudentInfo({...studentInfo, grade: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="School"
                value={studentInfo.school}
                onChange={(e) => setStudentInfo({...studentInfo, school: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teacher Name"
                value={studentInfo.teacher}
                onChange={(e) => setStudentInfo({...studentInfo, teacher: e.target.value})}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Report Formats Available:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <PdfIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                <Typography variant="subtitle2">PDF Report</Typography>
                <Typography variant="body2" color="text.secondary">
                  Professional formatted report
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <JsonIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                <Typography variant="subtitle2">JSON Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete analysis data
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CsvIcon sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                <Typography variant="subtitle2">CSV Export</Typography>
                <Typography variant="body2" color="text.secondary">
                  Spreadsheet compatible
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {generatingReport && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>Generating report...</Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownloadCSV} 
            startIcon={<CsvIcon />}
            variant="outlined"
            disabled={generatingReport}
          >
            Download CSV
          </Button>
          <Button 
            onClick={handleDownloadJSON} 
            startIcon={<JsonIcon />}
            variant="outlined"
            disabled={generatingReport}
          >
            Download JSON
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            startIcon={<PdfIcon />}
            variant="contained"
            disabled={generatingReport || !studentInfo.name}
          >
            Generate PDF Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CombinedAnalysisDashboard;

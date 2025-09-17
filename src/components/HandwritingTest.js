import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import axios from 'axios';
import FeatureChart from './FeatureChart';

const HandwritingTest = ({ onResult }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, JPEG, or PNG)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);
  };

  const analyzeHandwriting = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        'http://localhost:5001/analyze/handwriting',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      setAnalysisResult(response.data);
      if(onResult){
        onResult(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Analysis failed. Please check if the AI engine is running.'
      );
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Handwriting Analysis Test
      </Typography>
      
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Handwriting Sample
              </Typography>
              
              <Box
                sx={{
                  border: `2px dashed ${dragActive ? '#1976d2' : '#ccc'}`,
                  borderRadius: 2,
                  padding: 4,
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#f3f7ff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : 'Drag and drop an image here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: JPG, JPEG, PNG (max 5MB)
                </Typography>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />

              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={analyzeHandwriting}
                    disabled={analyzing}
                    startIcon={<AnalyticsIcon />}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Handwriting'}
                  </Button>

                  {analyzing && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                      />
                      <Typography 
                        variant="body2" 
                        align="center" 
                        sx={{ mt: 1 }}
                      >
                        {uploadProgress}% uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {analysisResult && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Overall Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={analysisResult.overall_score}
                      sx={{
                        flexGrow: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(analysisResult.overall_score),
                        },
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ 
                        ml: 2, 
                        color: getScoreColor(analysisResult.overall_score),
                        fontWeight: 'bold'
                      }}
                    >
                      {analysisResult.overall_score.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getScoreColor(analysisResult.overall_score),
                      fontWeight: 'bold'
                    }}
                  >
                    {getScoreLabel(analysisResult.overall_score)}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Detailed Features
                </Typography>

                <Grid container spacing={2}>
                  {Object.entries(analysisResult.features).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Typography variant="h6">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
          {analysisResult && (
            <Grid item xs={12}>
                <FeatureChart analysisResult={analysisResult} />
            </Grid>
           )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HandwritingTest;

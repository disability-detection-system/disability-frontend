import React, { useState, useRef, useEffect } from 'react';
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
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const SpeechTest = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [referenceText, setReferenceText] = useState('');
  const [useReferenceText, setUseReferenceText] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid audio file (WAV, MP3, OGG, M4A, WebM)');
        return;
      }
      
      setSelectedFile(file);
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const analyzeSpeech = async () => {
    if (!audioBlob) return;
    
    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Convert webm to wav if needed
      let audioFile = audioBlob;
      if (audioBlob.type.includes('webm')) {
        audioFile = new File([audioBlob], 'recording.webm', { 
          type: 'audio/webm' 
        });
      }
      
      formData.append('audio', audioFile);
      
      if (useReferenceText && referenceText.trim()) {
        formData.append('reference_text', referenceText.trim());
      }
      
      const response = await axios.post(
        'http://localhost:5002/analyze/speech',
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
        'Analysis failed. Please check if the speech analysis service is running.'
      );
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Speech Analysis Test
      </Typography>
      
      <Grid container spacing={3}>
        {/* Recording/Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Record or Upload Speech Sample
              </Typography>
              
              {/* Reference Text Section */}
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useReferenceText}
                      onChange={(e) => setUseReferenceText(e.target.checked)}
                    />
                  }
                  label="Use Reference Text"
                />
                
                {useReferenceText && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter the text that should be read..."
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Recording Controls */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Record Speech
                </Typography>
                
                {isRecording && (
                  <Chip 
                    label={`Recording: ${formatTime(recordingTime)}`} 
                    color="error" 
                    sx={{ mb: 2 }}
                  />
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!isRecording ? (
                    <Button
                      variant="contained"
                      startIcon={<MicIcon />}
                      onClick={startRecording}
                      color="primary"
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<StopIcon />}
                      onClick={stopRecording}
                      color="error"
                    >
                      Stop Recording
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* File Upload */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Or Upload Audio File
                </Typography>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Audio File
                </Button>
                
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>
              
              {/* Audio Player */}
              {audioUrl && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <audio controls style={{ width: '100%' }}>
                    <source src={audioUrl} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
              
              {/* Analysis Button */}
              {audioBlob && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={analyzeSpeech}
                  disabled={analyzing}
                  startIcon={<AnalyticsIcon />}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Speech'}
                </Button>
              )}
              
              {analyzing && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {uploadProgress}% uploaded
                  </Typography>
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
                  Speech Analysis Results
                </Typography>
                
                {/* Transcript */}
                {analysisResult.features.transcript && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Transcript:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2">
                        "{analysisResult.features.transcript}"
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {/* Overall Score */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Overall Confidence Score
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
                
                {/* Detailed Metrics */}
                <Typography variant="subtitle2" gutterBottom>
                  Detailed Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Reading Speed
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.reading_speed_wpm.toFixed(1)} WPM
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Fluency Score
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.fluency_score.toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Pronunciation
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.pronunciation_score.toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Speech Clarity
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.speech_clarity.toFixed(1)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Pauses
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.pause_frequency}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="h6">
                        {analysisResult.features.total_duration.toFixed(1)}s
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeechTest;

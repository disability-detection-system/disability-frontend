import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const FeatureChart = ({ analysisResult }) => {
  if (!analysisResult?.features) return null;

  const radarData = [
    {
      feature: 'Line Straightness',
      score: analysisResult.features.line_straightness,
    },
    {
      feature: 'Formation Quality',
      score: analysisResult.features.letter_formation_quality,
    },
    {
      feature: 'Consistency',
      score: analysisResult.features.consistency_score,
    },
    {
      feature: 'Writing Pressure',
      score: analysisResult.features.writing_pressure,
    },
  ];

  const barData = [
    { name: 'Letter Size', value: analysisResult.features.avg_letter_size },
    { name: 'Letter Spacing', value: analysisResult.features.letter_spacing },
    { name: 'Word Spacing', value: analysisResult.features.word_spacing },
    { name: 'Contour Count', value: analysisResult.features.contour_count },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Feature Visualization
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" align="center" gutterBottom>
                Quality Scores
              </Typography>
              <ResponsiveContainer width={520} height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="feature" />
                  <PolarRadiusAxis angle={0} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#1976d2"
                    fill="#1976d2"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" align="center" gutterBottom>
                Measurements
              </Typography>
              <ResponsiveContainer width={520} height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeatureChart;

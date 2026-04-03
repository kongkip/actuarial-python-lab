'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Card, Grid, CardContent, Typography, Slider, 
  Divider, Skeleton, Alert, Paper, Fade, CircularProgress, Stack
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getModelMetadata, postCalculateQuote } from '../../../lib/api'; 
import { ModelMetadata, QuoteResponse, QuoteRequest } from '../../../types/actuarial';

const PricingDashboard: React.FC = () => {
  // --- State Management ---
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  
  const [inputs, setInputs] = useState<QuoteRequest>({ 
    driver_age: 30, 
    exposure: 1.0, 
    sum_insured: 1500000 
  });

  // --- 1. Initial Load: Fetch Model Coefficients ---
  useEffect(() => {
    getModelMetadata()
      .then((data) => {
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to connect to the Pricing Engine. Ensure the FastAPI backend is running.");
        setLoading(false);
      });
  }, []);

  // --- 2. Live Quote Calculation with Debounce ---
  useEffect(() => {
    if (loading || !metadata) return;

    setCalculating(true);
    const debounceTimer = setTimeout(() => {
      postCalculateQuote(inputs)
        .then((data) => {
          setQuote(data);
          setCalculating(false);
        })
        .catch((err) => {
          console.error("Quote Calculation Error:", err);
          setCalculating(false);
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [inputs, loading, metadata]);

  // --- Handlers ---
  const handleSliderChange = (field: keyof QuoteRequest) => 
    (_event: Event, newValue: number | number[]) => {
      setInputs((prev) => ({ ...prev, [field]: newValue as number }));
    };

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Refined Header Block */}
      <Stack spacing={1} mb={4}>
        <Typography variant="h4" fontWeight="900" color="primary.main" letterSpacing="-0.02em">
          Poisson GLM Pricing
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Motor Private (Kenya) • Frequency Modeling Portal
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Left Col: Underwriting Inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" mb={2} fontWeight="700">Risk Profile</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Driver Age: <Typography component="span" fontWeight="700" color="text.primary">{inputs.driver_age}</Typography>
                </Typography>
                <Slider 
                  value={inputs.driver_age} 
                  min={18} max={85} 
                  onChange={handleSliderChange('driver_age')} 
                />
              </Box>

              <Box mb={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sum Insured: <Typography component="span" fontWeight="700" color="text.primary">KES {inputs.sum_insured.toLocaleString()}</Typography>
                </Typography>
                <Slider 
                  value={inputs.sum_insured} 
                  min={500000} max={10000000} step={100000}
                  onChange={handleSliderChange('sum_insured')} 
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Policy Exposure: <Typography component="span" fontWeight="700" color="text.primary">{inputs.exposure} Year</Typography>
                </Typography>
                <Slider 
                  value={inputs.exposure} 
                  min={0.1} max={1.0} step={0.1}
                  onChange={handleSliderChange('exposure')} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Col: Calculation Results & Analytics */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            
            {/* Main Premium Result */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.8 }}>Technical Pure Premium</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
                  {calculating ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Fade in={!calculating}>
                      <Typography variant="h3" fontWeight="800">
                        KES {quote?.pure_premium?.toLocaleString() ?? '---'}
                      </Typography>
                    </Fade>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Risk Intensity Result */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <Typography variant="overline" color="text.secondary">Annual Frequency (λ)</Typography>
                <Typography variant="h3" fontWeight="800" color="secondary">
                   {quote?.lambda ?? '---'}
                </Typography>
              </Paper>
            </Grid>

            {/* Model Transparency (Relativities) */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="700">GLM Relativity Structure</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    The multipliers below are derived from the Maximum Likelihood Estimates (MLE) of our Poisson model.
                  </Typography>
                  
                  <Box sx={{ width: '100%', height: 280, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metadata?.relativities}>
                        <XAxis 
                          dataKey="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#666', fontSize: 12 }} 
                        />
                        <YAxis hide domain={[0, 'dataMax + 0.5']} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="multiplier" radius={[6, 6, 0, 0]} barSize={60}>
                          {metadata?.relativities.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Alert severity="info" variant="text" sx={{ mt: 2, bgcolor: 'action.hover' }}>
                    <strong>Actuarial Note:</strong> This model assumes a Poisson distribution for claims counts. 
                    Relativities reflect the log-linear impact of age on the expected frequency.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PricingDashboard;
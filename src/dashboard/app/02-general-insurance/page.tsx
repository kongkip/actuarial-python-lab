'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea, Stack, Grid, Chip } from '@mui/material';
import Link from 'next/link';
import { QueryStats, ViewTimeline } from '@mui/icons-material';

export default function GeneralInsuranceHome() {
  const tools = [
    {
      id: 'GLM-01',
      title: 'Poisson GLM Pricing',
      desc: 'Frequency modeling portal using Maximum Likelihood Estimates for Motor Private.',
      path: '/02-general-insurance/poisson-glm',
      icon: QueryStats,
      status: 'Active',
    },
    {
      id: 'RES-01',
      title: 'IBNR Chain Ladder',
      desc: 'Run-off triangle triangulation and deterministic reserving calculations.',
      path: '#', // Placeholder path
      icon: ViewTimeline,
      status: 'Coming Soon',
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box mb={6}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Typography variant="h3" fontWeight="900" color="primary.main" letterSpacing="-0.02em">
            General Insurance
          </Typography>
          <Chip label="Module 02" color="secondary" size="small" sx={{ fontWeight: 'bold', borderRadius: 2 }} />
        </Stack>
        <Typography variant="subtitle1" color="text.secondary" maxWidth="md">
          Access tools for loss reserving, deterministic triangulation, and frequency-severity pricing models.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === 'Active';
          
          return (
            <Grid key={tool.id} item xs={12} sm={6} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 4,
                  opacity: isActive ? 1 : 0.6,
                  transition: 'all 0.2s ease-in-out',
                  ...(isActive && {
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px -10px rgba(0,0,0,0.05)'
                    }
                  })
                }}
              >
                <CardActionArea 
                  component={isActive ? Link : 'div'} 
                  href={isActive ? tool.path : undefined} 
                  disabled={!isActive}
                  sx={{ height: '100%', p: 1 }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <Box 
                        sx={{ 
                          display: 'inline-flex', 
                          p: 1.5, 
                          borderRadius: 3, 
                          bgcolor: isActive ? 'primary.light' : 'action.disabledBackground',
                          color: isActive ? 'primary.dark' : 'text.disabled',
                        }}
                      >
                        <Icon fontSize="medium" />
                      </Box>
                      {!isActive && (
                        <Chip label="Coming Soon" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      )}
                    </Stack>
                    
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                      <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 1 }}>
                        {tool.id}
                      </Typography>
                      <Typography variant="h6" fontWeight="700" lineHeight={1.2}>
                        {tool.title}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {tool.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
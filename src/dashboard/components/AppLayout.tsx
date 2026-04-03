'use client';

import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Avatar, Badge, Tooltip, Stack
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
  Search as SearchIcon 
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { ACTUARIAL_MODULES } from '../config/modules';

const DRAWER_WIDTH = 280;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // --- Dynamic Title Logic ---
  // Find the active module based on the current URL
  const currentModule = ACTUARIAL_MODULES.find(m => pathname.startsWith(m.path));
  const headerTitle = currentModule ? currentModule.title : 'Workspace Overview';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="900" color="primary.main" letterSpacing="-0.02em">
          The Actuarial Engine
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, px: 2 }}>
        {ACTUARIAL_MODULES.map((module) => {
          const Icon = module.icon;
          const isActive = pathname.startsWith(module.path);
          
          return (
            <ListItem key={module.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                selected={isActive}
                onClick={() => {
                  router.push(module.path);
                  setMobileOpen(false);
                }}
                sx={{ 
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${module.id} ${module.title}`} 
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, 
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary' // Ensures text/icons are dark on the light background
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Left Side: Contextual Title */}
          <Typography variant="subtitle1" fontWeight="600" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            {headerTitle}
          </Typography>

          {/* Right Side: Global Actions & User Profile */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Global Search">
              <IconButton color="inherit" size="small">
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit" size="small">
                <Badge badgeContent={3} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box sx={{ ml: 2, pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
              <Tooltip title="Account settings">
                <IconButton size="small" sx={{ p: 0 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}>
                    JS {/* E.g., John Smith */}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ... Drawer and Main Content Box remain identical ... */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: 'background.paper', borderRight: '1px dashed', borderColor: 'divider' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: '#FAFAFA'
        }}
      >
        <Toolbar /> 
        {children}
      </Box>
    </Box>
  );
}
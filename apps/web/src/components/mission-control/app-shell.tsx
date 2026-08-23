import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useIdentity, type Identity } from '../../identity';

type NavItem = { label: string; path: string; icon: ReactNode };
const iconSize = { fontSize: 21 };

function navigation(role: Identity['role'] | undefined): NavItem[] {
  const roleItems =
    role === 'crew-lead'
      ? [
          {
            label: 'Passengers',
            path: '/admin/passengers',
            icon: <GroupRoundedIcon sx={iconSize} />,
          },
          {
            label: 'Resources',
            path: '/admin/resources',
            icon: <HubRoundedIcon sx={iconSize} />,
          },
        ]
      : role === 'passenger'
        ? [
            {
              label: 'Discovery',
              path: '/resources',
              icon: <PersonSearchRoundedIcon sx={iconSize} />,
            },
          ]
        : [];
  return [
    {
      label: 'Overview',
      path: '/',
      icon: <DashboardRoundedIcon sx={iconSize} />,
    },
    ...roleItems,
  ];
}

function Sidebar({
  onSelectIdentity,
  onNavigate,
}: {
  onSelectIdentity: () => void;
  onNavigate?: () => void;
}) {
  const { identity } = useIdentity();
  const location = useLocation();
  const items = navigation(identity?.role);
  return (
    <Stack
      sx={{
        width: 268,
        height: '100%',
        bgcolor: '#061221',
        borderRight: '1px solid rgba(183,208,235,.1)',
        p: 2.25,
      }}
    >
      <Box sx={{ px: 1, pb: 3 }}>
        <Typography fontWeight={850} fontSize={25} letterSpacing="-.05em">
          <Box component="span" color="primary.main">
            X26
          </Box>{' '}
          PRMS
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          letterSpacing=".12em"
          textTransform="uppercase"
        >
          Mission systems
        </Typography>
      </Box>
      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                '&.Mui-selected': {
                  bgcolor: 'rgba(36,156,255,.18)',
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(36,156,255,.24)' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 39,
                  color:
                    location.pathname === item.path
                      ? 'primary.light'
                      : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 700 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ mb: 2 }} />
      <Button
        onClick={onSelectIdentity}
        color="inherit"
        sx={{
          p: 1,
          borderRadius: 2,
          justifyContent: 'start',
          textAlign: 'left',
          '&:hover': { bgcolor: 'rgba(255,255,255,.06)' },
        }}
      >
        <Avatar
          sx={{
            mr: 1.25,
            bgcolor: 'rgba(36,156,255,.15)',
            color: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          {identity?.role === 'crew-lead'
            ? 'CL'
            : identity?.role === 'passenger'
              ? 'P'
              : '?'}
        </Avatar>
        <Box>
          <Typography display="block" fontWeight={750} fontSize={13}>
            {identity
              ? identity.role === 'crew-lead'
                ? 'Crew Lead'
                : 'Passenger'
              : 'Select identity'}
          </Typography>
          <Typography display="block" variant="caption" color="text.secondary">
            {identity ? `${identity.id.slice(0, 8)}…` : 'Development access'}
          </Typography>
        </Box>
      </Button>
    </Stack>
  );
}

export function MissionControlShell({
  children,
  onSelectIdentity,
}: {
  children: ReactNode;
  onSelectIdentity: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 1200,
        }}
      >
        <Sidebar onSelectIdentity={onSelectIdentity} />
      </Box>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { bgcolor: '#061221' } }}
      >
        <Sidebar
          onSelectIdentity={onSelectIdentity}
          onNavigate={() => setOpen(false)}
        />
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0, ml: { lg: '268px' } }}>
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            minHeight: 76,
            px: { xs: 2, md: 4 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(7,21,38,.72)',
            backdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              sx={{ display: { lg: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" component="p" lineHeight={1.1}>
                Mission Control
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                fontWeight={750}
              >
                ● SYSTEM OPERATIONAL
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Development identity">
            <Button
              startIcon={<SettingsRoundedIcon />}
              onClick={onSelectIdentity}
              variant="outlined"
              color="inherit"
              sx={{ borderColor: 'divider', color: 'text.primary' }}
            >
              Identity
            </Button>
          </Tooltip>
        </Stack>
        <Box
          component="main"
          sx={{ p: { xs: 2, md: 4 }, maxWidth: 1680, mx: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

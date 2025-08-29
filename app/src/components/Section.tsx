import { Paper, Typography, Box } from '@mui/material';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3
      }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ '& > *': { mt: 2 } }}>
        {children}
      </Box>
    </Paper>
  );
}

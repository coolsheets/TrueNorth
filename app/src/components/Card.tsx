import { Paper, PaperProps } from '@mui/material';

/**
 * A styled Paper component that replaces the "card" utility class from Tailwind
 */
export default function Card({ children, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

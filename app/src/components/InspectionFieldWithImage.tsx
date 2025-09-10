import React from 'react';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import PhotoCapture from './PhotoCapture';

interface InspectionFieldWithImageProps {
  fieldName: string;
  imageFieldName: string;
  label: string;
  control: Control<any>;
  type?: 'text' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  required?: boolean;
  fullWidth?: boolean;
  errors?: any;
  multiline?: boolean;
  rows?: number;
}

const InspectionFieldWithImage: React.FC<InspectionFieldWithImageProps> = ({
  fieldName,
  imageFieldName,
  label,
  control,
  type = 'text',
  options = [],
  required = false,
  fullWidth = true,
  errors,
  multiline = false,
  rows = 4
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      {type === 'text' && (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: required ? `${label} is required` : false }}
          render={({ field }) => (
            <TextField
              {...field}
              label={label}
              fullWidth={fullWidth}
              error={!!errors?.[fieldName]}
              helperText={errors?.[fieldName]?.message || ''}
              margin="normal"
              multiline={multiline}
              rows={multiline ? rows : undefined}
            />
          )}
        />
      )}

      {type === 'select' && (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: required ? `${label} is required` : false }}
          render={({ field }) => (
            <FormControl fullWidth={fullWidth} margin="normal" error={!!errors?.[fieldName]}>
              <InputLabel>{label}</InputLabel>
              <Select {...field} label={label}>
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors?.[fieldName] && (
                <FormHelperText>{errors[fieldName].message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      )}

      <Controller
        name={imageFieldName}
        control={control}
        render={({ field }) => (
          <PhotoCapture
            onImageCapture={(imageData) => field.onChange(imageData)}
            existingImage={field.value}
            label={`Add Photo for ${label}`}
            fieldId={`${fieldName}-photo`}
          />
        )}
      />
    </Box>
  );
};

export default InspectionFieldWithImage;
declare module '@mui/icons-material/*' {
  import type { ComponentType } from 'react';
  import type { SvgIconProps } from '@mui/material/SvgIcon';

  const Icon: ComponentType<SvgIconProps>;

  export default Icon;
}

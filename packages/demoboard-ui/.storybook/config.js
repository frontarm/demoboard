import { configure } from '@storybook/react'

// automatically import all files ending in *.stories.js
configure(require.context('../src/components', true, /\.stories\.tsx$/), module)

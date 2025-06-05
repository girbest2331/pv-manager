'use client'

import { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'

export function Provider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <Box width="100%">
        {children}
      </Box>
    </CacheProvider>
  )
}

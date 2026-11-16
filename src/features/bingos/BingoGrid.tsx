import { useState } from 'react'
import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import type { BingoDetail } from './bingosApiSlice'
import UpdateSquareModal from './updateSquareModal'

interface BingoGridProps {
  details: BingoDetail[]
}

const BingoGrid = ({ details }: BingoGridProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // read from the store-fed props so the dialog always sees fresh data
  const selected = details.find((d) => d.id === selectedId) ?? null

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: { xs: 1, md: 1.5 },
        }}
      >
        {details.map((detail) => {
          const assigned = !!detail.participantName?.trim()
          return (
            <Tooltip
              key={detail.id}
              title={assigned ? detail.participantName : ''}
              placement="top"
            >
              <ButtonBase
                onClick={() => setSelectedId(detail.id)}
                aria-label={`Square ${detail.cellNumber}${
                  assigned ? `, ${detail.participantName}` : ', available'
                }`}
                sx={(theme) => ({
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.25,
                  p: 0.5,
                  overflow: 'hidden',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: assigned ? 'primary.main' : 'divider',
                  bgcolor: assigned ? 'primary.main' : 'background.paper',
                  color: assigned ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: assigned ? 'primary.dark' : 'action.hover',
                  },
                  '&.Mui-focusVisible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                })}
              >
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}
                >
                  {detail.cellNumber}
                </Typography>
                {assigned && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      width: '100%',
                      px: 0.5,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                    }}
                  >
                    {detail.participantName}
                  </Typography>
                )}
              </ButtonBase>
            </Tooltip>
          )
        })}
      </Box>
      <UpdateSquareModal
        open={selectedId !== null}
        detail={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}

export default BingoGrid

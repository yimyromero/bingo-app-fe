import Avatar from '@mui/material/Avatar'
import type { AvatarProps } from '@mui/material/Avatar'

interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  name?: string | null
  email?: string | null
  imageUrl?: string | null
}

// "Ana María López" -> "AM", "Ana" -> "AN", no name -> first letters of the email
const getInitials = (name?: string | null, email?: string | null) => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  const letters =
    words.length >= 2
      ? words[0][0] + words[1][0]
      : (words[0] ?? email?.split('@')[0] ?? '').slice(0, 2)
  return letters.toUpperCase()
}

// A stable colour per person so different users are easy to tell apart
const colorFor = (seed: string) => {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return `hsl(${hash}, 45%, 38%)`
}

// Shows the picture when there is one (MUI falls back to the initials if it
// fails to load); otherwise the initials.
const UserAvatar = ({
  name,
  email,
  imageUrl,
  sx,
  ...rest
}: UserAvatarProps) => {
  const initials = getInitials(name, email)
  return (
    <Avatar
      src={imageUrl || undefined}
      alt={name || email || ''}
      sx={{
        bgcolor: colorFor(name || email || ''),
        color: '#fff',
        fontSize: '0.95rem',
        ...sx,
      }}
      {...rest}
    >
      {initials}
    </Avatar>
  )
}

export default UserAvatar

import { AlertOctagon } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

const Root = styled.div`
  background-color: ${({ theme }) => (theme.darkMode ? '#888D9B' : '#CED0D9')};
  border-radius: 18px;
  color: black;
  display: flex;
  flex-direction: row;
  font-size: 14px;
  margin: 12px auto;
  padding: 16px;
  width: 100%;
  max-width: 880px;
`
const WarningIcon = styled(AlertOctagon)`
  margin: auto 16px auto 0;
  min-height: 22px;
  min-width: 22px;
`
const ReadMoreLink = styled(ExternalLink)`
  color: black;
  text-decoration: underline;
`

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <WarningIcon />
      <div>{children}</div>
    </Root>
  )
}

/**
 * Shows a downtime warning for the network if it's relevant
 */
export default function DowntimeWarning() {
  return null
}

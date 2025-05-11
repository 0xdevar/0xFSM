import {
  IconChevronDown,
  IconDeviceFloppy,
  IconFolderOpen,
  IconCode,
  IconCoffee
} from '@tabler/icons-react' // Added IconCode for Generate
import {
  Burger,
  Center,
  Container,
  Group,
  Menu,
  Text,
  Code,
  Button,
  Tooltip
} from '@mantine/core' // Added Tooltip
import { useDisclosure } from '@mantine/hooks'
import classes from './style/HeaderMenu.module.css' // Adjust path if needed

interface HeaderMenuProps {
  onGenerateClick: () => void
  onSaveClick: () => void
  onLoadClick: () => void
}

const menuLinks = [
  {
    link: '#file-menu', // Use descriptive anchors
    label: 'File',
    isActions: true, // Indicates this menu contains actions, not just links
    actions: [
      { id: 'load', label: 'Load Project', icon: IconFolderOpen },
      { id: 'save', label: 'Save Project', icon: IconDeviceFloppy }
    ]
  }
]

export function HeaderMenu ({
  onGenerateClick,
  onSaveClick,
  onLoadClick
}: HeaderMenuProps) {
  const [opened, { toggle }] = useDisclosure(false) // State for mobile burger menu

  const items = menuLinks.map(link => {
    // --- Render Action Menus (like File -> Save/Load) ---
    if (link.isActions && link.actions) {
      const actionItems = link.actions.map(item => {
        // Define specific handlers for clarity and debugging
        const handleItemClick = () => {
          if (item.id === 'load') {
            console.log(
              'HeaderMenu: Load Project clicked. Calling onLoadClick prop...'
            )
            if (typeof onLoadClick === 'function') {
              onLoadClick() // Call the function passed via props
            } else {
              console.error(
                'HeaderMenu Error: onLoadClick prop is not a function or was not provided!'
              )
            }
          } else if (item.id === 'save') {
            console.log(
              'HeaderMenu: Save Project clicked. Calling onSaveClick prop...'
            )
            if (typeof onSaveClick === 'function') {
              onSaveClick() // Call the function passed via props
            } else {
              console.error(
                'HeaderMenu Error: onSaveClick prop is not a function or was not provided!'
              )
            }
          }
          // Add handlers for other actions if needed
        }

        return (
          
          <Menu.Item
            key={item.id}
            leftSection={<item.icon size={14} stroke={1.5} />} // Render icon
            onClick={handleItemClick} // Use the specific handler
          >
            {item.label}
          </Menu.Item>
        )
      })

      // --- Render the Dropdown Menu Target (e.g., "File") ---
      return (
        <Menu
          key={link.label}
          trigger='hover'
          transitionProps={{ exitDuration: 0 }}
          withinPortal
          shadow='md'
        >
          <Menu.Target>
            <a
              href={link.link} // Use link for accessibility if applicable
              className={classes.link}
              onClick={event => event.preventDefault()} // Prevent default link behavior
            >
              <Center inline>
                {' '}
                {/* Use Center for vertical alignment */}
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown
                  size={14}
                  stroke={1.5}
                  style={{ marginLeft: '4px' }}
                />
              
              </Center>
            </a>
          </Menu.Target>
          {/* Render the dropdown content */}
          <Menu.Dropdown>{actionItems}</Menu.Dropdown>
        </Menu>
      )
    }

    // Add rendering logic for nested menus (link.links) if needed in the future

    return null // Fallback for unhandled link types
  })

  // --- Header Structure ---
  return (
    <header className={classes.header}>
      <Container size='lg'>
        
        {' '}
        <div className={classes.inner}>
          {' '}
          <Group align='center' gap='xs'>
            <Text c='blue' fw={700} size='xl'>
              0xFSM
            </Text>
            <Code fw={700}>v1.0.0</Code>
            <Button variant='gradient' gradient={{ from: 'pink', to: 'green' }} onClick={() => window.open('https://ko-fi.com/ahmedbero', '_blank')} leftSection={<IconCoffee size={16} stroke={1.5} />} visibleFrom='sm' >
              Support Me
            </Button>
          </Group>
          <Group gap={5} visibleFrom='sm' className={classes.links}>
            {items}
          </Group>
          <Group gap='sm' align='center'>
            <Tooltip label='Generate Resource Files' withArrow>
              <Button
                variant='gradient'
                gradient={{ from: 'teal', to: 'blue' }}
                onClick={onGenerateClick}
                leftSection={<IconCode size={16} stroke={1.5} />}
                visibleFrom='sm' // Hide button on small screens (use burger menu)
              >
                Generate Code
              </Button>
            </Tooltip>
            <Burger
              opened={opened}
              onClick={toggle}
              size='sm'
              hiddenFrom='sm'
              aria-label='Toggle navigation'
            />
         
          </Group>
        </div>
        
      </Container>
    </header>
  )
}

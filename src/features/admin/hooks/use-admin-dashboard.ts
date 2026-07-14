import { useState } from 'react'

export function useAdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  function toggleSidebar() {
    setIsSidebarCollapsed((isCollapsed) => !isCollapsed)
  }

  return { isSidebarCollapsed, toggleSidebar }
}

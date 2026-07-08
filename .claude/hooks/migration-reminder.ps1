# PostToolUse hook: migration-reminder
# Runs after Write or Edit. If migration SQL touched -> echoes workflow reminder.

$json = [System.Console]::In.ReadToEnd()

try {
    $data = $json | ConvertFrom-Json
    $path = $data.tool_input.file_path

    if ($null -ne $path -and ($path -match "supabase[/\\]migrations[/\\].+\.sql")) {
        Write-Output ""
        Write-Output "=== MIGRACION EDITADA ==="
        Write-Output "1. supabase db reset    (local: aplica migraciones + seeds)"
        Write-Output "2. pnpm db:types        (regenera types/supabase.ts)"
        Write-Output "Si push remoto: supabase db push"
        Write-Output "========================="
    }
} catch {
    # stdin vacio o JSON invalido — skip silently
}

exit 0

Param(
    [string]$SourceBranch = "main",
    [switch]$SkipMainPush
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
    param([Parameter(Mandatory = $true)][string]$Command)
    Write-Host "> git $Command" -ForegroundColor Cyan
    $commandScript = [ScriptBlock]::Create("git $Command")
    & $commandScript
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $Command"
    }
}

# Require a clean working tree to avoid accidental partial releases.
$dirty = git status --porcelain
if ($dirty) {
    throw "Working tree is not clean. Commit or stash changes before running release."
}

Invoke-Git "fetch --all --prune"

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
$sourceRef = "origin/$SourceBranch"

# Keep source branch updated from remote before publishing.
Invoke-Git "checkout $SourceBranch"
Invoke-Git "pull --ff-only origin $SourceBranch"

$releaseSha = (git rev-parse HEAD).Trim()
Write-Host "Source branch: $SourceBranch" -ForegroundColor Yellow
Write-Host "Release commit: $releaseSha" -ForegroundColor Yellow

# Step 1: Push exact release commit to master.
Invoke-Git "push origin $releaseSha:master"

# Step 2: Verify master points to expected commit.
$remoteMasterSha = (git ls-remote --heads origin master).Split([char]9)[0].Trim()
if ($remoteMasterSha -ne $releaseSha) {
    throw "Verification failed. master=$remoteMasterSha, expected=$releaseSha"
}
Write-Host "Verified: origin/master points to $releaseSha" -ForegroundColor Green

# Step 3: Promote verified commit to main.
if (-not $SkipMainPush) {
    Invoke-Git "checkout main"
    Invoke-Git "pull --ff-only origin main"
    Invoke-Git "merge --ff-only $releaseSha"
    Invoke-Git "push origin main"
    Write-Host "Verified commit promoted to origin/main" -ForegroundColor Green
} else {
    Write-Host "Skipped push to main (-SkipMainPush)." -ForegroundColor Yellow
}

# Return to original branch when possible.
if ($currentBranch -ne "main" -and $currentBranch -ne $SourceBranch) {
    Invoke-Git "checkout $currentBranch"
}

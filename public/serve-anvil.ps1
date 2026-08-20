param(
    [switch] $SelfTest
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$Listener = $null
$SelectedPort = $null
$ExpectedProject = "PROJECT ANVIL / Physical Fabric Laboratory"
$ExpectedLegacyGate = "INACTIVE / NO ACTIVE SCIENTIFIC OWNER GATE"

function Get-ContentType([string] $Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".js"   { return "text/javascript; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".ico"  { return "image/x-icon" }
        ".wasm" { return "application/wasm" }
        default  { return "application/octet-stream" }
    }
}

function Test-SafeEntryPath([string] $Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
    if (-not $Path.StartsWith("/") -or $Path.StartsWith("//")) { return $false }
    if ($Path.Contains("://") -or $Path.Contains("\")) { return $false }
    if ($Path -match "[\r\n\x00]") { return $false }
    return $true
}

function Write-Response(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $StatusCode,
    [string] $StatusText,
    [string] $ContentType,
    [byte[]] $Body,
    [bool] $HeadOnly = $false
) {
    $Header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n"
    $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
    $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

$IndexPath = Join-Path $Root "index.html"
$LauncherPath = Join-Path $Root "START_ANVIL.cmd"
$ManifestPath = Join-Path $Root "anvil-artifact.json"
$LegacyForgePath = Join-Path $Root "forge-gate.json"
if (-not (Test-Path -LiteralPath $IndexPath -PathType Leaf)) { throw "ANVIL artifact is incomplete: index.html is missing." }
if (-not (Test-Path -LiteralPath $LauncherPath -PathType Leaf)) { throw "ANVIL artifact is incomplete: START_ANVIL.cmd is missing." }
if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) { throw "ANVIL artifact is incomplete: anvil-artifact.json is missing." }
if (-not (Test-Path -LiteralPath $LegacyForgePath -PathType Leaf)) { throw "ANVIL artifact is incomplete: forge-gate.json compatibility marker is missing." }

try {
    $ArtifactManifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
}
catch {
    throw "ANVIL artifact has an unreadable anvil-artifact.json: $($_.Exception.Message)"
}
foreach ($Field in @("schema", "project", "role", "entryPath", "provenance", "sourceRepository", "sourceSha", "checkoutSha", "sourceRef", "ciEvent", "ciRunId", "ciRunAttempt", "artifactName", "builtAt")) {
    $Value = $ArtifactManifest.$Field
    if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) {
        throw "ANVIL artifact anvil-artifact.json is missing required field: $Field"
    }
}
if ($ArtifactManifest.schema -ne "anvil-owner-artifact/v1" -or $ArtifactManifest.project -ne $ExpectedProject) {
    throw "ANVIL artifact anvil-artifact.json has the wrong schema or project identity."
}

try {
    $LegacyForgeManifest = Get-Content -LiteralPath $LegacyForgePath -Raw | ConvertFrom-Json
}
catch {
    throw "ANVIL artifact has an unreadable forge-gate.json compatibility marker: $($_.Exception.Message)"
}
if ($LegacyForgeManifest.schema -ne "anvil-forge-owner-gate/v2" -or
    $LegacyForgeManifest.project -ne $ExpectedProject -or
    $LegacyForgeManifest.gate -ne $ExpectedLegacyGate) {
    throw "ANVIL artifact forge-gate.json is not the expected inactive compatibility marker."
}

$EntryPath = [string]$ArtifactManifest.entryPath
if (-not (Test-SafeEntryPath $EntryPath)) {
    throw "ANVIL artifact anvil-artifact.json contains an unsafe entryPath."
}
if ([string]$LegacyForgeManifest.entryPath -ne $EntryPath) {
    throw "ANVIL artifact manifests disagree on entryPath."
}

foreach ($Port in 4173..4199) {
    $Candidate = $null
    try {
        $Candidate = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $Candidate.Start()
        $Listener = $Candidate
        $SelectedPort = $Port
        break
    }
    catch {
        if ($null -ne $Candidate) {
            try { $Candidate.Stop() } catch { }
        }
    }
}

if ($null -eq $Listener -or $null -eq $SelectedPort) {
    throw "Could not open a local ANVIL validation port (4173-4199)."
}

if ($SelfTest) {
    foreach ($UnsafeEntryPath in @("//evil.example/", "https://evil.example/", "/foo\bar", "/ok`r`nInjected")) {
        if (Test-SafeEntryPath $UnsafeEntryPath) {
            throw "ANVIL entryPath self-test failed to reject: $UnsafeEntryPath"
        }
    }
    Write-Host "ANVIL artifact self-test PASS: $($ArtifactManifest.role) -> $EntryPath; neutral manifest valid; legacy Forge gate inactive; unsafe entry paths rejected; static files present; local listener opened on port $SelectedPort."
    $Listener.Stop()
    exit 0
}

$Url = "http://127.0.0.1:$SelectedPort$EntryPath"
Write-Host "PROJECT ANVIL - Browser Artifact" -ForegroundColor Cyan
Write-Host "Role    : $($ArtifactManifest.role)" -ForegroundColor Green
Write-Host "Entry   : $EntryPath"
Write-Host "Source  : $($ArtifactManifest.sourceSha)"
Write-Host "Checkout: $($ArtifactManifest.checkoutSha)"
Write-Host "Run     : $($ArtifactManifest.ciRunId) attempt $($ArtifactManifest.ciRunAttempt)"
Write-Host "URL     : $Url"
Write-Host ""
Write-Host "No scientific owner gate is active by default in this artifact."
Write-Host "The browser should open automatically."
Write-Host "Close this console window when validation is finished."
Write-Host ""
Start-Process $Url

$TrimChars = [char[]]@(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
)
$RootPrefix = $Root.TrimEnd($TrimChars) + [System.IO.Path]::DirectorySeparatorChar

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        try {
            $Stream = $Client.GetStream()
            $Reader = New-Object System.IO.StreamReader($Stream)
            $RequestLine = $Reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($RequestLine)) { continue }

            while ($true) {
                $Line = $Reader.ReadLine()
                if ($null -eq $Line -or $Line.Length -eq 0) { break }
            }

            $Parts = $RequestLine.Split(' ')
            if ($Parts.Length -lt 2) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                Write-Response $Stream 400 "Bad Request" "text/plain; charset=utf-8" $Body
                continue
            }

            $Method = $Parts[0].ToUpperInvariant()
            if ($Method -ne "GET" -and $Method -ne "HEAD") {
                $Body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
                Write-Response $Stream 405 "Method Not Allowed" "text/plain; charset=utf-8" $Body
                continue
            }

            $Target = $Parts[1]
            $PathPart = $Target.Split('?')[0]
            $DecodedPath = [System.Uri]::UnescapeDataString($PathPart)
            if ($DecodedPath -eq "/" -or [string]::IsNullOrWhiteSpace($DecodedPath)) {
                $RelativePath = "index.html"
            }
            else {
                $RelativePath = $DecodedPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            }

            if ($RelativePath.Contains("..")) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Write-Response $Stream 403 "Forbidden" "text/plain; charset=utf-8" $Body
                continue
            }

            $CandidatePath = [System.IO.Path]::GetFullPath((Join-Path $Root $RelativePath))
            if (-not $CandidatePath.StartsWith($RootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Write-Response $Stream 403 "Forbidden" "text/plain; charset=utf-8" $Body
                continue
            }

            if (-not (Test-Path -LiteralPath $CandidatePath -PathType Leaf)) {
                $Body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
                Write-Response $Stream 404 "Not Found" "text/plain; charset=utf-8" $Body
                continue
            }

            $Bytes = [System.IO.File]::ReadAllBytes($CandidatePath)
            Write-Response $Stream 200 "OK" (Get-ContentType $CandidatePath) $Bytes ($Method -eq "HEAD")
        }
        catch {
            Write-Warning $_.Exception.Message
        }
        finally {
            if ($null -ne $Client) { $Client.Close() }
        }
    }
}
finally {
    if ($null -ne $Listener) { $Listener.Stop() }
}

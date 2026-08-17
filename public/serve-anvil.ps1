$ErrorActionPreference = "Stop"

$Root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$Listener = $null
$SelectedPort = $null

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

function Write-Response(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $StatusCode,
    [string] $StatusText,
    [string] $ContentType,
    [byte[]] $Body,
    [bool] $HeadOnly = $false
) {
    $Header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
    $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
    $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
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

$Url = "http://127.0.0.1:$SelectedPort/?experiment=cut"
Write-Host "ANVIL-01 / CUT owner validation server" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host "URL : $Url" -ForegroundColor Green
Write-Host ""
Write-Host "The browser should open automatically."
Write-Host "Run CUT, inspect the transaction and the eight evidence gates."
Write-Host "Close this console window when validation is finished."
Write-Host ""
Start-Process $Url

$RootPrefix = $Root.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        try {
            $Stream = $Client.GetStream()
            $Reader = New-Object System.IO.StreamReader($Stream)
            $RequestLine = $Reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($RequestLine)) {
                continue
            }

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

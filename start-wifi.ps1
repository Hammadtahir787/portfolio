param(
  [int]$Port = 8080
)

$ipCandidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike '169.254.*' -and
    $_.IPAddress -ne '127.0.0.1' -and
    $_.PrefixOrigin -ne 'WellKnown'
  }

$localIp = $null
if ($ipCandidates) {
  $localIp = ($ipCandidates | Select-Object -First 1 -ExpandProperty IPAddress)
}

if (-not $localIp) {
  $localIp = '127.0.0.1'
}

Write-Host "Open on this PC: http://127.0.0.1:$Port/index.html" -ForegroundColor Cyan
Write-Host "Open on mobile (same Wi-Fi): http://${localIp}:$Port/index.html" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop server." -ForegroundColor Yellow

npx --yes http-server . -a 0.0.0.0 -p $Port -c-1

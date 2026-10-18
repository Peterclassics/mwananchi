$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localDirectory = Join-Path $projectRoot '.local'
$archive = Join-Path $localDirectory 'mysql-8.4.11-winx64.zip'
$url = 'https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-8.4.11-winx64.zip'
$total = 281191914L
$expectedHash = '2E833921898A9A030EA6BFE81BD811BC'
New-Item -ItemType Directory -Path $localDirectory -Force | Out-Null
$prefix = if (Test-Path -LiteralPath $archive) { (Get-Item -LiteralPath $archive).Length } else { 0L }
if ($prefix -gt $total) { throw 'Unexpected archive size; inspect the existing download.' }
if ($prefix -lt $total) {
    $partSize = [long][Math]::Ceiling(($total - $prefix) / 8.0)
    $ranges = for ($i = 0; $i -lt 8; $i++) {
        $start = $prefix + $i * $partSize
        if ($start -lt $total) {
            [pscustomobject]@{ Index = $i; Start = $start; End = [Math]::Min($total - 1, $start + $partSize - 1); Path = (Join-Path $localDirectory "mysql-part-$i.bin") }
        }
    }
    $ranges | ForEach-Object -Parallel {
        $ErrorActionPreference = 'Stop'
        $ProgressPreference = 'SilentlyContinue'
        $range = $_
        Invoke-WebRequest -Uri $using:url -Headers @{ Range = "bytes=$($range.Start)-$($range.End)" } -OutFile $range.Path
        if ((Get-Item -LiteralPath $range.Path).Length -ne ($range.End - $range.Start + 1)) { throw "Incomplete download part $($range.Index)" }
        Write-Output "Download part $($range.Index + 1) complete."
    } -ThrottleLimit 8
    $output = [IO.File]::Open($archive, [IO.FileMode]::Append)
    try {
        foreach ($range in $ranges) {
            $inputStream = [IO.File]::OpenRead($range.Path)
            try { $inputStream.CopyTo($output) } finally { $inputStream.Dispose() }
        }
    } finally { $output.Dispose() }
}
$hash = (Get-FileHash -LiteralPath $archive -Algorithm MD5).Hash
if ($hash -ne $expectedHash) { throw 'Archive integrity check failed. Do not extract or run it.' }
Write-Output 'Official MySQL archive downloaded and checksum verified.'

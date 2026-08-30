param([int]$start = 1, [int]$end = 999999, [string]$file = 'd:\DevWeekends\DevWeekends_Tasks\Docly\backend\src\controllers\appointmentController.ts')
$lines = Get-Content $file
$total = $lines.Length
if ($end -gt $total) { $end = $total }
for ($i = $start; $i -le $end; $i++) {
  Write-Output "${i}: $($lines[$i-1])"
}

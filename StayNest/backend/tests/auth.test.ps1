# StayNest backend auth test suite — run from the backend directory:
#   pwsh -File tests/auth.test.ps1
$ErrorActionPreference = 'SilentlyContinue'
$base = 'http://127.0.0.1:5000'
$ts = Get-Date -Format 'MMddHHmmss'
$email = "jane_$ts@example.com"
$pw = 'password123'
$testsDir = (Get-Location).Path
$email | Out-File -FilePath "$testsDir\.last-email" -Encoding ascii -NoNewline

function CallApi {
  param([string]$method, [string]$path, $body = $null, $token = $null)
  $cArgs = @('-s', '-X', $method, '-w', "`n%{http_code}")
  if ($token) { $cArgs += @('-H', "Authorization: Bearer $token") }
  if ($body) {
    $json = $body | ConvertTo-Json -Compress -Depth 5
    $cArgs += @('-H', 'Content-Type: application/json', '-d', $json)
  }
  $cArgs += "$base$path"
  $raw = ((& curl.exe @cArgs) -join "`n")
  $idx = $raw.LastIndexOf("`n")
  $status = $raw.Substring($idx + 1).Trim()
  $jsonBody = $raw.Substring(0, $idx)
  $obj = $jsonBody | ConvertFrom-Json -ErrorAction SilentlyContinue
  return [PSCustomObject]@{ Status = $status; Obj = $obj }
}

function HasPw($res) {
  $u = $res.Obj.user
  if ($null -eq $u) { return $false }
  return (Get-Member -InputObject $u -Name password -MemberType NoteProperty | Measure-Object).Count -gt 0
}

Write-Host "`n===== STAYNEST AUTH TEST SUITE ====="
Write-Host "email under test: $email`n"

# 1 Register (valid)
$r = CallApi Post '/api/auth/register' @{ name = 'Jane Doe'; email = $email; password = $pw }
Write-Host "1. Register (valid)            -> HTTP $($r.Status) | success=$($r.Obj.success) | token=$([bool]$r.Obj.token) | passwordLeaked=$(HasPw $r)"

# 2 Duplicate email
$r = CallApi Post '/api/auth/register' @{ name = 'Jane Two'; email = $email; password = $pw }
Write-Host "2. Duplicate email             -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# 3 Login (correct)
$r = CallApi Post '/api/auth/login' @{ email = $email; password = $pw }
$token = $r.Obj.token
Write-Host "3. Login (correct)             -> HTTP $($r.Status) | success=$($r.Obj.success) | token=$([bool]$token) | role=$(($r.Obj.user).role) | passwordLeaked=$(HasPw $r)"

# 4 Wrong password
$r = CallApi Post '/api/auth/login' @{ email = $email; password = 'wrongpassword' }
Write-Host "4. Wrong password              -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# 5a Protected /me without token
$r = CallApi Get '/api/auth/me'
Write-Host "5a. me (no token)              -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# 5b Protected /me with token
$r = CallApi Get '/api/auth/me' -token $token
Write-Host "5b. me (valid token)           -> HTTP $($r.Status) | success=$($r.Obj.success) | email=$(($r.Obj.user).email) | passwordLeaked=$(HasPw $r)"

# 6a Admin route without token
$r = CallApi Get '/api/admin/users'
Write-Host "6a. admin/users (no token)     -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# 6b Admin route with non-admin token -> 403
$r = CallApi Get '/api/admin/users' -token $token
Write-Host "6b. admin/users (user token)   -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# Promote to admin, re-login, then test the admin route -> 200
$promoteOut = (& node "$testsDir\tests\promote-admin.js" $email | Out-String).Trim()
Write-Host "   promote: $promoteOut"
$r = CallApi Post '/api/auth/login' @{ email = $email; password = $pw }
$adminToken = $r.Obj.token
$r = CallApi Get '/api/admin/users' -token $adminToken
Write-Host "6c. admin/users (admin token)  -> HTTP $($r.Status) | count=$(($r.Obj).count)"
$r = CallApi Get '/api/auth/me' -token $adminToken
Write-Host "    me (admin token) role      -> HTTP $($r.Status) | role=$(($r.Obj.user).role)"

# 7 Logout
$r = CallApi Post '/api/auth/logout' -token $token
Write-Host "7. Logout                      -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

# 8 Validation (bad name/email/password)
$r = CallApi Post '/api/auth/register' @{ name = 'ab'; email = 'not-an-email'; password = '123' }
Write-Host "8. Validation (bad input)      -> HTTP $($r.Status) | msg='$($r.Obj.message)'"

Write-Host "`n===== DONE ====="

# Offerwall Integration Test Script
Write-Host "🧪 Testing Freecoino Offerwall Integrations..." -ForegroundColor Cyan
Write-Host ""

$userId = "338939c3-a7ba-45ce-ad02-6af8126b78fd"
$baseUrl = "https://freecoino.com"

# Test URLs
$tests = @(
    @{
        Name = "Revtoo Offers"
        Url = "$baseUrl/api/revtoo-offers?user_id=$userId"
    },
    @{
        Name = "CPX Surveys"
        Url = "$baseUrl/api/cpx-surveys?user_id=$userId"
    },
    @{
        Name = "Notik Offers"
        Url = "$baseUrl/api/notik-offers?user_id=$userId"
    },
    @{
        Name = "Vortex Offers"
        Url = "$baseUrl/api/vortex-offers?user_id=$userId"
    },
    @{
        Name = "Gemiad Offers"
        Url = "$baseUrl/api/gemiad-offers?user_id=$userId"
    }
)

foreach ($test in $tests) {
    Write-Host "Testing: $($test.Name)..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $test.Url -UseBasicParsing -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        
        if ($json.success -eq $true) {
            $offerCount = if ($json.offers) { $json.offers.Count } else { 0 }
            Write-Host " ✅ SUCCESS - $offerCount offers" -ForegroundColor Green
        } else {
            Write-Host " ❌ FAILED - $($json.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Test complete! Check results above." -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If all show ❌ 'not configured' - Add environment variables to Vercel"
Write-Host "2. Follow guide: ADD-VERCEL-ENV-VARIABLES.md"
Write-Host "3. After adding variables, redeploy from Vercel dashboard"
Write-Host "4. Run this script again to verify"

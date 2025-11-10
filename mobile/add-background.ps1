# Script PowerShell pour ajouter un arrière-plan noir aux icônes
# Nécessite .NET (inclus dans Windows)

Write-Host "🎨 Ajout d'un fond noir aux icônes..." -ForegroundColor Cyan

# Charger les assemblies nécessaires
Add-Type -AssemblyName System.Drawing

function Add-BlackBackground {
    param(
        [string]$InputPath,
        [string]$OutputPath
    )
    
    try {
        # Charger l'image source
        $sourceImage = [System.Drawing.Image]::FromFile($InputPath)
        
        # Créer une nouvelle image avec fond noir
        $bitmap = New-Object System.Drawing.Bitmap($sourceImage.Width, $sourceImage.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # Remplir avec du noir
        $graphics.Clear([System.Drawing.Color]::Black)
        
        # Dessiner l'image source par-dessus
        $graphics.DrawImage($sourceImage, 0, 0, $sourceImage.Width, $sourceImage.Height)
        
        # Sauvegarder
        $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Nettoyer
        $graphics.Dispose()
        $bitmap.Dispose()
        $sourceImage.Dispose()
        
        Write-Host "✅ Créé : $OutputPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Erreur : $_" -ForegroundColor Red
        return $false
    }
}

# Créer un dossier de backup
$backupDir = "assets\backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Backup de l'icône originale
if (Test-Path "assets\icon.png") {
    Copy-Item "assets\icon.png" "$backupDir\icon-original.png"
    Write-Host "✅ Backup créé dans $backupDir" -ForegroundColor Green
}

# Traiter les icônes
$icons = @(
    @{Input="assets\icon.png"; Output="assets\icon-black-bg.png"},
    @{Input="assets\adaptive-icon.png"; Output="assets\adaptive-icon-black-bg.png"},
    @{Input="assets\notification-icon.png"; Output="assets\notification-icon-black-bg.png"}
)

foreach ($icon in $icons) {
    if (Test-Path $icon.Input) {
        Add-BlackBackground -InputPath $icon.Input -OutputPath $icon.Output
    }
}

Write-Host ""
Write-Host "✨ Terminé ! Vérifiez les nouvelles icônes dans assets/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Pour appliquer les changements :" -ForegroundColor Yellow
Write-Host "   Move-Item assets\icon-black-bg.png assets\icon.png -Force"
Write-Host "   Move-Item assets\adaptive-icon-black-bg.png assets\adaptive-icon.png -Force"

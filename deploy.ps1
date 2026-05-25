# Script de déploiement avec système de logs avancé
# =====================================================

# Configuration
$LogDir = "logs"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "deploy_$Timestamp.log"
$JsonLogFile = Join-Path $LogDir "deploy_$Timestamp.json"
$SummaryFile = Join-Path $LogDir "deploy_history.csv"

# Couleurs pour l'affichage
$Colors = @{
    INFO = "White"
    SUCCESS = "Green"
    WARNING = "Yellow"
    ERROR = "Red"
    DEBUG = "DarkGray"
}

# Créer le dossier logs s'il n'existe pas
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
    Write-Host "Dossier logs créé" -ForegroundColor Green
}

# Structure pour stocker les données du déploiement
$DeploymentLog = @{
    StartTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    EndTime = $null
    Duration = $null
    Status = "En cours"
    CommitMessage = $null
    CommitHash = $null
    Repository = $null
    Branch = "master"
    FilesChanged = @()
    Errors = @()
    Steps = @()
}

# Fonction de logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Details = $null
    )
    
    $LogEntry = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        Level = $Level
        Message = $Message
        Details = $Details
    }
    
    # Écrire dans le fichier log texte
    $LogMessage = "$($LogEntry.Timestamp) [$Level] $Message"
    if ($Details) {
        $LogMessage += " (Details: $($Details.Replace("`n", " | ").Replace("`r", "")))"
    }
    Add-Content -Path $LogFile -Value $LogMessage
    
    # Afficher dans la console avec couleur
    Write-Host $LogMessage -ForegroundColor $Colors[$Level]
    
    # Ajouter à la structure JSON
    $DeploymentLog.Steps += $LogEntry
}

# Fonction pour obtenir les informations git
function Get-GitInfo {
    try {
        $branch = (git rev-parse --abbrev-ref HEAD 2>&1).Trim()
        $remote = (git config --get remote.origin.url 2>&1).Trim()
        $lastCommitHash = (git log -1 --pretty=format:"%H" 2>&1).Trim()
        $lastCommitSubject = (git log -1 --pretty=format:"%s" 2>&1).Trim()
        
        return @{
            Branch = $branch
            Remote = $remote
            LastCommitHash = $lastCommitHash
            LastCommitSubject = $lastCommitSubject
        }
    } catch {
        Write-Log "Erreur lors de la récupération des infos Git: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Début du déploiement
Clear-Host
Write-Log "==========================================" "INFO"
Write-Log "DÉPLOIEMENT DÉMARRÉ" "INFO"
Write-Log "==========================================" "INFO"

$StartTime = Get-Date

try {
    # Obtenir les informations du repository
    $GitInfo = Get-GitInfo
    if ($GitInfo) {
        $DeploymentLog.Repository = $GitInfo.Remote
        $DeploymentLog.Branch = $GitInfo.Branch
        Write-Log "Repository Git: $($GitInfo.Remote)" "INFO"
        Write-Log "Branch actuelle: $($GitInfo.Branch)" "INFO"
    } else {
        Write-Log "Impossible de récupérer les informations Git. Assurez-vous d'être dans un dépôt Git." "WARNING"
    }

    # Étape 1: Git Status
    Write-Log "Vérification du statut Git..." "INFO"
    $GitStatusOutput = git status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Erreur lors de la vérification du statut Git: $GitStatusOutput"
    }
    
    $ChangedFiles = $GitStatusOutput | ForEach-Object { $_.Substring(3).Trim() }
    $DeploymentLog.FilesChanged = $ChangedFiles

    if ($ChangedFiles.Count -gt 0) {
        Write-Log "Fichiers avec des modifications en attente:" "INFO"
        $ChangedFiles | ForEach-Object { Write-Log "  $_" "INFO" }
    } else {
        Write-Log "Aucune modification détectée. Le dépôt est propre." "WARNING"
    }
    
    # Étape 2: Git Add
    Write-Log "Ajout de tous les fichiers modifiés..." "INFO"
    $AddResult = git add . 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Échec de l'ajout des fichiers: $AddResult"
    }
    Write-Log "Fichiers ajoutés avec succès." "SUCCESS"
    
    # Étape 3: Demander le message de commit
    $CommitMessage = Read-Host "Décrivez votre modification (optionnel)"
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $CommitMessage = "Mise à jour: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Log "Message de commit par défaut utilisé: $CommitMessage" "WARNING"
    } else {
        Write-Log "Message de commit: $CommitMessage" "INFO"
    }
    $DeploymentLog.CommitMessage = $CommitMessage

    # Étape 4: Git Commit
    Write-Log "Création du commit..." "INFO"
    $CommitResult = git commit -m "$CommitMessage" 2>&1
    if ($LASTEXITCODE -ne 0) {
        if ($CommitResult -match "nothing to commit") {
            Write-Log "Rien à commiter, l'arbre de travail est propre." "WARNING"
        } else {
            throw "Échec du commit: $CommitResult"
        }
    } else {
        Write-Log "Commit réussi." "SUCCESS"
        $CommitHash = (git rev-parse HEAD 2>&1).Trim()
        $DeploymentLog.CommitHash = $CommitHash
        Write-Log "Hash du commit: $CommitHash" "INFO"
    }
    
    # Étape 5: Git Push
    Write-Log "Envoi vers le dépôt distant (branch master)..." "INFO"
    $PushResult = git push origin master 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Échec de l'envoi (push): $PushResult"
    }
    Write-Log "Push réussi vers 'origin master'." "SUCCESS"
    
    # Déploiement réussi
    $DeploymentLog.Status = "Succès"
    $DeploymentLog.EndTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Duration = New-TimeSpan -Start $StartTime -End (Get-Date)
    $DeploymentLog.Duration = $Duration.ToString()

    Write-Log "==========================================" "INFO"
    Write-Log "DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!" "SUCCESS"
    Write-Log "Durée: $($Duration.TotalSeconds) secondes" "INFO"
    Write-Log "Log complet: $LogFile" "INFO"
    Write-Log "==========================================" "INFO"
    
} catch {
    # Gestion des erreurs
    $DeploymentLog.Status = "Échec"
    $DeploymentLog.Errors += $_.Exception.Message
    $DeploymentLog.EndTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Log "==========================================" "ERROR"
    Write-Log "DÉPLOIEMENT ÉCHOUÉ!" "ERROR"
    Write-Log "Erreur: $($_.Exception.Message)" "ERROR"
    Write-Log "Vérifiez le log pour plus de détails: $LogFile" "ERROR"
    Write-Log "==========================================" "ERROR"
    
    exit 1
} finally {
    # Sauvegarder le log JSON
    $DeploymentLog | ConvertTo-Json -Depth 5 | Set-Content -Path $JsonLogFile -Encoding UTF8
    Write-Log "Log JSON sauvegardé: $JsonLogFile" "INFO"

    # Ajouter au fichier d'historique CSV
    $CsvHeader = "Timestamp,Status,CommitHash,CommitMessage,Repository,Branch,Duration,Errors"
    if (!(Test-Path $SummaryFile)) {
        Add-Content -Path $SummaryFile -Value $CsvHeader -Encoding UTF8
    }
    $CsvLine = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),`"$($DeploymentLog.Status)`",`"$($DeploymentLog.CommitHash)`",`"$($DeploymentLog.CommitMessage -replace '"', '""')`",`"$($DeploymentLog.Repository)`",`"$($DeploymentLog.Branch)`",`"$($DeploymentLog.Duration)`",`"$($DeploymentLog.Errors -join '; ' -replace '"', '""')`""
    Add-Content -Path $SummaryFile -Value $CsvLine -Encoding UTF8
    Write-Log "Historique de déploiement ajouté à: $SummaryFile" "INFO"
}

Read-Host "Appuyez sur une touche pour continuer..."
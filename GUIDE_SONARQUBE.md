# Guide SonarQube — Frontend + Backend Node (NAFISSA)

Sonar analyse le **JavaScript** des dossiers **`backend-node/src`** et **`frontend/src`**. Dans l’interface (SonarCloud ou SonarQube serveur), vous voyez :

- **Bugs** et fiabilité  
- **Vulnérabilités** et **failles de sécurité** (OWASP / injection, secrets, headers, etc. selon les règles activées)  
- **Code smells** et duplications  
- **Couverture de tests** (agrégée à partir des deux rapports LCov frontend et backend)

Un seul projet Sonar avec une seule clé : **`nafissa-platform`** (`sonar.projectKey` dans `sonar-project.properties` à la racine).

---

## 1 — SonarCloud (recommandé avec GitHub)

1. Connectez-vous sur [SonarCloud](https://sonarcloud.io/) avec votre compte GitHub.  
2. **Créez une organisation** (ou utilisez votre org perso).  
3. **Importez le projet** `SySamba/nafissa` (ou analysez sans import en créant un projet manuellement avec la même clé que dans `sonar-project.properties`).  
4. Générez un **token d’analyse** : *My Account → Security*.  
5. Dans GitHub : **Repository → Settings → Secrets and variables → Actions**  
   - Nom exact du secret : **`SONAR_TOKEN`** (avec ce libellé, pour que la CI fonctionne).  
   - Valeur : **uniquement** la chaîne du jeton SonarCloud (ex. **`squ_…`** ou **`sqp_…`** du formulaire SonarCloud), sans guillemets, sans texte du type « Token : », sans retour ligne. **Ne pas** coller un **hash Git** du type **`31622e33…`** (identifiant de commit : ce n’est pas un jeton). Copie depuis le navigateur (**pas depuis Word**) : tout caractère accentué (`é`, etc.) peut provoquer **`Unexpected char 0xe9 in Authorization value`**.  
6. **`sonar-project.properties`** à la racine doit contenir au minimum :

```properties
sonar.organization=<clé_org_sonarcloud>
sonar.host.url=https://sonarcloud.io
```

(La clé d’organisation et `sonar.projectKey` doivent **strictement** correspondre au projet affiché sur SonarCloud.)

7. Commitez et poussez : le workflow **`.github/workflows/ci.yml`** exécute les tests, produit **`lcov.info`** côté `frontend/` et `backend-node/`, puis envoie l’analyse avec :

```properties
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info,backend-node/coverage/lcov.info
```

Après quelques minutes, ouvrez le tableau de projet sur SonarCloud : onglets **Issues**, **Security**, **Measures**, **Coverage**.

Les **notifications par e‑mail** ne sont pas activées par défaut pour chaque événement : dans SonarCloud, ouvrez **Mon compte** → **Notifications** (ou équivalent) et sélectionnez les alertes souhaitées ; vérifiez aussi vos courriers indésirables.

---

## 2 — SonarQube serveur privé

1. Déployez SonarQube (Docker, ZIP, Helm, etc.) et créez un projet avec la même **`sonar.projectKey`** que localement ou laissez le scanner la créer.  
2. Générez un **token** utilisateur avec droit d’analyse.  
3. Dans **`sonar-project.properties`**, renseignez l’URL de votre serveur :

```properties
sonar.host.url=https://votre-sonar.example.com
```

4. Le secret GitHub **`SONAR_TOKEN`** contient ce token ; le même workflow **`ci.yml`** s’utilise tel quel.

---

## 3 — Analyse en local

```powershell
# Depuis la racine du projet, après avoir lancé les tests avec couverture :
cd C:\Users\HP\Downloads\nafissatou\frontend
npm run test:coverage

cd ..\backend-node
npm run test:coverage

cd ..
# Définissez SONAR_TOKEN (PowerShell)
$env:SONAR_TOKEN = "sqxxxxxxxx"
sonar-scanner
```

Installez [SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/) et ajoutez `sonar.login` désormais obsolète — le CLI lit **`SONAR_TOKEN`**.

Pour SonarCloud en local, `sonar.organization` et `sonar.host.url` doivent être présents dans `sonar-project.properties`.

---

## 4 — À ne pas committer

- **Jamais** le token Sonar dans les fichiers : uniquement le secret GitHub **`SONAR_TOKEN`** ou une variable d’environnement locale.  
- **`node_modules/`** et **`coverage/`** : ignorés par `.gitignore` pour ne pas envoyer de bruit à Git ni à Sonar.

---

## 5 — Bonnes pratiques après une analyse

- Relancer Sonar après une grosse refacto ; traiter d’abord **bugs** puis **vulnérabilités**.  
- Les *faux positifs* peuvent être marqués **Won't fix** dans SonarCloud avec une courte justification pour l’équipe.  
- L’analyse complète prend souvent **1 à 3 minutes** : c’est normal.

---

## 6 — CI GitHub

Le workflow utilise **`SonarSource/sonarqube-scan-action@v6`** (version supportée par SonarSource).

**Présentation pour l’équipe** : **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.md`** (Word : **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS.docx`**, ou **`PRESENTATION_SONAR_CLOUD_GITHUB_ACTIONS_nouveau.docx`** si l’original était ouvert au moment de la régénération).

---

## 7 — Dépannage CI SonarCloud

### Couverture « aucune donnée » alors que les tests CI passent

Les rapports **`lcov.info`** utilisent souvent des chemins **`src/...`** relatifs au paquet (`frontend/` ou `backend-node/`). Sonar analyse depuis la **racine** du dépôt et attend des chemins du type **`frontend/src/...`**. Le workflow **`.github/workflows/ci.yml`** normalise ces chemins **avant** le scan ; après le prochain push sur `main` / `master`, la carte **Couverture** peut afficher des pourcentages.

### Jeton **`SONAR_TOKEN`** ≠ hash Git (**`31622e33…`**)

Un identifiant hexadécimal long (résumé d’un **commit** sur GitHub) **n’est pas** un jeton Sonar : ne pas le mettre dans **`SONAR_TOKEN`**. Utilisez le jeton généré dans **SonarCloud** (**Mon compte** → **Sécurité**) : valeur du type **`squ_...`** ou **`sqp_...`**.

### « Failed to query JRE metadata » / « Unexpected char 0xe9 in Authorization value »

Le jeton HTTP ne doit contenir **que des caractères ASCII** (lettres, chiffres, `_`, etc.). Un accent (`é`) ou du texte collé avec le jeton corrompt l’en-tête **Authorization**. **Régénérez** le secret **`SONAR_TOKEN`** sur GitHub en collant **uniquement** la valeur affichée par SonarCloud (copie depuis le navigateur, pas depuis Word).

---

*Projet : API `backend-node` + interface `frontend`. Configuration Sonar **uniquement** à la racine : `sonar-project.properties`.*

